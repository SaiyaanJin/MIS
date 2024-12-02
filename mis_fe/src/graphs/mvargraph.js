import React from "react";
import moment from "moment";

import Plot from "react-plotly.js";

export default function Mvargraph(props) {
  var name = "MVAR Data of ";
  var data = [];
  var datatype = "MVAR Data";

  if (props.mvar_data) {
    var stsn = "";
    let Durgapur = {};
    let Jeypore = {};
    let Sasaram = {};

    for (var i = 0; i < props.mvar_data.length - 1; i++) {
      var max = props.mvar_data[i]["max"];
      var min = props.mvar_data[i]["min"];
      var avg = props.mvar_data[i]["avg"];

      for (var x = 0; x < props.freq_region.length; x++) {
        if (props.freq_region[x] === "Durgapur") {
          Durgapur = {
            y: props.frequency[0]["frequency"],
            x: props.frequency[3]["Date_Time"],
            yaxis: "y2",
            name:
              props.frequency[0]["stationName"] +
              "(Max:" +
              props.frequency[0]["max"] +
              " HZ, Min:" +
              props.frequency[0]["min"] +
              " HZ, Avg:" +
              props.frequency[0]["avg"] +
              " HZ)",
            type: "line",
          };
        }
        if (props.freq_region[x] === "Jeypore") {
          Jeypore = {
            y: props.frequency[1]["frequency"],
            x: props.frequency[3]["Date_Time"],
            yaxis: "y2",
            name:
              props.frequency[1]["stationName"] +
              "(Max:" +
              props.frequency[1]["max"] +
              " HZ, Min:" +
              props.frequency[1]["min"] +
              " HZ, Avg:" +
              props.frequency[1]["avg"] +
              " HZ)",
            type: "line",
          };
        }
        if (props.freq_region[x] === "Sasaram") {
          Sasaram = {
            y: props.frequency[2]["frequency"],
            x: props.frequency[3]["Date_Time"],
            yaxis: "y2",
            name:
              props.frequency[2]["stationName"] +
              "(Max:" +
              props.frequency[2]["max"] +
              " HZ, Min:" +
              props.frequency[2]["min"] +
              " HZ, Avg:" +
              props.frequency[2]["avg"] +
              " HZ)",
            type: "line",
          };
        }
      }

      var name_suffix = "";

      if (props.date_time && props.check1) {
        name_suffix =
          ": " + moment(props.mvar_data[i]["Date_Time"]).format("DD-MM-YYYY");
        name = "Day-wise MVAR Data of ";
        datatype = "Date-wise MVAR Data";
      }

      if (props.date_time && props.check2) {
        name_suffix =
          ": " + moment(props.mvar_data[i]["Date_Time"]).format("MMMM YYYY");

        name = " Month-wise MVAR Data of ";
        datatype = "Month-wise MVAR Data";
      }

      if (i === 0) {
        stsn = props.mvar_data[i]["stationName"];
      } else {
        if (
          props.mvar_data[i]["stationName"] !==
          props.mvar_data[i - 1]["stationName"]
        ) {
          stsn = stsn + ", " + props.mvar_data[i]["stationName"];
        }
      }

      let mvar_actual = {
        y: props.mvar_data[i]["line"],
        x: props.mvar_data[props.mvar_data.length - 1]["Date_Time"],
        name:
          props.mvar_data[i]["stationName"] +
          " Line" +
          name_suffix +
          "(Max:" +
          max +
          " MW, Min:" +
          min +
          " MW, Avg:" +
          avg +
          " MW)",
        type: "line",
      };

      data.push(mvar_actual, Durgapur, Jeypore, Sasaram);
    }
  }

  return (
    <Plot
      data={data}
      layout={{
        showlegend: true,
        legend: {
          font: {
            family: "Courier New, monospace",
            size: 14,
            color: "#7f7f7f",
          },
          orientation: "h",
          bgcolor: "white",
          xanchor: "center",
          yanchor: "center",
          y: -0.2,
          x: 0.5,
        },
        width: 1900,
        height: 800,
        title: name + stsn,
        xaxis: {
          title: "Dates",
          titlefont: {
            family: "Courier New, monospace",
            size: 18,
            color: "#7f7f7f",
          },
        },
        yaxis: {
          title: datatype,
          titlefont: {
            family: "Courier New, monospace",
            size: 18,
            color: "#7f7f7f",
          },
        },
        yaxis2: {
          title: "Frequency (HZ)",
          titlefont: { color: "#8B0000" },
          tickfont: { color: "#8B0000" },
          anchor: "free",
          overlaying: "y",
          side: "right",
          position: 1,
        },
      }}
    />
  );
}
