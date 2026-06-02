import React, { useMemo, useRef } from "react";
import { Chart } from "primereact/chart";
import GraphToolbar from "./GraphToolbar";
import { useTheme } from "../context/ThemeContext";
import {
    hexRgba, makeChartPlugins, buildOptions, formatXLabels,
} from "./_chartUtils";

// ── Per-type colour palettes ────────────────────────────────────────────────
const TYPE_PALETTES = {
    Voltage:   ["#3b82f6", "#818cf8", "#06b6d4", "#22d3ee"],
    Frequency: ["#ef4444", "#f97316", "#fbbf24"],
    Demand:    ["#10b981", "#34d399", "#6ee7b7"],
    ICT:       ["#8b5cf6", "#a78bfa", "#c4b5fd"],
    Lines:     ["#f59e0b", "#fbbf24", "#fde68a"],
};

// ── Unit strings ─────────────────────────────────────────────────────────────
const TYPE_UNITS = {
    Voltage: "kV", Frequency: "Hz", Demand: "MW", ICT: "MW/MVAR", Lines: "MW/MVAR",
};

// ── Data field names ──────────────────────────────────────────────────────────
const TYPE_DATA_FIELD = {
    Frequency: "frequency",
    Voltage:   "voltageBus1",
    Demand:    "output",
    ICT:       "line",
    Lines:     "line",
};

// ── Accent colour for each type's Y-axis title / ticks / border ──────────────
const TYPE_AXIS_COLOR = {
    Voltage:   "#3b82f6",
    Frequency: "#ef4444",
    Demand:    "#10b981",
    ICT:       "#8b5cf6",
    Lines:     "#f59e0b",
};

// ── Dataset builder (now accepts an explicit yAxisID) ─────────────────────────
function buildDatasets(type, graphList, yAxisID) {
    const entries = graphList && graphList[type];
    if (!entries || !Array.isArray(entries)) return [];

    const colors   = TYPE_PALETTES[type]   || ["#94a3b8"];
    const datasets = [];

    for (let idx = 0; idx < entries.length - 1; idx++) {
        const entry = entries[idx];

        if (type === "Voltage") {
            const c1   = colors[(idx * 2)     % colors.length];
            const c2   = colors[(idx * 2 + 1) % colors.length];
            const bus1 = entry["voltageBus1"] || [];
            const bus2 = entry["voltageBus2"] || [];
            const name = entry["stationName"] || ("Station " + (idx + 1));

            datasets.push({
                label: name + " BUS-1 (" + TYPE_UNITS[type] + ")",
                data: bus1,
                borderColor: c1,
                backgroundColor: hexRgba(c1, 0.1),
                borderWidth: 2.2,
                tension: 0.38,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: c1,
                yAxisID,
                _hex: c1,
                _fill: true,
            });

            if (bus2.length > 0) {
                datasets.push({
                    label: name + " BUS-2 (" + TYPE_UNITS[type] + ")",
                    data: bus2,
                    borderColor: c2,
                    backgroundColor: hexRgba(c2, 0),
                    borderWidth: 1.8,
                    borderDash: [],
                    tension: 0.38,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: c2,
                    yAxisID,
                    _hex: c2,
                    _fill: false,
                });
            }
        } else {
            const field   = TYPE_DATA_FIELD[type];
            const color   = colors[idx % colors.length];
            const isSolid = idx % 2 === 0;
            const name    = entry["stationName"] || entry["label"] || (type + " " + (idx + 1));
            const data    = entry[field] || [];

            datasets.push({
                label: name + " (" + TYPE_UNITS[type] + ")",
                data,
                borderColor: color,
                backgroundColor: hexRgba(color, isSolid ? 0.1 : 0),
                borderWidth: isSolid ? 2.2 : 1.8,
                borderDash: [],
                tension: 0.38,
                fill: isSolid,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                yAxisID,
                _hex: color,
                _fill: isSolid,
            });
        }
    }

    return datasets;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Combinedgraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef   = useRef(null);
    const wrapperRef = useRef(null);

    const { chartData, chartOptions } = useMemo(() => {
        const gl = props.graph_list;

        // Collect active data types in a stable order
        const activeTypes = [];
        if (props.checkedV && gl && Array.isArray(gl["Voltage"]))   activeTypes.push("Voltage");
        if (props.checkedF && gl && Array.isArray(gl["Frequency"])) activeTypes.push("Frequency");
        if (props.checkedD && gl && Array.isArray(gl["Demand"]))    activeTypes.push("Demand");
        if (props.checkedI && gl && Array.isArray(gl["ICT"]))       activeTypes.push("ICT");
        if (props.checkedL && gl && Array.isArray(gl["Lines"]))     activeTypes.push("Lines");

        if (activeTypes.length === 0) return { chartData: {}, chartOptions: {} };

        // X-axis labels – taken from the last (meta) entry of the first active type
        const firstArr  = gl[activeTypes[0]];
        const lastEntry = Array.isArray(firstArr) && firstArr.length > 0
            ? firstArr[firstArr.length - 1]
            : null;
        const timeArr = lastEntry && lastEntry["Date_Time"] ? lastEntry["Date_Time"] : [];
        const labels  = formatXLabels(timeArr);

        // Theme colours
        const textColorSub = isDarkMode ? "#94a3b8" : "#64748b";
        const gridColor    = isDarkMode
            ? "rgba(148,163,184,0.10)"
            : "rgba(100,116,139,0.08)";

        // Build datasets and per-type Y axes (alternating left / right)
        const datasets = [];
        const yScales  = {};

        for (let ti = 0; ti < activeTypes.length; ti++) {
            const type        = activeTypes[ti];
            const yAxisID     = "y_" + type;
            const accentColor = TYPE_AXIS_COLOR[type] || textColorSub;
            const isFirst     = ti === 0;

            yScales[yAxisID] = {
                type: "linear",
                position: ti % 2 === 0 ? "left" : "right",
                ticks: {
                    color: accentColor,
                    font: { family: "Inter, sans-serif", size: 10 },
                },
                grid: {
                    color: isFirst ? gridColor : "transparent",
                    drawOnChartArea: isFirst,
                },
                border: { color: accentColor, width: 1.5 },
                title: {
                    display: true,
                    text: type + " (" + TYPE_UNITS[type] + ")",
                    color: accentColor,
                    font: { family: "Inter, sans-serif", size: 11, weight: "700" },
                },
            };

            datasets.push(...buildDatasets(type, gl, yAxisID));
        }

        const data = { labels, datasets };

        // Start from the shared base options then replace the scales block.
        // We deliberately exclude the default single "y" scale to avoid a
        // blank phantom axis appearing alongside our named per-type axes.
        const baseOptions = buildOptions({ isDarkMode, yLabel: "" });
        // eslint-disable-next-line no-unused-vars
        const { y: _drop, ...xScaleOnly } = baseOptions.scales || {};

        const options = {
            ...baseOptions,
            scales: {
                x: xScaleOnly.x,
                ...yScales,
            },
        };

        return { chartData: data, chartOptions: options };
    }, [
        props.graph_list,
        props.checkedV, props.checkedF, props.checkedD,
        props.checkedI, props.checkedL,
        isDarkMode,
    ]);

    const hasData = props.graph_list &&
        (props.checkedV || props.checkedF || props.checkedD || props.checkedI || props.checkedL);

    if (!hasData) return null;

    return (
        <div ref={wrapperRef} className="pc-chart-wrapper">
            <GraphToolbar chartRef={chartRef} wrapperRef={wrapperRef} />
            <div className="pc-chart-body" style={{ height: "680px", padding: "12px 16px" }}>
                <Chart
                    ref={chartRef}
                    type="line"
                    data={chartData}
                    options={chartOptions}
                    plugins={makeChartPlugins()}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
}
