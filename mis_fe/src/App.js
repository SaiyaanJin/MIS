import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import UltimateSidebar from "./Components/UltimateSidebar";
import axios from "axios";
import { Button } from "primereact/button";
import { useTheme } from "./context/ThemeContext";

// Modern Preloaders
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./index.css";
import "./App.css";
import "./cssFiles/ModernUI.css";

// Lazy Load Components for better performance
const Frequency = lazy(() => import("./Components/frequency"));
const Voltage = lazy(() => import("./Components/voltage"));
const Upload = lazy(() => import("./Components/upload"));
const Demand = lazy(() => import("./Components/demand"));
const Combined = lazy(() => import("./Components/combined"));
const Ict = lazy(() => import("./Components/ict"));
const Lines = lazy(() => import("./Components/lines"));
const Generator = lazy(() => import("./Components/generator"));
const WeeklyReports = lazy(() => import("./Components/weeklyreports"));
const MonthlyReports = lazy(() => import("./Components/monthlyreport"));
const MonthlyReports2 = lazy(() => import("./Components/monthlyreport2"));
const ISGS = lazy(() => import("./Components/isgs"));
const Exchange = lazy(() => import("./Components/Exchange"));
const Dc = lazy(() => import("./Components/dc"));
const Outage = lazy(() => import("./Components/outage"));
const ThermalGenerator = lazy(() => import("./Components/thermalGenerator"));

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;

const Layout = ({ children }) => {
	const { isDarkMode, toggleTheme } = useTheme();

	return (
		<div className="ultimate-layout">
			<UltimateSidebar />
			<main className="app-layout-main">
				<Button
					icon={isDarkMode ? "pi pi-sun" : "pi pi-moon"}
					onClick={toggleTheme}
					className="theme-toggle-floating"
					tooltip={`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
					tooltipOptions={{ position: "left" }}
				/>
				<div
					className="content-area py-4 pr-4 pl-0"
					style={{ width: "100%", maxWidth: "96vw", overflowX: "hidden" }}
				>
					<Suspense
						fallback={
							<div className="loading-placeholder">
								Initializing High-Fidelity Experience...
							</div>
						}
					>
						{children}
					</Suspense>
				</div>
			</main>
		</div>
	);
};

function App() {
	return (
		<ThemeProvider>
			<Router>
				<Layout>
					<Routes>
						<Route exact path="/" element={<Combined />} />
						<Route exact path="Frequency" element={<Frequency />} />
						<Route exact path="Voltage" element={<Voltage />} />
						<Route exact path="Demand" element={<Demand />} />
						<Route exact path="Ict" element={<Ict />} />
						<Route exact path="Lines" element={<Lines />} />
						<Route exact path="Generator" element={<Generator />} />
						<Route
							exact
							path="ThermalGenerator"
							element={<ThermalGenerator />}
						/>
						<Route exact path="ISGS" element={<ISGS />} />
						<Route exact path="Exchange" element={<Exchange />} />
						<Route exact path="WeeklyReports" element={<WeeklyReports />} />
						<Route exact path="MonthlyReports" element={<MonthlyReports />} />
						<Route exact path="MonthlyReports2" element={<MonthlyReports2 />} />
						<Route exact path="Upload" element={<Upload />} />
						<Route exact path="Dc" element={<Dc />} />
						<Route exact path="Outage" element={<Outage />} />
					</Routes>
				</Layout>
			</Router>
		</ThemeProvider>
	);
}

export default App;
