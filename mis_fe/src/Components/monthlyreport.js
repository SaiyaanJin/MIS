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
// import "../cssfiles/PasswordDemo.css";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
// import "../cssfiles/ButtonDemo.css";
import { MultiSelect } from "primereact/multiselect";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";
import "../cssFiles/Animation.css";
import "../cssFiles/PasswordDemo.css";
import "../cssFiles/ButtonDemo.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import Metergraph from "../graphs/Metergraph";
import { Chart } from "primereact/chart";
import zoomPlugin from "chartjs-plugin-zoom";
import { Chart as ChartJS, registerables } from "chart.js";
import { ColumnGroup } from "primereact/columngroup";
import { DownloadTableExcel } from "react-export-table-to-excel";
// import { Skeleton } from "primereact/skeleton";

function MonthlyReports() {
	const dt = useRef(null);
	const configMenu = useRef(null);
	const report_table = useRef(null);
	const toast = useRef();
	const [sum_checked, setsum_checked] = useState(false);
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
	const [name, setname] = useState("Elaborated Monthly Report");
	const [loading_show, setloading_show] = useState(false);
	const [report_data, setreport_data] = useState([]);
	const [report_data_header, setreport_data_header] = useState([]);
	const [report_data_header2, setreport_data_header2] = useState([]);
	const [show_report_table, setshow_report_table] = useState(false);
	var header_val = "";
	var header_val2 = "";
	// const items = Array.from({ length: 9 }, (v, i) => i);
	// const [show_skeleton, setshow_skeleton] = useState(false);

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
					"/meter_names?startDate=" +
						moment(date_range[0]).format("YYYY-MM-DD") +
						"&endDate=" +
						moment(date_range[1]).format("YYYY-MM-DD") +
						"&time=15" +
						
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
								"/meter_names?startDate=" +
									moment(date_range[0]).format("YYYY-MM-DD") +
									"&endDate=" +
									moment(date_range[1]).format("YYYY-MM-DD") +
									"&time=15" +
									
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
	}, [date_range]);

	useEffect(() => {
		if (sum_checked) {
			setname("Consolidated Monthly Report");
		} else {
			setname("Elaborated Monthly Report");
		}
	}, [sum_checked]);

	const generate_report = () => {
		if (start_date && end_date) {
			// setshow_skeleton(true);
			setloading_show(true);
			if (!folder_files) {
				axios
					.post(
						"/Report_Meter_Data?startDate=" +
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
						// setshow_skeleton(false);
						setshow_report_table(true);
						setloading_show(false);

						var head1 = [];
						var head2 = [];

						for (var i = 1; i <= 20; i++) {
							head1.push("pos_data" + String(i));
							head1.push("neg_data" + String(i));
							head2.push("sum" + String(i));
						}

						setreport_data_header(head1);
						setreport_data_header2(head2);
					});
			} else {
				axios
					.post(
						"/Report_Meter_Data?startDate=" +
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
						// setshow_skeleton(false);
						setshow_report_table(true);
						setloading_show(false);

						var head1 = [];
						var head2 = [];

						for (var i = 1; i <= 20; i++) {
							head1.push("pos_data" + String(i));
							head1.push("neg_data" + String(i));
							head2.push("sum" + String(i));
						}

						setreport_data_header(head1);
						setreport_data_header2(head2);
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
						"/GetMeterData?startDate=" +
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
						// setshow_skeleton(false);
						setgraphenable(false);
						setloading_show(false);
						// setBlocked(false);
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
									// borderColor: documentStyle.getPropertyValue("--pink-500"),
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
						"/GetMeterData?startDate=" +
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
						// setshow_skeleton(false);
						setgraphenable(false);
						setloading_show(false);

						// setBlocked(false);

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
									// borderColor: documentStyle.getPropertyValue("--pink-500"),
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

		if (sum_checked) {
			elTable = document.querySelector(".table1");
		} else {
			elTable = document.querySelector(".table");
		}

		let range, sel;

		// Ensure that range and selection are supported by the browsers
		if (document.createRange && window.getSelection) {
			range = document.createRange();
			sel = window.getSelection();
			// unselect any element in the page
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
					{/* <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" size="large" shape="circle" />*/}
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
					{/* <Menu model={items} popup ref={configMenu} id="config_menu" />*/}
					<button
						// className="p-panel-header-icon p-link mr-2"
						onClick={(e) => configMenu?.current?.toggle(e)}
					>
						{/* <span className="pi pi-cog"></span> */}
					</button>
					{options.togglerElement}
				</div>
			</div>
		);
	};

	const numbers = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
	];
	const numbers2 = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
		22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40
	];

	if (report_data.length !== 0) {
		header_val = (
			<ColumnGroup>
				<Row>
					<Column
					style={{ fontSize: "x-small" }}
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header="All figs in MWH"
						colSpan={1}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-bhutan"
						header="BHUTAN"
						colSpan={26}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-bangladesh"
						header="BANGLADESH"
						colSpan={8}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-nepal"
						header="NEPAL"
						colSpan={6}
					/>
				</Row>
				<Row>
					<Column
					style={{ fontSize: "small" }}
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header=""
						colSpan={1}
					/>
					{/* <Column
					style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-eng"
						header={report_data[0]["name"]}
						colSpan={2}
					/> */}
					{numbers.map((e) =>
						e % 2 === 0 ? (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng"
								header={report_data[0]["name" + String(e)][0]}
								colSpan={2}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						) : (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng1"
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
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header="Date"
						colSpan={1}
					/>
					{/* <Column
					style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-eng"
						header={report_data[0]["name_hindi"]}
						colSpan={2}
					/> */}
					{numbers.map((e) =>
						e % 2 === 0 ? (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={2}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						) : (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng1"
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
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header=""
						colSpan={1}
					/>
					{/* <Column
					style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-exp"
						header="Exp"
						colSpan={1}
					/>
					<Column
					style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-imp"
						header="Imp"
						colSpan={1}
					/> */}

					{numbers2.map((e) =>
						e % 2 === 0 ? (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-imp"
								header="Imp"
								colSpan={1}
							/>
						) : (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-exp"
								header="Exp"
								colSpan={1}
							/>
						)
					)}
				</Row>
			</ColumnGroup>
		);

		header_val2 = (
			<ColumnGroup>
				<Row>
					<Column
					style={{ fontSize: "x-small" }}
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header="All figs in MWH"
						colSpan={1}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-bhutan"
						header="BHUTAN"
						colSpan={13}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-bangladesh"
						header="BANGLADESH"
						colSpan={4}
					/>
					<Column
						alignHeader="center"
						headerClassName="p-nepal"
						header="NEPAL"
						colSpan={3}
					/>
				</Row>
				<Row>
					<Column
					style={{ fontSize: "small" }}
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header=""
						colSpan={1}
					/>
					{/* <Column
					style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-eng"
						header={report_data[0]["name"]}
						colSpan={1}
					/> */}
					{numbers.map((e) =>
						e % 2 === 0 ? (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng"
								header={report_data[0]["name" + String(e)][0]}
								colSpan={1}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						) : (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng1"
								header={report_data[0]["name" + String(e)][0]}
								colSpan={1}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						)
					)}
				</Row>
				<Row>
					<Column
					style={{ fontSize: "small" }}
						frozen
						alignHeader="center"
						headerClassName="p-blank"
						header="Date"
						colSpan={1}
					/>
					{/* <Column
					style={{ fontSize: "small" }}
						alignHeader="center"
						headerClassName="p-eng"
						header={report_data[0]["name_hindi"]}
						colSpan={1}
					/> */}
					{numbers.map((e) =>
						e % 2 === 0 ? (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={1}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						) : (
							<Column
							style={{ fontSize: "small" }}
								alignHeader="center"
								headerClassName="p-eng1"
								header={report_data[0]["name_hindi" + String(e)]}
								colSpan={1}
								headerTooltip={report_data[0]["name" + String(e)][1]}
							/>
						)
					)}
				</Row>
			</ColumnGroup>
		);
	}

	const v = (e) => {
		// console.log(e);
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
					frozen
					footerClassName="p-footer"
					align="center"
					footer="TOTAL"
					colSpan={1}
					footerStyle={{ textAlign: "center" }}
				/>
				{/* <Column
					footerClassName="p-footer"
					align="center"
					colSpan={1}
					footer={v("pos_data")}
				/>
				<Column
					footerClassName="p-footer"
					align="center"
					colSpan={1}
					footer={v("neg_data")}
				/> */}
				{numbers2.map((e) =>
					e % 2 !== 0 ? (
						<Column
							footerClassName="p-footer"
							align="center"
							colSpan={1}
							footer={v("pos_data" + String(Math.ceil(e / 2)))}
						/>
					) : (
						<Column
							footerClassName="p-footer"
							align="center"
							colSpan={1}
							footer={v("neg_data" + String(e / 2))}
						/>
					)
				)}
			</Row>
		</ColumnGroup>
	);

	const v2 = (e) => {
		if (e === 0) {
			let sum = 0;
			for (let vals of report_data) {
				sum = sum + vals.sum;
			}

			return sum.toFixed(2);
		} else {
			let sum = 0;
			for (let vals of report_data) {
				sum = sum + vals["sum" + String(e)];
			}

			return sum.toFixed(2);
		}
	};

	const table_footerGroup2 = (
		<ColumnGroup>
			<Row>
				<Column
					frozen
					footerClassName="p-footer"
					align="center"
					footer="TOTAL"
					colSpan={1}
					footerStyle={{ textAlign: "center" }}
				/>
				{/* <Column
					footerClassName="p-footer"
					align="center"
					colSpan={1}
					footer={v2(0)}
				/> */}
				{numbers.map((e) => (
					<Column
						footerClassName="p-footer"
						align="center"
						colSpan={1}
						footer={v2(e)}
					/>
				))}
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
						backgroundColor: "#00b7e2",
						fontSize: "large",
						color: "#000000",
					}}
				>
					<Avatar
						icon="pi pi-spin pi-file-pdf"
						style={{ backgroundColor: "#00b7e2", color: "#000000" }}
						shape="square"
					/>
					Monthly TR Exchange
				</span>
			</Divider>
			<div className="grid">
				<div hidden={uploadenable} className="col">
					<label htmlFor="range">Upload AMR Data</label> <br />
					<FileUpload
						name="demo[]"
						onUpload={file_name}
						onError={upload_error}
						url="http://10.3.230.62:5003/file_upload"
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
						severity="danger"
						raised
						rounded
						label="Get Meter Data"
						icon="pi pi-bookmark"
						onClick={() => {
							if (selected_meter_number) {
								setloading_show(true);
								getmeterdata();
								// setshow_skeleton(true);
							} else {
								alert("Select meters");
							}
						}}
					/>
				</div>
				<div className="field">
					<Button
					style={{ backgroundColor: "#00b7e2", color: "#000000" }}
						size="small"
						icon="pi pi-download"
						
						raised
						rounded
						onClick={generate_report}
					>
						Generate Report
					</Button>
				</div>
				<div className="field"></div>
			</div>

			{/* <div className="card" hidden={!show_skeleton}>
					<DataTable	
						value={items}
						headerColumnGroup={header_val}
						footerColumnGroup={table_footerGroup}
						className="p-datatable-striped"
						stripedRows
						showGridlines
					>
						{numbers2.map((e) =>
						<Column
							field={e}
							
							style={{ width: "2%" }}
							body={<Skeleton />}
						></Column>
						)}
						
						
					</DataTable>
				</div> */}

			<div hidden={graphenable}>
				<Panel headerTemplate={headerTemplate} toggleable>
					<div className="card">
						<Chart type="line" data={chartData} options={chartOptions} />
					</div>
				</Panel>
			</div>

			<div hidden={!show_report_table} className="card">
				<br />
				<Divider align="center">
					<span
						className="p-tag"
						style={{ backgroundColor: "#e81123", fontSize: "large" }}
					>
						{name}
					</span>
					<div
						className="card flex justify-content-center"
						style={{ marginTop: "8px" }}
					>
						<InputSwitch
							tooltip="Click to change Report type"
							checked={sum_checked}
							onChange={(e) => setsum_checked(e.value)}
						/>
					</div>
				</Divider>
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

				<div hidden={sum_checked} className="table">
					<DataTable
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
							frozen
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

				<div hidden={!sum_checked} className="table1">
					<DataTable
						rows={10}
						scrollable
						scrollHeight="830px"
						ref={dt}
						paginator
						rowsPerPageOptions={[10, 15, 20, report_data.length]}
						paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
						currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Meters"
						value={report_data}
						showGridlines
						tableStyle={{ minWidth: "50rem" }}
						removableSort
						headerColumnGroup={header_val2}
						footerColumnGroup={table_footerGroup2}
					>
						<Column
							frozen
							headerClassName="p-monthhead"
							bodyStyle={{ textAlign: "center" }}
							alignHeader="center"
							field="Date"
							header="Date"
							sortable
							style={{ minWidth: "110px" }}
						></Column>
						{report_data_header2.map((e) => (
							<Column
								headerClassName="p-monthhead"
								bodyStyle={{ textAlign: "center" }}
								alignHeader="center"
								field={e}
								header={e}
								sortable
								style={{ minWidth: "220px" }}
							></Column>
						))}
					</DataTable>
				</div>
			</div>

			<div ref={report_table} hidden={true} id="table">
				<DataTable
					rows={report_data.length}
					scrollable
					scrollHeight="830px"
					ref={dt}
					// paginator
					// rowsPerPageOptions={[10, 15, 20, report_data.length]}
					// paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
					// currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Generators"
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
				<br />
				<br />
				<br />
				<DataTable
					rows={report_data.length}
					scrollable
					scrollHeight="830px"
					ref={dt}
					// paginator
					// rowsPerPageOptions={[10, 15, 20, report_data.length]}
					// paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
					// currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Generators"
					value={report_data}
					showGridlines
					tableStyle={{ minWidth: "50rem" }}
					removableSort
					headerColumnGroup={header_val2}
					footerColumnGroup={table_footerGroup2}
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
					{report_data_header2.map((e) => (
						<Column
							headerClassName="p-monthhead"
							bodyStyle={{ textAlign: "center" }}
							alignHeader="center"
							field={e}
							header={e}
							sortable
							style={{ minWidth: "220px" }}
						></Column>
					))}
				</DataTable>
			</div>
		</>
	);
}
export default MonthlyReports;
