import React, { useEffect, useState } from "react";
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
import Ictgraph from "../graphs/ictgraph";

import { Divider } from "primereact/divider";
import { BlockUI } from "primereact/blockui";

import { InputSwitch } from "primereact/inputswitch";

import { InputNumber } from "primereact/inputnumber";

import { Checkbox } from "primereact/checkbox";

export default function Ict() {
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
	const [ict_states, setict_states] = useState();
	const [Selected_ict_states, setSelected_ict_states] = useState();
	const [ict_data, setict_data] = useState();
	const [enable, setenable] = useState(true);
	const [graphenable, setgraphenable] = useState(true);

	const [multiple_date, setMultiple_Date] = useState();
	const [multiple_ict_states, setmultipleict_states] = useState();
	const [multiple_Selected_ict_states, setmultipleSelected_ict_states] =
		useState();
	const [multiple_ict_data, setmultipleict_data] = useState();
	const [graphenable2, setgraphenable2] = useState(true);

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
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);

	useEffect(() => {
		if (start_date && end_date) {
			axios
				.post(
					"/ICTNames?startDate=" +
						moment(start_date).format("YYYY-MM-DD HH:mm") +
						"&endDate=" +
						moment(end_date).format("YYYY-MM-DD HH:mm"),
					{}
				)
				.then((response) => {
					setict_states(response.data);
				})
				.catch((error) => {});
		}

		if (multiple_date) {
			var temp_multi_date = [];
			for (var i = 0; i < multiple_date.length; i++) {
				temp_multi_date.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
			}

			if (i === multiple_date.length) {
				axios
					.post(
						"/MultiICTNames?MultistartDate=" + temp_multi_date + "&Type=Date",
						{}
					)
					.then((response) => {
						setmultipleict_states(response.data);
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
						"/MultiICTNames?MultistartDate=" + temp_multi_month + "&Type=Date",
						{}
					)
					.then((response) => {
						setmultipleict_states(response.data);
					})
					.catch((error) => {});
			}
		}
	}, [start_date, end_date, multiple_date, multiple_month]);

	const getictdata = () => {
		if (start_date && end_date && Selected_ict_states) {
			if (minutes && checked3) {
				axios
					.post(
						"/GetICTData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_ict_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						setict_data(response.data);
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
						"/GetICTData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_ict_states +
							"&time=1",
						{}
					)
					.then((response) => {
						setict_data(response.data);
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

	const getmultiictdata = () => {
		if (multiple_date && checked1) {
			if (multiminutes && checked4) {
				var temp1 = [];

				for (var i = 0; i < multiple_date.length; i++) {
					temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
				}

				if (temp1 && multiple_Selected_ict_states) {
					axios
						.post(
							"/GetMultiICTData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_ict_states +
								"&Type=Date" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipleict_data(response.data);
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

				if (temp1 && multiple_Selected_ict_states) {
					axios
						.post(
							"/GetMultiICTData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_ict_states +
								"&Type=Date" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipleict_data(response.data);
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

				if (temp2 && multiple_Selected_ict_states) {
					axios
						.post(
							"/GetMultiICTData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_ict_states +
								"&Type=Month" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipleict_data(response.data);
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

				if (temp2 && multiple_Selected_ict_states) {
					axios
						.post(
							"/GetMultiICTData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_ict_states +
								"&Type=Month" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipleict_data(response.data);
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
					style={{ backgroundColor: "#6a5acd", fontSize: "large" }}
				>
					<Avatar
						icon="pi pi-spin pi-microchip"
						style={{ backgroundColor: "#6a5acd", color: "#ffffff" }}
						shape="square"
					/>
					ICT Tab
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
							placeholder="Start yDate"
							dateFormat="dd-mm-yy"
							value={start_date}
							onChange={(e) => {
								setStart_Date(e.value);
							}}
							// onClick={() => {
							//   ICTNames();
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
							//   ICTNames();
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
					<label htmlFor="range">Select ICT : </label>
					<br />
					<MultiSelect
						filterPlaceholder="Search ICT here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						selectionLimit={5}
						display="chip"
						placeholder="Select ICT Region(s)"
						value={Selected_ict_states}
						options={ict_states}
						onChange={(e) => setSelected_ict_states(e.value)}
						filter
					/>{" "}
				</div>
				<div className="col">
					<br />
					<Button
						// severity="secondary"
						size="small"
						rounded
						style={{ backgroundColor: "#6a5acd" }}
						raised
						label="Get ICT Data"
						aria-label="ICT Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getictdata();
						}}
					/>
					{/* <div className="field-checkbox">
              Show Duration:
              <Checkbox
                inputId="1"
                name="city"
                value="ICT"
                onChange={frequency_region_change1}
                checked={freq_region1.indexOf("ICT") !== -1}
              />
              <label htmlFor="1">ICT</label>
              <Checkbox
                inputId="2"
                name="city"
                value="Frequency"
                onChange={frequency_region_change1}
                checked={freq_region1.indexOf("Frequency") !== -1}
              />
              <label htmlFor="2">Frequency</label>
            </div> */}
					<div className="col-2">
						<a
							hidden={enable}
							href={
								`${baseUrl}/GetICTDataExcel?startDate=` +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD") +
								"&stationName=" +
								Selected_ict_states
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
				<Ictgraph
					ict_data={ict_data}
					Selected_ict_states={Selected_ict_states}
					frequency={frequency}
					freq_region={freq_region}
				/>
			</div>
			{/* <br></br>

        <div className="card" hidden={graphenable}>
          <DataTable value={table_val} removableSort responsivelayout="scroll">
            <Column field="name" header="Name" sortable></Column>
            <Column field="maxv" header="Maximum Value" sortable></Column>
            <Column field="maxDT" header="Max Date Time" sortable></Column>
            <Column field="minv" header="Minimum Value" sortable></Column>
            <Column field="minDT" header="Min Date Time" sortable></Column>
            <Column field="avgv" header="Average value" sortable></Column>
          </DataTable>
        </div> */}
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
							//   ICTNames();
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
							// onClick={() => {
							//   ICTNames();
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
					<label htmlFor="range">Select ICT : </label>
					<br />
					<MultiSelect
						filterPlaceholder="Search ICT here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						selectionLimit={5}
						display="chip"
						placeholder="Select ICT Region(s)"
						value={multiple_Selected_ict_states}
						options={multiple_ict_states}
						onChange={(e) => setmultipleSelected_ict_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="col">
					<br />
					<Button
						// severity="secondary"
						size="small"
						rounded
						style={{ backgroundColor: "#6a5acd" }}
						raised
						label="Get Multi-ICT Data"
						aria-label="multi-ICT Data"
						onClick={() => {
							// setBlocked(true);
							setloading_show(true);
							getmultiictdata();
						}}
					/>
					{/* <div className="field-checkbox">
              Show Duration:
              <Checkbox
                inputId="1"
                name="city"
                value="ICT"
                onChange={frequency_region_change1}
                checked={freq_region1.indexOf("Ict") !== -1}
              />
              <label htmlFor="1">ICT</label>
              <Checkbox
                inputId="2"
                name="city"
                value="Frequency"
                onChange={frequency_region_change1}
                checked={freq_region1.indexOf("Frequency") !== -1}
              />
              <label htmlFor="2">Frequency</label>
            </div> */}
					<br></br>
					<div className="field-checkbox" style={{ marginTop: "5%" }}>
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
				<Ictgraph
					ict_data={multiple_ict_data}
					Selected_ict_states={multiple_Selected_ict_states}
					date_time={true}
					check1={checked1}
					check2={checked2}
					frequency={multifrequency}
					freq_region={freq_region}
				/>
			</div>

			{/* <br></br>
        <div className="card" hidden={graphenable2}>
          <DataTable
            value={multi_table_val}
            removableSort
            responsiveLayout="scroll"
          >
            <Column field="name" header="Name" sortable></Column>
            <Column field="maxv" header="Haximum Value" sortable></Column>
            <Column field="maxDT" header="Max Date Time" sortable></Column>
            <Column field="minv" header="Minimum Value" sortable></Column>
            <Column field="minDT" header="Min Date Time" sortable></Column>
            <Column field="avgv" header="Average Value" sortable></Column>
          </DataTable>
        </div> */}
			{/* </Fieldset> */}
		</>
	);
}
