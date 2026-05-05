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
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import jwt_decode from "jwt-decode";
import { useTheme } from "../context/ThemeContext";

// ─── Styles injected once ─────────────────────────────────────────────────────
const combinedStyles = `
@keyframes comb-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes comb-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.45); }
  70%  { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
  100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
}
@keyframes comb-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes comb-spin-slow {
  to { transform: rotate(360deg); }
}

.comb-hero {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding: 16px 22px;
  margin-bottom: 20px;
  border: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #4f46e5 100%);
  box-shadow: 0 12px 28px -8px rgba(37,99,235,0.4);
  animation: comb-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
}
.comb-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 1;
}
.comb-hero::after {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  pointer-events: none;
}
.comb-hero-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  animation: comb-pulse-ring 2.4s ease-in-out infinite;
  flex-shrink: 0;
}
.comb-hero-badge {
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
.comb-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-bright);
  border-radius: 10px;
  background: var(--bg-main);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.comb-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.comb-interval-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-bright);
  border-radius: 10px;
  background: var(--bg-main);
  transition: border-color 0.2s;
}
.comb-stat-card {
  border-radius: 14px;
  padding: 20px 22px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  transition: all 0.25s ease;
  animation: comb-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.comb-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.comb-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-bright);
}
.comb-stat-card.blue::before  { background: linear-gradient(90deg, #3b82f6, #2563eb); }
.comb-stat-card.green::before { background: linear-gradient(90deg, #10b981, #059669); }
.comb-stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
.comb-stat-card.violet::before{ background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.comb-stat-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.comb-stat-icon.blue  { background: rgba(59,130,246,0.12); color: #3b82f6; }
.comb-stat-icon.green { background: rgba(16,185,129,0.12); color: #10b981; }
.comb-stat-icon.amber { background: rgba(245,158,11,0.12); color: #f59e0b; }
.comb-stat-icon.violet{ background: rgba(139,92,246,0.12); color: #8b5cf6; }

.comb-section {
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  margin-bottom: 24px;
  animation: comb-fade-up 0.55s cubic-bezier(.16,1,.3,1) both;
}
.comb-section-header {
  padding: 18px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
}
.comb-section-title {
  display: flex; align-items: center; gap: 12px;
}
.comb-section-pill {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.comb-section-pill.blue  { background: rgba(59,130,246,0.12); color: #3b82f6; }
.comb-section-pill.violet{ background: rgba(139,92,246,0.12); color: #8b5cf6; }
.comb-section-body { padding: 24px; }

.comb-field-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
  display: flex; align-items: center; gap: 6px;
}
.comb-overlay-group {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  padding: 16px 20px;
  background: var(--bg-main);
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
}
.comb-checkbox-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.15s;
}
.comb-checkbox-item:hover { color: var(--text-primary); }

.comb-btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  border: none !important;
  padding: 10px 22px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  border-radius: 10px !important;
  height: 42px !important;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important;
  transition: all 0.2s !important;
}
.comb-btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(37,99,235,0.45) !important;
}

.comb-chart-wrapper {
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  animation: comb-fade-up 0.6s cubic-bezier(.16,1,.3,1) both;
}
.comb-chart-header {
  padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-main);
}
.comb-loading-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
}
.comb-loading-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 40px 48px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.comb-spinner {
  width: 48px; height: 48px;
  border: 3px solid var(--border-subtle);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: comb-spin-slow 0.8s linear infinite;
}
`;
export default function Combined() {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const { isDarkMode } = useTheme();
	const search = useLocation().search;
	const id = new URLSearchParams(search).get("token");
	const [page_hide, setpage_hide] = useState(true);
	const [blocked, setBlocked] = useState(false);
	const [loading_show, setloading_show] = useState(false);
	const [date_range, setDate_range] = useState([
		new Date(moment().set("hour",0).set("minute",0).set("second",0).subtract(2,"day")._d),
		new Date(moment().set("hour",23).set("minute",59).set("second",0).subtract(2,"day")._d),
	]);
	const start_date = date_range?.[0];
	const end_date   = date_range?.[1];

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
						baseUrl + "/FrequencyNames?startDate=" +
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
						baseUrl + "/VoltageNames?startDate=" +
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
						baseUrl + "/DemandMinNames?startDate=" +
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
						baseUrl + "/IctNames?startDate=" +
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
						baseUrl + "/LinesMWMVARNames?startDate=" +
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

	const getcombineddata = async () => {
		if (start_date && end_date) {
			setload(true);
			setgraphenable(false);

			const promises = [];

			if (checkedF && Selected_f_states && Selected_f_states.length > 0) {
				const p = axios
					.post(
						baseUrl + "/GetFrequencyData?startDate=" +
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
						} else {
							setfrequency_data(response.data);
						}
					})
					.catch(() => {});
				promises.push(p);
			}

			if (checkedV && Selected_v_states && Selected_v_states.length > 0) {
				const p = axios
					.post(
						baseUrl + "/GetVoltageData?startDate=" +
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
						} else {
							setvoltage_data(response.data);
						}
					})
					.catch(() => {});
				promises.push(p);
			}

			if (checkedD && Selected_d_states && Selected_d_states.length > 0) {
				const p = axios
					.post(
						baseUrl + "/GetDemandMinData?startDate=" +
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
						} else {
							setdemand_data(response.data);
						}
					})
					.catch(() => {});
				promises.push(p);
			}

			if (checkedI && Selected_i_states && Selected_i_states.length > 0) {
				const p = axios
					.post(
						baseUrl + "/GetICTData?startDate=" +
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
						} else {
							setict_data(response.data);
						}
					})
					.catch(() => {});
				promises.push(p);
			}

			if (checkedL && Selected_l_states && Selected_l_states.length > 0) {
				const p = axios
					.post(
						baseUrl + "/LinesMWMVARData?startDate=" +
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
						} else {
							setlines_data(response.data);
						}
					})
					.catch(() => {});
				promises.push(p);
			}

			await Promise.allSettled(promises);
			setload(false);
			setloading_show(false);
		}
	};

	const graph_list = {
		Frequency: frequency_data,
		Voltage: voltage_data,
		Demand: demand_data,
		ICT: ict_data,
		Lines: lines_data,
	};

	const dateRangeDays = start_date && end_date ? moment(end_date).diff(moment(start_date), "days") + 1 : 0;
	const selectedCount = (Selected_f_states?.length || 0) + (Selected_v_states?.length || 0) + (Selected_d_states?.length || 0) + (Selected_i_states?.length || 0) + (Selected_l_states?.length || 0);
	const anyDataLoaded = frequency_data || voltage_data || demand_data || ict_data || lines_data;

	return (
		<>
			{/* Inject page-scoped styles */}
			<style>{combinedStyles}</style>

			<BlockUI blocked={blocked} fullScreen />

			{/* Loading overlay */}
			{loading_show && (
				<div className="comb-loading-overlay">
					<div className="comb-loading-card">
						<div className="comb-spinner" />
						<div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Fetching Combined Analytics Data</div>
						<div style={{ fontSize: 12, color: "var(--text-muted)" }}>Crunching numbers from the grid…</div>
					</div>
				</div>
			)}

			<div style={{ paddingBottom: 40 }}>
				<div>

				{/* ── HERO HEADER ─────────────────────────────────── */}
				<div className="comb-hero">
					<div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
						<div className="comb-hero-icon">🕸️</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div className="comb-hero-badge">
								<span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
								Extensive Analytics
							</div>
							<h1 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
								Combined Grid Analytics
							</h1>
							<p style={{ color: "rgba(255,255,255,0.65)", margin: "3px 0 0", fontSize: 11.5, fontWeight: 400 }}>
								Multi-parameter monitoring & comparison
							</p>
						</div>
						<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
							{[
								{ val: dateRangeDays, lbl: "Days" },
								{ val: selectedCount, lbl: "Selected Elements" },
							].map(({ val, lbl }) => (
								<div key={lbl} style={{ textAlign: "center", padding: "6px 14px", background: "rgba(255,255,255,0.12)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }}>
									<div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{val}</div>
									<div style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{lbl}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ── STAT CARDS ───────────────────────────────────────────────── */}
				<div className="grid mb-4" style={{ animationDelay: "0.05s" }}>
					{[
						{ color: "blue",  icon: "pi-calendar-plus", label: "Date Range", value: start_date ? moment(start_date).format("DD MMM HH:mm") + " → " + moment(end_date).format("DD MMM YYYY") : "Not set" },
						{ color: "green", icon: "pi-sitemap",          label: "Elements Selected", value: selectedCount ? `${selectedCount} item${selectedCount > 1 ? "s" : ""}` : "None selected" },
						{ color: "amber", icon: "pi-clock",          label: "Resolution", value: `${minutes} min interval` },
						{ color: "violet", icon: "pi-chart-scatter",    label: "Data Status", value: anyDataLoaded ? "✓ Ready to view" : "Pending generation" },
					].map((s, idx) => (
						<div className="col-12 sm:col-6 xl:col-3" key={s.label}>
							<div className={`comb-stat-card ${s.color}`} style={{ animationDelay: `${0.08 + idx * 0.06}s` }}>
								<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
									<div className={`comb-stat-icon ${s.color}`}>
										<i className={`pi ${s.icon}`} />
									</div>
									<div>
										<div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-muted)", marginBottom: 3 }}>{s.label}</div>
										<div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* ═══════════════════════════════════════════════════════════════
					SECTION 1 — Time Range & Overlays
				═══════════════════════════════════════════════════════════════ */}
				<div className="comb-section">
					<div className="comb-section-header">
						<div className="comb-section-title">
							<div className="comb-section-pill blue"><i className="pi pi-calendar" /></div>
							<div>
								<div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Time Range & Preferences</div>
								<div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Select dates, resolution duration overlays</div>
							</div>
						</div>
						<Tag value="Global Settings" severity="info" rounded style={{ fontSize: 11 }} />
					</div>

					<div className="comb-section-body">
						<div className="grid align-items-end justify-content-between">

							{/* Date Range — single selectionMode="range" picker (LEFT ALIGNED) */}
							<div className="col-12 md:col-4 flex flex-column align-items-start">
								<div className="comb-field-label"><i className="pi pi-calendar-plus" />Date Range</div>
								<div className="modern-cal-wrapper" style={{ width: "100%" }}>
									<Calendar
										style={{ width: "100%" }}
										showIcon
										selectionMode="range"
										showTime
										hourFormat="24"
										placeholder="Select start → end date"
										dateFormat="dd-mm-yy"
										value={date_range}
										onChange={(e) => {
											const val = e.value || [];
											const newRange = [...val];
											if (newRange[0] && (!date_range || !date_range[0] || newRange[0].toDateString() !== date_range[0].toDateString())) {
												newRange[0] = new Date(newRange[0]);
												newRange[0].setHours(0, 0, 0, 0);
											}
											if (newRange[1] && (!date_range || !date_range[1] || newRange[1].toDateString() !== date_range[1].toDateString())) {
												newRange[1] = new Date(newRange[1]);
												newRange[1].setHours(23, 59, 0, 0);
											}
											setDate_range(newRange);
										}}
										monthNavigator
										yearNavigator
										yearRange="2015:2030"
										showButtonBar
										numberOfMonths={2}
										className="w-full"
									/>
								</div>
								{start_date && end_date && (
									<div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", justifyContent: "flex-start" }}>
										<span className="modern-date-badge">
											{moment(start_date).format("DD MMM YYYY HH:mm")}
										</span>
										<span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center", fontWeight: 700 }}>→</span>
										<span className="modern-date-badge">
											{moment(end_date).format("DD MMM YYYY HH:mm")}
										</span>
									</div>
								)}
							</div>

							{/* Interval (CENTER ALIGNED) */}
							<div className="col-12 md:col-4 flex flex-column align-items-center">
								<div className="comb-field-label" style={{ textAlign: "center" }}><i className="pi pi-stopwatch" />Interval (Mins)</div>
								<div className="comb-interval-row" style={{ width: "100%", maxWidth: "160px" }}>
									<div style={{ margin: "0 auto", width:"100%" }}>
										<InputNumber min={1} max={1440} value={minutes}
											onValueChange={(e) => setminutes(e.value)}
											showButtons buttonLayout="horizontal"
											decrementButtonClassName="p-button-outlined p-button-sm p-button-danger"
											incrementButtonClassName="p-button-outlined p-button-sm p-button-success"
											incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
											inputStyle={{ width: "100%", textAlign: "center", fontSize: 13, border: "none", background:"transparent" }} />
									</div>
								</div>
							</div>

							{/* Overlay Duration Group (RIGHT ALIGNED) */}
							<div className="col-12 md:col-4 flex flex-column align-items-end">
								<div className="comb-field-label" style={{ textAlign: "right", width: "100%" }}><i className="pi pi-sliders-h" />Show Duration of:</div>
								<div className="comb-overlay-group" style={{ justifyContent: "flex-end", width: "100%", textAlign: "right" }}>
									{["Frequency", "Voltage", "Demand"].map(v => (
										<label key={v} className="comb-checkbox-item" style={{ flexDirection: "row-reverse", gap: "8px" }}>
											{v}
											<Checkbox value={v} onChange={frequency_region_change} checked={duration_region.indexOf(v) !== -1} />
										</label>
									))}
								</div>
							</div>

						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════════════════════════════
					SECTION 2 — Parameter Selections
				═══════════════════════════════════════════════════════════════ */}
				<div className="comb-section">
					<div className="comb-section-header">
						<div className="comb-section-title">
							<div className="comb-section-pill violet"><i className="pi pi-list" /></div>
							<div>
								<div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Parameter Selections</div>
								<div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Toggle and select buses, regions, and elements</div>
							</div>
						</div>
					</div>

					<div className="comb-section-body">
						<div className="grid">
							<div className="col-12 md:col-6 lg:col">
								<div className="comb-field-label mb-2" style={{ display: "flex", justifyContent:"space-between" }}>
									<span>Show BUS Frequency</span>
									<InputSwitch checked={checkedF} onChange={(e) => setCheckedF(e.value)} />
								</div>
								<div className="comb-input-group" style={{ opacity: checkedF ? 1 : 0.6 }}>
									<MultiSelect filterPlaceholder="Search BUS here" showSelectAll showClear resetFilterOnHide
										maxSelectedLabels={7} disabled={!checkedF} selectionLimit={7} display="chip"
										placeholder="Select 220/400/765KV BUS" value={Selected_f_states} options={f_states}
										onChange={(e) => setSelected_f_states(e.value)} filter className="w-full modern-multiselect" panelClassName="modern-multiselect-panel" />
								</div>
							</div>

							<div className="col-12 md:col-6 lg:col">
								<div className="comb-field-label mb-2" style={{ display: "flex", justifyContent:"space-between" }}>
									<span>Show BUS Voltage</span>
									<InputSwitch checked={checkedV} onChange={(e) => setCheckedV(e.value)} />
								</div>
								<div className="comb-input-group" style={{ opacity: checkedV ? 1 : 0.6 }}>
									<MultiSelect filterPlaceholder="Search BUS here" showSelectAll showClear resetFilterOnHide
										maxSelectedLabels={7} disabled={!checkedV} selectionLimit={7} display="chip"
										placeholder="Select 220/400/765KV BUS" value={Selected_v_states} options={v_states}
										onChange={(e) => setSelected_v_states(e.value)} filter className="w-full modern-multiselect" panelClassName="modern-multiselect-panel" />
								</div>
							</div>

							<div className="col-12 md:col-6 lg:col">
								<div className="comb-field-label mb-2" style={{ display: "flex", justifyContent:"space-between" }}>
									<span>Show Demand</span>
									<InputSwitch checked={checkedD} onChange={(e) => setCheckedD(e.value)} />
								</div>
								<div className="comb-input-group" style={{ opacity: checkedD ? 1 : 0.6 }}>
									<MultiSelect filterPlaceholder="Search Regions here" showSelectAll showClear resetFilterOnHide
										maxSelectedLabels={7} disabled={!checkedD} selectionLimit={7} display="chip"
										placeholder="Select Regions" value={Selected_d_states} options={d_states}
										onChange={(e) => setSelected_d_states(e.value)} filter className="w-full modern-multiselect" panelClassName="modern-multiselect-panel" />
								</div>
							</div>

							<div className="col-12 md:col-6 lg:col">
								<div className="comb-field-label mb-2" style={{ display: "flex", justifyContent:"space-between" }}>
									<span>Show ICT Data</span>
									<InputSwitch checked={checkedI} onChange={(e) => setCheckedI(e.value)} />
								</div>
								<div className="comb-input-group" style={{ opacity: checkedI ? 1 : 0.6 }}>
									<MultiSelect filterPlaceholder="Search ICT-Names here" showSelectAll showClear resetFilterOnHide
										maxSelectedLabels={7} disabled={!checkedI} selectionLimit={7} display="chip"
										placeholder="Select 220/400/765KV BUS" value={Selected_i_states} options={i_states}
										onChange={(e) => setSelected_i_states(e.value)} filter className="w-full modern-multiselect" panelClassName="modern-multiselect-panel" />
								</div>
							</div>

							<div className="col-12 md:col-6 lg:col">
								<div className="comb-field-label mb-2" style={{ display: "flex", justifyContent:"space-between" }}>
									<span>Show Lines Data</span>
									<InputSwitch checked={checkedL} onChange={(e) => setCheckedL(e.value)} />
								</div>
								<div className="comb-input-group" style={{ opacity: checkedL ? 1 : 0.6 }}>
									<MultiSelect filterPlaceholder="Search Lines here" showSelectAll showClear resetFilterOnHide
										maxSelectedLabels={7} disabled={!checkedL} selectionLimit={7} display="chip"
										placeholder="Select 220/400/765KV BUS" value={Selected_l_states} options={l_states}
										onChange={(e) => setSelected_l_states(e.value)} filter className="w-full modern-multiselect" panelClassName="modern-multiselect-panel" />
								</div>
							</div>
						</div>
						
						{/* Action Buttons */}
						<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "24px" }}>
							<Button icon="pi pi-chart-bar" label="Get Combined Data" className="comb-btn-primary"
								onClick={() => {
									setloading_show(true);
									getcombineddata();
								}} />
						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════════════════════════════
					Chart Output Container
				═══════════════════════════════════════════════════════════════ */}
				{!graphenable && (
					<div className="comb-chart-wrapper mb-4">
						<div className="comb-chart-header">
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								<i className="pi pi-chart-line" style={{ color: "#4f46e5" }} />
								<span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Combined Dynamics Chart</span>
								<Tag value={`${moment(start_date).format("DD MMM")} → ${moment(end_date).format("DD MMM YYYY")}`}
									severity="info" rounded style={{ fontSize: 10 }} />
							</div>
							<div style={{ fontSize: 11, color: "var(--text-muted)" }}>Scroll to zoom · Drag to pan</div>
						</div>
						<div style={{ padding: "16px 20px" }}>
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
					</div>
				)}

				</div>
			</div>
		</>
	);
}
