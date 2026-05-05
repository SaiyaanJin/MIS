import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Row } from "react-grid-system";
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
import { Tag } from "primereact/tag";
import "../cssFiles/Animation.css";
import "../cssFiles/PasswordDemo.css";
import "../cssFiles/ButtonDemo.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import zoomPlugin from "chartjs-plugin-zoom";
import { Chart as ChartJS, registerables } from "chart.js";
import { ColumnGroup } from "primereact/columngroup";
import { DownloadTableExcel } from "react-export-table-to-excel";

// ─── Styles injected once ─────────────────────────────────────────────────────
const modernStyles = `
@keyframes gen-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gen-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.45); }
  70%  { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
  100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
}
@keyframes gen-spin-slow {
  to { transform: rotate(360deg); }
}

.gen-hero {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding: 16px 22px;
  margin-bottom: 20px;
  border: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, #d946ef 0%, #ec4899 45%, #f43f5e 100%);
  box-shadow: 0 12px 28px -8px rgba(217,70,239,0.4);
  animation: gen-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
}
.gen-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 1;
}
.gen-hero::after {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  pointer-events: none;
}
.gen-hero-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  animation: gen-pulse-ring 2.4s ease-in-out infinite;
  flex-shrink: 0;
}
.gen-hero-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 10px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 100px;
  font-size: 10px; font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.gen-stat-card {
  border-radius: 14px;
  padding: 20px 22px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  transition: all 0.25s ease;
  animation: gen-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.gen-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.gen-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-bright);
}
.gen-stat-card.blue::before  { background: linear-gradient(90deg, #3b82f6, #2563eb); }
.gen-stat-card.green::before { background: linear-gradient(90deg, #10b981, #059669); }
.gen-stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
.gen-stat-card.violet::before{ background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.gen-stat-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.gen-stat-icon.blue  { background: rgba(59,130,246,0.12); color: #3b82f6; }
.gen-stat-icon.green { background: rgba(16,185,129,0.12); color: #10b981; }
.gen-stat-icon.amber { background: rgba(245,158,11,0.12); color: #f59e0b; }
.gen-stat-icon.violet{ background: rgba(139,92,246,0.12); color: #8b5cf6; }

.gen-section {
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  overflow: visible;
  margin-bottom: 24px;
  animation: gen-fade-up 0.55s cubic-bezier(.16,1,.3,1) both;
  box-sizing: border-box;
}
.gen-section-header {
  padding: 18px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
}
.gen-section-title {
  display: flex; align-items: center; gap: 12px;
}
.gen-section-pill {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.gen-section-pill.blue  { background: rgba(59,130,246,0.12); color: #3b82f6; }
.gen-section-pill.violet{ background: rgba(139,92,246,0.12); color: #8b5cf6; }
.gen-section-body { padding: 24px; box-sizing: border-box; }

.gen-field-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
  display: flex; align-items: center; gap: 6px;
}
.gen-divider-row {
  height: 1px;
  background: var(--border-subtle);
  margin: 20px 0;
}

.gen-action-row {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  margin-top: 20px;
}
.gen-btn-primary {
  background: linear-gradient(135deg, #d946ef, #c41087) !important;
  border: none !important;
  padding: 10px 22px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  border-radius: 10px !important;
  height: 42px !important;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(217,70,239,0.35) !important;
  transition: all 0.2s !important;
}
.gen-btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(217,70,239,0.45) !important;
}
.gen-btn-secondary {
  background: var(--bg-main) !important;
  border: 1px solid var(--border-bright) !important;
  color: var(--text-secondary) !important;
  padding: 10px 20px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  border-radius: 10px !important;
  height: 42px !important;
  white-space: nowrap;
  transition: all 0.2s !important;
}
.gen-btn-secondary:hover {
  background: var(--bg-card) !important;
  border-color: var(--primary) !important;
  color: var(--primary) !important;
  transform: translateY(-1px) !important;
}
.gen-chart-wrapper {
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  animation: gen-fade-up 0.6s cubic-bezier(.16,1,.3,1) both;
}
.gen-chart-header {
  padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-main);
}

.gen-table-wrapper {
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  overflow: visible;
  animation: gen-fade-up 0.6s cubic-bezier(.16,1,.3,1) both;
  margin-bottom: 24px;
  width: 100%;
  box-sizing: border-box;
}
.gen-table-header {
  padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-main);
}
.gen-table-body {
  padding: 0;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 600px;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  border-radius: 0 0 16px 16px;
}
.gen-table-body .p-datatable {
  width: 100% !important;
  min-width: max-content;
}
.gen-table-body .p-datatable-wrapper {
  overflow-x: auto !important;
  overflow-y: visible !important;
}

.gen-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.gen-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-bright);
  border-radius: 10px;
  background: var(--bg-main);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.gen-input-group:focus-within {
  border-color: #d946ef;
  box-shadow: 0 0 0 3px rgba(217,70,239,0.15);
}
.gen-loading-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
}
.gen-loading-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 40px 48px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.gen-spinner {
  width: 48px; height: 48px;
  border: 3px solid var(--border-subtle);
  border-top-color: #d946ef;
  border-radius: 50%;
  animation: gen-spin-slow 0.8s linear infinite;
}
`;

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
					"/meter_names?startDate=" +
						moment(date_range[0]).format("YYYY-MM-DD") +
						"&endDate=" +
						moment(date_range[1]).format("YYYY-MM-DD") +
						"&time=" +
						time +
						"&folder=no",
					{},
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
									"&time=" +
									time +
									"&folder=yes",
								{},
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
						"/Report_Meter_Data2?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&time=" +
							time +
							"&folder=no",
						{},
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
						"/Report_Meter_Data2?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&time=" +
							time +
							"&folder=yes",
						{},
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
						"/GetMeterData?startDate=" +
							moment(start_date).format("YYYY-MM-DD") +
							"&endDate=" +
							moment(end_date).format("YYYY-MM-DD") +
							"&meter=" +
							selected_meter_number +
							"&time=" +
							time +
							"&folder=no",
						{},
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
								"--text-color-secondary",
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
						{},
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
								"--text-color-secondary",
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

	for (var z = 1; z <= 74; z++) {
		//all 4 meter array [lenght+ total+ net](66+4(2))
		numbers.push(z);
	}

	const numbers2 = [];

	for (var z1 = 1; z1 <= 144; z1++) {
		//all 4 meter array [lenght*2+ total*2+ net*1](66*2+4(3))
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
						),
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
						),
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
						),
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
					),
				)}
			</Row>
		</ColumnGroup>
	);

	return (
		<>
			<style>{modernStyles}</style>

			{/* Loading overlay */}
			{loading_show && (
				<div className="gen-loading-overlay">
					<div className="gen-loading-card">
						<div className="gen-spinner" />
						<div
							style={{
								fontWeight: 700,
								fontSize: 15,
								color: "var(--text-primary)",
							}}
						>
							Processing Data
						</div>
						<div style={{ fontSize: 12, color: "var(--text-muted)" }}>
							Generating your monthly report…
						</div>
					</div>
				</div>
			)}

			<Toast ref={toast} />

			<div style={{ paddingBottom: 40 }}>
				{/* ── HERO HEADER ─────────────────────────────────────────────────── */}
				<div className="gen-hero">
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 14,
							position: "relative",
							zIndex: 1,
						}}
					>
						<div className="gen-hero-icon">📋</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div className="gen-hero-badge">
								<span
									style={{
										width: 5,
										height: 5,
										borderRadius: "50%",
										background: "#ec4899",
										display: "inline-block",
									}}
								/>
								Monthly Exchange
							</div>
							<h1
								style={{
									color: "#fff",
									fontSize: 18,
									fontWeight: 800,
									margin: 0,
									letterSpacing: "-0.3px",
									lineHeight: 1.25,
								}}
							>
								IR Exchange Reports
							</h1>
							<p
								style={{
									color: "rgba(255,255,255,0.65)",
									margin: "3px 0 0",
									fontSize: 11.5,
									fontWeight: 400,
								}}
							>
								Analyze meter data and track energy exchange patterns
							</p>
						</div>
						<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
							{[
								{ val: meter_number?.length || 0, lbl: "Meters" },
								{
									val:
										date_range[0] && date_range[1]
											? moment(date_range[1]).diff(
													moment(date_range[0]),
													"days",
												) + 1
											: 0,
									lbl: "Days",
								},
								{ val: selected_meter_number?.length || 0, lbl: "Selected" },
							].map(({ val, lbl }) => (
								<div
									key={lbl}
									style={{
										textAlign: "center",
										padding: "6px 14px",
										background: "rgba(255,255,255,0.12)",
										borderRadius: 8,
										border: "1px solid rgba(255,255,255,0.2)",
									}}
								>
									<div
										style={{
											color: "#fff",
											fontSize: 18,
											fontWeight: 800,
											lineHeight: 1,
										}}
									>
										{val}
									</div>
									<div
										style={{
											color: "rgba(255,255,255,0.65)",
											fontSize: 9,
											fontWeight: 600,
											textTransform: "uppercase",
											marginTop: 2,
										}}
									>
										{lbl}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ── STAT CARDS ───────────────────────────────────────────────────── */}
				<div className="grid mb-4" style={{ animationDelay: "0.05s" }}>
					{[
						{
							color: "blue",
							icon: "pi-calendar-plus",
							label: "Date Range",
							value:
								date_range[0] && date_range[1]
									? moment(date_range[0]).format("DD MMM") +
										" → " +
										moment(date_range[1]).format("DD MMM YYYY")
									: "Not selected",
						},
						{
							color: "green",
							icon: "pi-database",
							label: "Data Source",
							value: folder_files ? "From Folder" : "Direct Upload",
						},
						{
							color: "amber",
							icon: "pi-history",
							label: "Interval",
							value: time + " min",
						},
						{
							color: "violet",
							icon: "pi-chart-bar",
							label: "Report Status",
							value: show_report_table ? "✓ Ready" : "Pending",
						},
					].map((s, idx) => (
						<div className="col-12 sm:col-6 xl:col-3" key={s.label}>
							<div
								className={`gen-stat-card ${s.color}`}
								style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
									<div className={`gen-stat-icon ${s.color}`}>
										<i className={`pi ${s.icon}`} />
									</div>
									<div>
										<div
											style={{
												fontSize: 10,
												fontWeight: 700,
												textTransform: "uppercase",
												letterSpacing: "0.6px",
												color: "var(--text-muted)",
												marginBottom: 3,
											}}
										>
											{s.label}
										</div>
										<div
											style={{
												fontSize: 14,
												fontWeight: 700,
												color: "var(--text-primary)",
											}}
										>
											{s.value}
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* ═══════════════════════════════════════════════════════════════
					SECTION 1 — Data Input & Configuration
				═══════════════════════════════════════════════════════════════ */}
				<div className="gen-section">
					<div className="gen-section-header">
						<div className="gen-section-title">
							<div className="gen-section-pill blue">
								<i className="pi pi-sliders-h" />
							</div>
							<div>
								<div
									style={{
										fontWeight: 700,
										fontSize: 15,
										color: "var(--text-primary)",
									}}
								>
									Data Input & Configuration
								</div>
								<div
									style={{
										fontSize: 11,
										color: "var(--text-muted)",
										marginTop: 1,
									}}
								>
									Configure date range, meters, and intervals
								</div>
							</div>
						</div>
						<Tag
							value="Setup"
							severity="info"
							rounded
							style={{ fontSize: 11 }}
						/>
					</div>

					<div className="gen-section-body">
						<div className="grid align-items-end gap-3">
							{/* Date Range */}
							<div className="col-12 md:col-4">
								<div className="gen-field-label">
									<i className="pi pi-calendar-plus" />
									Date Range
								</div>
								<div className="modern-cal-wrapper">
									<Calendar
										style={{ width: "100%" }}
										showIcon
										placeholder="Select start → end date"
										dateFormat="dd/mm/yy"
										value={date_range}
										onChange={(e) => setdate_range(e.value || [])}
										selectionMode="range"
										readOnlyInput
										className="w-full"
									/>
								</div>
								{date_range[0] && date_range[1] && (
									<div
										style={{
											display: "flex",
											gap: 6,
											marginTop: 10,
											flexWrap: "wrap",
										}}
									>
										<span className="modern-date-badge">
											{moment(date_range[0]).format("DD MMM YYYY")}
										</span>
										<span
											style={{
												fontSize: 11,
												color: "var(--text-muted)",
												alignSelf: "center",
												fontWeight: 700,
											}}
										>
											→
										</span>
										<span className="modern-date-badge">
											{moment(date_range[1]).format("DD MMM YYYY")}
										</span>
									</div>
								)}
							</div>

							{/* Interval */}
							<div className="col-12 md:col-3">
								<div className="gen-field-label">
									<i className="pi pi-stopwatch" />
									Resolution Interval
								</div>
								<div className="gen-input-group">
									<InputNumber
										min={15}
										max={1440}
										step={15}
										value={time}
										onValueChange={(e) => settime(e.value)}
										showButtons
										buttonLayout="horizontal"
										decrementButtonClassName="p-button-outlined p-button-sm"
										incrementButtonClassName="p-button-outlined p-button-sm"
										incrementButtonIcon="pi pi-minus"
										decrementButtonIcon="pi pi-plus"
										inputStyle={{
											width: "50px",
											textAlign: "center",
											fontSize: 13,
										}}
										suffix=" min"
									/>
								</div>
							</div>

							{/* Meter Selector */}
							<div className="col-12 md:col-5">
								<div className="gen-field-label">
									<i className="pi pi-database" />
									Select Meter(s)
								</div>
								<MultiSelect
									filterPlaceholder="Search meters…"
									showSelectAll
									showClear
									resetFilterOnHide
									maxSelectedLabels={3}
									selectionLimit={5}
									display="chip"
									placeholder="Pick up to 5 meters…"
									value={selected_meter_number}
									options={meter_number}
									onChange={(e) => setselected_meter_number(e.value)}
									filter
									className="w-full modern-multiselect"
									panelClassName="modern-multiselect-panel"
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="gen-action-row">
							<Button
								icon="pi pi-chart-bar"
								label="Get Meter Data"
								className="gen-btn-primary"
								onClick={() => {
									if (selected_meter_number) {
										setloading_show(true);
										getmeterdata();
									} else {
										toast.current.show({
											severity: "warn",
											summary: "Selection Required",
											detail: "Please select at least one meter",
											life: 3000,
										});
									}
								}}
							/>
							<Button
								icon="pi pi-download"
								label="Generate Report"
								className="gen-btn-primary"
								style={{
									background:
										"linear-gradient(135deg, #d946ef, #c41087) !important",
									boxShadow: "0 4px 12px rgba(217,70,239,0.35) !important",
								}}
								onClick={() => {
									if (date_range[0] && date_range[1]) {
										setloading_show(true);
										generate_report();
									} else {
										toast.current.show({
											severity: "warn",
											summary: "Date Range Required",
											detail: "Please select a date range",
											life: 3000,
										});
									}
								}}
							/>
						</div>
					</div>
				</div>

				{/* File Upload Section */}
				<div hidden={uploadenable} className="gen-section">
					<div className="gen-section-header">
						<div className="gen-section-title">
							<div className="gen-section-pill violet">
								<i className="pi pi-cloud-upload" />
							</div>
							<div>
								<div
									style={{
										fontWeight: 700,
										fontSize: 15,
										color: "var(--text-primary)",
									}}
								>
									Upload AMR Data
								</div>
								<div
									style={{
										fontSize: 11,
										color: "var(--text-muted)",
										marginTop: 1,
									}}
								>
									Upload ZIP files containing meter readings
								</div>
							</div>
						</div>
						<Tag
							value="Optional"
							severity="warning"
							rounded
							style={{ fontSize: 11 }}
						/>
					</div>
					<div className="gen-section-body">
						<FileUpload
							name="demo[]"
							onUpload={file_name}
							onError={upload_error}
							url="http://10.3.230.62:5003/file_upload"
							accept="zip/*"
							maxFileSize={50000000}
							emptyTemplate={
								<p style={{ color: "var(--text-muted)", textAlign: "center" }}>
									<i
										className="pi pi-cloud-upload"
										style={{ fontSize: 32, marginBottom: 10, display: "block" }}
									/>
									Drag and drop ZIP files here or click to browse
								</p>
							}
						/>
					</div>
				</div>

				{/* Chart Section */}
				{!graphenable && (
					<div className="gen-chart-wrapper mb-4">
						<div className="gen-chart-header">
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								<i className="pi pi-chart-line" style={{ color: "#d946ef" }} />
								<span
									style={{
										fontWeight: 700,
										fontSize: 14,
										color: "var(--text-primary)",
									}}
								>
									Meter Data Graph
								</span>
								{selected_meter_number && (
									<Tag
										value={`${selected_meter_number.length} meter(s)`}
										severity="info"
										rounded
										style={{ fontSize: 10 }}
									/>
								)}
							</div>
							<div style={{ fontSize: 11, color: "var(--text-muted)" }}>
								Scroll to zoom · Drag to pan
							</div>
						</div>
						<div style={{ padding: "16px 20px" }}>
							<Panel headerTemplate={headerTemplate} toggleable>
								<div className="card">
									<Chart type="line" data={chartData} options={chartOptions} />
								</div>
							</Panel>
						</div>
					</div>
				)}

				{/* ═══════════════════════════════════════════════════════════════
					SECTION 2 — Monthly Report Table
				═══════════════════════════════════════════════════════════════ */}
				{show_report_table && (
					<div className="gen-section">
						<div className="gen-section-header">
							<div className="gen-section-title">
								<div className="gen-section-pill blue">
									<i className="pi pi-table" />
								</div>
								<div>
									<div
										style={{
											fontWeight: 700,
											fontSize: 15,
											color: "var(--text-primary)",
										}}
									>
										Monthly IR Exchange Report
									</div>
									<div
										style={{
											fontSize: 11,
											color: "var(--text-muted)",
											marginTop: 1,
										}}
									>
										Detailed monthly energy exchange data
									</div>
								</div>
							</div>
						</div>

						<div className="gen-section-body">
							{/* Action Buttons */}
							<div className="gen-action-row" style={{ marginBottom: 20 }}>
								<Button
									size="small"
									icon="pi pi-copy"
									severity="help"
									rounded
									raised
									label="Copy Table"
									onClick={() => copyTable()}
								/>
								<DownloadTableExcel
									filename={`MIS-Monthly Report_${moment(date_range[0]).format("DD-MM-YY")}_to_${moment(date_range[1]).format("DD-MM-YY")}`}
									sheet="Reports"
									currentTableRef={report_table.current}
								>
									<Button
										type="button"
										icon="pi pi-download"
										severity="success"
										rounded
										raised
										label="Export to Excel"
										tooltip="Download report as Excel file"
									/>
								</DownloadTableExcel>
							</div>

							{/* Table Section */}
							<div className="gen-table-wrapper">
								<div className="gen-table-body">
									<div className="table">
										<DataTable
											rows={9}
											scrollable
											scrollHeight="600px"
											ref={dt}
											paginator
											rowsPerPageOptions={[9, 15, 20, report_data.length]}
											paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
											currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
											value={report_data}
											showGridlines
											style={{ minWidth: "auto", width: "auto" }}
											removableSort
											headerColumnGroup={header_val}
											footerColumnGroup={table_footerGroup}
										>
											<Column
												frozen
												headerClassName="p-monthhead"
												bodyStyle={{
													textAlign: "center",
													backgroundColor: "#ffffff",
													color: "#000000",
												}}
												alignHeader="center"
												field="Date"
												header="Date"
												sortable
												style={{ minWidth: "110px" }}
											></Column>
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
														key={e}
														className="p-total"
														headerClassName="p-monthhead"
														bodyStyle={{
															textAlign: "center",
															backgroundColor: "#ffffff",
															color: "#000000",
														}}
														alignHeader="center"
														field={e}
														header={e}
														sortable
														style={{ minWidth: "110px" }}
													></Column>
												) : (
													<Column
														key={e}
														headerClassName="p-monthhead"
														bodyStyle={{
															textAlign: "center",
															backgroundColor: "#ffffff",
															color: "#000000",
														}}
														alignHeader="center"
														field={e}
														header={e}
														sortable
														style={{ minWidth: "110px" }}
													></Column>
												),
											)}
										</DataTable>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Hidden Table for Export */}
				<div ref={report_table} hidden={true} id="table">
					<DataTable
						rows={report_data.length}
						scrollable
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
								key={e}
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
			</div>
		</>
	);
}
export default MonthlyReports2;
