import React, { useMemo, useRef } from "react";
import { Chart } from "primereact/chart";
import { useTheme } from "../context/ThemeContext";
import {
    hexRgba, makeChartPlugins, buildOptions, formatXLabels, findMaxMin
} from "./_chartUtils";

const TYPE_PALETTES = {
    Voltage:   ["#3b82f6","#818cf8","#06b6d4","#22d3ee"],
    Frequency: ["#ef4444","#f97316","#fbbf24"],
    Demand:    ["#10b981","#34d399","#6ee7b7"],
    ICT:       ["#8b5cf6","#a78bfa","#c4b5fd"],
    Lines:     ["#f59e0b","#fbbf24","#fde68a"],
};

const TYPE_UNITS = {
    Voltage: "kV", Frequency: "Hz", Demand: "MW", ICT: "MW/MVAR", Lines: "MW/MVAR",
};

const TYPE_DATA_FIELD = {
    Frequency: "frequency",
    Voltage:   "voltageBus1",
    Demand:    "output",
    ICT:       "line",
    Lines:     "line",
};

function buildDatasets(type, graphList) {
    const entries = graphList && graphList[type];
    if (!entries || !Array.isArray(entries)) return [];

    const colors = TYPE_PALETTES[type] || ["#94a3b8"];
    const datasets = [];

    for (let idx = 0; idx < entries.length - 1; idx++) {
        const entry = entries[idx];

        if (type === "Voltage") {
            const c1 = colors[(idx * 2) % colors.length];
            const c2 = colors[(idx * 2 + 1) % colors.length];
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
                yAxisID: "y",
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
                    borderDash: [7, 3],
                    tension: 0.38,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: c2,
                    yAxisID: "y",
                    _hex: c2,
                    _fill: false,
                });
            }
        } else {
            const field = TYPE_DATA_FIELD[type];
            const color = colors[idx % colors.length];
            const isSolid = idx % 2 === 0;
            const name = entry["stationName"] || entry["label"] || (type + " " + (idx + 1));
            const data = entry[field] || [];

            datasets.push({
                label: name + " (" + TYPE_UNITS[type] + ")",
                data: data,
                borderColor: color,
                backgroundColor: hexRgba(color, isSolid ? 0.1 : 0),
                borderWidth: isSolid ? 2.2 : 1.8,
                borderDash: isSolid ? [] : [7, 3],
                tension: 0.38,
                fill: isSolid,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                yAxisID: "y",
                _hex: color,
                _fill: isSolid,
            });
        }
    }

    return datasets;
}

export default function Combinedgraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);

    const { chartData, chartOptions } = useMemo(function() {
        const gl = props.graph_list;
        const activeTypes = [];
        if (props.checkedV && gl && Array.isArray(gl["Voltage"]))    activeTypes.push("Voltage");
        if (props.checkedF && gl && Array.isArray(gl["Frequency"]))  activeTypes.push("Frequency");
        if (props.checkedD && gl && Array.isArray(gl["Demand"]))     activeTypes.push("Demand");
        if (props.checkedI && gl && Array.isArray(gl["ICT"]))        activeTypes.push("ICT");
        if (props.checkedL && gl && Array.isArray(gl["Lines"]))      activeTypes.push("Lines");

        if (activeTypes.length === 0) return { chartData: {}, chartOptions: {} };

        const firstType = activeTypes[0];
        const firstArr = gl && gl[firstType];
        const lastEntry = Array.isArray(firstArr) && firstArr.length > 0 ? firstArr[firstArr.length - 1] : null;
        const timeArr = lastEntry && lastEntry["Date_Time"] ? lastEntry["Date_Time"] : [];
        const labels = formatXLabels(timeArr);

        var datasets = [];
        for (var ti = 0; ti < activeTypes.length; ti++) {
            var typeDs = buildDatasets(activeTypes[ti], gl);
            for (var di = 0; di < typeDs.length; di++) {
                datasets.push(typeDs[di]);
            }
        }

        const data = { labels: labels, datasets: datasets };
        const yLabel = activeTypes.map(function(t) { return TYPE_UNITS[t]; }).join(" / ");
        const options = buildOptions({ isDarkMode: isDarkMode, yLabel: "Combined: " + yLabel });

        return { chartData: data, chartOptions: options };
    }, [props.graph_list, props.checkedV, props.checkedF, props.checkedD, props.checkedI, props.checkedL, isDarkMode]);

    const hasData = props.graph_list && (props.checkedV || props.checkedF || props.checkedD || props.checkedI || props.checkedL);
    if (!hasData) return null;

    return (
        <div style={{ position: "relative", width: "100%", height: "680px", padding: "8px 0" }}>
            <Chart
                ref={chartRef}
                type="line"
                data={chartData}
                options={chartOptions}
                plugins={makeChartPlugins()}
                style={{ width: "100%", height: "100%" }}
            />
            <div style={{ position: "absolute", bottom: 6, right: 10, fontSize: 10, color: "#94a3b8", userSelect: "none", pointerEvents: "none", fontFamily: "Inter, sans-serif", letterSpacing: "0.3px" }}>⊕ Scroll to zoom &nbsp;·&nbsp; ✥ Drag to pan &nbsp;·&nbsp; ↺ Dbl-click to reset</div>
        </div>
    );
}
