import React from "react";
import moment from "moment";

import Plot from "react-plotly.js";

export default function Linesgraph(props) {
  var name = "Lines Data of ";
  var data = [];
  var datatype = "MW Data";

  if (props.lines_data && props.frequency) {
    var stsn = "";
    var temp_max_x = [];
    var temp_min_x = [];
    var temp_max_y = [];
    var temp_min_y = [];

    for (var i = 0; i < props.lines_data.length - 1; i++) {
      var max = props.lines_data[i]["max"];
      var min = props.lines_data[i]["min"];
      var avg = props.lines_data[i]["avg"];

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

      if (props.date_time) {
        name_suffix =
          ": " + moment(props.lines_data[i]["Date_Time"]).format("DD-MM-YYYY");
        name = "Day-wise Lines Data of ";
        datatype = "Date-wise MW Data";
      }

      if (props.date_time && props.check2) {
        name_suffix =
          ": " + moment(props.lines_data[i]["Date_Time"]).format("MMMM YYYY");

        name = " Month-wise Lines Data of ";
        datatype = "Month-wise MW Data";
      }

      if (i === 0) {
        stsn = props.lines_data[i]["stationName"];
      } else {
        if (
          props.lines_data[i]["stationName"] !==
          props.lines_data[i - 1]["stationName"]
        ) {
          stsn = stsn + ", " + props.lines_data[i]["stationName"];
        }
      }

      if (
        props.Selected_lines_states[i] ===
        props.lines_data[i]["stationName"] + " MW"
      ) {
        let lines_actual = {
          y: props.lines_data[i]["line"],
          x: props.lines_data[props.lines_data.length - 1]["Date_Time"],
          name:
            props.lines_data[i]["stationName"] +
            " Line" +
            name_suffix +
            "(Max:" +
            max[0][0] +
            " MW, Min:" +
            min[0][0] +
            " MW, Avg:" +
            avg +
            " MW)",

          type: "line",
        };

        data.push(lines_actual);
      } else {
        let lines_actual = {
          y: props.lines_data[i]["line"],
          x: props.lines_data[props.lines_data.length - 1]["Date_Time"],
          name:
            props.lines_data[i]["stationName"] +
            " Line" +
            name_suffix +
            "(Max:" +
            max[0][0] +
            " MVAR, Min:" +
            min[0][0] +
            " MVAR, Avg:" +
            avg +
            " MVAR)",

          type: "line",
          line: {
            dash: "dashdot",
            width: 1.7,
          },
        };

        data.push(lines_actual);
      }
    }

    if (props.freq_region.indexOf("Durgapur") > -1) {
      let Durgapur = {
        y: props.frequency[0]["frequency"],
        x: props.frequency[3]["Date_Time"],
        yaxis: "y2",
        name:
          props.frequency[0]["stationName"] +
          " frequency data of " +
          moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY") +
          "(Max:" +
          props.frequency[0]["max"][0][0] +
          " HZ, Min:" +
          props.frequency[0]["min"][0][0] +
          " HZ, Avg:" +
          props.frequency[0]["avg"] +
          " HZ)",
        type: "line",
      };

      data.push(Durgapur);
    }

    if (props.freq_region.indexOf("Jeypore") > -1) {
      let Jeypore = {
        y: props.frequency[1]["frequency"],
        x: props.frequency[3]["Date_Time"],
        yaxis: "y2",
        name:
          props.frequency[1]["stationName"] +
          " frequency data of " +
          moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY") +
          "(Max:" +
          props.frequency[1]["max"][0][0] +
          " HZ, Min:" +
          props.frequency[1]["min"][0][0] +
          " HZ, Avg:" +
          props.frequency[1]["avg"] +
          " HZ)",
        type: "line",
      };
      data.push(Jeypore);
    }

    if (props.freq_region.indexOf("Sasaram") > -1) {
      let Sasaram = {
        y: props.frequency[2]["frequency"],
        x: props.frequency[3]["Date_Time"],
        yaxis: "y2",
        name:
          props.frequency[2]["stationName"] +
          " frequency data of " +
          moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY") +
          "(Max:" +
          props.frequency[2]["max"][0][0] +
          " HZ, Min:" +
          props.frequency[2]["min"][0][0] +
          " HZ, Avg:" +
          props.frequency[2]["avg"] +
          " HZ)",
        type: "line",
      };
      data.push(Sasaram);
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
            " at " +
            d.points[0].x +
            " of " +
            d.points[0].data["name"]
        );
      }}
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
          yanchor: "bottom",
          y: -0.3,
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
