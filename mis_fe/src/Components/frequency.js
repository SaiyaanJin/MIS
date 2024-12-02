import React, { useEffect, useState, useRef } from "react";
import { Calendar } from "primereact/calendar";
import "../cssFiles/PasswordDemo.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "../cssFiles/ButtonDemo.css";
import { Avatar } from "primereact/avatar";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import Frequencygraph from "../graphs/frequencygraph";
import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";

import { InputSwitch } from "primereact/inputswitch";

import { InputNumber } from "primereact/inputnumber";

import { Checkbox } from "primereact/checkbox";

// import { Toast } from "primereact/toast";

// import CircularProgress from "@mui/material/CircularProgress";
// import Box from "@mui/material/Box";
import { BlockUI } from "primereact/blockui";
// import { Inplace, InplaceDisplay, InplaceContent } from "primereact/inplace";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Frequency() {
	const [start_date, setStart_Date] = useState(
		new Date(
			moment()
				.set("hour", 0)
				.set("minute", 0)
				.set("second", 0)
				.subtract(2, "day")._d
		)
	);
	const [end_date, setEnd_Date] = useState(
		new Date(
			moment()
				.set("hour", 23)
				.set("minute", 59)
				.set("second", 0)
				.subtract(2, "day")._d
		)
	);
	const [multiple_date, setMultiple_Date] = useState();
	const [multiple_frequency_states, setmultiplefrequency_states] = useState();
	const [
		multiple_Selected_frequency_states,
		setmultipleSelected_frequency_states,
	] = useState();
	const [multiple_frequency_data, setmultiplefrequency_data] = useState();

	const [frequency_states, setfrequency_states] = useState();
	const [Selected_frequency_states, setSelected_frequency_states] = useState();
	const [frequency_data, setfrequency_data] = useState();
	const [enable, setenable] = useState(true);
	const [graphenable, setgraphenable] = useState(true);
	const [graphenable2, setgraphenable2] = useState(true);
	const temp_multi_date = [];

	const [multiple_month, setMultiple_Month] = useState();

	const [checked1, setChecked1] = useState(true);
	const [checked2, setChecked2] = useState(false);

	const [checked3, setChecked3] = useState(false);
	const [minutes, setminutes] = useState(1);
	const [checked4, setChecked4] = useState(false);
	const [multiminutes, setmultiminutes] = useState(1);

	const [freq_region, setfreq_region] = useState([]);

	const toast = useRef(null);
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);
	const table_val = [];
	const multi_table_val = [];

	const accept = () => {
		toast.current.show({
			severity: "info",
			summary: "Confirmed",
			detail: "You have accepted",
			life: 3000,
		});
	};

	const reject = () => {
		toast.current.show({
			severity: "warn",
			summary: "Rejected",
			detail: "You have rejected",
			life: 3000,
		});
	};

	useEffect(() => {
		if (start_date && end_date) {
			axios
				.post(
					"http://10.3.200.63:5010/FrequencyNames?startDate=" +
						moment(start_date).format("YYYY-MM-DD HH:mm") +
						"&endDate=" +
						moment(end_date).format("YYYY-MM-DD HH:mm"),
					{}
				)
				.then((response) => {
					setfrequency_states(response.data);
				})
				.catch((error) => {});
		}

		if (multiple_date) {
			for (var i = 0; i < multiple_date.length; i++) {
				temp_multi_date.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
			}

			if (i === multiple_date.length) {
				axios
					.post(
						"http://10.3.200.63:5010/MultiFrequencyNames?MultistartDate=" +
							temp_multi_date,
						{}
					)
					.then((response) => {
						setmultiplefrequency_states(response.data);
					})
					.catch((error) => {});
			}
		}

		if (multiple_month) {
			var temp_multi_month = [];

			var temp_multi_month = [];
			for (var j = 0; j < multiple_month.length; j++) {
				temp_multi_month.push(moment(multiple_month[j]).format("YYYY-MM-DD"));
			}

			if (j === multiple_month.length) {
				axios
					.post(
						"http://10.3.200.63:5010/MultiFrequencyNames?MultistartDate=" +
							temp_multi_month,
						{}
					)
					.then((response) => {
						setmultiplefrequency_states(response.data);
					})
					.catch((error) => {});
			}
		}
	}, [start_date, end_date, multiple_date, multiple_month]);

	const getfrequencydata = () => {
		if (start_date && end_date && Selected_frequency_states) {
			if (minutes && checked3) {
				axios
					.post(
						"http://10.3.200.63:5010/GetFrequencyData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_frequency_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							setBlocked(false);
							setloading_show(false);
							return;
						}
						setfrequency_data(response.data);
						setenable(false);
						setgraphenable(false);
						setBlocked(false);
						setloading_show(false);
					});
			} else {
				axios
					.post(
						"http://10.3.200.63:5010/GetFrequencyData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_frequency_states +
							"&time=1",
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							setBlocked(false);
							setloading_show(false);
							return;
						}
						// console.log(response);
						setfrequency_data(response.data);
						setenable(false);
						setgraphenable(false);
						setBlocked(false);
						setloading_show(false);
					});
			}
		}
	};

	const getmultifrequencydata = () => {
		if (multiple_date && checked1) {
			if (multiminutes && checked4) {
				var temp1 = [];

				for (var i = 0; i < multiple_date.length; i++) {
					temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
				}

				if (temp1 && multiple_Selected_frequency_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_frequency_states +
								"&Type=Date" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							setBlocked(false);
							setloading_show(false);
							// console.log(response);
							setmultiplefrequency_data(response.data);
							// setenable(false);
							setgraphenable2(false);
						});
				}
			} else {
				var temp1 = [];

				for (var i = 0; i < multiple_date.length; i++) {
					temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
				}

				if (temp1 && multiple_Selected_frequency_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_frequency_states +
								"&Type=Date" +
								"&time=1",
							{}
						)
						.then((response) => {
							setBlocked(false);
							setloading_show(false);
							// console.log(response);
							setmultiplefrequency_data(response.data);
							// setenable(false);
							setgraphenable2(false);
						});
				}
			}
		}

		if (multiple_month && checked2) {
			if (multiminutes && checked4) {
				var temp2 = [];

				for (var i = 0; i < multiple_month.length; i++) {
					temp2.push(moment(multiple_month[i]).format("YYYY-MM-DD"));
				}

				if (temp2 && multiple_Selected_frequency_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_frequency_states +
								"&Type=Month" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							setBlocked(false);
							setloading_show(false);
							// console.log(response);
							setmultiplefrequency_data(response.data);
							// setenable(false);
							setgraphenable2(false);
						});
				}
			} else {
				var temp2 = [];

				for (var i = 0; i < multiple_month.length; i++) {
					temp2.push(moment(multiple_month[i]).format("YYYY-MM-DD"));
				}

				if (temp2 && multiple_Selected_frequency_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_frequency_states +
								"&Type=Month" +
								"&time=1",
							{}
						)
						.then((response) => {
							setBlocked(false);
							setloading_show(false);
							// console.log(response);
							setmultiplefrequency_data(response.data);
							// setenable(false);
							setgraphenable2(false);
						});
				}
			}
		}
	};

	const frequency_region_change = (e) => {
		let selectedregions = [...freq_region];

		if (e.checked) selectedregions.push(e.value);
		else selectedregions.splice(selectedregions.indexOf(e.value), 1);

		setfreq_region(selectedregions);
	};

	if (frequency_data) {
		for (var k = 0; k < frequency_data.length - 1; k++) {
			table_val.push({
				name: frequency_data[k]["stationName"],
				maxv: frequency_data[k]["max"][0][0] + "HZ",
				maxDT: frequency_data[k]["max"][1],
				minv: frequency_data[k]["min"][0][0] + "HZ",
				minDT: frequency_data[k]["min"][1],
				avgv: frequency_data[k]["avg"] + "HZ",
			});
		}
	}

	if (multiple_frequency_data) {
		if (checked2) {
			for (var k = 0; k < multiple_frequency_data.length - 15; k++) {
				multi_table_val.push({
					name: multiple_frequency_data[k]["stationname"],
					maxv: multiple_frequency_data[k]["max"][0][0] + "HZ",
					maxDT: multiple_frequency_data[k]["max"][1],
					minv: multiple_frequency_data[k]["min"][0][0],
					minDT: multiple_frequency_data[k]["min"][1],
					avgv: multiple_frequency_data[k]["ave"] + "HZ",
				});
			}
		}

		if (checked1) {
			for (var k = 0; k < multiple_frequency_data.length - 1; k++) {
				multi_table_val.push({
					name: multiple_frequency_data[k]["stationName"],
					maxv: multiple_frequency_data[k]["max"][0][0] + " HZ",
					maxDT:
						moment(multiple_frequency_data[k]["Date_Time"]).format(
							"DD-MM-YYYY"
						) +
						" " +
						multiple_frequency_data[k]["max"][1],
					minv: multiple_frequency_data[k]["min"][0][0] + " HZ",
					minDT:
						moment(multiple_frequency_data[k]["Date_Time"]).format(
							"DD-MM-YYYY"
						) +
						" " +
						multiple_frequency_data[k]["min"][1],
					avgv: multiple_frequency_data[k]["avg"] + " HZ",
				});
			}
		}
	}
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
					style={{ backgroundColor: "#FF1493", fontSize: "large" }}
				>
					<Avatar
						icon="pi pi-spin pi-wave-pulse"
						style={{ backgroundColor: "#FF1493", color: "#ffffff" }}
						shape="square"
					/>
					Frequency Tab
				</span>
			</Divider>
			<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
				<div className="field">
					<label htmlFor="range">From</label> <br />
					<Calendar
						style={{ width: "75%" }}
						showIcon
						showWeek
						showTime
						hourFormat="24"
						hideOnDateTimeSelect
						placeholder="Start Date"
						dateFormat="dd-mm-yy"
						value={start_date}
						onChange={(e) => {
							setStart_Date(e.value);
						}}
						// onClick={() => {
						//   frequencyNames();
						// }}
						monthNavigator
						yearNavigator
						yearRange="2010:2025"
						showButtonBar
					></Calendar>
				</div>
				<div className="field">
					<label htmlFor="range">To</label> <br />
					<Calendar
						style={{ width: "75%" }}
						showIcon
						showWeek
						showTime
						hourFormat="24"
						hideOnDateTimeSelect
						placeholder="End Date"
						dateFormat="dd-mm-yy"
						value={end_date}
						onChange={(e) => {
							setEnd_Date(e.value);
						}}
						// onClick={() => {
						//   frequencyNames();
						// }}
						monthNavigator
						yearNavigator
						yearRange="2010:2025"
						showButtonBar
					></Calendar>
				</div>
				<div className="field">
					<InputSwitch
						checked={checked3}
						onChange={(e) => {
							setChecked3(e.value);
						}}
					/>

					<label htmlFor="range">Interval (1 to 1440 minutes)</label>
					<div className="field-checkbox">
						<InputNumber
							size={7}
							min={1}
							max={1440}
							disabled={!checked3}
							value={minutes}
							onValueChange={(e) => setminutes(e.value)}
							suffix=" minutes"
							showButtons
							buttonLayout="horizontal"
							decrementButtonClassName="p-button-danger"
							incrementButtonClassName="p-button-success"
							incrementButtonIcon="pi pi-plus"
							decrementButtonIcon="pi pi-minus"
						/>
					</div>
				</div>
				<div className="field">
					<label htmlFor="range">Select BUS : </label>
					<br />
					<MultiSelect
						filterPlaceholder="Search BUS here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						selectionLimit={5}
						display="chip"
						placeholder="Select 220/400/765KV BUS"
						value={Selected_frequency_states}
						options={frequency_states}
						onChange={(e) => setSelected_frequency_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="field">
					<br />
					<Button
						severity="danger"
						size="small"
						rounded
						style={{ backgroundColor: "#FF1493" }}
						raised
						label="Get frequency Data"
						aria-label="frequency Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getfrequencydata();
						}}
					/>
					<div className="col-2">
						<a
							hidden={enable}
							href={
								"http://10.3.200.63:5010/GetFrequencyDataExcel?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD") +
								"&stationName=" +
								Selected_frequency_states
							}
						>
							{" "}
							Download{" "}
						</a>
					</div>
					<div className="field-checkbox">
						Show Duration of :
						<Checkbox
							inputId="1"
							name="city"
							value="Frequency Duration"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Frequency Duration") !== -1}
						/>
						<label htmlFor="1">Frequency</label>
					</div>
				</div>
			</div>

			<div hidden={graphenable}>
				<Divider />
				<Frequencygraph
					frequency_data={frequency_data}
					Selected_frequency_states={Selected_frequency_states}
					duration={freq_region}
				/>
			</div>
			<br></br>

			<div className="card" hidden={graphenable}>
				<DataTable value={table_val} removableSort responsivelayout="scroll">
					<Column field="name" header="Name" sortable></Column>
					<Column field="maxv" header="Maximum Value" sortable></Column>
					<Column field="maxDT" header="Max Date Time" sortable></Column>
					<Column field="minv" header="Minimum Value" sortable></Column>
					<Column field="minDT" header="Min Date Time" sortable></Column>
					<Column field="avgv" header="Average value" sortable></Column>
				</DataTable>
			</div>
			{/* </Fieldset> */}

			{/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
			<br />
			<br />
			<Divider align="center">
				<span className="p-tag">Comparison (Date/Month wise)</span>
			</Divider>
			<div className="grid">
				<div className="col">
					{" "}
					<div className="field col-12 md:col-11">
						<InputSwitch
							checked={checked1}
							onChange={(e) => {
								setChecked1(e.value);
								setChecked2(!e.value);
							}}
						/>
						<br></br>
						<label htmlFor="range">Date-wise comparison: </label> <br />
						<Calendar
							showIcon
							showWeek
							disabled={checked2}
							selectionMode="multiple"
							placeholder="Start Date"
							dateFormat="dd-mm-yy"
							value={multiple_date}
							onChange={(e) => {
								setMultiple_Date(e.value);
							}}
							// onClick={() => {
							//   frequencyNames();
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
					<div className="field col-12 md:col-10">
						<InputSwitch
							checked={checked2}
							onChange={(e) => {
								setChecked2(e.value);
								setChecked1(!e.value);
							}}
						/>
						<br></br>
						<label htmlFor="range">Month-wise comparison: </label> <br />
						<Calendar
							showIcon
							showWeek
							disabled={checked1}
							selectionMode="multiple"
							placeholder="Start Date"
							view="month"
							dateFormat="MM-yy"
							value={multiple_month}
							onChange={(e) => {
								setMultiple_Month(e.value);
							}}
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
						<InputSwitch
							checked={checked4}
							onChange={(e) => {
								setChecked4(e.value);
							}}
						/>
						{"  "}
						<br></br>
						<label htmlFor="range">1 to 1440 minutes</label>
						<br></br>
						<InputNumber
							size={10}
							min={1}
							max={1440}
							disabled={!checked4}
							value={multiminutes}
							onValueChange={(e) => setmultiminutes(e.value)}
							suffix=" minutes"
							showButtons
							buttonLayout="horizontal"
							decrementButtonClassName="p-button-danger"
							incrementButtonClassName="p-button-success"
							incrementButtonIcon="pi pi-plus"
							decrementButtonIcon="pi pi-minus"
						/>
					</div>
				</div>
				<div className="col" style={{ marginTop: "1%" }}>
					<label htmlFor="range">Select substation : </label>
					<br />
					<MultiSelect
						filterPlaceholder="Search BUS here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						selectionLimit={5}
						display="chip"
						placeholder="Select 220/400/765KV BUS"
						value={multiple_Selected_frequency_states}
						options={multiple_frequency_states}
						onChange={(e) => setmultipleSelected_frequency_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="col">
					<br />
					<Button
						size="small"
						severity="danger"
						rounded
						style={{ backgroundColor: "#FF1493" }}
						raised
						label="Get Multi-Frequency Data"
						aria-label="multiFrequency Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getmultifrequencydata();
						}}
					/>
					<div className="field-checkbox" style={{ marginTop: "5%" }}>
						Show Duration:
						<Checkbox
							inputId="1"
							name="city"
							value="Frequency Duration"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Frequency Duration") !== -1}
						/>
						<label htmlFor="1">Frequency</label>
					</div>
				</div>
			</div>
			<Divider />
			<div hidden={graphenable2}>
				<Frequencygraph
					frequency_data={multiple_frequency_data}
					Selected_frequency_states={multiple_Selected_frequency_states}
					date_time={true}
					check1={checked1}
					check2={checked2}
					duration={freq_region}
				/>
			</div>
			<br></br>
			<div className="card" hidden={graphenable2}>
				<DataTable
					value={multi_table_val}
					removableSort
					responsivelayout="scroll"
				>
					<Column field="name" header="Name" sortable></Column>
					<Column field="maxv" header="Maximum Value" sortable></Column>
					<Column field="maxDT" header="Max Date Time" sortable></Column>
					<Column field="minv" header="Minimum Value" sortable></Column>
					<Column field="minDT" header="Min Date Time" sortable></Column>
					<Column field="avgv" header="Average value" sortable></Column>
				</DataTable>
			</div>
			{/* </Fieldset> */}
		</>
	);
}
