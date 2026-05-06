import React, { useMemo, useRef } from "react";
import moment from "moment";
import { Chart } from "primereact/chart";
import { useTheme } from "../context/ThemeContext";
import {
    TRACE_COLORS, FREQ_COLORS,
    hexRgba, makeChartPlugins, buildOptions, buildFreqDatasets, formatXLabels, findMaxMin
} from "./_chartUtils";

export default function Frequencygraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);

    const { chartData, chartOptions } = useMemo(() => {
        if (!props.frequency_data) return { chartData: {}, chartOptions: {} };

        const dateArr = props.frequency_data[props.frequency_data.length - 1]["Date_Time"] || [];
        const labels  = formatXLabels(dateArr);
        const datasets = [];

        for (let i = 0; i < props.frequency_data.length - 1; i++) {
            const entry = props.frequency_data[i];
            const max   = entry["max"];
            const min   = entry["min"];
            const avg   = entry["avg"];
            const color = TRACE_COLORS[i % TRACE_COLORS.length];

            let nameSuffix = "";
            if (props.date_time && props.check1) nameSuffix = " · " + moment(entry["Date_Time"]).format("DD MMM YY");
            if (props.date_time && props.check2) nameSuffix = " · " + moment(entry["Date_Time"]).format("MMM YYYY");

            const maxVal = max?.[0]?.[0] != null ? Number(max[0][0]).toFixed(4) : "N/A";
            const minVal = min?.[0]?.[0] != null ? Number(min[0][0]).toFixed(4) : "N/A";
            const avgVal = avg != null ? Number(avg).toFixed(4) : "N/A";
            const { maxIdx: _mxI, minIdx: _mnI, maxVal: _mxV, minVal: _mnV } = findMaxMin(entry["frequency"]);

            datasets.push({
                label: `${entry["stationName"]}${nameSuffix}  ▲${maxVal} ▼${minVal} ⌀${avgVal} Hz`,
                data: entry["frequency"] || [],
                borderColor: color,
                backgroundColor: hexRgba(color, 0.1),
                borderWidth: 2,
                tension: 0.35,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                yAxisID: "y",
                _maxIdx: _mxI,
                _minIdx: _mnI,
                _maxVal: _mxV,
                _minVal: _mnV,
                _unit: "Hz",
                _hex: color,
                _fill: true,
            });
        }

        const data = { labels, datasets };
        const options = buildOptions({
            isDarkMode,
            yLabel: "Frequency (Hz)",
            yCallback: (v) => `${v} Hz`,
        });

        return { chartData: data, chartOptions: options };
    }, [props.frequency_data, props.check1, props.check2, isDarkMode]);

    if (!props.frequency_data) return null;

    return (
        <div style={{ position: "relative", width: "100%", height: "650px", padding: "8px 0" }}>
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
