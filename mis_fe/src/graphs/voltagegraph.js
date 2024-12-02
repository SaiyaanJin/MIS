import React from "react";
import moment from "moment";

// import Plotly from "plotly.js-dist-min";
import Plot from "react-plotly.js";

export default function Voltagegraph(props) {
	var name = "Voltage Data of ";
	var data = [];
	var datatype = "KV";

	if (props.voltage_data) {
		var stsn = "";
		var temp_max_x1 = [];
		var temp_min_x1 = [];
		var temp_max_y1 = [];
		var temp_min_y1 = [];

		var temp_max_x2 = [];
		var temp_min_x2 = [];
		var temp_max_y2 = [];
		var temp_min_y2 = [];

		for (var i = 0; i < props.voltage_data.length - 1; i++) {
			var max_v1 = props.voltage_data[i]["max_v1"];
			var min_v1 = props.voltage_data[i]["min_v1"];
			var avg_v1 = props.voltage_data[i]["avg_v1"];
			var max_v2 = props.voltage_data[i]["max_v2"];
			var min_v2 = props.voltage_data[i]["min_v2"];
			var avg_v2 = props.voltage_data[i]["avg_v2"];

			if (i === 0) {
				temp_max_y1 = max_v1[0];
				temp_max_x1 = max_v1[1];
				temp_min_y1 = min_v1[0];
				temp_min_x1 = min_v1[1];

				temp_max_y2 = max_v2[0];
				temp_max_x2 = max_v2[1];
				temp_min_y2 = min_v2[0];
				temp_min_x2 = min_v2[1];
			} else {
				temp_max_y1 = [...temp_max_y1, ...max_v1[0]];
				temp_max_x1 = [...temp_max_x1, ...max_v1[1]];
				temp_min_y1 = [...temp_min_y1, ...min_v1[0]];
				temp_min_x1 = [...temp_min_x1, ...min_v1[1]];

				temp_max_y2 = [...temp_max_y2, ...max_v2[0]];
				temp_max_x2 = [...temp_max_x2, ...max_v2[1]];
				temp_min_y2 = [...temp_min_y2, ...min_v2[0]];
				temp_min_x2 = [...temp_min_x2, ...min_v2[1]];
			}

			var name_suffix = "";

			if (props.date_time && props.check1) {
				name_suffix =
					": " +
					moment(props.voltage_data[i]["Date_Time"]).format("DD-MM-YYYY");
				name = "Date-wise Voltage Data of ";
				datatype = "Date-wise KV Data";
			}

			if (props.date_time && props.check2) {
				name_suffix =
					": " + moment(props.voltage_data[i]["Date_Time"]).format("MMMM YYYY");

				name = " Month-wise Voltage Data of ";
				datatype = "Month-wise KV Data";
			}

			if (i === 0) {
				stsn = props.voltage_data[i]["stationName"];
			} else {
				if (
					props.voltage_data[i]["stationName"] !==
					props.voltage_data[i - 1]["stationName"]
				) {
					stsn = stsn + ", " + props.voltage_data[i]["stationName"];
				}
			}

			let voltage_actual = {
				y: props.voltage_data[i]["voltageBus1"],
				x: props.voltage_data[props.voltage_data.length - 1]["Date_Time"],
				yaxis: "y1",
				name:
					props.voltage_data[i]["stationName"] +
					" BUS-1" +
					name_suffix +
					"(Max:" +
					max_v1[0][0] +
					" KV, Min:" +
					min_v1[0][0] +
					" KV, Avg:" +
					avg_v1 +
					" KV)",

				type: "line",
			};

			let voltage_forecast = {
				y: props.voltage_data[i]["voltageBus2"],
				x: props.voltage_data[props.voltage_data.length - 1]["Date_Time"],
				yaxis: "y1",
				name:
					props.voltage_data[i]["stationName"] +
					" BUS-2" +
					name_suffix +
					"(Max:" +
					max_v2[0][0] +
					" KV, Min:" +
					min_v2[0][0] +
					" KV, Avg:" +
					avg_v2 +
					" KV)",
				type: "line",
				line: {
					dash: "dashdot",
					width: 1.7,
				},
			};
			data.push(voltage_actual, voltage_forecast);

			if (props.freq_region1.indexOf("Voltage") > -1) {
				let V_Duration1 = {
					y: props.voltage_data[i]["voltageBus1 Duration"][0],
					x: props.voltage_data[i]["voltageBus1 Duration"][1],
					xaxis: "x2",
					name:
						props.voltage_data[i]["stationName"] +
						" Bus-1 Duration of " +
						moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY"),
					type: "line",
				};
				data.push(V_Duration1);

				let V_Duration2 = {
					y: props.voltage_data[i]["voltageBus2 Duration"][0],
					x: props.voltage_data[i]["voltageBus2 Duration"][1],
					xaxis: "x2",
					name:
						props.voltage_data[i]["stationName"] +
						" Bus-1 Duration of " +
						moment(props.frequency[0]["Date_Time"]).format("DD-MM-YYYY"),
					type: "line",
					line: {
						dash: "dashdot",
						width: 1.7,
					},
				};
				data.push(V_Duration2);
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

		temp_max_y1 = [...temp_max_y1, ...temp_max_y2];
		temp_max_x1 = [...temp_max_x1, ...temp_max_x2];
		temp_min_y1 = [...temp_min_y1, ...temp_min_y2];
		temp_min_x1 = [...temp_min_x1, ...temp_min_x2];

		let max_in1 = {
			y: temp_max_y1,
			x: temp_max_x1,

			name: "Maximums",
			mode: "markers",
			type: "scatter",
			marker: { color: "#03ef01" },
		};

		let min_in1 = {
			y: temp_min_y1,
			x: temp_min_x1,

			name: "Minimums",
			mode: "markers",
			type: "scatter",
			marker: { color: "#000000" },
		};

		// let max_in2 = {
		//   y: temp_max_y2,
		//   x: temp_max_x2,

		//   name: "Maximums",
		//   mode: "markers",
		//   type: "scatter",
		//   marker: { color: "#101820FF" },
		// };

		// let min_in2 = {
		//   y: temp_min_y2,
		//   x: temp_min_x2,

		//   name: "Minimums",
		//   mode: "markers",
		//   type: "scatter",
		//   marker: { color: "#101820FF" },
		// };

		data.push(max_in1);
		data.push(min_in1);
		// data.push(max_in2);
		// data.push(min_in2);
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
				yaxis2: {
					title: "Frequency (HZ)",
					titlefont: { color: "#8B0000" },
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
