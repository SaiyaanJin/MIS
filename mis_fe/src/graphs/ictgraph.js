import React, { useMemo, useRef } from "react";
import moment from "moment";
import { Chart } from "primereact/chart";
import { useTheme } from "../context/ThemeContext";
import {
    TRACE_COLORS,
    hexRgba, makeGradientPlugin, buildOptions, buildFreqDatasets, formatXLabels, findMaxMin, makeMaxMinPlugin
} from "./_chartUtils";

export default function Ictgraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);

    const { chartData, chartOptions } = useMemo(() => {
        if (!props.ict_data) return { chartData: {}, chartOptions: {} };

        const dateArr = props.ict_data[props.ict_data.length - 1]["Date_Time"] || [];
        const labels  = formatXLabels(dateArr);
        const datasets = [];
        let hasFreqAxis = false;

        for (let i = 0; i < props.ict_data.length - 1; i++) {
            const entry  = props.ict_data[i];
            const max    = entry["max"];
            const min    = entry["min"];
            const avg    = entry["avg"];
            const isMW   = entry["stationName"].endsWith("MW");
            const color  = TRACE_COLORS[i % TRACE_COLORS.length];
            const unit   = isMW ? "MW" : "MVAR";

            let nameSuffix = "";
            if (props.date_time && props.check1) nameSuffix = " · " + moment(entry["Date_Time"]).format("DD MMM YY");
            if (props.date_time && props.check2) nameSuffix = " · " + moment(entry["Date_Time"]).format("MMM YYYY");

            const maxVal = max?.[0]?.[0] != null ? Number(max[0][0]).toFixed(2) : "N/A";
            const minVal = min?.[0]?.[0] != null ? Number(min[0][0]).toFixed(2) : "N/A";
            const avgVal = avg != null ? Number(avg).toFixed(2) : "N/A";
            const { maxIdx: _mxI, minIdx: _mnI, maxVal: _mxV, minVal: _mnV } = findMaxMin(entry["line"]);

            datasets.push({
                label: `${entry["stationName"]}${nameSuffix}  ▲${maxVal} ▼${minVal} ⌀${avgVal} ${unit}`,
                data: entry["line"] || [],
                borderColor: color,
                backgroundColor: hexRgba(color, 0.1),
                borderWidth: isMW ? 2 : 1.6,
                borderDash: isMW ? [] : [6, 3],
                tension: 0.35,
                fill: isMW,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                yAxisID: "y",
                _maxIdx: _mxI,
                _minIdx: _mnI,
                _maxVal: _mxV,
                _minVal: _mnV,
                _unit: unit,
                _hex: color,
                _fill: isMW,
            });
        }

        // Frequency overlays
        if (props.freq_region && props.frequency) {
            const freqDs = buildFreqDatasets(props.freq_region, props.frequency, labels);
            if (freqDs.length) { datasets.push(...freqDs); hasFreqAxis = true; }
        }

        const data = { labels, datasets };
        const options = buildOptions({
            isDarkMode,
            yLabel: "Active / Reactive Power (MW / MVAR)",
            hasFreqAxis,
        });

        return { chartData: data, chartOptions: options };
    }, [props.ict_data, props.freq_region, props.frequency, props.check1, props.check2, isDarkMode]);

    if (!props.ict_data) return null;

    return (
        <div style={{ position: "relative", width: "100%", height: "650px", padding: "8px 0" }}>
            <Chart
                ref={chartRef}
                type="line"
                data={chartData}
                options={chartOptions}
                plugins={[makeGradientPlugin(), makeMaxMinPlugin()]}
                style={{ width: "100%", height: "100%" }}
            />
            <div style={{ position: "absolute", bottom: 6, right: 10, fontSize: 10, color: "#94a3b8", userSelect: "none", pointerEvents: "none" }}>Scroll to zoom � Drag to pan � Dbl-click to reset</div>
        </div>
    );
}
