import React, { useMemo, useRef } from "react";
import moment from "moment";
import { Chart } from "primereact/chart";
import { useTheme } from "../context/ThemeContext";
import {
    TRACE_COLORS,
    hexRgba, makeChartPlugins, buildOptions, buildFreqDatasets, formatXLabels, findMaxMin
} from "./_chartUtils";

// Bus-1 = solid+fill, Bus-2 = dashed+no-fill with shifted palette
const BUS1_COLORS = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#f97316"];
const BUS2_COLORS = ["#818cf8","#34d399","#fbbf24","#a78bfa","#22d3ee","#fb923c"];

export default function Voltagegraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);

    const { chartData, chartOptions } = useMemo(() => {
        if (!props.voltage_data) return { chartData: {}, chartOptions: {} };

        const dateArr = props.voltage_data[props.voltage_data.length - 1]["Date_Time"] || [];
        const labels  = formatXLabels(dateArr);
        const datasets = [];
        let hasFreqAxis = false;

        for (let i = 0; i < props.voltage_data.length - 1; i++) {
            const entry   = props.voltage_data[i];
            const max_v1  = entry["max_v1"];
            const min_v1  = entry["min_v1"];
            const avg_v1  = entry["avg_v1"];
            const max_v2  = entry["max_v2"];
            const min_v2  = entry["min_v2"];
            const avg_v2  = entry["avg_v2"];
            const c1 = BUS1_COLORS[i % BUS1_COLORS.length];
            const c2 = BUS2_COLORS[i % BUS2_COLORS.length];

            let nameSuffix = "";
            if (props.date_time && props.check1) nameSuffix = " · " + moment(entry["Date_Time"]).format("DD MMM YY");
            if (props.date_time && props.check2) nameSuffix = " · " + moment(entry["Date_Time"]).format("MMM YYYY");

            const f = (v) => v != null ? Number(v).toFixed(2) : "N/A";
            const { maxIdx: _mx1I, minIdx: _mn1I, maxVal: _mx1V, minVal: _mn1V } = findMaxMin(entry["voltageBus1"]);
            const { maxIdx: _mx2I, minIdx: _mn2I, maxVal: _mx2V, minVal: _mn2V } = findMaxMin(entry["voltageBus2"]);

            // Bus-1 (solid + gradient fill)
            datasets.push({
                label: `${entry["stationName"]} BUS-1${nameSuffix}  ▲${f(max_v1?.[0]?.[0])} ▼${f(min_v1?.[0]?.[0])} ⌀${f(avg_v1)} kV`,
                data: entry["voltageBus1"] || [],
                borderColor: c1,
                backgroundColor: hexRgba(c1, 0.12),
                borderWidth: 2.2,
                tension: 0.35,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: c1,
                yAxisID: "y",
                _maxIdx: _mx1I,
                _minIdx: _mn1I,
                _maxVal: _mx1V,
                _minVal: _mn1V,
                _unit: "kV",
                _hex: c1,
                _fill: true,
            });

            // Bus-2 (dashed, no fill)
            datasets.push({
                label: `${entry["stationName"]} BUS-2${nameSuffix}  ▲${f(max_v2?.[0]?.[0])} ▼${f(min_v2?.[0]?.[0])} ⌀${f(avg_v2)} kV`,
                data: entry["voltageBus2"] || [],
                borderColor: c2,
                backgroundColor: hexRgba(c2, 0),
                borderWidth: 1.8,
                borderDash: [],
                tension: 0.35,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: c2,
                yAxisID: "y",
                _maxIdx: _mx2I,
                _minIdx: _mn2I,
                _maxVal: _mx2V,
                _minVal: _mn2V,
                _unit: "kV",
                _hex: c2,
                _fill: false,
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
            yLabel: "Voltage (kV)",
            yCallback: (v) => `${v} kV`,
            hasFreqAxis,
        });

        return { chartData: data, chartOptions: options };
    }, [props.voltage_data, props.freq_region, props.frequency, props.check1, props.check2, isDarkMode]);

    if (!props.voltage_data) return null;

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
