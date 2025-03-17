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
import Demandgraph from "../graphs/demandgraph";
import { Divider } from "primereact/divider";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";
import { BlockUI } from "primereact/blockui";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function Demand() {
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
	const [exportColumns, setexportColumns] = useState();
	const [demand_states, setdemand_states] = useState();
	const [Selected_demand_states, setSelected_demand_states] = useState();
	const [demand_data, setdemand_data] = useState();
	const [enable, setenable] = useState(true);
	const [graphenable, setgraphenable] = useState(true);
	const [multiple_date, setMultiple_Date] = useState();
	const [multiple_demand_states, setmultipledemand_states] = useState();
	const [multiple_Selected_demand_states, setmultipleSelected_demand_states] =
		useState();
	const [multiple_demand_data, setmultipledemand_data] = useState();
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
	const [freq_region1, setfreq_region1] = useState([]);
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);
	const table_val = [];
	const multi_table_val = [];

	const names = {
		BH_DEMAND: "Bihar DEMAND",
		DVC_DEMAND: "DVC DEMAND",
		GR_DEMAND: "Odisha DEMAND",
		JH_DEMAND: "Jharkhand DEMAND",
		"REG DEMAND": "Regional DEMAND",
		SI_DEMAND: "Sikkim DEMAND",
		WB_DEMAND: "West Bengal DEMAND",
		BH_DIFFERENCE: "Bihar DIFFERENCE",
		BH_DRAWAL: "Bihar DRAWAL",
		"BH_DRAWAL( ER END)": "Bihar DRAWAL (ER END)",
		BH_END_DRAWAL: "Bihar End DRAWAL",
		DVC_DIFFERENCE: "DVC DIFFERENCE",
		"DV_DRAWAL( ER END)": "DVC DRAWAL (ER END)",
		DV_DRAWAL: "DVC DRAWAL",
		DV_END_DRAWAL: "DVC End DRAWAL",
		GR_DIFFERENCE: "Odisha DIFFERENCE",
		GR_DRAWAL: "Odisha DRAWAL",
		"GR_DRAWAL( ER END)": "Odisha DRAWAL (ER END)",
		GR_END_DRAWAL: "Odisha End DRAWAL",
		JH_DIFFERENCE: "Jharkhand DIFFERENCE",
		JH_DRAWAL: "Jharkhand DRAWAL",
		"JH_DRAWAL( ER END)": "Jharkhand DRAWAL (ER END)",
		JH_END_DRAWAL: "Jharkhand End DRAWAL",
		SI_DIFFERENCE: "Sikkim DIFFERENCE",
		SI_DRAWAL: "Sikkim DRAWAL",
		"SI_DRAWAL( ER END)": "Sikkim DRAWAL (ER END)",
		SI_END_DRAWL: "Sikkim End DRAWAL",
		WB_DIFFERENCE: "West Bengal DIFFERENCE",
		WB_DRAWAL: "West Bengal DRAWAL",
		"WB_DRAWAL( ER END)": "West Bengal DRAWAL (ER END)",
		WB_END_DRAWAL: "West Bengal End DRAWAL",
		'CESC DEMAND': 'CESC DEMAND',
		'ALL INDIA DEMAND': 'ALL INDIA DEMAND'
	};

	useEffect(() => {
		if (start_date && end_date) {
			axios
				.post(
					"http://10.3.200.63:5010/DemandMinNames?startDate=" +
						moment(start_date).format("YYYY-MM-DD HH:mm") +
						"&endDate=" +
						moment(end_date).format("YYYY-MM-DD HH:mm"),
					{}
				)
				.then((response) => {
					setdemand_states(
						response.data.map((v, i) => {
							return {
								label: names.hasOwnProperty(v) ? names[v] : "",
								value: v,
							};
						})
					);
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
						"http://10.3.200.63:5010/MultiDemandMinNames?MultistartDate=" +
							temp_multi_date,
						{}
					)
					.then((response) => {
						setmultipledemand_states(
							response.data.map((v, i) => {
								return {
									label: names.hasOwnProperty(v) ? names[v] : "",
									value: v,
								};
							})
						);
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
						"http://10.3.200.63:5010/MultiDemandMinNames?MultistartDate=" +
							temp_multi_month,
						{}
					)
					.then((response) => {
						setmultipledemand_states(
							response.data.map((v, i) => {
								return {
									label: names.hasOwnProperty(v) ? names[v] : "",
									value: v,
								};
							})
						);
					})
					.catch((error) => {});
			}
		}
	}, [start_date, end_date, multiple_date, multiple_month]);

	const getdemanddata = () => {
		if (start_date && end_date && Selected_demand_states) {
			if (minutes && checked3) {
				axios
					.post(
						"http://10.3.200.63:5010/GetDemandMinData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_demand_states +
							"&time=" +
							minutes,
						{}
					)
					.then((response) => {
						setdemand_data(response.data);
						setexportColumns({
							"Date Time": response.data[1].Date_Time,
							Data: response.data[0].output,
						});
						setenable(false);
						setgraphenable(false);
						setBlocked(false);
						setloading_show(false);
					});

				axios
					.post(
						"http://10.3.200.63:5010/GetFrequencyData?startDate=" +
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
						"http://10.3.200.63:5010/GetDemandMinData?startDate=" +
							moment(start_date).format("YYYY-MM-DD HH:mm") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD HH:mm") +
							"&stationName=" +
							Selected_demand_states +
							"&time=1",
						{}
					)
					.then((response) => {
						setdemand_data(response.data);
						setenable(false);
						setgraphenable(false);
						setBlocked(false);
						setloading_show(false);
						setexportColumns({
							"Date Time": response.data[1].Date_Time,
							Data: response.data[0].output,
						});
					});

				axios
					.post(
						"http://10.3.200.63:5010/GetFrequencyData?startDate=" +
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

	const getmultidemanddata = () => {
		if (multiple_date && checked1) {
			if (multiminutes && checked4) {
				var temp1 = [];

				for (var i = 0; i < multiple_date.length; i++) {
					temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
				}

				if (temp1 && multiple_Selected_demand_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiDemandMinData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_demand_states +
								"&Type=Date" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipledemand_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
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

				if (temp1 && multiple_Selected_demand_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiDemandMinData?MultistartDate=" +
								temp1 +
								"&MultistationName=" +
								multiple_Selected_demand_states +
								"&Type=Date" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipledemand_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
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

				if (temp2 && multiple_Selected_demand_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiDemandMinData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_demand_states +
								"&Type=Month" +
								"&time=" +
								multiminutes,
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipledemand_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
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

				if (temp2 && multiple_Selected_demand_states) {
					axios
						.post(
							"http://10.3.200.63:5010/GetMultiDemandMinData?MultistartDate=" +
								temp2 +
								"&MultistationName=" +
								multiple_Selected_demand_states +
								"&Type=Month" +
								"&time=1",
							{}
						)
						.then((response) => {
							// console.log(response);
							setmultipledemand_data(response.data);
							// setenable(false);
							setgraphenable2(false);
							setBlocked(false);
							setloading_show(false);
						});

					axios
						.post(
							"http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
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

	if (demand_data) {
		for (var k = 0; k < demand_data.length - 1; k++) {
			table_val.push({
				name: demand_data[k]["stationName"],
				maxv: demand_data[k]["max"][0][0] + "MW",
				maxDT: demand_data[k]["max"][1],
				minv: demand_data[k]["min"][0][0] + "MW",
				minDT: demand_data[k]["min"][1],
				avgv: demand_data[k]["avg"] + "MW",
			});
		}
	}

	if (multiple_demand_data) {
		if (checked2) {
			for (var k = 0; k < multiple_demand_data.length - 15; k++) {
				multi_table_val.push({
					name: multiple_demand_data[k]["stationname"],
					maxv: multiple_demand_data[k]["max"][0][0] + "MW",
					maxDT: multiple_demand_data[k]["max"][1],
					minv: multiple_demand_data[k]["min"][0][0],
					minDT: multiple_demand_data[k]["min"][1],
					avgv: multiple_demand_data[k]["avg"] + "MW",
				});
			}
		}

		if (checked1) {
			for (var k = 0; k < multiple_demand_data.length - 1; k++) {
				multi_table_val.push({
					name: multiple_demand_data[k]["stationName"],
					maxv: multiple_demand_data[k]["max"][0][0] + " MW",
					maxDT:
						moment(multiple_demand_data[k]["Date_Time"]).format("DD-MM-YYYY") +
						" " +
						multiple_demand_data[k]["max"][1],
					minv: multiple_demand_data[k]["min"][0][0] + " MW",
					minDT:
						moment(multiple_demand_data[k]["Date_Time"]).format("DD-MM-YYYY") +
						" " +
						multiple_demand_data[k]["min"][1],
					avgv: multiple_demand_data[k]["avg"] + " MW",
				});
			}
		}
	}

	const exportExcel = () => {
		import("xlsx").then((xlsx) => {
			const worksheet = xlsx.utils.json_to_sheet(exportColumns);
			const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
			const excelBuffer = xlsx.write(workbook, {
				bookType: "xlsx",
				type: "array",
			});

			saveAsExcelFile(excelBuffer, "products");
		});
	};

	const saveAsExcelFile = (buffer, fileName) => {
		import("file-saver").then((module) => {
			if (module && module.default) {
				let EXCEL_TYPE =
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
				let EXCEL_EXTENSION = ".xlsx";
				const data = new Blob([buffer], {
					type: EXCEL_TYPE,
				});

				module.default.saveAs(
					data,
					fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
				);
			}
		});
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
					style={{
						backgroundColor: "#ffa500",
						fontSize: "large",
						color: "#000000",
					}}
				>
					<Avatar
						icon="pi pi-spin pi-chart-line"
						style={{ backgroundColor: "#ffa500", color: "#000000" }}
						shape="square"
					/>
					Demand Tab
				</span>
			</Divider>
			{/* <Button
					type="button"
					icon="pi pi-file-excel"
					severity="success"
					rounded
					onClick={exportExcel}
					data-pr-tooltip="XLS"
				/> */}
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
							//   DemandNames();
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
							//   DemandNames();
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
						filterPlaceholder="Search Regions here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						selectionLimit={5}
						display="chip"
						placeholder="Select Demand Region(s)"
						value={Selected_demand_states}
						options={demand_states}
						onChange={(e) => setSelected_demand_states(e.value)}
						filter
					/>{" "}
				</div>
				<div className="col">
					<br />
					<Button
						severity="warning"
						size="small"
						rounded
						style={{ backgroundColor: "#ffa500", color: "#000000" }}
						raised
						label="Get Demand Data"
						aria-label="Demand Data"
						onClick={() => {
							getdemanddata();
							setBlocked(true);
							setloading_show(true);
						}}
					/>
					<div className="field-checkbox" style={{ marginTop: "5%" }}>
						Show Duration:
						<Checkbox
							inputId="1"
							name="city"
							value="Demand"
							onChange={frequency_region_change1}
							checked={freq_region1.indexOf("Demand") !== -1}
						/>
						<label htmlFor="1">Demand</label>
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
								"http://10.3.200.63:5010/GetDemandMinDataExcel?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD") +
								"&stationName=" +
								Selected_demand_states
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
				<Demandgraph
					demand_data={demand_data}
					Selected_demand_states={Selected_demand_states}
					frequency={frequency}
					freq_region={freq_region}
					freq_region1={freq_region1}
					names={names}
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
							//   demandNames();
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
							//   demandNames();
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
					<label htmlFor="range">Select substation : </label>
					<br />
					<MultiSelect
						filterPlaceholder="Search Regions here"
						showSelectAll
						showClear
						resetFilterOnHide
						maxSelectedLabels={5}
						selectionLimit={5}
						display="chip"
						placeholder="Select Demand Region(s)"
						value={multiple_Selected_demand_states}
						options={multiple_demand_states}
						onChange={(e) => setmultipleSelected_demand_states(e.value)}
						filter
					/>{" "}
				</div>{" "}
				<div className="col">
					<br />
					<Button
						severity="warning"
						size="small"
						rounded
						style={{ backgroundColor: "#ffa500", color: "#000000" }}
						raised
						label="Get Multi-demand Data"
						aria-label="multidemand Data"
						onClick={() => {
							getmultidemanddata();
							setBlocked(true);
							setloading_show(true);
						}}
					/>
					<div className="field-checkbox" style={{ marginTop: "5%" }}>
						Show Duration:
						<Checkbox
							inputId="1"
							name="city"
							value="Demand"
							onChange={frequency_region_change1}
							checked={freq_region1.indexOf("Demand") !== -1}
						/>
						<label htmlFor="1">Demand</label>
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
				<Demandgraph
					demand_data={multiple_demand_data}
					Selected_demand_states={multiple_Selected_demand_states}
					date_time={true}
					check1={checked1}
					check2={checked2}
					frequency={multifrequency}
					freq_region={freq_region}
					freq_region1={freq_region1}
					names={names}
				/>
			</div>

			<br></br>
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
			</div>
			{/* </Fieldset> */}
		</>
	);
}
