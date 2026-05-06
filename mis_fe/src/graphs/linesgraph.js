import React, { useMemo, useRef } from "react";
import moment from "moment";
import { Chart } from "primereact/chart";
import GraphToolbar from "./GraphToolbar";
import { useTheme } from "../context/ThemeContext";
import {
    TRACE_COLORS,
    hexRgba, makeChartPlugins, buildOptions, buildFreqDatasets, formatXLabels, findMaxMin
} from "./_chartUtils";

export default function Linesgraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);
    const wrapperRef = useRef(null);

    const { chartData, chartOptions } = useMemo(() => {
        if (!props.lines_data || !props.frequency) return { chartData: {}, chartOptions: {} };

        const dateArr = props.lines_data[props.lines_data.length - 1]["Date_Time"] || [];
        const labels  = formatXLabels(dateArr);
        const datasets = [];
        let hasFreqAxis = false;

        for (let i = 0; i < props.lines_data.length - 1; i++) {
            const entry  = props.lines_data[i];
            const max    = entry["max"];
            const min    = entry["min"];
            const avg    = entry["avg"];
            // MW vs MVAR determined by station name suffix or Selected_lines_states
            const isMW   = props.Selected_lines_states?.[i] === entry["stationName"] + " MW";
            const unit   = isMW ? "MW" : "MVAR";
            const color  = TRACE_COLORS[i % TRACE_COLORS.length];

            let nameSuffix = "";
            if (props.date_time) nameSuffix = " · " + moment(entry["Date_Time"]).format("DD MMM YY");
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
                borderDash: [],
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
            yLabel: "Power (MW / MVAR)",
            hasFreqAxis,
        });

        return { chartData: data, chartOptions: options };
    }, [props.lines_data, props.freq_region, props.frequency, props.date_time, props.check2, isDarkMode]);

    if (!props.lines_data) return null;

    return (
        <div ref={wrapperRef} className="pc-chart-wrapper"><GraphToolbar chartRef={chartRef} wrapperRef={wrapperRef} /><div className="pc-chart-body" style={{ height: "650px", padding: "12px 16px" }}>
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
