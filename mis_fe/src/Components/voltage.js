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
import Voltagegraph from "../graphs/voltagegraph";
import { Divider } from "primereact/divider";
import { BlockUI } from "primereact/blockui";

import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Voltage() {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
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
	const [multiple_voltage_states, setmultiplevoltage_states] = useState();
	const [multiple_Selected_voltage_states, setmultipleSelected_voltage_states] =
		useState();
	const [multiple_voltage_data, setmultiplevoltage_data] = useState();

	const [voltage_states, setvoltage_states] = useState();
	const [Selected_voltage_states, setSelected_voltage_states] = useState();
	const [voltage_data, setvoltage_data] = useState();
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

	const [frequency, setfrequency] = useState();
	const [multifrequency, setmultifrequency] = useState();
	const [freq_region, setfreq_region] = useState([]);
	const [freq_region1, setfreq_region1] = useState([]);
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);

	const toast = useRef(null);

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
					"/VoltageNames?startDate=" +
						moment(start_date).format("YYYY-MM-DD HH:mm") +
						"&endDate=" +
						moment(end_date).format("YYYY-MM-DD HH:mm"),
					{}
				)
				.then((response) => {
					setvoltage_states(response.data);
				})
				.catch((error) => {});
		}

		if (multiple_date) {
			for (var i = 0; i < multiple_date.length; i++) {
				temp_multi_date.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
			}

			if (i === multiple_date.length) {
				axios
					.post("/MultiVoltageNames?MultistartDate=" + temp_multi_date, {})
					.then((response) => {
						setmultiplevoltage_states(response.data);
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
					.post("/MultiVoltageNames?MultistartDate=" + temp_multi_month, {})
					.then((response) => {
						setmultiplevoltage_states(response.data);
					})
					.catch((error) => {});
			}
		}
	}, [start_date, end_date, multiple_date, multiple_month]);

	const getvoltagedata = () => {
		if (start_date && end_date && Selected_voltage_states) {
			if (minutes && checked3) {
				axios
					.post(
						"/GetVoltageData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_voltage_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						// console.log(response);
						setvoltage_data(response.data);
						setenable(false);
						setgraphenable(false);
						setBlocked(false);
						setloading_show(false);
					});

				axios
					.post(
						"/GetFrequencyData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						setfrequency(response.data);
					});
			} else {
				axios
					.post(
						"/GetVoltageData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_voltage_states +
							"&time=1",
						{}
					)
					.then((response) => {
						// console.log(response);
						setvoltage_data(response.data);
						setenable(false);
						setgraphenable(false);
						setBlocked(false);
						setloading_show(false);
					});

				axios
					.post(
						"/GetFrequencyData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
							"&time=1",
						{}
					)
					.then((response) => {
						// console.log(response);
						setfrequency(response.data);
					});
			}
		}
	};

	const getmultivoltagedata = () => {
		if (multiple_date && checked1) {
			if (multiminutes && checked4) {
				var temp1 = [];

				for (var i = 0; i < multiple_date.length; i++) {
					temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
				}

				if (temp1 && multiple_Selected_voltage_states) {
					axios
						.post(
							"/GetMultiVoltageData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_voltage_states +
								"&Type=Date" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultiplevoltage_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"/GetMultiFrequencyData?MultistartDate=" +
								temp1[0] +
								"&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
								"&Type=Date" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultifrequency(response.data);
						});
				}
			} else {
				var temp1 = [];

				for (var i = 0; i < multiple_date.length; i++) {
					temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
				}

				if (temp1 && multiple_Selected_voltage_states) {
					axios
						.post(
							"/GetMultiVoltageData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_voltage_states +
								"&Type=Date" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultiplevoltage_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"/GetMultiFrequencyData?MultistartDate=" +
								temp1[0] +
								"&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
								"&Type=Date" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultifrequency(response.data);
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

				if (temp2 && multiple_Selected_voltage_states) {
					axios
						.post(
							"/GetMultiVoltageData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_voltage_states +
								"&Type=Month" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultiplevoltage_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"/GetMultiFrequencyData?MultistartDate=" +
								temp2 +
								"&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
								"&Type=Month" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultifrequency(response.data);
						});
				}
			} else {
				var temp2 = [];

				for (var i = 0; i < multiple_month.length; i++) {
					temp2.push(moment(multiple_month[i]).format("YYYY-MM-DD"));
				}

				if (temp2 && multiple_Selected_voltage_states) {
					axios
						.post(
							"/GetMultiVoltageData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_voltage_states +
								"&Type=Month" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultiplevoltage_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"/GetMultiFrequencyData?MultistartDate=" +
								temp2 +
								"&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
								"&Type=Month" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultifrequency(response.data);
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

	const frequency_region_change1 = (e) => {
		let selectedregions = [...freq_region1];

		if (e.checked) selectedregions.push(e.value);
		else selectedregions.splice(selectedregions.indexOf(e.value), 1);

		setfreq_region1(selectedregions);
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
					style={{ backgroundColor: "#000000", fontSize: "large" }}
				>
					<Avatar
						icon="pi pi-spin pi-gauge"
						style={{ backgroundColor: "#000000", color: "#ffffff" }}
						shape="square"
					/>
					Voltage Tab
				</span>
			</Divider>
			<div className="grid">
				<div className="col">
					{" "}
					<div className="field col-12 md:col-11">
						<label htmlFor="range">From</label> <br />
						<Calendar
							style={{ width: "70%" }}
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
							//   voltageNames();
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
					<div className="field col-12 md:col-11">
						<label htmlFor="range">To</label> <br />
						<Calendar
							style={{ width: "70%" }}
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
							//   voltageNames();
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
					<div className="field col-12 md:col-10" style={{ marginTop: "-3%" }}>
						<InputSwitch
							checked={checked3}
							onChange={(e) => {
								setChecked3(e.value);
							}}
						/>
						{"  "}
						<label htmlFor="range">Interval (1 to 1440 minutes)</label>
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
				<div className="col">
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
						placeholder="Select 220/400/765KV Substation(s)"
						value={Selected_voltage_states}
						options={voltage_states}
						onChange={(e) => setSelected_voltage_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="col">
					<br />
					<Button
						severity="secondary"
						size="small"
						rounded
						style={{ backgroundColor: "#000000" }}
						raised
						label="Get voltage Data"
						aria-label="voltage Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getvoltagedata();
						}}
					/>
					<div className="field-checkbox" style={{ marginTop: "5%" }}>
						Show Duration:
						<Checkbox
							inputId="1"
							name="city"
							value="Voltage"
							onChange={frequency_region_change1}
							checked={freq_region1.indexOf("Voltage") !== -1}
						/>
						<label htmlFor="1">Voltage</label>
						<Checkbox
							inputId="2"
							name="city"
							value="Frequency"
							onChange={frequency_region_change1}
							checked={freq_region1.indexOf("Frequency") !== -1}
						/>
						<label htmlFor="2">Frequency</label>
					</div>
					<div className="col-2">
						<a
							hidden={enable}
							href={
								`${baseUrl}/GetVoltageDataExcel?startDate=` +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD") +
								"&stationName=" +
								Selected_voltage_states
							}
						>
							{" "}
							Download{" "}
						</a>
					</div>
					<div className="field-checkbox">
						Show Frequency:
						<Checkbox
							inputId="1"
							name="city"
							value="Durgapur"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Durgapur") !== -1}
						/>
						<label htmlFor="1">Durgapur</label>
						<Checkbox
							inputId="2"
							name="city"
							value="Jeypore"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Jeypore") !== -1}
						/>
						<label htmlFor="2">Jeypore</label>
						<Checkbox
							inputId="3"
							name="city"
							value="Sasaram"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Sasaram") !== -1}
						/>
						<label htmlFor="3">Sasaram</label>
					</div>
				</div>
			</div>

			<div hidden={graphenable}>
				<Divider />
				<Voltagegraph
					voltage_data={voltage_data}
					Selected_voltage_states={Selected_voltage_states}
					frequency={frequency}
					freq_region={freq_region}
					freq_region1={freq_region1}
				/>
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
					<div className="field col-12 md:col-10">
						<InputSwitch
							checked={checked1}
							onChange={(e) => {
								setChecked1(e.value);
								setChecked2(!e.value);
							}}
						/>
						<label htmlFor="range">Date-wise comparison: </label> <br />
						<Calendar
							showIcon
							disabled={checked2}
							selectionMode="multiple"
							placeholder="Start Date"
							dateFormat="dd-mm-yy"
							value={multiple_date}
							onChange={(e) => {
								setMultiple_Date(e.value);
							}}
							// onClick={() => {
							//   voltageNames();
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
					<div className="field col-12 md:col-10">
						<InputSwitch
							checked={checked4}
							onChange={(e) => {
								setChecked4(e.value);
							}}
						/>
						{"  "}
						<label htmlFor="range">Interval (1 to 1440 minutes)</label>
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
						placeholder="Select 220/400/765KV Substation(s)"
						value={multiple_Selected_voltage_states}
						options={multiple_voltage_states}
						onChange={(e) => setmultipleSelected_voltage_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="col">
					<br />
					<Button
						severity="secondary"
						size="small"
						rounded
						style={{ backgroundColor: "#000000" }}
						raised
						label="Get Multi-Voltage Data"
						aria-label="multivoltage Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getmultivoltagedata();
						}}
					/>
					<div className="field-checkbox" style={{ marginTop: "5%" }}>
						Show Duration:
						<Checkbox
							inputId="1"
							name="city"
							value="Voltage"
							onChange={frequency_region_change1}
							checked={freq_region1.indexOf("Voltage") !== -1}
						/>
						<label htmlFor="1">Voltage</label>
						<Checkbox
							inputId="2"
							name="city"
							value="Frequency"
							onChange={frequency_region_change1}
							checked={freq_region1.indexOf("Frequency") !== -1}
						/>
						<label htmlFor="2">Frequency</label>
					</div>
					<br></br>
					<div className="field-checkbox">
						Show Frequency:
						<Checkbox
							inputId="1"
							name="city"
							value="Durgapur"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Durgapur") !== -1}
						/>
						<label htmlFor="1">Durgapur</label>
						<Checkbox
							inputId="2"
							name="city"
							value="Jeypore"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Jeypore") !== -1}
						/>
						<label htmlFor="2">Jeypore</label>
						<Checkbox
							inputId="3"
							name="city"
							value="Sasaram"
							onChange={frequency_region_change}
							checked={freq_region.indexOf("Sasaram") !== -1}
						/>
						<label htmlFor="3">Sasaram</label>
					</div>
				</div>
			</div>
			<Divider />
			<div hidden={graphenable2}>
				<Voltagegraph
					voltage_data={multiple_voltage_data}
					Selected_voltage_states={multiple_Selected_voltage_states}
					date_time={true}
					check1={checked1}
					check2={checked2}
					frequency={multifrequency}
					freq_region={freq_region}
					freq_region1={freq_region1}
				/>
			</div>
			{/* </Fieldset> */}
		</>
	);
}
