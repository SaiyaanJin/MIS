import React, { useMemo, useRef } from "react";
import { Chart } from "primereact/chart";
import { useTheme } from "../context/ThemeContext";
import {
    TRACE_COLORS,
    hexRgba, makeChartPlugins, buildOptions, formatXLabels
} from "./_chartUtils";

export default function Dlrgraph(props) {
    const { isDarkMode } = useTheme();
    const chartRef = useRef(null);

    const { chartData, chartOptions } = useMemo(() => {
        if (!props.dlr_data || !props.Selected_dlr_states) return { chartData: {}, chartOptions: {} };

        const dateArr = props.dlr_data[props.dlr_data.length - 1]["Date_Time"] || [];
        const labels  = formatXLabels(dateArr);
        const datasets = [];

        for (let i = 0; i < props.dlr_data.length - 1; i++) {
            const name  = props.Selected_dlr_states[i] || `Line ${i + 1}`;
            const c     = TRACE_COLORS[i * 2 % TRACE_COLORS.length];
            const cFore = TRACE_COLORS[(i * 2 + 1) % TRACE_COLORS.length];

            // Actual (solid + fill)
            datasets.push({
                label: `${name} — Actual`,
                data: props.dlr_data[i]["actual"] || [],
                borderColor: c,
                backgroundColor: hexRgba(c, 0.12),
                borderWidth: 2.2,
                tension: 0.35,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: c,
                yAxisID: "y",
                _hex: c,
                _fill: true,
            });

            // Forecast (dashed, no fill)
            datasets.push({
                label: `${name} — Forecast`,
                data: props.dlr_data[i]["forecast"] || [],
                borderColor: cFore,
                backgroundColor: hexRgba(cFore, 0),
                borderWidth: 1.8,
                borderDash: [8, 4],
                tension: 0.35,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: cFore,
                yAxisID: "y",
                _hex: cFore,
                _fill: false,
            });
        }

        const data = { labels, datasets };
        const options = buildOptions({
            isDarkMode,
            yLabel: "DLR Capacity (MW)",
            yCallback: (v) => `${v} MW`,
        });

        return { chartData: data, chartOptions: options };
    }, [props.dlr_data, props.Selected_dlr_states, isDarkMode]);

    if (!props.dlr_data) return null;

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
