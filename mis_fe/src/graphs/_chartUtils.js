/**
 * Shared Chart.js utilities for all MIS graph components.
 * Provides palette, gradient factory, zoom plugin, and option builders.
 */
import moment from "moment";
import { Chart as ChartJS, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

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

// ── Gradient plugin (inject into Chart.js) ────────────────────────────────────
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
    const tooltipBg    = isDarkMode ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.96)";
    const tooltipBdr   = isDarkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        animation: { duration: 550, easing: "easeInOutQuart" },
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
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: "Inter, sans-serif", size: 12, weight: "700" },
                bodyFont: { family: "Inter, sans-serif", size: 11 },
            },
            zoom: {
                zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "xy" },
                pan:  { enabled: true, mode: "xy" },
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
// Returns { maxIdx, minIdx } for a numeric array (skips null/undefined).
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

// ── Max / Min annotation plugin ───────────────────────────────────────────────
// Datasets opt in by setting: _maxIdx, _minIdx, _maxVal, _minVal, _unit, _hex
// Draws a filled circle + value callout label at the peak and trough of each trace.
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

                const px = point.x;
                const py = point.y;
                const val = isMax ? ds._maxVal : ds._minVal;
                if (val == null) return;

                // ── Dot ──────────────────────────────────────────────────────
                ctx.save();
                ctx.beginPath();
                ctx.arc(px, py, 6, 0, 2 * Math.PI);
                ctx.fillStyle   = isMax ? "#ef4444" : "#3b82f6";   // red = max, blue = min
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth   = 2;
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // ── Label background + text ───────────────────────────────────
                const symbol = isMax ? "▲" : "▼";
                const label  = `${symbol} ${Number(val).toFixed(2)}${unit ? " " + unit : ""}`;
                ctx.save();
                ctx.font = "bold 10px Inter, sans-serif";
                const tw = ctx.measureText(label).width;

                // Determine label position: above for max, below for min
                const PAD   = 4;
                const BOX_H = 16;
                const BOX_W = tw + PAD * 2;

                // Clamp horizontally inside chart area
                let lx = px - BOX_W / 2;
                lx = Math.max(chartArea.left, Math.min(chartArea.right - BOX_W, lx));

                let ly = isMax ? py - 8 - BOX_H : py + 8;
                // Clamp vertically inside chart area
                ly = Math.max(chartArea.top, Math.min(chartArea.bottom - BOX_H, ly));

                // Background pill
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
                ctx.shadowBlur = 0;

                // Text
                ctx.fillStyle  = "#ffffff";
                ctx.textAlign  = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(label, lx + BOX_W / 2, ly + BOX_H / 2);
                ctx.restore();
            };

            drawMarker(ds._maxIdx, true);
            drawMarker(ds._minIdx, false);
        });
    },
});
