/**
 * Shared Chart.js utilities for all MIS graph components.
 * Provides palette, gradient factory, zoom plugin, and option builders.
 *
 * Features:
 *  - Gradient fills per dataset
 *  - Max / Min point markers (▲ / ▼)
 *  - Crosshair (vertical + horizontal hairlines on hover)
 *  - Double-click to reset pan & zoom
 *  - Zoom-level badge overlay
 *  - Rich tooltip with colour swatches
 */
import moment from "moment";
import { Chart as ChartJS, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Register once globally
ChartJS.register(...registerables, zoomPlugin);

export { ChartJS };

// ── Palette ───────────────────────────────────────────────────────────────────
export const TRACE_COLORS = [
    "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#84cc16",
    "#6366f1", "#14b8a6", "#a78bfa", "#fb923c",
];

export const FREQ_COLORS = {
    Durgapur: "#ef4444",
    Jeypore:  "#f97316",
    Sasaram:  "#db2777",
};

// ── Hex → rgba ────────────────────────────────────────────────────────────────
export const hexRgba = (hex, alpha) => {
    if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

// ── Canvas gradient factory ───────────────────────────────────────────────────
export const makeGradient = (ctx, hex, height = 400) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0,   hexRgba(hex, 0.32));
    gradient.addColorStop(0.5, hexRgba(hex, 0.10));
    gradient.addColorStop(1,   hexRgba(hex, 0.00));
    return gradient;
};

// ── Gradient plugin ───────────────────────────────────────────────────────────
export const makeGradientPlugin = () => ({
    id: "misGradientFill",
    beforeDatasetsUpdate(chart) {
        const ctx = chart.ctx;
        const { height } = chart.chartArea || {};
        if (!height) return;
        chart.data.datasets.forEach((ds) => {
            if (ds._fill && ds._hex) {
                ds.backgroundColor = makeGradient(ctx, ds._hex, height);
            }
        });
    },
});

// ── Crosshair plugin ──────────────────────────────────────────────────────────
// Draws a vertical + horizontal hairline at the cursor position.
export const makeCrosshairPlugin = () => ({
    id: "misCrosshair",
    afterInit(chart) {
        chart._crosshairX = null;
        chart._crosshairY = null;
        const canvas = chart.canvas;
        if (!canvas) return;

        const onMove = (e) => {
            if (!chart.canvas) return;
            const rect = canvas.getBoundingClientRect();
            chart._crosshairX = e.clientX - rect.left;
            chart._crosshairY = e.clientY - rect.top;
            if (chart.ctx) chart.draw();
        };
        const onLeave = () => {
            chart._crosshairX = null;
            chart._crosshairY = null;
            if (chart.ctx) chart.draw();
        };

        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        chart._crosshairListeners = { onMove, onLeave };
    },
    destroy(chart) {
        const canvas = chart.canvas;
        const { onMove, onLeave } = chart._crosshairListeners || {};
        if (canvas && onMove)  canvas.removeEventListener("mousemove", onMove);
        if (canvas && onLeave) canvas.removeEventListener("mouseleave", onLeave);
        chart._crosshairListeners = null;
    },
    afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!ctx || !chartArea) return;
        const x = chart._crosshairX;
        const y = chart._crosshairY;
        if (x == null || y == null) return;

        // Only draw inside chart area
        if (x < chartArea.left || x > chartArea.right ||
            y < chartArea.top  || y > chartArea.bottom) return;

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(148,163,184,0.55)";

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();

        // Small circle intersection dot
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(148,163,184,0.7)";
        ctx.fill();

        ctx.restore();
    },
});

// ── Double-click to reset zoom/pan ───────────────────────────────────────────
export const makeResetZoomPlugin = () => ({
    id: "misResetZoom",
    afterInit(chart) {
        const canvas = chart.canvas;
        if (!canvas) return;

        const onDblClick = (e) => {
            e.preventDefault();
            if (!chart.canvas) return;
            if (chart.resetZoom) {
                chart.resetZoom();
                // Brief flash animation on the canvas border
                try {
                    canvas.style.transition = "box-shadow 0.15s ease";
                    canvas.style.boxShadow  = "0 0 0 2px rgba(59,130,246,0.6)";
                    setTimeout(() => {
                        if (canvas) canvas.style.boxShadow = "";
                    }, 350);
                } catch (_) { /* chart may have unmounted */ }
            }
        };

        canvas.addEventListener("dblclick", onDblClick);
        chart._resetZoomListener = onDblClick;
    },
    destroy(chart) {
        const canvas = chart.canvas;
        if (canvas && chart._resetZoomListener) {
            canvas.removeEventListener("dblclick", chart._resetZoomListener);
        }
        chart._resetZoomListener = null;
    },
});

// ── Zoom-level badge plugin ───────────────────────────────────────────────────
// Shows "ZOOM 2.4×" badge in the top-left when the chart is zoomed in.
export const makeZoomBadgePlugin = () => ({
    id: "misZoomBadge",
    afterDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!ctx || !chartArea) return;

        // Read current zoom ratio from the zoom plugin state (x-axis scale)
        let ratio = 1;
        try {
            const xScale  = chart.scales["x"];
            const origMin = xScale._originalMin ?? xScale.min;
            const origMax = xScale._originalMax ?? xScale.max;
            const currMin = xScale.min;
            const currMax = xScale.max;
            if (origMax != null && origMin != null && currMax !== currMin) {
                ratio = (origMax - origMin) / (currMax - currMin);
            }
        } catch (_) { /* ignore */ }

        if (ratio <= 1.05) return; // Only show badge when meaningfully zoomed

        const label = `ZOOM ${ratio.toFixed(1)}×`;
        ctx.save();
        ctx.font = "bold 10px Inter, sans-serif";
        const tw = ctx.measureText(label).width;
        const PAD = 6, H = 18;
        const bx = chartArea.left + 8;
        const by = chartArea.top + 8;

        // Background pill
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + tw + PAD * 2 - r, by);
        ctx.arcTo(bx + tw + PAD * 2, by, bx + tw + PAD * 2, by + r, r);
        ctx.lineTo(bx + tw + PAD * 2, by + H - r);
        ctx.arcTo(bx + tw + PAD * 2, by + H, bx + tw + PAD * 2 - r, by + H, r);
        ctx.lineTo(bx + r, by + H);
        ctx.arcTo(bx, by + H, bx, by + H - r, r);
        ctx.lineTo(bx, by + r);
        ctx.arcTo(bx, by, bx + r, by, r);
        ctx.closePath();
        ctx.fillStyle = "rgba(37,99,235,0.88)";
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bx + (tw + PAD * 2) / 2, by + H / 2);
        ctx.restore();
    },
});

// ── Max / Min annotation plugin ───────────────────────────────────────────────
export const makeMaxMinPlugin = () => ({
    id: "misMaxMinMarkers",
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const { chartArea } = chart;
        if (!chartArea) return;

        chart.data.datasets.forEach((ds, dsIdx) => {
            if (ds._maxIdx == null || ds._minIdx == null) return;
            const meta = chart.getDatasetMeta(dsIdx);
            if (!meta || meta.hidden) return;

            const color = ds._hex || ds.borderColor || "#3b82f6";
            const unit  = ds._unit || "";

            const drawMarker = (pointIdx, isMax) => {
                if (pointIdx < 0) return;
                const point = meta.data[pointIdx];
                if (!point) return;

                const px  = point.x;
                const py  = point.y;
                const val = isMax ? ds._maxVal : ds._minVal;
                if (val == null) return;

                // Dot
                ctx.save();
                ctx.beginPath();
                ctx.arc(px, py, 6, 0, 2 * Math.PI);
                ctx.fillStyle   = isMax ? "#ef4444" : "#3b82f6";
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth   = 2;
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // Label
                const symbol = isMax ? "▲" : "▼";
                const label  = `${symbol} ${Number(val).toFixed(2)}${unit ? " " + unit : ""}`;
                ctx.save();
                ctx.font = "bold 10px Inter, sans-serif";
                const tw = ctx.measureText(label).width;

                const PAD   = 4;
                const BOX_H = 16;
                const BOX_W = tw + PAD * 2;

                let lx = px - BOX_W / 2;
                lx = Math.max(chartArea.left, Math.min(chartArea.right - BOX_W, lx));

                let ly = isMax ? py - 8 - BOX_H : py + 8;
                ly = Math.max(chartArea.top, Math.min(chartArea.bottom - BOX_H, ly));

                ctx.beginPath();
                const r = 4;
                ctx.moveTo(lx + r, ly);
                ctx.lineTo(lx + BOX_W - r, ly);
                ctx.arcTo(lx + BOX_W, ly, lx + BOX_W, ly + r, r);
                ctx.lineTo(lx + BOX_W, ly + BOX_H - r);
                ctx.arcTo(lx + BOX_W, ly + BOX_H, lx + BOX_W - r, ly + BOX_H, r);
                ctx.lineTo(lx + r, ly + BOX_H);
                ctx.arcTo(lx, ly + BOX_H, lx, ly + BOX_H - r, r);
                ctx.lineTo(lx, ly + r);
                ctx.arcTo(lx, ly, lx + r, ly, r);
                ctx.closePath();
                ctx.fillStyle   = isMax ? "rgba(239,68,68,0.92)" : "rgba(59,130,246,0.92)";
                ctx.shadowColor = "rgba(0,0,0,0.30)";
                ctx.shadowBlur  = 4;
                ctx.fill();
                ctx.shadowBlur  = 0;

                ctx.fillStyle    = "#ffffff";
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(label, lx + BOX_W / 2, ly + BOX_H / 2);
                ctx.restore();
            };

            drawMarker(ds._maxIdx, true);
            drawMarker(ds._minIdx, false);
        });
    },
});

// ── Convenience: all interactive plugins bundled ──────────────────────────────
// Use this in every graph component instead of listing them individually.
// Usage: plugins={makeChartPlugins()}
export const makeChartPlugins = () => [
    makeGradientPlugin(),
    makeMaxMinPlugin(),
    makeCrosshairPlugin(),
    makeResetZoomPlugin(),
    makeZoomBadgePlugin(),
];

// ── Common Chart options builder ──────────────────────────────────────────────
export const buildOptions = ({
    isDarkMode,
    yLabel = "Value",
    yCallback = null,
    hasFreqAxis = false,
    maxXTicks = 24,
}) => {
    const textColor    = isDarkMode ? "#cbd5e1" : "#334155";
    const textColorSub = isDarkMode ? "#94a3b8" : "#64748b";
    const gridColor    = isDarkMode ? "rgba(148,163,184,0.10)" : "rgba(100,116,139,0.08)";
    const tooltipBg    = isDarkMode ? "rgba(15,23,42,0.96)"   : "rgba(255,255,255,0.98)";
    const tooltipBdr   = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        animation: { duration: 600, easing: "easeInOutQuart" },
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 18,
                    font: { family: "Inter, sans-serif", size: 11, weight: "600" },
                    generateLabels: (chart) =>
                        ChartJS.defaults.plugins.legend.labels.generateLabels(chart).map(item => ({
                            ...item,
                            text: item.text.length > 55 ? item.text.slice(0, 52) + "…" : item.text,
                        })),
                },
            },
            tooltip: {
                mode: "index",
                intersect: false,
                backgroundColor: tooltipBg,
                titleColor: textColor,
                bodyColor: textColorSub,
                borderColor: tooltipBdr,
                borderWidth: 1,
                padding: { x: 14, y: 10 },
                cornerRadius: 10,
                boxPadding: 5,
                titleFont: { family: "Inter, sans-serif", size: 12, weight: "700" },
                bodyFont:  { family: "Inter, sans-serif", size: 11 },
                usePointStyle: true,
                callbacks: {
                    // Show colour swatch dot next to each value
                    labelPointStyle: () => ({ pointStyle: "circle", rotation: 0 }),
                },
            },
            zoom: {
                zoom: {
                    wheel:   { enabled: true, speed: 0.08 },
                    pinch:   { enabled: true },
                    mode:    "xy",
                    onZoom:  ({ chart }) => chart.update("none"),
                },
                pan: {
                    enabled:   true,
                    mode:      "xy",
                    threshold: 5,
                    onPan:     ({ chart }) => chart.update("none"),
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSub,
                    font: { family: "Inter, sans-serif", size: 10 },
                    maxTicksLimit: maxXTicks,
                    maxRotation: 30,
                    minRotation: 0,
                },
                grid:   { color: gridColor },
                border: { color: "transparent" },
                title: {
                    display: true,
                    text: "Date / Time",
                    color: textColorSub,
                    font: { family: "Inter, sans-serif", size: 11 },
                },
            },
            y: {
                type: "linear",
                position: "left",
                ticks: {
                    color: textColorSub,
                    font: { family: "Inter, sans-serif", size: 10 },
                    callback: yCallback || ((v) => v),
                },
                grid:   { color: gridColor },
                border: { color: "transparent" },
                title: {
                    display: true,
                    text: yLabel,
                    color: textColorSub,
                    font: { family: "Inter, sans-serif", size: 11 },
                },
            },
            ...(hasFreqAxis ? {
                yFreq: {
                    type: "linear",
                    position: "right",
                    ticks: {
                        color: FREQ_COLORS.Durgapur,
                        font: { family: "Inter, sans-serif", size: 10 },
                        callback: (v) => `${v} Hz`,
                    },
                    grid: { drawOnChartArea: false },
                    border: { color: "transparent" },
                    title: {
                        display: true,
                        text: "Frequency (Hz)",
                        color: FREQ_COLORS.Durgapur,
                        font: { family: "Inter, sans-serif", size: 11 },
                    },
                },
            } : {}),
        },
    };
};

// ── Frequency overlay dataset builder ─────────────────────────────────────────
export const buildFreqDatasets = (freq_region, frequency, sharedLabels) => {
    if (!freq_region || !frequency) return [];
    const freqStations = [
        { key: "Durgapur", idx: 0 },
        { key: "Jeypore",  idx: 1 },
        { key: "Sasaram",  idx: 2 },
    ];
    return freqStations.flatMap(({ key, idx }) => {
        if (freq_region.indexOf(key) === -1) return [];
        const fd = frequency[idx];
        if (!fd) return [];
        const fColor = FREQ_COLORS[key];
        const fMax = Number(fd["max"]?.[0]?.[0] || 0).toFixed(3);
        const fMin = Number(fd["min"]?.[0]?.[0] || 0).toFixed(3);
        const fAvg = Number(fd["avg"] || 0).toFixed(3);
        return [{
            label: `${fd["stationName"] || key} Freq  ▲${fMax} ▼${fMin} ⌀${fAvg} Hz`,
            data: fd["frequency"] || [],
            borderColor: fColor,
            backgroundColor: hexRgba(fColor, 0),
            borderWidth: 1.6,
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: fColor,
            yAxisID: "yFreq",
            _hex: fColor,
            _fill: false,
        }];
    });
};

// ── X-label formatter ─────────────────────────────────────────────────────────
export const formatXLabels = (arr) =>
    (arr || []).map(t => {
        const m = moment(t, moment.ISO_8601, true);
        return m.isValid() ? m.format("DD-MMM HH:mm") : String(t ?? "");
    });

// ── Max / Min index finder ─────────────────────────────────────────────────────
export const findMaxMin = (dataArr) => {
    if (!dataArr || dataArr.length === 0) return { maxIdx: -1, minIdx: -1 };
    let maxIdx = -1, minIdx = -1;
    let maxVal = -Infinity, minVal = Infinity;
    for (let i = 0; i < dataArr.length; i++) {
        const v = Number(dataArr[i]);
        if (isNaN(v)) continue;
        if (v > maxVal) { maxVal = v; maxIdx = i; }
        if (v < minVal) { minVal = v; minIdx = i; }
    }
    return { maxIdx, minIdx, maxVal, minVal };
};

// ── Excel Export Utility ──────────────────────────────────────────────────────
export const exportGraphToExcel = (data, label, prefix = "Graph") => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    const sharedTimeArr = data[data.length - 1]["Date_Time"] || [];
    const stationMap = {};
    for (let i = 0; i < data.length - 1; i++) {
        const e = data[i];
        const n = e["stationName"] || `Station_${i}`;
        if (!stationMap[n]) stationMap[n] = [];
        stationMap[n].push(e);
    }
    const isSingleRange = Object.values(stationMap).every(entries => entries.length === 1);
    const fmt = (ts) => { const m = moment(ts, moment.ISO_8601, true); return ts ? (m.isValid() ? m.format("DD-MMM-YY HH:mm") : String(ts)) : ""; };
    const fmtT = (ts) => { const m = moment(ts, moment.ISO_8601, true); return ts ? (m.isValid() ? m.format("HH:mm") : String(ts)) : ""; };

    if (isSingleRange) {
        // Single Date: grouped by station
        const stNames = Object.keys(stationMap);
        const rows = sharedTimeArr.map((ts, idx) => {
            const row = { "Date / Time": fmt(ts) };
            stNames.forEach(n => { row[n] = ((stationMap[n][0]["output"] || stationMap[n][0]["actual"] || stationMap[n][0]["demand"] || stationMap[n][0]["voltageBus1"] || stationMap[n][0]["line"] || stationMap[n][0]["frequency"] || stationMap[n][0]["drawal"] || stationMap[n][0]["schedule"]) || [])[idx] ?? ""; });
            return row;
        });
        if (rows.length > 0) {
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0]).map(k => ({ wch: Math.min(Math.max(k.length, ...rows.map(r => String(r[k]??'').length)) + 2, 30) }));
            XLSX.utils.book_append_sheet(wb, ws, `${prefix} Data`.substring(0, 31));
        }
    } else {
        // Multi Date: grouped by date, creating separate sheets for each date/month
        const dateMap = {};
        for (let i = 0; i < data.length - 1; i++) {
            const e = data[i];
            const d = e["Date_Time"] ? moment(e["Date_Time"]).format("DD-MMM-YYYY") : "Value";
            if (!dateMap[d]) dateMap[d] = [];
            dateMap[d].push(e);
        }
        
        Object.entries(dateMap).forEach(([dateStr, entries]) => {
            const stNames = entries.map(e => e["stationName"] || "Unknown");
            const slotCount = Math.max(...entries.map(e => ((e["output"] || e["actual"] || e["demand"] || e["voltageBus1"] || e["line"] || e["frequency"] || e["drawal"] || e["schedule"])||[]).length));
            
            const rows = Array.from({ length: slotCount }, (_, ri) => {
                const row = { "Time": fmtT(sharedTimeArr[ri]) || `Slot ${ri+1}` };
                entries.forEach((e, di) => { 
                    row[stNames[di]] = ((e["output"] || e["actual"] || e["demand"] || e["voltageBus1"] || e["line"] || e["frequency"] || e["drawal"] || e["schedule"])||[])[ri] ?? ""; 
                });
                return row;
            });
            
            if (rows.length > 0) {
                const ws = XLSX.utils.json_to_sheet(rows);
                ws["!cols"] = Object.keys(rows[0]).map(k => ({ wch: Math.min(Math.max(k.length, ...rows.map(r => String(r[k]??'').length)) + 2, 30) }));
                XLSX.utils.book_append_sheet(wb, ws, dateStr.substring(0, 31));
            }
        });
    }
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${prefix}_${label}_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
};
