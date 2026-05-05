import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import "../cssFiles/PasswordDemo.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "../cssFiles/ButtonDemo.css";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import Isgsgraph from "../graphs/isgsgraph";
import { Divider } from "primereact/divider";
import { BlockUI } from "primereact/blockui";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Chip } from "primereact/chip";
import { Tag } from "primereact/tag";
import { useTheme } from "../context/ThemeContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ─── Styles injected once ─────────────────────────────────────────────────────
const generatorStyles = `
@keyframes gen-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gen-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.45); }
  70%  { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
  100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
}
@keyframes gen-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
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
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #4f46e5 100%);
  box-shadow: 0 12px 28px -8px rgba(37,99,235,0.4);
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
/* Input wrapper styling */
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.gen-input-group .p-inputnumber { flex: 1; }
.gen-input-group .p-inputnumber input,
.gen-interval-row .p-inputnumber input {
  border: none !important;
  background: transparent !important;
  padding: 2px 4px !important;
  font-size: 13px !important;
  color: var(--text-primary) !important;
  width: 52px;
  text-align: center;
}
.gen-interval-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-bright);
  border-radius: 10px;
  background: var(--bg-main);
  transition: border-color 0.2s;
}
.gen-switch-label {
  font-size: 12px; font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
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
  overflow: hidden;
  margin-bottom: 24px;
  animation: gen-fade-up 0.55s cubic-bezier(.16,1,.3,1) both;
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
.gen-section-body { padding: 24px; }

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
.gen-overlay-group {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  padding: 16px 20px;
  background: var(--bg-main);
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
}
.gen-checkbox-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.15s;
}
.gen-checkbox-item:hover { color: var(--text-primary); }

.gen-action-row {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  margin-top: 20px;
}
.gen-btn-primary {
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
.gen-btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(37,99,235,0.45) !important;
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
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: gen-spin-slow 0.8s linear infinite;
}
`;

export default function Isgs() {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const { isDarkMode } = useTheme();

    // ── State ────────────────────────────────────────────────────────────────
    const [date_range, setDate_range] = useState([
        new Date(moment().set("hour",0).set("minute",0).set("second",0).subtract(2,"day")._d),
        new Date(moment().set("hour",23).set("minute",59).set("second",0).subtract(2,"day")._d),
    ]);
    const start_date = date_range?.[0];
    const end_date   = date_range?.[1];
    const [isgs_states, setisgs_states]                         = useState();
    const [Selected_isgs_states, setSelected_isgs_states]       = useState();
    const [isgs_data, setisgs_data]                             = useState();
    const [enable, setenable]                                             = useState(true);
    const [graphenable, setgraphenable]                                   = useState(true);

    const [multiple_date, setMultiple_Date]                                                 = useState();
    const [multiple_isgs_states, setmultipleisgs_states]                         = useState();
    const [multiple_Selected_isgs_states, setmultipleSelected_isgs_states]       = useState();
    const [multiple_isgs_data, setmultipleisgs_data]                             = useState();
    const [graphenable2, setgraphenable2]                                                   = useState(true);
    const [multiple_month, setMultiple_Month]                                               = useState();

    const [checked1, setChecked1] = useState(true);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);
    const [minutes, setminutes]   = useState(1);
    const [checked4, setChecked4] = useState(false);
    const [multiminutes, setmultiminutes] = useState(1);

    const [frequency, setfrequency]       = useState();
    const [multifrequency, setmultifrequency] = useState();
    const [freq_region, setfreq_region]   = useState([]);
    const [freq_region1, setfreq_region1] = useState([]);
    const [blocked, setBlocked]           = useState(false);
    const [loading_show, setloading_show] = useState(false);

    // ── Data Fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (start_date && end_date) {
            axios.post(baseUrl + "/IsgsNames?startDate=" + moment(start_date).format("YYYY-MM-DD HH:mm") + "&endDate=" + moment(end_date).format("YYYY-MM-DD HH:mm"), {})
                .then(r => setisgs_states(r.data)).catch(() => {});
        }
        if (multiple_date) {
            const dates = multiple_date.map(d => moment(d).format("YYYY-MM-DD"));
            if (dates.length === multiple_date.length) {
                axios.post(baseUrl + "/MultiIsgsNames?MultistartDate=" + dates, {})
                    .then(r => setmultipleisgs_states(r.data)).catch(() => {});
            }
        }
        if (multiple_month) {
            const months = multiple_month.map(d => moment(d).format("YYYY-MM-DD"));
            if (months.length === multiple_month.length) {
                axios.post(baseUrl + "/MultiIsgsNames?MultistartDate=" + months, {})
                    .then(r => setmultipleisgs_states(r.data)).catch(() => {});
            }
        }
    }, [start_date, end_date, multiple_date, multiple_month]);

    const getisgsdata = () => {
        if (!start_date || !end_date || !Selected_isgs_states) return;
        const t = checked3 && minutes ? minutes : 1;
        const sd = moment(start_date).format("YYYY-MM-DD HH:mm");
        const ed = moment(end_date).format("YYYY-MM-DD HH:mm");
        axios.post(baseUrl + `/GetIsgsData?startDate=${sd}&endDate=${ed}&stationName=${(Selected_isgs_states || []).map(s => String(s).replace(/&/g, "%26")).join(",")}&time=${t}`, {})
            .then(r => { setisgs_data(r.data); setenable(false); setgraphenable(false); setBlocked(false); setloading_show(false); });
        axios.post(baseUrl + `/GetFrequencyData?startDate=${sd}&endDate=${ed}&stationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North&time=${t}`, {})
            .then(r => setfrequency(r.data));
    };

    const getmultiisgsdata = () => {
        if (multiple_date && checked1) {
            const dates = multiple_date.map(d => moment(d).format("YYYY-MM-DD"));
            const t = checked4 && multiminutes ? multiminutes : 1;
            if (dates.length && multiple_Selected_isgs_states) {
                axios.post(baseUrl + `/GetMultiIsgsData?MultistartDate=${dates}&MultistationName=${(multiple_Selected_isgs_states || []).map(s => String(s).replace(/&/g, "%26")).join(",")}&Type=Date&time=${t}`, {})
                    .then(r => { setmultipleisgs_data(r.data); setgraphenable2(false); setBlocked(false); setloading_show(false); });
                axios.post(baseUrl + `/GetMultiFrequencyData?MultistartDate=${dates[0]}&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North&Type=Date&time=${t}`, {})
                    .then(r => setmultifrequency(r.data));
            }
        }
        if (multiple_month && checked2) {
            const months = multiple_month.map(d => moment(d).format("YYYY-MM-DD"));
            const t = checked4 && multiminutes ? multiminutes : 1;
            if (months.length && multiple_Selected_isgs_states) {
                axios.post(baseUrl + `/GetMultiIsgsData?MultistartDate=${months}&MultistationName=${(multiple_Selected_isgs_states || []).map(s => String(s).replace(/&/g, "%26")).join(",")}&Type=Month&time=${t}`, {})
                    .then(r => { setmultipleisgs_data(r.data); setgraphenable2(false); setBlocked(false); setloading_show(false); });
                axios.post(baseUrl + `/GetMultiFrequencyData?MultistartDate=${months}&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North&Type=Month&time=${t}`, {})
                    .then(r => setmultifrequency(r.data));
            }
        }
    };

    const freq_change  = (e) => { let s=[...freq_region];  e.checked?s.push(e.value):s.splice(s.indexOf(e.value),1); setfreq_region(s);  };
    const freq_change1 = (e) => { let s=[...freq_region1]; e.checked?s.push(e.value):s.splice(s.indexOf(e.value),1); setfreq_region1(s); };

    // ── Excel Export ──────────────────────────────────────────────────────────
    const exportGraphToExcel = (data, label) => {
        if (!data) return;
        const wb = XLSX.utils.book_new();
        const sharedTimeArr = data[data.length - 1]["Date_Time"] || [];
        const stationMap = {};
        for (let i = 0; i < data.length - 1; i++) {
            const e = data[i];
            const n = e["stationName"] || `Station_${i}`;
            if (!stationMap[n]) stationMap[n] = [];
            stationMap[n].push(e);
        }
        const isSingleRange = Object.values(stationMap).every(entries => entries.length === 1);
        const fmt = (ts) => { const m = moment(ts, moment.ISO_8601, true); return ts ? (m.isValid() ? m.format("DD-MMM-YY HH:mm") : String(ts)) : ""; };
        const fmtT = (ts) => { const m = moment(ts, moment.ISO_8601, true); return ts ? (m.isValid() ? m.format("HH:mm") : String(ts)) : ""; };

        if (isSingleRange) {
            const stNames = Object.keys(stationMap);
            const rows = sharedTimeArr.map((ts, idx) => {
                const row = { "Date / Time": fmt(ts) };
                stNames.forEach(n => { row[n] = ((stationMap[n][0]["output"] || stationMap[n][0]["actual"] || stationMap[n][0]["demand"] || stationMap[n][0]["voltageBus1"] || stationMap[n][0]["line"] || stationMap[n][0]["frequency"] || stationMap[n][0]["drawal"] || stationMap[n][0]["schedule"]) || [])[idx] ?? ""; });
                return row;
            });
            if (rows.length > 0) {
                const ws = XLSX.utils.json_to_sheet(rows);
                ws["!cols"] = Object.keys(rows[0]).map(k => ({ wch: Math.min(Math.max(k.length, ...rows.map(r => String(r[k]??'').length)) + 2, 30) }));
                XLSX.utils.book_append_sheet(wb, ws, "Isgs Data");
            }
        } else {
            Object.entries(stationMap).forEach(([name, entries]) => {
                const hdrs = entries.map(e => e["Date_Time"] ? moment(e["Date_Time"]).format("DD-MMM-YYYY") : "Value");
                const slotCount = Math.max(...entries.map(e => ((e["output"] || e["actual"] || e["demand"] || e["voltageBus1"] || e["line"] || e["frequency"] || e["drawal"] || e["schedule"])||[]).length));
                const rows = Array.from({ length: slotCount }, (_, ri) => {
                    const row = { "Time": fmtT(sharedTimeArr[ri]) || `Slot ${ri+1}` };
                    entries.forEach((e, di) => { row[hdrs[di]] = ((e["output"] || e["actual"] || e["demand"] || e["voltageBus1"] || e["line"] || e["frequency"] || e["drawal"] || e["schedule"])||[])[ri] ?? ""; });
                    return row;
                });
                if (rows.length > 0) {
                    const ws = XLSX.utils.json_to_sheet(rows);
                    ws["!cols"] = Object.keys(rows[0]).map(k => ({ wch: Math.min(Math.max(k.length, ...rows.map(r => String(r[k]??'').length)) + 2, 30) }));
                    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
                }
            });
        }
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), `Generator_${label}_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
    };

    // ── Stat Badges ───────────────────────────────────────────────────────────
    const stationCount = isgs_data ? (isgs_data.length - 1) : 0;
    const multiCount   = multiple_isgs_data ? (multiple_isgs_data.length - 1) : 0;
    const dateRangeDays = start_date && end_date ? moment(end_date).diff(moment(start_date), "days") + 1 : 0;
    const selectedCount = Selected_isgs_states ? Selected_isgs_states.length : 0;

    return (
        <>
            {/* Inject page-scoped styles */}
            <style>{generatorStyles}</style>

            <BlockUI blocked={blocked} fullScreen />

            {/* Loading overlay */}
            {loading_show && (
                <div className="gen-loading-overlay">
                    <div className="gen-loading-card">
                        <div className="gen-spinner" />
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Fetching Isgs Data</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Crunching numbers from the grid…</div>
                    </div>
                </div>
            )}

            <div style={{ paddingBottom: 40 }}>
				<div>

                {/* ── HERO HEADER (compact) ─────────────────────────────────── */}
                <div className="gen-hero">
                    <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
                        <div className="gen-hero-icon">🏭</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="gen-hero-badge">
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                Live Analytics
                            </div>
                            <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
                                Isgs Analytics
                            </h1>
                            <p style={{ color: "rgba(255,255,255,0.65)", margin: "3px 0 0", fontSize: 11.5, fontWeight: 400 }}>
                                ISGS power monitoring
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            {[
                                { val: stationCount, lbl: "Stations" },
                                { val: dateRangeDays, lbl: "Days" },
                                { val: selectedCount, lbl: "Selected" },
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
                        { color: "blue",  icon: "pi-calendar-plus", label: "Date Range", value: start_date ? moment(start_date).format("DD MMM") + " → " + moment(end_date).format("DD MMM YYYY") : "Not set" },
                        { color: "green", icon: "pi-bolt",          label: "Generators Selected", value: selectedCount ? `${selectedCount} station${selectedCount > 1 ? "s" : ""}` : "None selected" },
                        { color: "amber", icon: "pi-clock",          label: "Resolution", value: checked3 ? `${minutes} min interval` : "1 min (default)" },
                        { color: "violet", icon: "pi-chart-line",    label: "Data Status", value: isgs_data ? "✓ Ready to view" : "Pending generation" },
                    ].map((s, idx) => (
                        <div className="col-12 sm:col-6 xl:col-3" key={s.label}>
                            <div className={`gen-stat-card ${s.color}`} style={{ animationDelay: `${0.08 + idx * 0.06}s` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div className={`gen-stat-icon ${s.color}`}>
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
                    SECTION 1 — Single Date-Range Analysis
                ═══════════════════════════════════════════════════════════════ */}
                <div className="gen-section">
                    <div className="gen-section-header">
                        <div className="gen-section-title">
                            <div className="gen-section-pill blue"><i className="pi pi-chart-line" /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Single Range Analysis</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Select a date range &amp; generators to plot</div>
                            </div>
                        </div>
                        <Tag value="Isgs Output" severity="info" rounded style={{ fontSize: 11 }} />
                    </div>

                    <div className="gen-section-body">
                        <div className="grid align-items-end">

                            {/* Date Range — single selectionMode="range" picker */}
                            <div className="col-12 md:col-4">
                                <div className="gen-field-label"><i className="pi pi-calendar-plus" />Date Range</div>
                                <div className="modern-cal-wrapper">
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
                                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
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

                            {/* Interval */}
                            <div className="col-12 md:col-3">
                                <div className="gen-field-label"><i className="pi pi-stopwatch" />Resolution Interval</div>
                                <div className="gen-interval-row">
                                    <InputSwitch checked={checked3} onChange={(e) => setChecked3(e.value)} />
                                    <span className="gen-switch-label">{checked3 ? `${minutes} min` : "Default 1 min"}</span>
                                    <div style={{ marginLeft: "auto" }}>
                                        <InputNumber min={1} max={1440} disabled={!checked3} value={minutes}
                                            onValueChange={(e) => setminutes(e.value)}
                                            showButtons buttonLayout="horizontal"
                                            decrementButtonClassName="p-button-outlined p-button-sm"
                                            incrementButtonClassName="p-button-outlined p-button-sm"
                                            incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                                            inputStyle={{ width: "40px", textAlign: "center", fontSize: 13 }} />
                                    </div>
                                </div>
                            </div>

                            {/* Isgs Selector */}
                            <div className="col-12 md:col-5">
                                <div className="gen-field-label"><i className="pi pi-bolt" />Select Isgs(s)</div>
                                <MultiSelect filterPlaceholder="Search generators…" showSelectAll showClear resetFilterOnHide
                                    maxSelectedLabels={3} selectionLimit={5} display="chip"
                                    placeholder="Pick up to 5 generators…"
                                    value={Selected_isgs_states} options={isgs_states}
                                    onChange={(e) => setSelected_isgs_states(e.value)}
                                    filter className="w-full modern-multiselect"
                                    panelClassName="modern-multiselect-panel" />
                            </div>

                        </div>

                        {/* Overlay Options */}
                        <div className="gen-divider-row" />
                        <div className="grid gap-0">
                            <div className="col-12 md:col-6">
                                <div className="gen-field-label mb-2"><i className="pi pi-sliders-h" />Overlay — Duration Curve</div>
                                <div className="gen-overlay-group">
                                    {["Isgs", "Frequency"].map(v => (
                                        <label key={v} className="gen-checkbox-item">
                                            <Checkbox value={v} onChange={freq_change1} checked={freq_region1.indexOf(v) !== -1} />
                                            {v}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="gen-field-label mb-2"><i className="pi pi-wave-pulse" />Overlay — Frequency Stations</div>
                                <div className="gen-overlay-group">
                                    {[
                                        { val: "Durgapur", color: "#ef4444" },
                                        { val: "Jeypore",  color: "#f97316" },
                                        { val: "Sasaram",  color: "#db2777" },
                                    ].map(({ val, color }) => (
                                        <label key={val} className="gen-checkbox-item">
                                            <Checkbox value={val} onChange={freq_change} checked={freq_region.indexOf(val) !== -1} />
                                            <span style={{ color: freq_region.indexOf(val) !== -1 ? color : undefined, fontWeight: freq_region.indexOf(val) !== -1 ? 700 : undefined }}>
                                                {val}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="gen-action-row">
                            <Button icon="pi pi-chart-bar" label="Generate Graph" className="gen-btn-primary"
                                onClick={() => { setloading_show(true); getisgsdata(); }} />
                            <Button icon="pi pi-download" label="Export Graph Data" className="gen-btn-secondary"
                                disabled={!isgs_data}
                                tooltip="Export plotted data as Excel" tooltipOptions={{ position: "top" }}
                                onClick={() => exportGraphToExcel(isgs_data,
                                    `${moment(start_date).format("YYYYMMDD")}_${moment(end_date).format("YYYYMMDD")}`)} />
                            <Button icon="pi pi-file-excel" label="Export Raw Data" className="gen-btn-secondary"
                                disabled={enable}
                                tooltip="Download from server" tooltipOptions={{ position: "top" }}
                                onClick={() => { window.location.href = `${baseUrl}/GetIsgsDataExcel?startDate=${moment(start_date).format("YYYY-MM-DD")}&endDate=${moment(end_date).format("YYYY-MM-DD")}&stationName=${(Selected_isgs_states || []).map(s => String(s).replace(/&/g, "%26")).join(",")}`; }} />
                            {!graphenable && isgs_data && (
                                <Chip label={`${isgs_data.length - 1} trace(s) loaded`}
                                    icon="pi pi-check-circle"
                                    style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 600, fontSize: 12 }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Output — Range */}
                {!graphenable && (
                    <div className="gen-chart-wrapper mb-4">
                        <div className="gen-chart-header">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <i className="pi pi-chart-line" style={{ color: "#3b82f6" }} />
                                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Output Chart</span>
                                <Tag value={`${moment(start_date).format("DD MMM")} → ${moment(end_date).format("DD MMM YYYY")}`}
                                    severity="info" rounded style={{ fontSize: 10 }} />
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Scroll to zoom · Drag to pan</div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <Isgsgraph
                                isgs_data={isgs_data}
                                Selected_isgs_states={Selected_isgs_states}
                                frequency={frequency}
                                freq_region={freq_region}
                                freq_region1={freq_region1}
                            />
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    SECTION 2 — Multi-Timeline Comparison
                ═══════════════════════════════════════════════════════════════ */}
                <div className="gen-section" style={{ animationDelay: "0.1s" }}>
                    <div className="gen-section-header">
                        <div className="gen-section-title">
                            <div className="gen-section-pill violet"><i className="pi pi-objects-column" /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Multi-Timeline Comparison</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Compare generator output across multiple days or months</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                                <button
                                    onClick={() => { setChecked1(true); setChecked2(false); }}
                                    style={{
                                        padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                        background: checked1 ? "#2563eb" : "var(--bg-main)",
                                        color: checked1 ? "#fff" : "var(--text-muted)",
                                        transition: "all 0.2s",
                                    }}>
                                    Day-wise
                                </button>
                                <button
                                    onClick={() => { setChecked2(true); setChecked1(false); }}
                                    style={{
                                        padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                        background: checked2 ? "#8b5cf6" : "var(--bg-main)",
                                        color: checked2 ? "#fff" : "var(--text-muted)",
                                        transition: "all 0.2s",
                                    }}>
                                    Month-wise
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="gen-section-body">
                        <div className="grid align-items-end gap-0">
                            {/* Date / Month picker */}
                            <div className="col-12 md:col-3">
                                <div className="mb-3">
                                    <div className="gen-field-label">
                                        <i className={checked1 ? "pi pi-calendar" : "pi pi-calendar-times"} />
                                        {checked1 ? "Select Dates (Day-wise)" : "Select Months"}
                                    </div>
                                    {checked1 && (
                                        <div className="modern-cal-wrapper">
                                            <Calendar style={{ width: "100%" }} showIcon showWeek
                                                selectionMode="multiple" placeholder="Pick dates…" dateFormat="dd-mm-yy"
                                                value={multiple_date} onChange={(e) => setMultiple_Date(e.value)}
                                                monthNavigator yearNavigator yearRange="2015:2030" showButtonBar />
                                        </div>
                                    )}
                                    {checked2 && (
                                        <div className="modern-cal-wrapper">
                                            <Calendar style={{ width: "100%" }} showIcon showWeek
                                                selectionMode="multiple" placeholder="Pick months…" view="month" dateFormat="MM-yy"
                                                value={multiple_month} onChange={(e) => setMultiple_Month(e.value)}
                                                monthNavigator yearNavigator yearRange="2015:2030" showButtonBar />
                                        </div>
                                    )}
                                    {/* Quick date badges */}
                                    {checked1 && multiple_date && multiple_date.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                            {multiple_date.map((d, i) => (
                                                <span key={i} className="modern-date-badge violet">
                                                    {moment(d).format("DD MMM")}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {checked2 && multiple_month && multiple_month.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                            {multiple_month.map((d, i) => (
                                                <span key={i} className="modern-date-badge violet">
                                                    {moment(d).format("MMM YYYY")}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Interval */}
                            <div className="col-12 md:col-2">
                                <div className="mb-3">
                                    <div className="gen-field-label"><i className="pi pi-stopwatch" />Interval</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <InputSwitch checked={checked4} onChange={(e) => setChecked4(e.value)} />
                                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{checked4 ? "Custom" : "Default (1 min)"}</span>
                                    </div>
                                    <InputNumber min={1} max={1440} disabled={!checked4} value={multiminutes}
                                        onValueChange={(e) => setmultiminutes(e.value)}
                                        showButtons buttonLayout="horizontal"
                                        decrementButtonClassName="p-button-danger p-button-outlined"
                                        incrementButtonClassName="p-button-success p-button-outlined"
                                        incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                                        inputStyle={{ width: "4rem", textAlign: "center" }} />
                                </div>
                            </div>

                            {/* Isgs multi-selector */}
                            <div className="col-12 md:col-5">
                                <div className="mb-3">
                                    <div className="gen-field-label"><i className="pi pi-bolt" />Select Isgs(s)</div>
                                    <MultiSelect filterPlaceholder="Search generators…" showSelectAll showClear resetFilterOnHide
                                        maxSelectedLabels={3} selectionLimit={5} display="chip"
                                        placeholder="Pick generators…"
                                        value={multiple_Selected_isgs_states} options={multiple_isgs_states}
                                        onChange={(e) => setmultipleSelected_isgs_states(e.value)}
                                        filter className="w-full modern-multiselect"
                                        panelClassName="modern-multiselect-panel" />
                                </div>
                            </div>
                        </div>

                        {/* Overlay Options */}
                        <div className="gen-divider-row" />
                        <div className="grid gap-0">
                            <div className="col-12 md:col-6">
                                <div className="gen-field-label mb-2"><i className="pi pi-sliders-h" />Overlay — Duration Curve</div>
                                <div className="gen-overlay-group">
                                    {["Isgs", "Frequency"].map(v => (
                                        <label key={v} className="gen-checkbox-item">
                                            <Checkbox value={v} onChange={freq_change1} checked={freq_region1.indexOf(v) !== -1} />
                                            {v}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="gen-field-label mb-2"><i className="pi pi-wave-pulse" />Overlay — Frequency Stations</div>
                                <div className="gen-overlay-group">
                                    {[
                                        { val: "Durgapur", color: "#ef4444" },
                                        { val: "Jeypore",  color: "#f97316" },
                                        { val: "Sasaram",  color: "#db2777" },
                                    ].map(({ val, color }) => (
                                        <label key={val} className="gen-checkbox-item">
                                            <Checkbox value={val} onChange={freq_change} checked={freq_region.indexOf(val) !== -1} />
                                            <span style={{ color: freq_region.indexOf(val) !== -1 ? color : undefined, fontWeight: freq_region.indexOf(val) !== -1 ? 700 : undefined }}>
                                                {val}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="gen-action-row">
                            <Button icon="pi pi-chart-bar" label="Generate Comparison" className="gen-btn-primary"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9) !important" }}
                                onClick={() => { setloading_show(true); getmultiisgsdata(); }} />
                            <Button icon="pi pi-download" label="Export Graph Data" className="gen-btn-secondary"
                                disabled={!multiple_isgs_data}
                                tooltip="Export plotted comparison data as Excel" tooltipOptions={{ position: "top" }}
                                onClick={() => {
                                    const lbl = checked1
                                        ? (multiple_date?.map(d => moment(d).format("DDMMYYYY")).join("_") || "dates")
                                        : (multiple_month?.map(d => moment(d).format("MMYYYY")).join("_") || "months");
                                    exportGraphToExcel(multiple_isgs_data, lbl);
                                }} />
                            {!graphenable2 && multiple_isgs_data && (
                                <Chip label={`${multiple_isgs_data.length - 1} trace(s) loaded`}
                                    icon="pi pi-check-circle"
                                    style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.3)", fontWeight: 600, fontSize: 12 }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Output — Multi */}
                {!graphenable2 && (
                    <div className="gen-chart-wrapper">
                        <div className="gen-chart-header">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <i className="pi pi-objects-column" style={{ color: "#8b5cf6" }} />
                                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Comparison Chart</span>
                                <Tag value={checked1 ? "Day-wise" : "Month-wise"} severity="help" rounded style={{ fontSize: 10 }} />
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Scroll to zoom · Drag to pan</div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <Isgsgraph
                                isgs_data={multiple_isgs_data}
                                Selected_isgs_states={multiple_Selected_isgs_states}
                                date_time={true}
                                check1={checked1}
                                check2={checked2}
                                frequency={multifrequency}
                                freq_region={freq_region}
                                freq_region1={freq_region1}
                            />
                        </div>
                    </div>
                )}
</div>
            </div>
        </>
    );
}
