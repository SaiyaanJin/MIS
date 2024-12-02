import React from "react";
// import moment from "moment";

import Plot from "react-plotly.js";

export default function Combinedgraph(props) {
	var name = "Combined Plot of";
	var data = [];

	// var temp_max_x = [];
	// var temp_min_x = [];
	// var temp_max_y = [];
	// var temp_min_y = [];

	var fYtype = "y";
	var vYtype = "y";
	var dYtype = "y";
	var iYtype = "y";
	var lYtype = "y";

	var name1 = "";
	var name2 = "";
	var name3 = "";
	var name4 = "";
	var name5 = "";

	var color0 = "#ffc538";
	var color1 = "#ff5f37";
	var color2 = "#5bbf71";
	var color3 = "#0771ee";
	var color4 = "#c78aff";
	var color5 = "#7f4d43";

	var selections = [];

	if (props.checkedV && props.graph_list["Voltage"]) {
		name = name + " Voltage";
		selections.push("Voltage");
	}
	if (props.checkedF && props.graph_list["Frequency"]) {
		name = name + " Frequency";
		selections.push("Frequency");
	}
	if (props.checkedD && props.graph_list["Demand"]) {
		name = name + " Demand";
		selections.push("Demand");
	}
	if (props.checkedI && props.graph_list["ICT"]) {
		name = name + " ICT";
		selections.push("ICT");
	}
	if (props.checkedL && props.graph_list["Lines"]) {
		name = name + " Lines";
		selections.push("Lines");
	}

	if (selections.length > 0) {
		name1 = selections[0] + " Data";

		if (selections[1] === "Frequency" && props.graph_list["Frequency"]) {
			fYtype = "y2";
			name2 = "Frequency Data";
		}
		if (selections[1] === "Demand" && props.graph_list["Demand"]) {
			dYtype = "y2";
			name2 = "Demand Data";
		}
		if (selections[1] === "ICT" && props.graph_list["ICT"]) {
			iYtype = "y2";
			name2 = "ICT Data";
		}
		if (selections[1] === "Lines" && props.graph_list["Lines"]) {
			lYtype = "y2";
			name2 = "Lines Data";
		}

		if (selections[2] === "Demand" && props.graph_list["Demand"]) {
			dYtype = "y3";
			name3 = "Demand Data";
		}
		if (selections[2] === "ICT" && props.graph_list["ICT"]) {
			iYtype = "y3";
			name3 = "ICT Data";
		}
		if (selections[2] === "Lines" && props.graph_list["Lines"]) {
			lYtype = "y3";
			name3 = "Lines Data";
		}

		if (selections[3] === "ICT" && props.graph_list["ICT"]) {
			iYtype = "y4";
			name4 = "ICT Data";
		}
		if (selections[3] === "Lines" && props.graph_list["Lines"]) {
			lYtype = "y4";
			name4 = "Lines Data";
		}

		if (selections[4] === "Lines" && props.graph_list["Lines"]) {
			lYtype = "y5";
			name5 = "Lines Data";
		}

		if (selections[0] === "Frequency" && selections.length > 1) {
			if (selections[1] === "Demand") {
				var temp1 = fYtype;
				fYtype = dYtype;
				dYtype = temp1;
				name1 = name2;
				name2 = "Frequency Data";
			}

			if (selections[1] === "ICT") {
				var temp1 = fYtype;
				fYtype = iYtype;
				iYtype = temp1;
				name1 = name2;
				name2 = "Frequency Data";
			}

			if (selections[1] === "Lines") {
				var temp1 = fYtype;
				fYtype = lYtype;
				iYtype = temp1;
				name1 = name2;
				name2 = "Frequency Data";
			}
		}
	}

	if (props.graph_list) {
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		if (props.graph_list["Voltage"] && props.checkedV) {
			var stsn = "";
			var temp_max_v1 = "";
			var temp_min_v1 = "";
			var temp_max_v2 = "";
			var temp_min_v2 = "";

			for (var i = 0; i < props.graph_list["Voltage"].length - 1; i++) {
				if (i === 0) {
					stsn = props.graph_list["Voltage"][i]["stationName"];
				} else {
					stsn = stsn + ", " + props.graph_list["Voltage"][i]["stationName"];
				}

				for (
					var j = 1;
					j < props.graph_list["Voltage"][i]["max_v1"].length;
					j++
				) {
					if (j === 1) {
						temp_max_v1 = props.graph_list["Voltage"][i]["max_v1"][j];
					} else {
						temp_max_v1 =
							temp_max_v1 + ", " + props.graph_list["Voltage"][i]["max_v1"][j];
					}
				}

				for (
					var j = 1;
					j < props.graph_list["Voltage"][i]["min_v1"].length;
					j++
				) {
					if (j === 1) {
						temp_min_v1 = props.graph_list["Voltage"][i]["min_v1"][j];
					} else {
						temp_min_v1 =
							temp_min_v1 + ", " + props.graph_list["Voltage"][i]["min_v1"][j];
					}
				}

				for (
					var j = 1;
					j < props.graph_list["Voltage"][i]["max_v2"].length;
					j++
				) {
					if (j === 1) {
						temp_max_v2 = props.graph_list["Voltage"][i]["max_v2"][j];
					} else {
						temp_max_v2 =
							temp_max_v2 + ", " + props.graph_list["Voltage"][i]["max_v2"][j];
					}
				}

				for (
					var j = 1;
					j < props.graph_list["Voltage"][i]["min_v2"].length;
					j++
				) {
					if (j === 1) {
						temp_min_v2 = props.graph_list["Voltage"][i]["min_v2"][j];
					} else {
						temp_min_v2 =
							temp_min_v2 + ", " + props.graph_list["Voltage"][i]["min_v2"][j];
					}
				}
				var index = selections.indexOf("Voltage") + 1;

				if (index === 1) {
					index = color1;
				}

				let voltage_data1 = {
					y: props.graph_list["Voltage"][i]["voltageBus1"],
					x: props.graph_list["Voltage"][
						props.graph_list["Voltage"].length - 1
					]["Date_Time"],
					yaxis: vYtype,

					name:
						props.graph_list["Voltage"][i]["stationName"] +
						" BUS-1 Voltage Data " +
						"(Max:" +
						props.graph_list["Voltage"][i]["max_v1"][0][0] +
						" MW" +
						"," +
						" Min:" +
						props.graph_list["Voltage"][i]["min_v1"][0][0] +
						"MW" +
						", Avg:" +
						props.graph_list["Voltage"][i]["avg_v1"] +
						" MW)",
					type: "line",
					marker: { color: index },
				};

				let voltage_data2 = {
					y: props.graph_list["Voltage"][i]["voltageBus2"],
					x: props.graph_list["Voltage"][
						props.graph_list["Voltage"].length - 1
					]["Date_Time"],
					yaxis: vYtype,

					name:
						props.graph_list["Voltage"][i]["stationName"] +
						" BUS-2 Voltage Data " +
						"(Max:" +
						props.graph_list["Voltage"][i]["max_v2"][0][0] +
						" MW" +
						"," +
						" Min:" +
						props.graph_list["Voltage"][i]["min_v2"][0][0] +
						"MW" +
						", Avg:" +
						props.graph_list["Voltage"][i]["avg_v2"] +
						" MW)",
					type: "line",
					line: {
						dash: "dashdot",
						width: 1.7,
					},
					marker: { color: color0 },
				};
				data.push(voltage_data1, voltage_data2);
			}

			if (props.duration_region.indexOf("Voltage") > -1) {
				for (var i = 0; i < props.graph_list["Voltage"].length - 1; i++) {
					let voltage_duration1 = {
						y: props.graph_list["Voltage"][i]["voltageBus1 Duration"][0],
						x: props.graph_list["Voltage"][i]["voltageBus1 Duration"][1],
						xaxis: "x2",
						yaxis: "vYtype",
						name:
							props.graph_list["Voltage"][i]["stationName"] +
							" Bus-1 Duration Graph",
						type: "line",
						marker: { color: "index" },
					};

					let voltage_duration2 = {
						y: props.graph_list["Voltage"][i]["voltageBus2 Duration"][0],
						x: props.graph_list["Voltage"][i]["voltageBus2 Duration"][1],
						xaxis: "x2",
						yaxis: "vYtype",
						name:
							props.graph_list["Voltage"][i]["stationName"] +
							" Bus-2 Duration Graph",
						type: "line",
						line: {
							dash: "dashdot",
							width: 1.7,
						},
						marker: { color: "color0" },
					};

					data.push(voltage_duration1, voltage_duration2);
				}
			}
		}

		if (props.graph_list["Demand"] && props.checkedD) {
			var stsn = "";

			var temp_max = "";
			var temp_min = "";

			for (var i = 0; i < props.graph_list["Demand"].length - 1; i++) {
				if (i === 0) {
					stsn = props.graph_list["Demand"][i]["stationName"];
				} else {
					stsn = stsn + ", " + props.graph_list["Demand"][i]["stationName"];
				}
				for (var j = 1; j < props.graph_list["Demand"][i]["max"].length; j++) {
					if (j === 1) {
						temp_max = props.graph_list["Demand"][i]["max"][j];
					} else {
						temp_max =
							temp_max + ", " + props.graph_list["Demand"][i]["max"][j];
					}
				}

				for (var j = 1; j < props.graph_list["Demand"][i]["min"].length; j++) {
					if (j === 1) {
						temp_min = props.graph_list["Demand"][i]["min"][j];
					} else {
						temp_min =
							temp_min + ", " + props.graph_list["Demand"][i]["min"][j];
					}
				}

				var index = selections.indexOf("Demand") + 1;

				if (index === 1) {
					index = color1;
				}
				if (index === 2 && !(selections.indexOf("Frequency") > -1)) {
					index = color2;
				} else if (index === 2 && selections.indexOf("Frequency") > -1) {
					index = color1;
				}
				if (index === 3) {
					index = color3;
				}

				let demand_data = {
					y: props.graph_list["Demand"][i]["output"],
					x: props.graph_list["Demand"][props.graph_list["Demand"].length - 1][
						"Date_Time"
					],
					yaxis: dYtype,
					name:
						props.graph_list["Demand"][i]["stationName"] +
						" Demand " +
						"(Max:" +
						props.graph_list["Demand"][i]["max"][0][0] +
						" MW" +
						"," +
						" Min:" +
						props.graph_list["Demand"][i]["min"][0][0] +
						" MW " +
						", Avg:" +
						props.graph_list["Demand"][i]["avg"] +
						" MW)",
					type: "line",
					marker: { color: index },
				};

				data.push(demand_data);
			}

			if (props.duration_region.indexOf("Demand") > -1) {
				for (var i = 0; i < props.graph_list["Demand"].length - 1; i++) {
					let demand_duration = {
						y: props.graph_list["Demand"][i]["Duration"][0],
						x: props.graph_list["Demand"][i]["Duration"][1],
						xaxis: "x2",
						yaxis: dYtype,
						name:
							props.graph_list["Demand"][i]["stationName"] +
							" Demand Duration Graph",
						type: "line",
						line: {
							dash: "dashdot",
							width: 1.7,
						},
						marker: { color: index },
					};

					data.push(demand_duration);
				}
			}

			// if (props.graph_list["Voltage"] && props.checkedV) {
			//   var stsn = "";
			//   var temp_max_v1 = "";
			//   var temp_min_v1 = "";
			//   var temp_max_v2 = "";
			//   var temp_min_v2 = "";

			//   for (var i = 0; i < props.graph_list["Voltage"].length - 1; i++) {
			//     if (i === 0) {
			//       stsn = props.graph_list["Voltage"][i]["stationName"];
			//     } else {
			//       stsn = stsn + ", " + props.graph_list["Voltage"][i]["stationName"];
			//     }
			//     for (
			//       var j = 1;
			//       j < props.graph_list["Voltage"][i]["max_v1"].length;
			//       j++
			//     ) {
			//       if (j === 1) {
			//         temp_max_v1 = props.graph_list["Voltage"][i]["max_v1"][j];
			//       } else {
			//         temp_max_v1 =
			//           temp_max_v1 + ", " + props.graph_list["Voltage"][i]["max_v1"][j];
			//       }
			//     }

			//     for (
			//       var j = 1;
			//       j < props.graph_list["Voltage"][i]["min_v1"].length;
			//       j++
			//     ) {
			//       if (j === 1) {
			//         temp_min_v1 = props.graph_list["Voltage"][i]["min_v1"][j];
			//       } else {
			//         temp_min_v1 =
			//           temp_min_v1 + ", " + props.graph_list["Voltage"][i]["min_v1"][j];
			//       }
			//     }

			//     for (
			//       var j = 1;
			//       j < props.graph_list["Voltage"][i]["max_v2"].length;
			//       j++
			//     ) {
			//       if (j === 1) {
			//         temp_max_v2 = props.graph_list["Voltage"][i]["max_v2"][j];
			//       } else {
			//         temp_max_v2 =
			//           temp_max_v2 + ", " + props.graph_list["Voltage"][i]["max_v2"][j];
			//       }
			//     }

			//     for (
			//       var j = 1;
			//       j < props.graph_list["Voltage"][i]["min_v2"].length;
			//       j++
			//     ) {
			//       if (j === 1) {
			//         temp_min_v2 = props.graph_list["Voltage"][i]["min_v2"][j];
			//       } else {
			//         temp_min_v2 =
			//           temp_min_v2 + ", " + props.graph_list["Voltage"][i]["min_v2"][j];
			//       }
			//     }
			//     var index = selections.indexOf("Voltage") + 1;

			//     if (index === 1) {
			//       index = color1;
			//     }

			//     let voltage_data1 = {
			//       y: props.graph_list["Voltage"][i]["voltageBus1"],
			//       x: props.graph_list["Voltage"][
			//         props.graph_list["Voltage"].length - 1
			//       ]["Date_Time"],
			//       yaxis: vYtype,
			//       name:
			//         props.graph_list["Voltage"][i]["stationName"] +
			//         " BUS-1 Voltage Data " +
			//         "(Max:" +
			//         props.graph_list["Voltage"][i]["max_v1"][0] +
			//         " MW at " +
			//         temp_max_v1 +
			//         "," +
			//         " Min:" +
			//         props.graph_list["Voltage"][i]["min_v1"][0] +
			//         " MW at " +
			//         temp_min_v1 +
			//         ", Avg:" +
			//         props.graph_list["Voltage"][i]["avg_v1"] +
			//         " MW)",
			//       type: "line",
			//       marker: { color: index },
			//     };

			//     let voltage_data2 = {
			//       y: props.graph_list["Voltage"][i]["voltageBus2"],
			//       x: props.graph_list["Voltage"][
			//         props.graph_list["Voltage"].length - 1
			//       ]["Date_Time"],
			//       yaxis: vYtype,
			//       name:
			//         props.graph_list["Voltage"][i]["stationName"] +
			//         " BUS-2 Voltage Data " +
			//         "(Max:" +
			//         props.graph_list["Voltage"][i]["max_v2"][0] +
			//         " MW at " +
			//         temp_max_v2 +
			//         "," +
			//         " Min:" +
			//         props.graph_list["Voltage"][i]["min_v2"][0] +
			//         " MW at " +
			//         temp_min_v2 +
			//         ", Avg:" +
			//         props.graph_list["Voltage"][i]["avg_v2"] +
			//         " MW)",
			//       type: "dashdot",
			//       marker: { color: color0 },
			//     };

			//     data.push(voltage_data1, voltage_data2);
			//   }

			//   if (props.duration_region.indexOf("Voltage") > -1) {
			//     for (var i = 0; i < props.graph_list["Voltage"].length - 1; i++) {
			//       let voltage_duration1 = {
			//         y: props.graph_list["Voltage"][i]["voltageBus1 Duration"][0],
			//         x: props.graph_list["Voltage"][i]["voltageBus1 Duration"][1],
			//         xaxis: "x2",
			//         yaxis: vYtype,
			//         name:
			//           props.graph_list["Voltage"][i]["stationName"] +
			//           " Bus-1 Duration Graph",
			//         type: "line",
			//         marker: { color: index },
			//       };

			//       let voltage_duration2 = {
			//         y: props.graph_list["Voltage"][i]["voltageBus2 Duration"][0],
			//         x: props.graph_list["Voltage"][i]["voltageBus2 Duration"][1],
			//         xaxis: "x2",
			//         yaxis: vYtype,
			//         name:
			//           props.graph_list["Voltage"][i]["stationName"] +
			//           " Bus-2 Duration Graph",
			//         type: "dashdot",
			//         marker: { color: color0 },
			//       };

			//       data.push(voltage_duration1, voltage_duration2);
			//     }
			//   }
			// }
			////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		if (props.graph_list["ICT"] && props.checkedI) {
			var stsn = "";

			var temp_max = "";
			var temp_min = "";

			for (var i = 0; i < props.graph_list["ICT"].length - 1; i++) {
				if (i === 0) {
					stsn = props.graph_list["ICT"][i]["stationName"];
				} else {
					stsn = stsn + ", " + props.graph_list["ICT"][i]["stationName"];
				}
				for (var j = 1; j < props.graph_list["ICT"][i]["max"].length; j++) {
					if (j === 1) {
						temp_max = props.graph_list["ICT"][i]["max"][j];
					} else {
						temp_max = temp_max + ", " + props.graph_list["ICT"][i]["max"][j];
					}
				}

				for (var j = 1; j < props.graph_list["ICT"][i]["min"].length; j++) {
					if (j === 1) {
						temp_min = props.graph_list["ICT"][i]["min"][j];
					} else {
						temp_max = temp_min + ", " + props.graph_list["ICT"][i]["min"][j];
					}
				}

				var index = selections.indexOf("ICT") + 1;

				if (index === 1) {
					index = color1;
				}
				if (index === 2 && !(selections.indexOf("Frequency") > -1)) {
					index = color2;
				} else if (index === 2 && selections.indexOf("Frequency") > -1) {
					index = color1;
				}
				if (index === 3) {
					index = color3;
				}
				if (index === 4) {
					index = color4;
				}

				if (props.Selected_i_states) {
					if (
						props.graph_list["ICT"][i]["stationName"].split(" ")[
							props.graph_list["ICT"][i]["stationName"].split(" ").length - 1
						] === "MW"
					) {
						let ICT_data = {
							y: props.graph_list["ICT"][i]["line"],
							x: props.graph_list["ICT"][props.graph_list["ICT"].length - 1][
								"Date_Time"
							],
							yaxis: iYtype,
							marker: { color: index },
							name:
								props.graph_list["ICT"][i]["stationName"] +
								" ICT Data" +
								"(Max:" +
								props.graph_list["ICT"][i]["max"][0][0] +
								" MW " +
								"," +
								" Min:" +
								props.graph_list["ICT"][i]["min"][0][0] +
								" MW " +
								", Avg:" +
								props.graph_list["ICT"][i]["avg"] +
								" MW)",
							type: "line",
						};

						data.push(ICT_data);
					} else {
						let ICT_data = {
							y: props.graph_list["ICT"][i]["line"],
							x: props.graph_list["ICT"][props.graph_list["ICT"].length - 1][
								"Date_Time"
							],
							yaxis: iYtype,
							marker: { color: index },
							name:
								props.graph_list["ICT"][i]["stationName"] +
								" ICT Data" +
								"(Max:" +
								props.graph_list["ICT"][i]["max"][0][0] +
								" MVAR " +
								"," +
								" Min:" +
								props.graph_list["ICT"][i]["min"][0][0] +
								" MVAR " +
								", Avg:" +
								props.graph_list["ICT"][i]["avg"] +
								" MVAR)",
							type: "line",
							line: {
								dash: "dashdot",
								width: 1.7,
							},
						};

						data.push(ICT_data);
					}
				}
			}
		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		if (props.graph_list["Lines"] && props.checkedL) {
			var stsn = "";

			var temp_max = "";
			var temp_min = "";

			for (var i = 0; i < props.graph_list["Lines"].length - 1; i++) {
				if (i === 0) {
					stsn = props.graph_list["Lines"][i]["stationName"];
				} else {
					stsn = stsn + ", " + props.graph_list["Lines"][i]["stationName"];
				}
				for (var j = 1; j < props.graph_list["Lines"][i]["max"].length; j++) {
					if (j === 1) {
						temp_max = props.graph_list["Lines"][i]["max"][j];
					} else {
						temp_max = temp_max + ", " + props.graph_list["Lines"][i]["max"][j];
					}
				}

				for (var j = 1; j < props.graph_list["Lines"][i]["min"].length; j++) {
					if (j === 1) {
						temp_min = props.graph_list["Lines"][i]["min"][j];
					} else {
						temp_max = temp_min + ", " + props.graph_list["Lines"][i]["min"][j];
					}
				}

				var index = selections.indexOf("Lines") + 1;

				if (index === 1) {
					index = color1;
				}
				if (index === 2 && !(selections.indexOf("Frequency") > -1)) {
					index = color2;
				} else if (index === 2 && selections.indexOf("Frequency") > -1) {
					index = color1;
				}
				if (index === 3) {
					index = color3;
				}
				if (index === 4) {
					index = color4;
				}
				if (index === 5) {
					index = color5;
				}

				if (props.Selected_l_states) {
					if (
						props.Selected_l_states[i] ===
						props.graph_list["Lines"][i]["stationName"] + " MW"
					) {
						let Lines_data = {
							y: props.graph_list["Lines"][i]["line"],
							x: props.graph_list["Lines"][
								props.graph_list["Lines"].length - 1
							]["Date_Time"],
							yaxis: lYtype,
							name:
								props.graph_list["Lines"][i]["stationName"] +
								" Lines Data" +
								"(Max:" +
								props.graph_list["Lines"][i]["max"][0][0] +
								" MW" +
								"," +
								" Min:" +
								props.graph_list["Lines"][i]["min"][0][0] +
								" MW" +
								", Avg:" +
								props.graph_list["Lines"][i]["avg"] +
								" MW)",
							type: "line",
							marker: { color: index },
						};

						data.push(Lines_data);
					} else {
						let Lines_data = {
							y: props.graph_list["Lines"][i]["line"],
							x: props.graph_list["Lines"][
								props.graph_list["Lines"].length - 1
							]["Date_Time"],
							yaxis: lYtype,
							name:
								props.graph_list["Lines"][i]["stationName"] +
								" Lines Data" +
								"(Max:" +
								props.graph_list["Lines"][i]["max"][0][0] +
								" MVAR" +
								"," +
								" Min:" +
								props.graph_list["Lines"][i]["min"][0][0] +
								" MVAR" +
								", Avg:" +
								props.graph_list["Lines"][i]["avg"] +
								" MVAR)",
							type: "line",
							line: {
								dash: "dashdot",
								width: 1.7,
							},
							marker: { color: index },
						};

						data.push(Lines_data);
					}
				}
			}
		}

		if (props.graph_list["Frequency"] && props.checkedF) {
			var stsn = "";

			var temp_max = "";
			var temp_min = "";

			for (var i = 0; i < props.graph_list["Frequency"].length - 1; i++) {
				if (i === 0) {
					stsn = props.graph_list["Frequency"][i]["stationName"];
				} else {
					stsn = stsn + ", " + props.graph_list["Frequency"][i]["stationName"];
				}
				for (
					var j = 1;
					j < props.graph_list["Frequency"][i]["max"].length;
					j++
				) {
					if (j === 1) {
						temp_max = props.graph_list["Frequency"][i]["max"][j];
					} else {
						temp_max =
							temp_max + ", " + props.graph_list["Frequency"][i]["max"][j];
					}
				}

				for (
					var j = 1;
					j < props.graph_list["Frequency"][i]["min"].length;
					j++
				) {
					if (j === 1) {
						temp_min = props.graph_list["Frequency"][i]["min"][j];
					} else {
						temp_min =
							temp_min + ", " + props.graph_list["Frequency"][i]["min"][j];
					}
				}

				var index = selections.indexOf("Frequency") + 1;

				if (index === 1 && selections.length === 1) {
					index = color1;
				} else {
					index = color2;
				}

				let frequency_data = {
					y: props.graph_list["Frequency"][i]["frequency"],
					x: props.graph_list["Frequency"][
						props.graph_list["Frequency"].length - 1
					]["Date_Time"],
					yaxis: fYtype,
					name:
						props.graph_list["Frequency"][i]["stationName"] +
						" line" +
						"(Max:" +
						props.graph_list["Frequency"][i]["max"][0][0] +
						" HZ " +
						"," +
						" Min:" +
						props.graph_list["Frequency"][i]["min"][0][0] +
						" HZ " +
						", Avg:" +
						props.graph_list["Frequency"][i]["avg"] +
						" HZ)",
					type: "line",
					marker: { color: index },
				};

				data.push(frequency_data);
			}

			if (props.duration_region.indexOf("Frequency") > -1) {
				for (var i = 0; i < props.graph_list["Frequency"].length - 1; i++) {
					let frequency_duration = {
						y: props.graph_list["Frequency"][i]["Duration"][0],
						x: props.graph_list["Frequency"][i]["Duration"][1],
						xaxis: "x2",
						yaxis: fYtype,
						name:
							props.graph_list["Frequency"][i]["stationName"] +
							" Duration Graph",
						type: "line",
						line: {
							dash: "dashdot",
							width: 1.7,
						},
						marker: { color: index },
					};

					data.push(frequency_duration);
				}
			}
		}
		// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
				width: 1900,
				height: 800,

				legend: {
					font: {
						family: "Courier New, monospace",
						size: 12,
						color: "#7f7f7f",
					},
					orientation: "h",
					bgcolor: "white",
					xanchor: "center",
					yanchor: "center",
					y: -0.2,
					x: 0.5,
				},

				title: name,
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
					title: name1,
					titlefont: {
						size: 18,
						color: color1,
					},
					tickfont: { color: color1 },
				},

				xaxis2: {
					title: "Duration Curve",
					titlefont: { color: "rgb(148, 103, 189)" },
					tickfont: { color: "rgb(148, 103, 189)" },
					overlaying: "x",
					side: "top",
				},
				yaxis2: {
					title: name2,

					titlefont: { color: color2, size: 18 },
					tickfont: { color: color2 },
					anchor: "free",
					overlaying: "y",
					side: "right",
					position: 1,
				},
				yaxis4: {
					title: name4,

					titlefont: { color: color4, size: 14 },
					tickfont: { color: color4, size: 14 },
					anchor: "free",
					overlaying: "y",
					side: "right",
					position: 0.998,
				},
				yaxis3: {
					title: name3,
					titlefont: { color: color3, size: 14 },
					tickfont: { color: color3, size: 11 },
					anchor: "x",
					overlaying: "y",
					side: "left",
				},
				yaxis5: {
					title: name5,
					titlefont: { color: color5, size: 10 },
					tickfont: { color: color5, size: 10 },
					anchor: "x",
					overlaying: "y",
				},
			}}
		/>
	);
}
