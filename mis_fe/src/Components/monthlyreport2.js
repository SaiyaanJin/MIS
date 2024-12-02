import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar } from "primereact/avatar";
import { Row } from "react-grid-system";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import moment from "moment";
import { FileUpload } from "primereact/fileupload";
import { Panel } from "primereact/panel";
import { Calendar } from "primereact/calendar";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { MultiSelect } from "primereact/multiselect";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import zoomPlugin from "chartjs-plugin-zoom";
import { Chart as ChartJS, registerables } from "chart.js";
import { ColumnGroup } from "primereact/columngroup";
import { DownloadTableExcel } from "react-export-table-to-excel";

function MonthlyReports2() {
	const dt = useRef(null);
	const configMenu = useRef(null);
	const report_table = useRef(null);
	const toast = useRef();
	const [File, setFile] = useState([]);
	const [start_date, setstart_date] = useState();
	const [end_date, setend_date] = useState();
	const [meter_number, setmeter_number] = useState();
	const [selected_meter_number, setselected_meter_number] = useState();
	const [time, settime] = useState(15);
	const [date_range, setdate_range] = useState([]);
	const [graphenable, setgraphenable] = useState(true);
	const [uploadenable, setuploadenable] = useState(true);
	const [folder_files, setfolder_files] = useState(false);
	const [chartData, setChartData] = useState({});
	const [chartOptions, setChartOptions] = useState({});
	const [loading_show, setloading_show] = useState(false);
	const [report_data, setreport_data] = useState([]);
	const [report_data_header, setreport_data_header] = useState([]);
	const [show_report_table, setshow_report_table] = useState(false);
	var header_val = "";

	ChartJS.register(...registerables, zoomPlugin);
	const zoomOptions = {
		zoom: {
			wheel: {
				enabled: true,
			},
			pinch: {
				enabled: true,
			},
			mode: "xy",
		},
		pan: {
			enabled: true,
			mode: "xy",
		},
	};

	useEffect(() => {
		if (date_range && date_range[1]) {
			axios
				.post(
					"http://10.3.200.63:5010/meter_names?startDate=" +
						moment(date_range[0]).format("YYYY-MM-DD") +
						"&endDate=" +
						moment(date_range[1]).format("YYYY-MM-DD") +
						"&time=" +
						time +
						"&folder=no",
					{}
				)
				.then((response) => {
					setmeter_number(response.data);
					setfolder_files(false);
					setuploadenable(true);
					if (response.data.length === 0) {
						axios
							.post(
								"http://10.3.200.63:5010/meter_names?startDate=" +
									moment(date_range[0]).format("YYYY-MM-DD") +
									"&endDate=" +
									moment(date_range[1]).format("YYYY-MM-DD") +
									"&time=" +
									time +
									"&folder=yes",
								{}
							)
							.then((response) => {
								if (response.data[0] === "Please Upoad") {
									alert("Data not found anywhere, Please Upload");
									setuploadenable(false);
								} else {
									setmeter_number(response.data);
									setfolder_files(true);
								}
							})
							.catch((error) => {});
					}
				})
				.catch((error) => {});

			setend_date(date_range[1]);
			setstart_date(date_range[0]);
		}
	}, [date_range, time]);

	const generate_report = () => {
		if (start_date && end_date) {
			setloading_show(true);
			if (!folder_files) {
				axios
					.post(
						"http://10.3.200.63:5010/Report_Meter_Data2?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&time=" +
							time +
							"&folder=no",
						{}
					)
					.then((response) => {
						setreport_data(response.data);
						setshow_report_table(true);
						setloading_show(false);
						var head1 = [];

						for (var i = 1; i <= 4; i++) {
							if (i === 1) {
								for (var j = 1; j <= 8; j++) {
									head1.push("pos_data" + String(i) + String(j));
									head1.push("neg_data" + String(i) + String(j));
								}
								head1.push("net_pos1");
								head1.push("net_neg1");
								head1.push("net_val1");
							}
							if (i === 2) {
								for (var k = 1; k <= 6; k++) {
									head1.push("pos_data" + String(i) + String(k));
									head1.push("neg_data" + String(i) + String(k));
								}
								head1.push("net_pos2");
								head1.push("net_neg2");
								head1.push("net_val2");
							}
							if (i === 3) {
								for (var l = 1; l <= 17; l++) {
									head1.push("pos_data" + String(i) + String(l));
									head1.push("neg_data" + String(i) + String(l));
								}
								head1.push("net_pos3");
								head1.push("net_neg3");
								head1.push("net_val3");
							}
							if (i === 4) {
								for (var m = 1; m <= 35; m++) {
									head1.push("pos_data" + String(i) + String(m));
									head1.push("neg_data" + String(i) + String(m));
								}
								head1.push("net_pos4");
								head1.push("net_neg4");
								head1.push("net_val4");
							}
						}

						setreport_data_header(head1);
					});
			} else {
				axios
					.post(
						"http://10.3.200.63:5010/Report_Meter_Data2?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&time=" +
							time +
							"&folder=yes",
						{}
					)
					.then((response) => {
						setreport_data(response.data);
						setshow_report_table(true);
						setloading_show(false);
						var head1 = [];

						for (var i = 1; i <= 4; i++) {
							if (i === 1) {
								for (var j = 1; j <= 8; j++) {
									head1.push("pos_data" + String(i) + String(j));
									head1.push("neg_data" + String(i) + String(j));
								}
								head1.push("net_pos1");
								head1.push("net_neg1");
								head1.push("net_val1");
							}
							if (i === 2) {
								for (var k = 1; k <= 6; k++) {
									head1.push("pos_data" + String(i) + String(k));
									head1.push("neg_data" + String(i) + String(k));
								}
								head1.push("net_pos2");
								head1.push("net_neg2");
								head1.push("net_val2");
							}
							if (i === 3) {
								for (var l = 1; l <= 17; l++) {
									head1.push("pos_data" + String(i) + String(l));
									head1.push("neg_data" + String(i) + String(l));
								}
								head1.push("net_pos3");
								head1.push("net_neg3");
								head1.push("net_val3");
							}
							if (i === 4) {
								for (var m = 1; m <= 35; m++) {
									head1.push("pos_data" + String(i) + String(m));
									head1.push("neg_data" + String(i) + String(m));
								}
								head1.push("net_pos4");
								head1.push("net_neg4");
								head1.push("net_val4");
							}
						}

						setreport_data_header(head1);
					});
			}
		}
	};

	const showSuccess = (v) => {
		toast.current.show({
			severity: "success",
			summary: v,
			detail: v + " SuccessFully",
			life: 3000,
		});
	};

	const reject = (v) => {
		toast.current.show({
			severity: "error",
			summary: "Error",
			detail: v,
			life: 3000,
		});
	};

	const file_name = (e) => {
		var filenames = [];
		for (var i = 0; i < e.files.length; i++) {
			filenames = [...filenames, ...[e.files[i].name]];
		}

		setFile([...File, ...filenames]);
		if (filenames) {
			showSuccess("SEM File Uploaded");
			reject("Upload Error");
			setuploadenable(true);
		}
	};

	const upload_error = (e) => {
		reject("Upload Error");
	};

	const getmeterdata = () => {
		if (start_date && end_date && selected_meter_number) {
			// setloading_show(true);
			if (!folder_files) {
				axios
					.post(
						"http://10.3.200.63:5010/GetMeterData?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&meter=" +
							selected_meter_number +
							"&time=" +
							time +
							"&folder=no",
						{}
					)
					.then((response) => {
						setgraphenable(false);
						setloading_show(false);

						if (response.data.length > 1) {
							var temp_labels = [];

							for (var z = 1; z < response.data.length; z++) {
								let temp_labels1 = {
									label:
										"SEM Data of " +
										response.data[z]["meterNO"] +
										": " +
										response.data[z]["meterID"],
									data: response.data[z]["data"],
									fill: false,

									tension: 0.4,
									yAxisID: "y",
								};

								temp_labels.push(temp_labels1);
							}

							const documentStyle = getComputedStyle(document.documentElement);
							const textColor = documentStyle.getPropertyValue("--text-color");
							const textColorSecondary = documentStyle.getPropertyValue(
								"--text-color-secondary"
							);
							const surfaceBorder =
								documentStyle.getPropertyValue("--surface-border");
							const data = {
								labels: response.data[0],
								datasets: temp_labels,
							};
							const options = {
								stacked: false,
								maintainAspectRatio: false,
								aspectRatio: 0.6,
								plugins: {
									zoom: zoomOptions,
									legend: {
										labels: {
											color: textColor,
										},
									},
								},
								scales: {
									x: {
										ticks: {
											color: textColorSecondary,
										},
										grid: {
											color: surfaceBorder,
										},
									},
									y: {
										type: "linear",
										display: true,
										position: "left",
										ticks: {
											color: textColorSecondary,
										},
										grid: {
											color: surfaceBorder,
										},
									},
								},
							};
							setChartData(data);
							setChartOptions(options);
						}
					});
			} else {
				axios
					.post(
						"http://10.3.200.63:5010/GetMeterData?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&meter=" +
							selected_meter_number +
							"&time=" +
							time +
							"&folder=yes",
						{}
					)
					.then((response) => {
						setgraphenable(false);
						setloading_show(false);

						if (response.data.length > 1) {
							var temp_labels = [];

							for (var z = 1; z < response.data.length; z++) {
								let temp_labels1 = {
									label:
										"SEM Data of " +
										response.data[z]["meterNO"] +
										": " +
										response.data[z]["meterID"],
									data: response.data[z]["data"],
									fill: false,

									tension: 0.4,
									yAxisID: "y",
								};

								temp_labels.push(temp_labels1);
							}

							const documentStyle = getComputedStyle(document.documentElement);
							const textColor = documentStyle.getPropertyValue("--text-color");
							const textColorSecondary = documentStyle.getPropertyValue(
								"--text-color-secondary"
							);
							const surfaceBorder =
								documentStyle.getPropertyValue("--surface-border");
							const data = {
								labels: response.data[0],
								datasets: temp_labels,
							};
							const options = {
								stacked: false,
								maintainAspectRatio: false,
								aspectRatio: 0.6,
								plugins: {
									zoom: zoomOptions,
									legend: {
										labels: {
											color: textColor,
										},
									},
								},
								scales: {
									x: {
										ticks: {
											color: textColorSecondary,
										},
										grid: {
											color: surfaceBorder,
										},
									},
									y: {
										type: "linear",
										display: true,
										position: "left",
										ticks: {
											color: textColorSecondary,
										},
										grid: {
											color: surfaceBorder,
										},
									},
								},
							};
							setChartData(data);
							setChartOptions(options);
						}
					});
			}
		}
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

				module.default.saveAs(data, fileName + EXCEL_EXTENSION);
			}
		});
	};

	const handleExport = () => {
		if (chartData) {
			var excel_data = [];
			for (var i = 0; i < chartData.labels.length; i++) {
				var t1 = {
					Date: chartData.labels[i],
				};

				for (var j = 0; j < chartData.datasets.length; j++) {
					t1[chartData.datasets[j].label.split("of ")[1]] =
						chartData.datasets[j].data[i];
				}

				excel_data.push(t1);
			}
		}
		import("xlsx").then((xlsx) => {
			const worksheet = xlsx.utils.json_to_sheet(excel_data);
			const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
			const excelBuffer = xlsx.write(workbook, {
				bookType: "xlsx",
				type: "array",
			});

			saveAsExcelFile(excelBuffer, chartData.datasets[0].label);
		});
	};

	const copyTable = () => {
		var elTable = "";

		elTable = document.querySelector(".table");

		let range, sel;

		if (document.createRange && window.getSelection) {
			range = document.createRange();
			sel = window.getSelection();

			sel.removeAllRanges();

			try {
				range.selectNodeContents(elTable);
				sel.addRange(range);
			} catch (e) {
				range.selectNode(elTable);
				sel.addRange(range);
			}

			document.execCommand("copy");
		}

		sel.removeAllRanges();

		toast.current.show({
			severity: "success",
			summary: "Copied",
			detail: "Table Copied SuccessFully",
			life: 3000,
		});
	};

	const headerTemplate = (options) => {
		const className = `${options.className} justify-content-space-between`;

		return (
			<div className={className}>
				<div className="flex align-items-center gap-2">
					<span className="font-bold">Meter Data Graph</span>
				</div>
				<div>
					<Button
						size="small"
						icon="pi pi-file-excel"
						severity="success"
						raised
						rounded
						onClick={handleExport}
					>
						Export to Excel
					</Button>

					<button onClick={(e) => configMenu?.current?.toggle(e)}></button>
					{options.togglerElement}
				</div>
			</div>
		);
	};

	const numbers = [];

	for (var z = 1; z <= 74; z++) { //all 4 meter array [lenght+ total+ net](66+4(2))
		numbers.push(z);
	}

	const numbers2 = [];

	for (var z1 = 1; z1 <= 144; z1++) { //all 4 meter array [lenght*2+ total*2+ net*1](66*2+4(3))
		numbers2.push(z1);
	}

	if (report_data.length !== 0) {
		header_val = (
			<ColumnGroup>
				<Row>
					<Column
						style={{ fontSize: "x-small" }}
						alignHeader="center"
						headerClassName="p-blank"
						header="ALL FIGS ARE IN MWH"
						colSpan={1}
						frozen
					/>
					<Column
						alignHeader="center"
						headerClassName="p-ner"
						header="NER"
						colSpan={19}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-sr"
						header="SR"
						colSpan={15}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-wr"
						header="WR"
						colSpan={37}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-nr"
						header="NR**"
						colSpan={73}
					/>
				</Row>
				<Row>
					<Column
						alignHeader="center"
						headerClassName="p-blank"
						header=""
						colSpan={1}
						frozen
					/>

					{numbers.map((e) =>
						report_data[0]["name" + String(e)] === "नेट" ? (
							<Column
								alignHeader="center"
								style={{ fontSize: "small" }}
								header={report_data[0]["name" + String(e)]}
								colSpan={1}
							/>
						) : report_data[0]["name" + String(e)] === "कुल" ? (
							<Column
								alignHeader="center"
								style={{ fontSize: "small" }}
								header={report_data[0]["name" + String(e)]}
								colSpan={2}
							/>
						) : e % 2 === 0 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng1"
								header={report_data[0]["name" + String(e)][0]}
								colSpan={2}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						) : (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng11"
								header={report_data[0]["name" + String(e)][0]}
								colSpan={2}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						)
					)}
				</Row>
				<Row>
					<Column
						style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-blank"
						header="Date"
						colSpan={1}
						frozen
					/>

					{numbers.map((e) =>
						report_data[0]["name_hindi" + String(e)] === "Net" ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={1}
							/>
						) : report_data[0]["name_hindi" + String(e)] === "Total" ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={2}
							/>
						) : e % 2 === 0 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng1"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={2}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						) : (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng11"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={2}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						)
					)}
				</Row>

				<Row>
					<Column
						style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-blank"
						header=""
						colSpan={1}
						frozen
					/>

					{numbers2.map((f) =>
						[19, 34, 71, 144].indexOf(f) > -1 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								// headerClassName="p-total"
								header=""
								colSpan={1}
							/>
						) : f % 2 === 0 && f < 20 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-imp"
								header="Imp"
								colSpan={1}
							/>
						) : f < 20 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-exp"
								header="Exp"
								colSpan={1}
							/>
						) : f % 2 === 0 && f < 35 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-exp"
								header="Exp"
								colSpan={1}
							/>
						) : f < 35 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-imp"
								header="Imp"
								colSpan={1}
							/>
						) : f % 2 === 0 && f < 72 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-imp"
								header="Imp"
								colSpan={1}
							/>
						) : f < 72 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-exp"
								header="Exp"
								colSpan={1}
							/>
						) : f % 2 === 0 ? (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-exp"
								header="Exp"
								colSpan={1}
							/>
						) : (
							<Column
								style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-imp"
								header="Imp"
								colSpan={1}
							/>
						)
					)}
				</Row>
			</ColumnGroup>
		);
	}

	const v = (e) => {
		let sum = 0;
		for (let vals of report_data) {
			sum = sum + vals[e];
		}
		return sum.toFixed(2);
	};

	const table_footerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					// footerClassName="p-footer1"
					align="center"
					footer="TOTAL"
					colSpan={1}
					footerStyle={{ textAlign: "center" }}
					frozen
				/>

				{report_data_header.map((e) =>
					[
						"net_val1",
						"net_val2",
						"net_val3",
						"net_val4",
						"net_pos1",
						"net_pos2",
						"net_pos3",
						"net_pos4",
						"net_neg1",
						"net_neg2",
						"net_neg3",
						"net_neg4",
					].indexOf(e) > -1 ? (
						<Column
							footerClassName="p-total"
							align="center"
							colSpan={1}
							footer={v(e)}
						/>
					) : (
						<Column
							footerClassName="p-footer1"
							align="center"
							colSpan={1}
							footer={v(e)}
						/>
					)
				)}
			</Row>
		</ColumnGroup>
	);

	return (
		<>
			<div hidden={!loading_show}>
				<div className="loader">
					<div className="spinner"></div>
				</div>
			</div>

			<Toast ref={toast} />

			<Divider align="left">
				<span
					className="p-tag"
					style={{
						backgroundColor: "#FF8FAB",
						fontSize: "large",
						color: "#000000",
					}}
				>
					<Avatar
						icon="pi pi-spin pi-file-pdf"
						style={{ backgroundColor: "#FF8FAB", color: "#000000" }}
						shape="square"
					/>
					Monthly IR Exchange
				</span>
			</Divider>
			<div className="grid">
				<div hidden={uploadenable} className="col">
					<label htmlFor="range">Upload AMR Data</label> <br />
					<FileUpload
						name="demo[]"
						onUpload={file_name}
						onError={upload_error}
						url="http://10.3.200.63:5003/file_upload"
						accept="zip/*"
						maxFileSize={50000000}
						emptyTemplate={
							<p className="m-0">
								Drag and drop relevant files supporting the issue.
							</p>
						}
					/>
				</div>
			</div>
			<br />

			<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
				<div className="field"> </div>
				<div className="field">
					<span className="p-float-label">
						Date Range:
						<br />
						<Calendar
							placeholder="Select Date Range"
							dateFormat="dd/mm/yy"
							value={date_range}
							onChange={(e) => setdate_range(e.value)}
							showIcon
							selectionMode="range"
							readOnlyInput
						/>
					</span>
				</div>

				<div className="field">
					<span className="p-float-label">
						Interval (1 to 1440 minutes)
						<br />
						<InputNumber
							size={10}
							min={15}
							max={1440}
							step={15}
							value={time}
							onValueChange={(e) => settime(e.value)}
							suffix=" minutes"
							showButtons
							buttonLayout="horizontal"
							decrementButtonClassName="p-button-danger"
							incrementButtonClassName="p-button-success"
							incrementButtonIcon="pi pi-plus"
							decrementButtonIcon="pi pi-minus"
						/>
					</span>
				</div>
				<div className="field">
					<span className="p-float-label">
						Select Meter:
						<br />
						<MultiSelect
							filterPlaceholder="Search here"
							showSelectAll
							showClear
							resetFilterOnHide
							maxSelectedLabels={5}
							selectionLimit={5}
							display="chip"
							placeholder="meter number (meter id)"
							value={selected_meter_number}
							options={meter_number}
							onChange={(e) => setselected_meter_number(e.value)}
							filter
						/>
					</span>
				</div>

				<div className="field">
					<Button
						raised
						rounded
						label="Get Meter Data"
						icon="pi pi-bookmark"
						onClick={() => {
							if (selected_meter_number) {
								// setBlocked(true);
								setloading_show(true);
								getmeterdata();
							} else {
								alert("Select meters");
							}
						}}
					/>
				</div>
				<div className="field">
					<Button
						style={{ backgroundColor: "#FF8FAB", color: "#000000" }}
						size="small"
						icon="pi pi-download"
						severity="danger"
						raised
						rounded
						onClick={generate_report}
					>
						Generate Report
					</Button>
				</div>
				<div className="field"></div>
			</div>

			<div hidden={graphenable}>
				<Panel headerTemplate={headerTemplate} toggleable>
					<div className="card">
						<Chart type="line" data={chartData} options={chartOptions} />
					</div>
				</Panel>
			</div>

			<div hidden={!show_report_table} className="card">
				<br />

				<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
					<div className="field">
						<Button
							size="small"
							severity="help"
							rounded
							raised
							label="Copy this Table"
							onClick={() => {
								copyTable();
							}}
						/>
					</div>
					<div className="field">
						<DownloadTableExcel
							filename={
								"MIS-Monthly Report:" +
								moment(date_range[0]).format("DD/MM/YY") +
								" to " +
								moment(date_range[1]).format("DD/MM/YY")
							}
							sheet="Reports"
							currentTableRef={report_table.current}
						>
							<Button
								type="button"
								icon="pi pi-download"
								severity="success"
								rounded
								raised
								tooltip="Download report"
							/>
						</DownloadTableExcel>
					</div>
				</div>

				<div className="table">
					<DataTable
						// size="small"
						rows={9}
						scrollable
						scrollHeight="830px"
						ref={dt}
						paginator
						rowsPerPageOptions={[9, 15, 20, report_data.length]}
						paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
						currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Meters"
						value={report_data}
						showGridlines
						tableStyle={{ minWidth: "50rem" }}
						removableSort
						headerColumnGroup={header_val}
						footerColumnGroup={table_footerGroup}
					>
						<Column
							headerClassName="p-monthhead"
							bodyStyle={{ textAlign: "center" }}
							alignHeader="center"
							field="Date"
							header="Date"
							sortable
							style={{ minWidth: "110px" }}
							frozen
						></Column>
						{report_data_header.map((e) => (
							[
								"net_val1",
								"net_val2",
								"net_val3",
								"net_val4",
								"net_pos1",
								"net_pos2",
								"net_pos3",
								"net_pos4",
								"net_neg1",
								"net_neg2",
								"net_neg3",
								"net_neg4",
							].indexOf(e) > -1 ? (
								<Column
								className="p-total"
								bodyStyle={{ textAlign: "center" }}
								alignHeader="center"
								field={e}
								header={e}
								sortable
								style={{ minWidth: "110px" }}
							></Column>
							) : (
							<Column
								headerClassName="p-monthhead"
								bodyStyle={{ textAlign: "center" }}
								alignHeader="center"
								field={e}
								header={e}
								sortable
								style={{ minWidth: "110px" }}
							></Column>
						)))}
					</DataTable>
				</div>
			</div>

			<div ref={report_table} hidden={true} id="table">
				<DataTable
					rows={report_data.length}
					scrollable
					scrollHeight="830px"
					ref={dt}
					value={report_data}
					showGridlines
					tableStyle={{ minWidth: "50rem" }}
					removableSort
					headerColumnGroup={header_val}
					footerColumnGroup={table_footerGroup}
				>
					<Column
						headerClassName="p-monthhead"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Date"
						header="Date"
						sortable
						style={{ minWidth: "110px" }}
					></Column>
					{report_data_header.map((e) => (
						<Column
							headerClassName="p-monthhead"
							bodyStyle={{ textAlign: "center" }}
							alignHeader="center"
							field={e}
							header={e}
							sortable
							style={{ minWidth: "110px" }}
						></Column>
					))}
				</DataTable>
			</div>
		</>
	);
}
export default MonthlyReports2;
