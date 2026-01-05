import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import "../cssFiles/PasswordDemo.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconsq
import "../cssFiles/ButtonDemo.css";
import { Avatar } from "primereact/avatar";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import Combinedgraph from "../graphs/combinedgraph";
import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";
import { BlockUI } from "primereact/blockui";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import jwt_decode from "jwt-decode";

export default function Combined() {
	const search = useLocation().search;
	const id = new URLSearchParams(search).get("token");
	const [page_hide, setpage_hide] = useState(true);
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);
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

	const [load, setload] = useState(false);

	const [f_states, setf_states] = useState();
	const [v_states, setv_states] = useState();
	const [d_states, setd_states] = useState();
	const [i_states, seti_states] = useState();
	const [l_states, setl_states] = useState();

	const [Selected_f_states, setSelected_f_states] = useState();
	const [Selected_v_states, setSelected_v_states] = useState();
	const [Selected_d_states, setSelected_d_states] = useState();
	const [Selected_i_states, setSelected_i_states] = useState();
	const [Selected_l_states, setSelected_l_states] = useState();

	const [frequency_data, setfrequency_data] = useState();
	const [voltage_data, setvoltage_data] = useState();
	const [demand_data, setdemand_data] = useState();
	const [ict_data, setict_data] = useState();
	const [lines_data, setlines_data] = useState();

	const [graphenable, setgraphenable] = useState(true);

	const [checkedF, setCheckedF] = useState(false);
	const [checkedV, setCheckedV] = useState(false);
	const [checkedD, setCheckedD] = useState(false);
	const [checkedI, setCheckedI] = useState(false);
	const [checkedL, setCheckedL] = useState(false);

	const [minutes, setminutes] = useState(1);

	const [duration_region, setduration_region] = useState([]);

	const names = {
		BH_DEMAND: "Bihar DEMAND",
		DVC_DEMAND: "DVC DEMAND",
		GR_DEMAND: "Odisha DEMAND",
		JH_DEMAND: "Jharkhand DEMAND",
		"REG DEMAND": "Regional DEMAND",
		SI_DEMAND: "Sikkim DEMAND",
		WB_DEMAND: "West Bengal DEMAND",
		BH_DIFFERENCE: "Bihar DIFFERENCE",
		"BH_DRAWAL( ER END)": "Bihar DRAWAL (ER END)",
		BH_END_DRAWAL: "Bihar End DRAWAL",
		DVC_DIFFERENCE: "DVC DIFFERENCE",
		"DV_DRAWAL( ER END)": "DVC DRAWAL (ER END)",
		DV_END_DRAWAL: "DVC End DRAWAL",
		GR_DIFFERENCE: "Odisha DIFFERENCE",
		"GR_DRAWAL( ER END)": "Odisha DRAWAL (ER END)",
		GR_END_DRAWAL: "Odisha End DRAWAL",
		JH_DIFFERENCE: "Jharkhand DIFFERENCE",
		"JH_DRAWAL( ER END)": "Jharkhand DRAWAL (ER END)",
		JH_END_DRAWAL: "Jharkhand End DRAWAL",
		SI_DIFFERENCE: "Sikkim DIFFERENCE",
		"SI_DRAWAL( ER END)": "Sikkim DRAWAL (ER END)",
		SI_END_DRAWL: "Sikkim End DRAWAL",
		WB_DIFFERENCE: "West Bengal DIFFERENCE",
		"WB_DRAWAL( ER END)": "West Bengal DRAWAL (ER END)",
		WB_END_DRAWAL: "West Bengal End DRAWAL",
	};

	useEffect(() => {
		if (id) {
			axios
				.get("https://sso.erldc.in:5000/verify", {
					headers: { Token: id },
				})
				.then((response) => {
					var decoded = jwt_decode(response.data["Final_Token"], "it@posoco");
					setpage_hide(!decoded("Login"));
				})
				.catch((error) => {});
		} else {
			setpage_hide(true);
		}

		if (checkedV && checkedD) {
			alert("Voltage & Demand Comparison is not allowed. Please select one");
			setCheckedV(!checkedD);
			setCheckedD(!checkedV);
		}

		if (start_date && end_date) {
			if (checkedF) {
				axios
					.post(
						"/FrequencyNames?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm")
					)
					.then((response) => {
						setf_states(response.data);
					})
					.catch((error) => {});
			}

			if (checkedV) {
				axios
					.post(
						"/VoltageNames?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm")
					)
					.then((response) => {
						setv_states(response.data);
					})
					.catch((error) => {
						console.error(error);
					});
			}

			if (checkedD) {
				axios
					.post(
						"/DemandMinNames?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm")
					)
					.then((response) => {
						setd_states(
							response.data.map((v, i) => {
								return {
									label: names.hasOwnProperty(v) ? names[v] : v,
									value: v,
								};
							})
						);
					})
					.catch((error) => {
						console.error(error);
					});
			}

			if (checkedI) {
				axios
					.post(
						"/ICTNames?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm"),
						{}
					)
					.then((response) => {
						seti_states(response.data);
					})
					.catch((error) => {});
			}

			if (checkedL) {
				axios
					.post(
						"/LinesMWMVARNames?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm"),
						{}
					)
					.then((response) => {
						setl_states(
							response.data.map((v, i) => {
								return {
									label:
										v.split(" Ckt-").join(" ").split(":")[0] +
										" " +
										v.split(" end ")[1],
									value: v,
								};
							})
						);
					})
					.catch((error) => {});
			}
		}
	}, [start_date, end_date, checkedF, checkedV, checkedD, checkedI, checkedL]);

	const frequency_region_change = (e) => {
		let selectedregions = [...duration_region];

		if (e.checked) selectedregions.push(e.value);
		else selectedregions.splice(selectedregions.indexOf(e.value), 1);

		setduration_region(selectedregions);
	};

	const getcombineddata = () => {
		if (start_date && end_date) {
			setload(true);

			if (checkedF && Selected_f_states && Selected_f_states.length > 0) {
				axios
					.post(
						"/GetFrequencyData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_f_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							return;
						}

						setfrequency_data(response.data);
						// setBlocked(false);
						setloading_show(false);
					})
					.catch((error) => {});
			}

			if (checkedV && Selected_v_states && Selected_v_states.length > 0) {
				axios
					.post(
						"/GetVoltageData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_v_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							return;
						}
						setvoltage_data(response.data);
						// setBlocked(false);
						setloading_show(false);
					})
					.catch((error) => {});
			}

			if (checkedD && Selected_d_states && Selected_d_states.length > 0) {
				axios
					.post(
						"/GetDemandMinData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_d_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							return;
						}
						setdemand_data(response.data);
						// setBlocked(false);
						setloading_show(false);
					})
					.catch((error) => {});
			}

			if (checkedI && Selected_i_states && Selected_i_states.length > 0) {
				axios
					.post(
						"/GetICTData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_i_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							return;
						}
						setict_data(response.data);
						// setBlocked(false);
						setloading_show(false);
					})
					.catch((error) => {});
			}

			if (checkedL && Selected_l_states && Selected_l_states.length > 0) {
				axios
					.post(
						"/LinesMWMVARData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_l_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						if (response.data === "Time ERROR") {
							alert("Data Interval shouldn't be more than time value");
							return;
						}
						setlines_data(response.data);
						// setBlocked(false);
						setloading_show(false);
					})
					.catch((error) => {});
			}
			const timeout = setTimeout(() => {
				setgraphenable(false);
				setload(false);
			}, 500);
		}
	};

	const graph_list = {
		Frequency: frequency_data,
		Voltage: voltage_data,
		Demand: demand_data,
		ICT: ict_data,
		Lines: lines_data,
	};

	return (
		<>
			<div hidden={!loading_show}>
				<div className="loader">
					<div className="spinner"></div>
				</div>
			</div>

			{/* <BlockUI blocked={blocked} fullScreen /> */}
			{/* <Fieldset hidden={!page_hide}>
				<h1>Please Login again by SSO </h1>
			</Fieldset> */}

			{/* <Fieldset
				toggleable
				legend={
					<div className="flex align-items-center ">
						<Avatar
							icon="pi pi-sitemap"
							style={{ backgroundColor: "#3cb371", color: "#ffffff" }}
							shape="circle"
						/>

						<span> Combined</span>
					</div>
				}
			> */}
			<Divider align="left">
				<span
					className="p-tag"
					style={{
						backgroundColor: "#FAF9F6",
						fontSize: "large",
						color: "#000000",
					}}
				>
					<Avatar
						icon="pi pi-spin pi-sitemap"
						style={{
							backgroundColor: "#FAF9F6",
							color: "#000000",
						}}
						shape="square"
					/>
					Combined Tab
				</span>
			</Divider>

			<div className="grid">
				<div className="col">
					<div className="field col-12 md:col-11">
						<label htmlFor="range">From</label> <br />
						<Calendar
							style={{ width: "55%" }}
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
							yearRange="2015:2030"
							showButtonBar
						></Calendar>
					</div>
				</div>

				<div className="col">
					<div className="field col-12 md:col-12">
						<label htmlFor="range">To</label> <br />
						<Calendar
							style={{ width: "55%" }}
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
							yearRange="2015:2030"
							showButtonBar
						></Calendar>
					</div>
				</div>

				<div className="col">
					<div className="field col-12 md:col-10" style={{ marginTop: "-3%" }}>
						<label htmlFor="range">Interval (1 to 1440 minutes)</label>
						<InputNumber
							size={7}
							min={1}
							max={1440}
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
					<div className="field-checkbox">
						Show Duration of :
						<Checkbox
							inputId="1"
							name="city"
							value="Frequency"
							onChange={frequency_region_change}
							checked={duration_region.indexOf("Frequency") !== -1}
						/>
						<label htmlFor="1">Frequency</label>
						<Checkbox
							inputId="2"
							name="city"
							value="Voltage"
							onChange={frequency_region_change}
							checked={duration_region.indexOf("Voltage") !== -1}
						/>
						<label htmlFor="2">Voltage </label>
						<Checkbox
							inputId="3"
							name="city"
							value="Demand"
							onChange={frequency_region_change}
							checked={duration_region.indexOf("Demand") !== -1}
						/>
						<label htmlFor="3">Demand</label>
					</div>
				</div>
			</div>

			<Divider align="center">
				<span className="p-tag">Selections</span>
			</Divider>
			<div className="grid">
				<div className="col">
					<InputSwitch
						checked={checkedF}
						onChange={(e) => {
							setCheckedF(e.value);
						}}
					/>
					{"  "}
					<label htmlFor="range">Show BUS Frequency</label>

					<br />
					<MultiSelect
						filterPlaceholder="Search BUS here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						disabled={!checkedF}
						selectionLimit={5}
						display="chip"
						placeholder="Select 220/400/765KV BUS"
						value={Selected_f_states}
						options={f_states}
						onChange={(e) => setSelected_f_states(e.value)}
						filter
					/>
				</div>

				<div className="col">
					<InputSwitch
						checked={checkedV}
						onChange={(e) => {
							setCheckedV(e.value);
						}}
					/>
					{"  "}
					<label htmlFor="range">Show BUS Voltage</label>

					<br />
					<MultiSelect
						filterPlaceholder="Search BUS here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						disabled={!checkedV}
						selectionLimit={5}
						display="chip"
						placeholder="Select 220/400/765KV BUS"
						value={Selected_v_states}
						options={v_states}
						onChange={(e) => setSelected_v_states(e.value)}
						filter
					/>
				</div>

				<div className="col">
					<InputSwitch
						checked={checkedD}
						onChange={(e) => {
							setCheckedD(e.value);
						}}
					/>
					{"  "}
					<label htmlFor="range">Show Demand</label>

					<br />
					<MultiSelect
						filterPlaceholder="Search Regions here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						disabled={!checkedD}
						selectionLimit={5}
						display="chip"
						placeholder="Select Regions"
						value={Selected_d_states}
						options={d_states}
						onChange={(e) => setSelected_d_states(e.value)}
						filter
					/>
				</div>

				<div className="col">
					<InputSwitch
						checked={checkedI}
						onChange={(e) => {
							setCheckedI(e.value);
						}}
					/>
					{"  "}
					<label htmlFor="range">Show ICT Data</label>

					<br />
					<MultiSelect
						filterPlaceholder="Search ICT-Names here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						disabled={!checkedI}
						selectionLimit={5}
						display="chip"
						placeholder="Select 220/400/765KV BUS"
						value={Selected_i_states}
						options={i_states}
						onChange={(e) => setSelected_i_states(e.value)}
						filter
					/>
				</div>

				<div className="col">
					<InputSwitch
						checked={checkedL}
						onChange={(e) => {
							setCheckedL(e.value);
						}}
					/>
					{"  "}
					<label htmlFor="range">Show Lines Data</label>

					<br />
					<MultiSelect
						filterPlaceholder="Search Lines here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						disabled={!checkedL}
						selectionLimit={5}
						display="chip"
						placeholder="Select 220/400/765KV BUS"
						value={Selected_l_states}
						options={l_states}
						onChange={(e) => setSelected_l_states(e.value)}
						filter
					/>
				</div>
			</div>
			<br></br>
			<br></br>
			<div className="grid">
				<br></br>
				<div className="field col-10 md:col-5"></div>
				<div className="col">
					<br />
					<Button
						raised
						outlined
						style={{ color: "#000000", backgroundColor: "#FAF9F6" }}
						label="Get Combined Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getcombineddata();
						}}
					/>
				</div>
			</div>
			{/* </Fieldset> */}

			<div hidden={graphenable}>
				<Combinedgraph
					graph_list={graph_list}
					duration_region={duration_region}
					checkedL={checkedL}
					checkedI={checkedI}
					checkedD={checkedD}
					checkedV={checkedV}
					checkedF={checkedF}
					Selected_i_states={Selected_i_states}
					Selected_l_states={Selected_l_states}
				/>
			</div>

			{/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
		</>
	);
}
