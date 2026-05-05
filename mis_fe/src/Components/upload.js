import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import { BlockUI } from "primereact/blockui";
import { Divider } from "primereact/divider";
import { useTheme } from "../context/ThemeContext";

const uploadStyles = `
@keyframes upload-reveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes upload-pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.upload-hero {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
  box-shadow: 0 20px 40px -12px rgba(59, 130, 246, 0.4);
  animation: upload-reveal 0.6s cubic-bezier(.16,1,.3,1) both;
}

.upload-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15), transparent 30%);
}

.upload-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  backdrop-filter: blur(8px);
}

.upload-title {
  color: white;
  font-size: 2.25rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -1px;
  line-height: 1.1;
}

.upload-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 8px;
  max-width: 600px;
}

.upload-ctrl-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  animation: upload-reveal 0.8s cubic-bezier(.16,1,.3,1) 0.1s both;
}

.dark-mode .upload-ctrl-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
}

.upload-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 4px;
}

.dark-mode .upload-label {
  color: #94a3b8;
}

.upload-field-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dark-mode .upload-field-container {
  background: #0f172a;
  border-color: #334155;
}

.upload-field-container:focus-within {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.dark-mode .upload-field-container:focus-within {
  background: #1e293b;
}

.execute-btn {
  background: #2563eb !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 18px 48px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  transition: all 0.4s cubic-bezier(.16,1,.3,1) !important;
  animation: upload-pulse 2s infinite;
}

.execute-btn:hover {
  background: #1d4ed8 !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(37, 99, 235, 0.5) !important;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 30px;
  border: 1px dashed rgba(59, 130, 246, 0.3);
  margin-top: 24px;
}
`;

export default function Upload() {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const { isDarkMode } = useTheme();
	const [date_range, set_date_range] = useState(null);
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
		"Exchange",
	];

	const uploaddata = () => {
		if (Selected_lines_states && date_range && date_range[0] && date_range[1]) {
			setloading_show(true);
			const start_date = date_range[0];
			const end_date = date_range[1];

			for (var i = 0; i < Selected_lines_states.length; i++) {
				if (Selected_lines_states[i] === "Voltage") {
					axios
						.post(
							baseUrl +
								"/VoltageFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Voltage data inserted for " + response.data["dates"]);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Lines") {
					axios
						.post(
							baseUrl +
								"/LinesFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
							"Lines MW",
						)
						.then((response) => {})
						.catch((error) => {});

					axios
						.post(
							baseUrl +
								"/MVARFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Lines data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "ICT") {
					axios
						.post(
							baseUrl +
								"/ICTFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
							{},
						)
						.then((response) => {
							alert("ICT data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Demand") {
					axios
						.post(
							baseUrl +
								"/DemandFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Demand data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Generator") {
					axios
						.post(
							baseUrl +
								"/GeneratorFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Generator data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Thermal Generator") {
					axios
						.post(
							baseUrl +
								"/ThGeneratorFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Thermal Generator data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "ISGS") {
					axios
						.post(
							baseUrl +
								"/ISGSFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Frequency data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Frequency") {
					axios
						.post(
							baseUrl +
								"/FrequencyFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Frequency data inserted for " + response.data);
						})
						.catch((error) => {});
				} else if (Selected_lines_states[i] === "Exchange") {
					axios
						.post(
							baseUrl +
								"/ExchangeFileInsert?startDate=" +
								moment(start_date).format("YYYY-MM-DD") +
								"&endDate=" +
								moment(end_date).format("YYYY-MM-DD"),
						)
						.then((response) => {
							alert("Exchange data inserted for " + response.data);
						})
						.catch((error) => {});
				}
			}
			setBlocked(false);
			setloading_show(false);
		} else {
			alert("Please select both Date Range and Grid Data Streams.");
		}
	};

	return (
		<div
			className={`p-4 min-h-screen ${isDarkMode ? "dark-mode" : ""}`}
			style={{ background: isDarkMode ? "#0f172a" : "#f1f5f9" }}
		>
			<style>{uploadStyles}</style>

			<div hidden={!loading_show}>
				<div className="loader">
					<div className="spinner"></div>
				</div>
			</div>

			<BlockUI blocked={blocked} fullScreen />

			<div className="upload-hero">
				<div className="upload-hero-badge">
					<i className="pi pi-bolt text-xs"></i>
					<span>Grid Synchronization</span>
				</div>
				<h4 className="upload-title">DATA INGESTION ENGINE</h4>
				<p className="upload-subtitle text-lg">
					Synchronize real-time grid telemetry from tele-metering systems to
					core data storage.
				</p>
			</div>

			<div className="max-w-4xl mx-auto">
				<div className="upload-ctrl-card">
					<div className="grid">
						<div className="col-12 md:col-6 lg:col-5">
							<div className="upload-input-group">
								<label className="upload-label">
									Temporal Range (Origin & Target)
								</label>
								<div className="upload-field-container">
									<i className="pi pi-calendar text-blue-500 text-lg"></i>
									<Calendar
										className="w-full"
										placeholder="Select Date Range"
										dateFormat="dd-mm-yy"
										value={date_range}
										onChange={(e) => set_date_range(e.value)}
										selectionMode="range"
										readOnlyInput
										hideOnRangeSelection
										showIcon={false}
										inputClassName="bg-transparent border-none p-0 ml-1 text-sm font-bold w-full"
									/>
								</div>
							</div>
						</div>

						<div className="col-12 md:col-6 lg:col-7">
							<div className="upload-input-group">
								<label className="upload-label">Metric Stream Discovery</label>
								<div className="upload-field-container">
									<i className="pi pi-map text-blue-500 text-lg"></i>
									<MultiSelect
										className="w-full border-none"
										display="chip"
										placeholder="Choose Grid Data Streams"
										value={Selected_lines_states}
										options={values}
										onChange={(e) => setSelected_lines_states(e.value)}
										filter
										panelClassName="modern-multiselect-panel"
										inputClassName="bg-transparent"
										style={{ background: "transparent" }}
									/>
								</div>
							</div>
						</div>
					</div>

					<Divider className="my-6 opacity-30" />

					<div className="flex flex-column align-items-center">
						<Button
							icon="pi pi-cloud-upload"
							className="execute-btn"
							label="EXECUTE SYNCHRONIZATION"
							onClick={uploaddata}
							loading={loading_show}
						/>

						<div className="status-indicator">
							<i className="pi pi-info-circle text-blue-500"></i>
							<span className="text-sm font-bold tracking-tight opacity-80">
								{date_range && date_range[1]
									? `READY: Synchronizing ${Selected_lines_states?.length || 0} streams for target period.`
									: "AWAITING: Select ingestion parameters to begin synchronization."}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
