import React from "react";
import moment from "moment";

import Plot from "react-plotly.js";

export default function Frequencygraph(props) {
  var name = "Frequency Data of ";
  var data = [];
  var datatype = "Frequency Data";

  if (props.frequency_data) {
    var stsn = "";
    var temp_max_x = [];
    var temp_min_x = [];
    var temp_max_y = [];
    var temp_min_y = [];

    for (var i = 0; i < props.frequency_data.length - 1; i++) {
      var max = props.frequency_data[i]["max"];
      var min = props.frequency_data[i]["min"];
      // var avg = props.frequency_data[i]["avg"];

      if (i === 0) {
        temp_max_y = max[0];
        temp_max_x = max[1];
        temp_min_y = min[0];
        temp_min_x = min[1];
      } else {
        temp_max_y = [...temp_max_y, ...max[0]];
        temp_max_x = [...temp_max_x, ...max[1]];
        temp_min_y = [...temp_min_y, ...min[0]];
        temp_min_x = [...temp_min_x, ...min[1]];
      }

      var name_suffix = "";

      if (props.date_time && props.check1) {
        name_suffix =
          ": " +
          moment(props.frequency_data[i]["Date_Time"]).format("DD-MM-YYYY");
        name = "Day-wise Frequency Data of ";
        datatype = "Date-wise Frequency Data";
      }

      if (props.date_time && props.check2) {
        name_suffix =
          ": " +
          moment(props.frequency_data[i]["Date_Time"]).format("MMMM YYYY");

        name = " Month-wise Frequency Data of ";
        datatype = "Month-wise Frequency Data";
      }

      if (i === 0) {
        stsn = props.frequency_data[i]["stationName"];
      } else {
        if (
          props.frequency_data[i]["stationName"] !==
          props.frequency_data[i - 1]["stationName"]
        ) {
          stsn = stsn + ", " + props.frequency_data[i]["stationName"];
        }
      }

      if (props.check1) {
        let frequency = {
          y: props.frequency_data[i]["frequency"],
          x: props.frequency_data[props.frequency_data.length - 1]["Date_Time"],

          name:
            props.frequency_data[i]["stationName"] +
            " " +
            moment(props.frequency_data[i]["Date_Time"]).format("DD-MM-YYYY"),

          type: "line",
        };

        data.push(frequency);
      } else if (props.check2) {
        let frequency = {
          y: props.frequency_data[i]["frequency"],
          x: props.frequency_data[props.frequency_data.length - 1]["Date_Time"],

          name:
            props.frequency_data[i]["stationName"] +
            " " +
            moment(props.frequency_data[i]["Date_Time"]).format("MMMM-YYYY"),

          type: "line",
        };

        data.push(frequency);
      } else {
        let frequency = {
          y: props.frequency_data[i]["frequency"],
          x: props.frequency_data[props.frequency_data.length - 1]["Date_Time"],

          name: props.frequency_data[i]["stationName"],

          type: "line",
        };

        data.push(frequency);
      }

      if (props.duration.length > 0) {
        let duration = {
          y: props.frequency_data[i]["Duration"][0],
          x: props.frequency_data[i]["Duration"][1],
          xaxis: "x2",
          name:
            props.frequency_data[i]["stationName"] + " Duration" + name_suffix,
          type: "line",
        };

        data.push(duration);
      }
    }

    let max_in = {
      y: temp_max_y,
      x: temp_max_x,

      name: "Maximums",
      mode: "markers",
      type: "scatter",
      marker: { color: "#03ef01" },
    };

    let min_in = {
      y: temp_min_y,
      x: temp_min_x,

      name: "Minimums",
      mode: "markers",
      type: "scatter",
      marker: { color: "#000000" },
    };

    data.push(max_in);
    data.push(min_in);
  }
  return (
    <Plot
      data={data}
      onClick={(d) => {
        alert(
          d.points[0].y +
            " HZ at " +
            d.points[0].x +
            " of " +
            d.points[0].data["name"]
        );
      }}
      layout={{
        hovermode: "closest",
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
          // title: "Dates",
          titlefont: {
            family: "Courier New, monospace",
            size: 10,
            color: "#7f7f7f",
          },
          tickfont: { color: "#7f7f7f", size: 9 },
        },
        yaxis: {
          title: datatype,
          titlefont: {
            family: "Courier New, monospace",
            size: 18,
            color: "#7f7f7f",
          },
        },
        xaxis2: {
          title: "Frequency Duration Curve",
          titlefont: { color: "rgb(148, 103, 189)" },
          tickfont: { color: "rgb(148, 103, 189)" },
          overlaying: "x",
          side: "top",
        },
      }}
    />
  );
}
