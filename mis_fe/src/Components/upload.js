import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import { BlockUI } from "primereact/blockui";
import { useTheme } from "../context/ThemeContext";

/* ── Page-scoped styles ─────────────────────────────────────────── */
const uploadStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes up-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes up-pulse-ring {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,99,71,0.4); }
  50%      { box-shadow: 0 0 0 10px rgba(255,99,71,0); }
}
@keyframes up-spin {
  to { transform: rotate(360deg); }
}
@keyframes up-bar-fill {
  from { width: 0; }
  to   { width: var(--bar-w, 0%); }
}

/* ── Loading overlay ───────────────────────────────────────────── */
.up-loading-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(15,23,42,0.75);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.up-loading-card {
  background: var(--bg-card, #fff);
  border-radius: 16px;
  padding: 36px 48px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  box-shadow: 0 24px 48px -12px rgba(0,0,0,0.4);
  border: 1px solid var(--border-subtle, #e2e8f0);
}
.up-spinner {
  width: 44px; height: 44px;
  border: 4px solid rgba(255,99,71,0.15);
  border-top-color: #ff6347;
  border-radius: 50%;
  animation: up-spin 0.75s linear infinite;
}

/* ── Hero ──────────────────────────────────────────────────────── */
.up-hero {
  position: relative; overflow: hidden;
  border-radius: 14px; padding: 20px 26px;
  margin-bottom: 0;
  background: linear-gradient(135deg, #7f1d1d 0%, #c2410c 45%, #ff6347 100%);
  box-shadow: 0 14px 30px -8px rgba(255,99,71,0.45);
  animation: up-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
}
.up-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.up-hero::after {
  content: '';
  position: absolute; top: -60px; right: -60px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%);
  pointer-events: none;
}
.up-hero-icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
  animation: up-pulse-ring 2.5s ease-in-out infinite;
}
.up-hero-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 10px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 100px;
  font-size: 10px; font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.5px; text-transform: uppercase;
  margin-bottom: 6px;
}

/* ── Control card ──────────────────────────────────────────────── */
.up-ctrl-card {
  background: var(--bg-card, #fff);
  border-radius: 14px;
  border: 1px solid var(--border-subtle, #e2e8f0);
  border-left: 3px solid #ff6347;
  box-shadow: -3px 0 16px -4px rgba(255,99,71,0.3), 0 4px 24px -4px rgba(0,0,0,0.08);
  padding: 24px 28px;
  animation: up-fade-up 0.55s cubic-bezier(.16,1,.3,1) 0.08s both;
}

/* ── Section label ─────────────────────────────────────────────── */
.up-section-label {
  font-size: 10px; font-weight: 800;
  color: var(--text-muted, #64748b);
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 10px; margin-top: 0;
  display: flex; align-items: center; gap: 6px;
}
.up-section-label::after {
  content: ''; flex: 1; height: 1px;
  background: var(--border-subtle, #e2e8f0);
}

/* ── Date field ────────────────────────────────────────────────── */
.up-date-field {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 14px;
  background: var(--bg-surface, #f8fafc);
  border: 1.5px solid var(--border-subtle, #e2e8f0);
  border-radius: 10px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.up-date-field:focus-within {
  border-color: #ff6347;
  box-shadow: 0 0 0 3px rgba(255,99,71,0.12);
  background: var(--bg-card, #fff);
}

/* ── Stream toggle cards ───────────────────────────────────────── */
.up-streams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 4px;
}
.up-stream-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 14px 10px;
  border-radius: 10px;
  border: 1.5px solid var(--border-subtle, #e2e8f0);
  background: var(--bg-surface, #f8fafc);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.16,1,.3,1);
  user-select: none;
  position: relative; overflow: hidden;
}
.up-stream-card:hover {
  border-color: #ff6347;
  background: rgba(255,99,71,0.05);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -4px rgba(255,99,71,0.2);
}
.up-stream-card.selected {
  border-color: #ff6347;
  background: rgba(255,99,71,0.08);
  box-shadow: 0 4px 14px -4px rgba(255,99,71,0.3);
}
.up-stream-card.selected::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,99,71,0.06), transparent);
}
.up-stream-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-subtle, #e2e8f0);
  transition: all 0.22s;
}
.up-stream-card.selected .up-stream-icon {
  background: rgba(255,99,71,0.15);
  border-color: rgba(255,99,71,0.3);
}
.up-stream-name {
  font-size: 11px; font-weight: 700;
  color: var(--text-secondary, #475569);
  text-align: center; line-height: 1.3;
  transition: color 0.2s;
}
.up-stream-card.selected .up-stream-name {
  color: #ff6347;
}
.up-stream-check {
  position: absolute; top: 6px; right: 7px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ff6347;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0.5);
  transition: all 0.18s cubic-bezier(.16,1,.3,1);
}
.up-stream-card.selected .up-stream-check {
  opacity: 1; transform: scale(1);
}

/* ── Select all row ────────────────────────────────────────────── */
.up-select-all-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.up-select-all-btn {
  font-size: 11px; font-weight: 700;
  color: #ff6347;
  cursor: pointer; border: none; background: none;
  padding: 3px 8px; border-radius: 6px;
  transition: background 0.2s;
}
.up-select-all-btn:hover { background: rgba(255,99,71,0.08); }
.up-selected-count {
  font-size: 11px; font-weight: 600;
  color: var(--text-muted, #64748b);
}

/* ── Execute button ────────────────────────────────────────────── */
.up-execute-btn {
  background: linear-gradient(135deg, #c2410c, #ff6347) !important;
  border: none !important; border-radius: 11px !important;
  padding: 14px 36px !important;
  font-size: 13px !important; font-weight: 800 !important;
  letter-spacing: 0.6px !important;
  box-shadow: 0 8px 20px -6px rgba(255,99,71,0.5) !important;
  transition: all 0.3s cubic-bezier(.16,1,.3,1) !important;
}
.up-execute-btn:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  box-shadow: 0 14px 28px -6px rgba(255,99,71,0.6) !important;
}
.up-execute-btn:disabled {
  opacity: 0.5 !important; cursor: not-allowed !important;
}

/* ── Status bar ────────────────────────────────────────────────── */
.up-status-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-radius: 30px;
  border: 1px dashed rgba(255,99,71,0.35);
  background: rgba(255,99,71,0.04);
  font-size: 12px; font-weight: 600;
  color: var(--text-secondary, #475569);
}
.up-status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #ff6347; flex-shrink: 0;
  animation: up-pulse-ring 1.8s ease-in-out infinite;
}

/* ── Stat pills ────────────────────────────────────────────────── */
.up-stat-pill {
  text-align: center; padding: 6px 16px;
  background: rgba(255,255,255,0.12);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
}
`;

/* ── Stream metadata ─────────────────────────────────────────── */
const STREAMS = [
    { key: "Frequency",         icon: "〰️",  label: "Frequency"    },
    { key: "Voltage",           icon: "⚡",  label: "Voltage"      },
    { key: "Lines",             icon: "↔️",  label: "Lines"        },
    { key: "ICT",               icon: "🔌",  label: "ICT"          },
    { key: "Demand",            icon: "📈",  label: "Demand"       },
    { key: "Generator",         icon: "⚙️",  label: "Generator"    },
    { key: "Thermal Generator", icon: "🔥",  label: "Thermal Gen"  },
    { key: "ISGS",              icon: "🌐",  label: "ISGS"         },
    { key: "Exchange",          icon: "🔄",  label: "Exchange"     },
];

/* ── API endpoint map ────────────────────────────────────────── */
const ENDPOINT_MAP = {
    "Voltage":           "/VoltageFileInsert",
    "Lines":             "/LinesFileInsert",
    "ICT":               "/ICTFileInsert",
    "Demand":            "/DemandFileInsert",
    "Generator":         "/GeneratorFileInsert",
    "Thermal Generator": "/ThGeneratorFileInsert",
    "ISGS":              "/ISGSFileInsert",
    "Frequency":         "/FrequencyFileInsert",
    "Exchange":          "/ExchangeFileInsert",
};

export default function Upload() {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const { isDarkMode } = useTheme();
    const [date_range, set_date_range]             = useState(null);
    const [selected, setSelected]                  = useState([]);
    const [blocked, setBlocked]                    = useState(false);
    const [loading_show, setloading_show]          = useState(false);

    const toggleStream = (key) => {
        setSelected(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const allSelected   = selected.length === STREAMS.length;
    const toggleAll     = () => setSelected(allSelected ? [] : STREAMS.map(s => s.key));

    const isReady = selected.length > 0 && date_range && date_range[0] && date_range[1];

    const dateStr = date_range && date_range[0]
        ? date_range[1]
            ? `${moment(date_range[0]).format("DD MMM")} → ${moment(date_range[1]).format("DD MMM YYYY")}`
            : `${moment(date_range[0]).format("DD MMM YYYY")} → …`
        : null;

    const uploaddata = () => {
        if (!isReady) {
            alert("Please select a Date Range and at least one Data Stream.");
            return;
        }
        setloading_show(true);
        const start_date = date_range[0];
        const end_date   = date_range[1];
        const dateParams = `?startDate=${moment(start_date).format("YYYY-MM-DD")}&endDate=${moment(end_date).format("YYYY-MM-DD")}`;

        const promises = selected.map(stream => {
            const url = baseUrl + ENDPOINT_MAP[stream] + dateParams;
            // Lines also needs MVAr insert
            if (stream === "Lines") {
                return Promise.all([
                    axios.post(url, "Lines MW").catch(() => {}),
                    axios.post(baseUrl + "/MVARFileInsert" + dateParams).catch(() => {})
                ]);
            }
            return axios.post(url, stream === "ICT" ? {} : undefined)
                .then(r => {
                    const data = r.data;
                    console.info(`${stream} inserted:`, data?.dates ?? data);
                })
                .catch(() => {});
        });

        Promise.allSettled(promises).then(() => {
            setloading_show(false);
            setBlocked(false);
            alert(`✅ Synchronization complete for ${selected.length} stream(s).`);
        });
    };

    return (
        <div
            className={isDarkMode ? "dark-mode" : ""}
            style={{ background: isDarkMode ? "#0f172a" : "#f1f5f9", minHeight: "100vh", padding: 16, '--page-accent': '#ff6347' }}
        >
            <style>{uploadStyles}</style>
            <BlockUI blocked={blocked} fullScreen />

            {/* Loading overlay */}
            {loading_show && (
                <div className="up-loading-overlay">
                    <div className="up-loading-card">
                        <div className="up-spinner" />
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                            Synchronizing Data…
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Pushing {selected.length} stream{selected.length !== 1 ? "s" : ""} to storage.
                        </div>
                    </div>
                </div>
            )}

            {/* ── HERO ─────────────────────────────────────────── */}
            <div className="up-hero">
                <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
                    <div className="up-hero-icon">📡</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="up-hero-badge">
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fde68a", display: "inline-block" }} />
                            Grid Synchronization
                        </div>
                        <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.25 }}>
                            Data Ingestion Engine
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.65)", margin: "3px 0 0", fontSize: 11.5, fontWeight: 400 }}>
                            Push tele-metering telemetry into core data storage
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {[
                            { val: selected.length, lbl: "Streams" },
                            { val: date_range && date_range[0] && date_range[1]
                                ? Math.max(1, Math.round((date_range[1] - date_range[0]) / 86400000) + 1)
                                : "—", lbl: "Days" },
                        ].map(({ val, lbl }) => (
                            <div key={lbl} className="up-stat-pill">
                                <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{val}</div>
                                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CONTROL CARD ─────────────────────────────────── */}
            <div className="up-ctrl-card">

                {/* Date Range */}
                <p className="up-section-label">
                    <i className="pi pi-calendar" style={{ color: "#ff6347" }} />
                    Temporal Range
                </p>
                <div className="up-date-field" style={{ marginBottom: 22 }}>
                    <i className="pi pi-calendar-plus" style={{ color: "#ff6347", fontSize: 16, flexShrink: 0 }} />
                    <Calendar
                        style={{ flex: 1 }}
                        placeholder="Select start → end date"
                        dateFormat="dd-mm-yy"
                        value={date_range}
                        onChange={(e) => set_date_range(e.value)}
                        selectionMode="range"
                        readOnlyInput
                        hideOnRangeSelection
                        showIcon={false}
                        inputClassName="bg-transparent border-none p-0 text-sm font-bold w-full"
                    />
                    {dateStr && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#ff6347", flexShrink: 0, whiteSpace: "nowrap" }}>
                            {dateStr}
                        </span>
                    )}
                    {date_range && (
                        <i
                            className="pi pi-times"
                            style={{ color: "var(--text-muted)", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
                            onClick={() => set_date_range(null)}
                        />
                    )}
                </div>

                {/* Stream Selection */}
                <div className="up-select-all-row">
                    <p className="up-section-label" style={{ margin: 0, flex: 1 }}>
                        <i className="pi pi-database" style={{ color: "#ff6347" }} />
                        Data Streams
                    </p>
                    <button className="up-select-all-btn" onClick={toggleAll}>
                        {allSelected ? "Deselect All" : "Select All"}
                    </button>
                    <span className="up-selected-count" style={{ marginLeft: 10 }}>
                        {selected.length}/{STREAMS.length} selected
                    </span>
                </div>

                <div className="up-streams-grid">
                    {STREAMS.map(({ key, icon, label }) => {
                        const isSelected = selected.includes(key);
                        return (
                            <div
                                key={key}
                                className={`up-stream-card${isSelected ? " selected" : ""}`}
                                onClick={() => toggleStream(key)}
                            >
                                <div className="up-stream-check">
                                    <i className="pi pi-check" style={{ color: "#fff", fontSize: 8 }} />
                                </div>
                                <div className="up-stream-icon">{icon}</div>
                                <span className="up-stream-name">{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border-subtle, #e2e8f0)", margin: "22px 0" }} />

                {/* Action row */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <Button
                        icon="pi pi-cloud-upload"
                        className="up-execute-btn"
                        label="Execute Synchronization"
                        onClick={uploaddata}
                        loading={loading_show}
                        disabled={!isReady}
                    />

                    <div className="up-status-bar">
                        <div className="up-status-dot" style={{ background: isReady ? "#22c55e" : "#ff6347" }} />
                        {isReady
                            ? `Ready — ${selected.length} stream${selected.length !== 1 ? "s" : ""} · ${moment(date_range[0]).format("DD MMM")} → ${moment(date_range[1]).format("DD MMM YYYY")}`
                            : selected.length === 0 && !date_range
                                ? "Select a date range and at least one data stream to begin."
                                : !date_range
                                    ? "Pick a date range to continue."
                                    : "Select at least one data stream to continue."
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
