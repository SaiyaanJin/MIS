import React from "react";
import moment from "moment";

import Plot from "react-plotly.js";

export default function Demandgraph(props) {
  var name = "Demand Data of ";
  var data = [];
  var datatype = "MW Data";

  if (props.demand_data) {
    var stsn = "";
    var temp_max_x = [];
    var temp_min_x = [];
    var temp_max_y = [];
    var temp_min_y = [];

    for (var i = 0; i < props.demand_data.length - 1; i++) {
      var max = props.demand_data[i]["max"];
      var min = props.demand_data[i]["min"];
      // var avg = props.demand_data[i]["avg"];

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

      // var name_suffix = "";

      if (props.date_time && props.check1) {
        // name_suffix =
        //   ": " + moment(props.demand_data[i]["Date_Time"]).format("DD-MM-YYYY");
        name = "Day-wise Demand Data of ";
        datatype = "Date-wise MW Data ";
      }

      if (props.date_time && props.check2) {
        // name_suffix =
        //   ": " + moment(props.demand_data[i]["Date_Time"]).format("MMMM YYYY");

        name = " Month-wise Demand Data of ";
        datatype = "Month-wise MW Data ";
      }

      if (i === 0) {
        stsn = props.demand_data[i]["stationName"];
      } else {
        if (
          props.demand_data[i]["stationName"] !==
          props.demand_data[i - 1]["stationName"]
        ) {
          stsn = stsn + ", " + props.demand_data[i]["stationName"];
        }
      }

      if (props.check1) {
        let demand = {
          y: props.demand_data[i]["output"],
          x: props.demand_data[props.demand_data.length - 1]["Date_Time"],

          name:
            props.demand_data[i]["stationName"] +
            " " +
            moment(props.demand_data[i]["Date_Time"]).format("DD-MM-YYYY"),

          type: "line",
        };

        data.push(demand);
      } else if (props.check2) {
        let demand = {
          y: props.demand_data[i]["output"],
          x: props.demand_data[props.demand_data.length - 1]["Date_Time"],

          name:
            props.demand_data[i]["stationName"] +
            " " +
            moment(props.demand_data[i]["Date_Time"]).format("MMMM-YYYY"),

          type: "line",
        };

        data.push(demand);
      } else {
        let demand = {
          y: props.demand_data[i]["output"],
          x: props.demand_data[props.demand_data.length - 1]["Date_Time"],

          name: props.demand_data[i]["stationName"],

          type: "line",
        };

        data.push(demand);
      }

      if (props.freq_region1.indexOf("Demand") > -1) {
        let V_Duration = {
          y: props.demand_data[i]["Duration"][0],
          x: props.demand_data[i]["Duration"][1],
          xaxis: "x2",
          name:
            props.demand_data[i]["stationName"] +
            " Duration of " +
            moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY"),
          type: "line",
        };
        data.push(V_Duration);
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

      if (props.freq_region1.indexOf("Frequency") > -1) {
        let F_Duration = {
          y: props.frequency[0]["Duration"][0],
          x: props.frequency[0]["Duration"][1],
          xaxis: "x2",
          yaxis: "y2",
          name:
            props.frequency[0]["stationName"] +
            " frequency data of " +
            moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY") +
            " Duration",
          type: "line",
        };
        data.push(F_Duration);
      }
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

      if (props.freq_region1.indexOf("Frequency") > -1) {
        let F_Duration = {
          y: props.frequency[1]["Duration"][0],
          x: props.frequency[1]["Duration"][1],
          xaxis: "x2",
          yaxis: "y2",
          name:
            props.frequency[1]["stationName"] +
            " frequency data of " +
            moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY") +
            " Duration",
          type: "line",
        };
        data.push(F_Duration);
      }
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

      if (props.freq_region1.indexOf("Frequency") > -1) {
        let F_Duration = {
          y: props.frequency[2]["Duration"][0],
          x: props.frequency[2]["Duration"][1],
          xaxis: "x2",
          yaxis: "y2",
          name:
            props.frequency[2]["stationName"] +
            " frequency data of " +
            moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY") +
            " Duration",
          type: "line",
        };
        data.push(F_Duration);
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
          tickfont: { color: "#7f7f7f", size: 9 },
        },
        yaxis: {
          title: datatype,
          titlefont: {
            size: 18,
            color: "#009445",
          },
        },

        yaxis2: {
          title: "Frequency Data",

          titlefont: { color: "#8B0000", size: 18 },
          tickfont: { color: "#8B0000" },
          anchor: "free",
          overlaying: "y",
          side: "right",
          position: 1,
        },
        xaxis2: {
          title: "Duration Curve",
          titlefont: { color: "rgb(148, 103, 189)" },
          tickfont: { color: "rgb(148, 103, 189)" },
          overlaying: "x",
          side: "top",
        },
      }}
    />
  );
}
