import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./cssFiles/Animation.css";
import "./App.css";
import { Avatar } from "primereact/avatar";
import "primeicons/primeicons.css";
import Frequency from "./Components/frequency";
import Voltage from "./Components/voltage";
import Upload from "./Components/upload";
import WeeklyReports from "./Components/weeklyreports";
import MonthlyReports from "./Components/monthlyreport";
import MonthlyReports2 from "./Components/monthlyreport2";
import Lines from "./Components/lines";
import Ict from "./Components/ict";
import Demand from "./Components/demand";
import Combined from "./Components/combined";
import Generator from "./Components/generator";
import ISGS from "./Components/isgs";
import Exchange from "./Components/Exchange";
import Dc from "./Components/dc";
import Outage from "./Components/outage";
import ThermalGenerator from "./Components/thermalGenerator";
import "../node_modules/primeflex/primeflex.css";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

function App() {
	return (
		<div className="App">
			<div
				className="shadow-class"
				style={{ marginTop: ".2%", marginBottom: "2%" }}
			>
				<img
					src="posoco-logo.jpg"
					alt="posoco"
					style={{
						width: "100%",
						boxShadow: "initial",
						position: "-webkit-sticky" /* Safari */,

						top: "0",
					}}
				/>
			</div>
			<Router>
				<div
					className="list"
					style={{ marginTop: "1%", marginBottom: "-1%", fontSize: "2px" }}
				>
					<ul>
						<Link to="/">
							<Avatar
								text
								icon="pi pi-sitemap"
								style={{ backgroundColor: "#FAF9F6", color: "#000000" }}
								shape="circle"
							/>
							<b>Combined</b>
						</Link>

						<Link to="Frequency">
							<Avatar
								icon="pi pi-wave-pulse"
								style={{ backgroundColor: "#FF1493", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Frequency</b>
						</Link>

						<Link to="Voltage">
							<Avatar
								icon="pi pi-gauge"
								style={{ backgroundColor: "#000000", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Voltage</b>
						</Link>

						<Link to="Demand">
							<Avatar
								icon="pi pi-chart-line"
								style={{ backgroundColor: "#ffa500", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Demand</b>
						</Link>

						<Link to="Ict">
							<Avatar
								icon="pi pi-microchip"
								style={{ backgroundColor: "#6a5acd", color: "#ffffff" }}
								shape="circle"
							/>
							<b>ICT</b>
						</Link>

						<Link to="Lines">
							<Avatar
								icon="pi pi-arrow-right-arrow-left"
								style={{ backgroundColor: "#c83042", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Lines</b>
						</Link>

						<Link to="Generator">
							<Avatar
								icon="pi pi-bolt"
								style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
								shape="circle"
							/>
							<div className="dropdown">
								<div icon="pi pi-chevron-down">
									{" "}
									<b>Generator</b>
								</div>

								<div className="dropdown-content" style={{ minWidth: "280%" }}>
									<Link to="ThermalGenerator">
										<Avatar
											icon="pi pi-bolt"
											style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
											shape="circle"
										/>
										<b>Plant-wise Generation</b>
									</Link>
								</div>
							</div>
						</Link>

						<Link to="ISGS">
							<Avatar
								icon="pi pi-globe"
								style={{ backgroundColor: "#0000ff", color: "#ffffff" }}
								shape="circle"
							/>
							<b>ISGS</b>
						</Link>

						<Link to="Exchange">
							<Avatar
								icon="pi pi-sync"
								style={{ backgroundColor: "#00d9ffff", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Exchange</b>
						</Link>

						<Link to="WeeklyReports">
							<Avatar
								icon="pi pi-file-pdf"
								style={{ backgroundColor: "#ff0000", color: "#ffffff" }}
								shape="circle"
							/>
							<div className="dropdown">
								<div icon="pi pi-chevron-down">
									{" "}
									<b>Reports</b>
								</div>

								<div className="dropdown-content">
									<Link to="WeeklyReports">
										<Avatar
											icon="pi pi-file-excel"
											style={{ backgroundColor: "#4bf0a5", color: "#000000" }}
											shape="circle"
										/>
										<b>Weekly</b>
									</Link>
									<Link to="MonthlyReports">
										<Avatar
											icon="pi pi-calendar-plus"
											style={{ backgroundColor: "#00b7e2", color: "#ffffff" }}
											shape="circle"
										/>
										<b>Monthly TR Exchange</b>
									</Link>
									<Link to="MonthlyReports2">
										<Avatar
											icon="pi pi-calendar-plus"
											style={{ backgroundColor: "#FF8FAB", color: "#ffffff" }}
											shape="circle"
										/>
										<b>Monthly IR Exchange</b>
									</Link>
								</div>
							</div>
						</Link>

						<Link to="DC">
							<div className="dropdown">
								<div icon="pi pi-chevron-down">
									{" "}
									<b>Other</b>
								</div>

								<div className="dropdown-content" style={{ width: "auto" }}>
									<Link to="DC">
										<Avatar
											icon="pi pi-file-excel"
											style={{ backgroundColor: "#4bf0a5", color: "#000000" }}
											shape="circle"
										/>
										<b>DC</b>
									</Link>
									<Link to="Outage">
										<Avatar
											icon="pi pi-calendar-plus"
											style={{ backgroundColor: "#00b7e2", color: "#ffffff" }}
											shape="circle"
										/>
										<b>Outage</b>
									</Link>
								</div>
							</div>
						</Link>

						<Link to="Upload">
							<Avatar
								icon="pi pi-upload"
								style={{ backgroundColor: "#ff6347", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Upload Files</b>
						</Link>
					</ul>
				</div>
				<Routes>
					<Route exact path="/" element={<Combined />} />
					<Route exact path="Frequency" element={<Frequency />} />
					<Route exact path="Voltage" element={<Voltage />} />
					<Route exact path="Demand" element={<Demand />} />
					<Route exact path="Ict" element={<Ict />} />
					<Route exact path="Lines" element={<Lines />} />
					<Route exact path="Generator" element={<Generator />} />
					<Route exact path="ThermalGenerator" element={<ThermalGenerator />} />
					<Route exact path="ISGS" element={<ISGS />} />
					<Route exact path="Exchange" element={<Exchange />} />
					<Route exact path="WeeklyReports" element={<WeeklyReports />} />
					<Route exact path="MonthlyReports" element={<MonthlyReports />} />
					<Route exact path="MonthlyReports2" element={<MonthlyReports2 />} />
					<Route exact path="Upload" element={<Upload />} />
					<Route exact path="Dc" element={<Dc />} />
					<Route exact path="Outage" element={<Outage />} />
					{/* <Route
            exact
            path="Demand_Projection"
            element={<Demand_Projection />}
          /> */}
				</Routes>
			</Router>
		</div>
	);
}

export default App;
