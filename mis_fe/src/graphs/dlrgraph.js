import React from "react";

import Plot from "react-plotly.js";

export default function Dlrgraph(props) {
  var data = [];
  if (props.Selected_dlr_states && props.dlr_data) {
    for (var i = 0; i < props.dlr_data.length - 1; i++) {
      let dlr_actual = {
        y: props.dlr_data[i]["actual"],
        x: props.dlr_data[props.dlr_data.length - 1]["Date_Time"],
        name: props.Selected_dlr_states[i] + " Actual Data",
        type: "line",
      };
      let dlr_forecast = {
        y: props.dlr_data[i]["forecast"],
        x: props.dlr_data[props.dlr_data.length - 1]["Date_Time"],
        name: props.Selected_dlr_states[i] + " Forecast Data",
        type: "line",
        line: {
          dash: "dashdot",
          width: 4,
        },
      };
      data.push(dlr_actual, dlr_forecast);
    }
  }
  return (
    <Plot
      data={data}
      layout={{
        showlegend: true,
        legend: {
          orientation: "h",
          bgcolor: "white",
          xanchor: "center",
          yanchor: "center",
          y: 1.4,
          x: 0.5,
        },
        width: 1900,
        height: 800,
        title: "name",
        xaxis: {
          title: "x Axis",
          titlefont: {
            family: "Courier New, monospace",
            size: 18,
            color: "#7f7f7f",
          },
        },
        yaxis: {
          title: "MW Data",
          titlefont: {
            family: "Courier New, monospace",
            size: 18,
            color: "#7f7f7f",
          },
        },
      }}
    />
  );
}
