import React, { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import "../cssFiles/PasswordDemo.css";
import "../cssFiles/Animation.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "../cssFiles/ButtonDemo.css";
import { Avatar } from "primereact/avatar";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import { BlockUI } from "primereact/blockui";

import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Upload() {
	const [start_date, setStart_Date] = useState();
	const [end_date, setEnd_Date] = useState();

	const [Selected_lines_states, setSelected_lines_states] = useState();
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);

	const values = [
		"Frequency",
		"Voltage",
		"Lines",
		"ICT",
		"Demand",
		"Generator",
		"Thermal Generator",
		"ISGS",
	];

	const uploaddata = () => {
		if (Selected_lines_states && start_date && end_date) {
			for (var i = 0; i < Selected_lines_states.length; i++) {
				if (Selected_lines_states[i] === "Voltage") {
					axios
						.post(
							"/VoltageFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Voltage data inserted for " + response.data["dates"]);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Lines") {
					axios
						.post(
							"/LinesFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
							"Lines MW"
						)
						.then((response) => {})
						.catch((error) => {});

					axios
						.post(
							"/MVARFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Lines data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "ICT") {
					axios
						.post(
							"/ICTFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
							{}
						)
						.then((response) => {
							alert("ICT data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Demand") {
					axios
						.post(
							"/DemandFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Demand data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Generator") {
					axios
						.post(
							"/GeneratorFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Generator data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Thermal Generator") {
					axios
						.post(
							"/ThGeneratorFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Thermal Generator data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "ISGS") {
					axios
						.post(
							"/ISGSFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Frequency data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Frequency") {
					axios
						.post(
							"/FrequencyFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD")
						)
						.then((response) => {
							alert("Frequency data inserted for " + response.data);
						})
						.catch((error) => {});
				}
			}
			setBlocked(false);
			setloading_show(false);
		}
	};

	return (
		<>
			<div hidden={!loading_show}>
				<div className="loader">
					<div className="spinner"></div>
				</div>
			</div>

			<BlockUI blocked={blocked} fullScreen />
			<Divider align="left">
				<span
					className="p-tag"
					style={{ backgroundColor: "#ff6347", fontSize: "large" }}
				>
					<Avatar
						icon="pi pi-spin pi-upload"
						style={{ backgroundColor: "#ff6347", color: "#ffffff" }}
						shape="square"
					/>
					Upload Tab
				</span>
			</Divider>
			<div className="grid">
				<div className="col">
					{" "}
					<div className="field col-12 md:col-6">
						<label htmlFor="range">From :</label> <br />
						<Calendar
							showIcon
							placeholder="Start Date"
							dateFormat="dd-mm-yy"
							value={start_date}
							onChange={(e) => {
								setStart_Date(e.value);
							}}
							// onClick={() => {
							//   linesNames();
							// }}
							monthNavigator
							yearNavigator
							yearRange="2010:2025"
							showButtonBar
						></Calendar>
					</div>
				</div>
				<div className="col">
					{" "}
					<div className="field col-12 md:col-6">
						<label htmlFor="range">To :</label> <br />
						<Calendar
							showIcon
							placeholder="End Date"
							dateFormat="dd-mm-yy"
							value={end_date}
							onChange={(e) => {
								setEnd_Date(e.value);
							}}
							// onClick={() => {
							//   linesNames();
							// }}
							monthNavigator
							yearNavigator
							yearRange="2010:2025"
							showButtonBar
						></Calendar>
					</div>
				</div>
				<div className="col">
					<label htmlFor="range">Select Files : </label>
					<br />
					<MultiSelect
						display="chip"
						placeholder="choose File(s)"
						value={Selected_lines_states}
						options={values}
						onChange={(e) => setSelected_lines_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="col">
					<br />
					<Button
						severity="danger"
						size="small"
						rounded
						style={{ backgroundColor: "#ff6347" }}
						label="Upload Data"
						aria-label="Upload Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							uploaddata();
						}}
					/>
				</div>
			</div>

			{/* <Linesgraph
          lines_data={lines_data}
          Selected_lines_states={Selected_lines_states}
        /> */}
		</>
	);
	// </div>
	// );
}
