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
