import React, { useMemo, useRef } from "react";
import moment from "moment";
import { Chart } from "primereact/chart";
import { Chart as ChartJS, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useTheme } from "../context/ThemeContext";

// Register Chart.js core + zoom plugin once
ChartJS.register(...registerables, zoomPlugin);

// ─── Palette ──────────────────────────────────────────────────────────────────
const TRACE_COLORS = [
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#6366f1", // indigo
    "#14b8a6", // teal
];

const FREQ_COLORS = {
    Durgapur: "#ef4444",
    Jeypore:  "#f97316",
    Sasaram:  "#db2777",
};

// ─── Hex → rgba helper ───────────────────────────────────────────────────────
const hexRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

// ─── Gradient factory (canvas-based, created per render) ─────────────────────
const makeGradient = (ctx, hex, height = 400) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0,   hexRgba(hex, 0.35));
    gradient.addColorStop(0.5, hexRgba(hex, 0.12));
    gradient.addColorStop(1,   hexRgba(hex, 0.0));
    return gradient;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ThermalGeneratorgraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);

    // Theme tokens
    const textColor       = isDarkMode ? "#cbd5e1" : "#334155";
    const textColorSub    = isDarkMode ? "#94a3b8" : "#64748b";
    const gridColor       = isDarkMode ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.08)";
    const tooltipBg       = isDarkMode ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.96)";
    const tooltipBorder   = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

    const { chartData, chartOptions } = useMemo(() => {
        if (!props.thermalGenerator_data) return { chartData: {}, chartOptions: {} };

        const datasets = [];
        const dateArr  = props.thermalGenerator_data[props.thermalGenerator_data.length - 1]["Date_Time"] || [];

        // X-axis labels: format as readable time strings
        const labels = dateArr.map(t => {
            const m = moment(t, moment.ISO_8601, true);
            return m.isValid() ? m.format("DD-MMM HH:mm") : String(t);
        });

        let traceIdx = 0;
        let titleSuffix = "";
        let hasFreqAxis = false;
        const hasFreq = props.freq_region && props.freq_region.length > 0;

        // ── Station traces ────────────────────────────────────────────────────
        for (let i = 0; i < props.thermalGenerator_data.length - 1; i++) {
            const entry   = props.thermalGenerator_data[i];
            const stName  = entry["stationName"] || "";
            const max     = entry["max"];
            const min     = entry["min"];
            const avg     = entry["avg"];
            const isMW    = stName.split(" ").pop() === "MW";
            const color   = TRACE_COLORS[traceIdx % TRACE_COLORS.length];

            let nameSuffix = "";
            if (props.date_time && props.check1) {
                nameSuffix = " · " + moment(entry["Date_Time"]).format("DD MMM YY");
                titleSuffix = " — Day-wise";
            }
            if (props.date_time && props.check2) {
                nameSuffix = " · " + moment(entry["Date_Time"]).format("MMM YYYY");
                titleSuffix = " — Month-wise";
            }

            const maxVal = max?.[0]?.[0] != null ? Number(max[0][0]).toFixed(1) : "N/A";
            const minVal = min?.[0]?.[0] != null ? Number(min[0][0]).toFixed(1) : "N/A";
            const avgVal = avg != null ? Number(avg).toFixed(1) : "N/A";
            const legend = `${stName}${nameSuffix}  ▲${maxVal} ▼${minVal} ⌀${avgVal} MW`;

            datasets.push({
                label: legend,
                data: entry["output"] || [],
                borderColor: color,
                backgroundColor: hexRgba(color, 0.1), // fallback; gradient set in plugin below
                borderWidth: isMW ? 2 : 1.6,
                borderDash: isMW ? [] : [6, 3],
                tension: 0.35,
                fill: isMW,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 2,
                yAxisID: "y",
                _hex: color,   // stored for gradient plugin
                _isMW: isMW,
            });
            traceIdx++;
        }

        // ── Frequency overlay traces ──────────────────────────────────────────
        const freqStations = [
            { key: "Durgapur", idx: 0 },
            { key: "Jeypore",  idx: 1 },
            { key: "Sasaram",  idx: 2 },
        ];

        if (props.freq_region && props.frequency) {
            freqStations.forEach(({ key, idx }) => {
                if (props.freq_region.indexOf(key) === -1) return;
                const fd = props.frequency[idx];
                if (!fd) return;
                const fColor = FREQ_COLORS[key];
                const fMax = Number(fd["max"]?.[0]?.[0] || 0).toFixed(3);
                const fMin = Number(fd["min"]?.[0]?.[0] || 0).toFixed(3);
                const fAvg = Number(fd["avg"] || 0).toFixed(3);

                datasets.push({
                    label: `${fd["stationName"] || key} Freq  ▲${fMax} ▼${fMin} ⌀${fAvg} Hz`,
                    data: fd["frequency"] || [],
                    borderColor: fColor,
                    backgroundColor: hexRgba(fColor, 0.0),
                    borderWidth: 1.6,
                    tension: 0.3,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: fColor,
                    yAxisID: "yFreq",
                    _hex: fColor,
                    _isMW: false,
                });
                hasFreqAxis = true;
            });
        }

        // ─── Chart.js data object ─────────────────────────────────────────────
        const data = { labels, datasets };

        // ─── Options ─────────────────────────────────────────────────────────
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            animation: {
                duration: 600,
                easing: "easeInOutQuart",
            },
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 20,
                        font: { family: "Inter, sans-serif", size: 11, weight: "600" },
                        // Shorten labels in the legend box
                        generateLabels: (chart) =>
                            ChartJS.defaults.plugins.legend.labels.generateLabels(chart).map(item => ({
                                ...item,
                                text: item.text.length > 60 ? item.text.slice(0, 57) + "…" : item.text,
                            })),
                    },
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: tooltipBg,
                    titleColor: textColor,
                    bodyColor: textColorSub,
                    borderColor: tooltipBorder,
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 8,
                    titleFont: { family: "Inter, sans-serif", size: 12, weight: "700" },
                    bodyFont: { family: "Inter, sans-serif", size: 11 },
                    callbacks: {
                        label: (ctx) => {
                            const val = ctx.parsed.y;
                            if (val == null) return null;
                            const isFreq = ctx.dataset.yAxisID === "yFreq";
                            return ` ${ctx.dataset.label.split("  ")[0]}: ${Number(val).toFixed(isFreq ? 4 : 2)} ${isFreq ? "Hz" : "MW"}`;
                        },
                    },
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "xy",
                    },
                    pan: {
                        enabled: true,
                        mode: "xy",
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSub,
                        font: { family: "Inter, sans-serif", size: 10 },
                        maxTicksLimit: 24,
                        maxRotation: 30,
                        minRotation: 0,
                    },
                    grid: { color: gridColor, lineWidth: 1 },
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
                        callback: v => `${v} MW`,
                    },
                    grid: { color: gridColor, lineWidth: 1 },
                    border: { color: "transparent" },
                    title: {
                        display: true,
                        text: "Active Power (MW)",
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
                            callback: v => `${v} Hz`,
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

        return { chartData: data, chartOptions: options };
    // Re-run whenever data or theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.thermalGenerator_data, props.freq_region, props.frequency, props.check1, props.check2, isDarkMode]);

    // ── Canvas gradient plugin: inject real canvas gradients after chart mounts ──
    const gradientPlugin = useMemo(() => ({
        id: "generatorGradientFill",
        beforeDatasetsUpdate(chart) {
            const ctx = chart.ctx;
            const { height } = chart.chartArea || {};
            if (!height) return;
            chart.data.datasets.forEach((ds) => {
                if (ds._isMW && ds._hex) {
                    ds.backgroundColor = makeGradient(ctx, ds._hex, height);
                }
            });
        },
    }), []);

    if (!props.thermalGenerator_data) return null;

    return (
        <div style={{ position: "relative", width: "100%", height: "680px", padding: "8px 0" }}>
            <Chart
                ref={chartRef}
                type="line"
                data={chartData}
                options={chartOptions}
                plugins={[gradientPlugin]}
                style={{ width: "100%", height: "100%" }}
            />
            <div style={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: "10px",
                color: isDarkMode ? "#475569" : "#94a3b8",
                userSelect: "none",
            }}>
                Scroll wheel to zoom · Drag to pan · Double-click to reset
            </div>
        </div>
    );
}
