import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./cssFiles/Animation.css";
// import Spinners from "react-bootstrap/Spinner";
import "./App.css";
import { Avatar } from "primereact/avatar";
import "primeicons/primeicons.css";
import Frequency from "./Components/frequency";
import Voltage from "./Components/voltage";
import Upload from "./Components/upload";
import WeeklyReports from "./Components/weeklyreports";
import MonthlyReports from "./Components/monthlyreport";
import MonthlyReports2 from "./Components/monthlyreport2";
// import Mvar from "./Components/mvar";
import Lines from "./Components/lines";
import Ict from "./Components/ict";
// import Dlr from "./Components/dlr";
import Demand from "./Components/demand";
import Combined from "./Components/combined";
import Generator from "./Components/generator";
import ISGS from "./Components/isgs";
import Dc from "./Components/dc";
import "../node_modules/primeflex/primeflex.css";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NavbarDropdown from "react-navbar-dropdown";
// import Demand_Projection from "./Components/demand_projection";

import "./App.css";

function App() {
	return (
		<div className="App">
			<div
				className="shadow p-3 mb-5 bg-white rounded"
				style={{ marginTop: "-1.1%" }}
			>
				<img
					src="posoco-logo.jpg"
					alt="posoco"
					style={{
						width: "100%",
						boxShadow: "initial",
						position: "-webkit-sticky" /* Safari */,
						position: "sticky",
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
								icon="pi pi-bolt"
								style={{ backgroundColor: "#FF1493", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Frequency</b>
						</Link>

						<Link to="Voltage">
							<Avatar
								icon="pi pi-sliders-v"
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
								icon="pi pi-hourglass"
								style={{ backgroundColor: "#6a5acd", color: "#ffffff" }}
								shape="circle"
							/>
							<b>ICT</b>
						</Link>

						<Link to="Lines">
							<Avatar
								icon="pi pi-list"
								style={{ backgroundColor: "#c83042", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Lines</b>
						</Link>

						<Link to="Generator">
							<Avatar
								icon="pi pi-building"
								style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Generator</b>
						</Link>

						<Link to="ISGS">
							<Avatar
								icon="pi pi-globe"
								style={{ backgroundColor: "#0000ff", color: "#ffffff" }}
								shape="circle"
							/>
							<b>ISGS</b>
						</Link>

						{/* <Link to="WeeklyReports">
							<Avatar
								icon="pi pi-file-pdf"
								style={{ backgroundColor: "#ff0000", color: "#ffffff" }}
								shape="circle"
							/>
							<b>Reports</b>
						</Link> */}

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
										<b>Monthly-1</b>
									</Link>
									<Link to="MonthlyReports2">
										<Avatar
											icon="pi pi-calendar-plus"
											style={{ backgroundColor: "#FF8FAB", color: "#ffffff" }}
											shape="circle"
										/>
										<b>Monthly-2</b>
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

						<Link to="Dc">
							{/* <Avatar
								// icon="pi pi-upload"
								style={{ backgroundColor: "#ff6347", color: "#ffffff" }}
								shape="circle"
							/> */}
							<b>DC</b>
						</Link>

						{/* <Link to="Demand_Projection">
              <b>Demand Projection</b>
            </Link> */}
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
					<Route exact path="ISGS" element={<ISGS />} />
					<Route exact path="WeeklyReports" element={<WeeklyReports />} />
					<Route exact path="MonthlyReports" element={<MonthlyReports />} />
					<Route exact path="MonthlyReports2" element={<MonthlyReports2 />} />
					<Route exact path="Upload" element={<Upload />} />
					<Route exact path="Dc" element={<Dc />} />
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
