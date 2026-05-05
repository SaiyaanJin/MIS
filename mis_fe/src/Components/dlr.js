import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import Dlrgraph from "../graphs/dlrgraph";
import { exportSingleGraphToExcel } from "./_excelUtils";
import "../cssFiles/pageCommon.css";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Dlr() {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [dateRange, setDateRange] = useState([
        moment().startOf("day").subtract(2, "day").toDate(),
        moment().endOf("day").subtract(2, "day").toDate()
    ]);
    const [dlrStates, setDlrStates] = useState([]);
    const [selectedDlrStates, setSelectedDlrStates] = useState([]);
    const [dlrData, setDlrData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            axios.post(baseUrl + `/dlrNames?startDate=${moment(dateRange[0]).format("YYYY-MM-DD")}&endDate=${moment(dateRange[1]).format("YYYY-MM-DD")}`)
                .then(res => setDlrStates(res.data)).catch(() => {});
        }
    }, [dateRange]);

    const getDlrData = async () => {
        if (dateRange && dateRange[0] && dateRange[1] && selectedDlrStates && selectedDlrStates.length > 0) {
            setIsLoading(true);
            const sDate = moment(dateRange[0]).format("YYYY-MM-DD");
            const eDate = moment(dateRange[1]).format("YYYY-MM-DD");
            
            try {
                const res = await axios.post(baseUrl + `/GetdlrData?startDate=${sDate}&endDate=${eDate}&stationName=${selectedDlrStates}`);
                setDlrData(res.data);
            } catch (err) { console.error(err); }
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: "0 10px" }}>
            {isLoading && (
                <div className="pc-loading-overlay">
                    <div className="pc-loading-box">
                        <div className="pc-spinner"></div>
                        <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "14px", fontFamily: "Inter" }}>Loading Analytics</div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>Processing grid data...</div>
                    </div>
                </div>
            )}

            <div className="pc-hero">
                <div className="pc-hero-inner">
                    <div className="pc-hero-icon"><i className="pi pi-map" style={{ color: "#0ea5e9", fontSize: "20px" }}></i></div>
                    <div className="pc-hero-text">
                        <div className="pc-hero-badge" style={{ borderColor: "rgba(14,165,233,0.5)", color: "#7dd3fc" }}>Dynamic Line Rating</div>
                        <h1 className="pc-hero-title">DLR Capacity Analytics</h1>
                        <p className="pc-hero-sub">Dynamic rating limits vs actual flow analysis</p>
                    </div>
                </div>
            </div>

            <div className="pc-section">
                <div className="pc-section-head">
                    <div className="pc-section-pill" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}><i className="pi pi-chart-line"></i></div>
                    <span className="pc-section-title">Single Range Analysis</span>
                </div>
                <div className="pc-section-body p-fluid grid formgrid">
                    <div className="field col-12 md:col-4">
                        <label className="pc-label"><i className="pi pi-calendar"></i> Date Range</label>
                        <div className="modern-cal-wrapper">
                            <Calendar selectionMode="range" readOnlyInput hideOnRangeSelection placeholder="Select Range"
                                dateFormat="dd-M-yy" value={dateRange} onChange={(e) => {
                                    const val = e.value || [];
                                    const newRange = [...val];
                                    if (newRange[0] && (!dateRange || !dateRange[0] || newRange[0].toDateString() !== dateRange[0].toDateString())) {
                                        newRange[0] = new Date(newRange[0]);
                                        newRange[0].setHours(0, 0, 0, 0);
                                    }
                                    if (newRange[1] && (!dateRange || !dateRange[1] || newRange[1].toDateString() !== dateRange[1].toDateString())) {
                                        newRange[1] = new Date(newRange[1]);
                                        newRange[1].setHours(23, 59, 0, 0);
                                    }
                                    setDateRange(newRange);
                                }}
                                showIcon className="w-full" />
                        </div>
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="pc-label"><i className="pi pi-building"></i> Select Entities</label>
                        <div className="modern-multiselect">
                            <MultiSelect selectionLimit={7} display="chip" placeholder="Select Line(s)"
                                value={selectedDlrStates} options={dlrStates} onChange={(e) => setSelectedDlrStates(e.value)}
                                filter className="pc-multiselect" panelClassName="modern-multiselect-panel" />
                        </div>
                    </div>
                    <div className="field col-12 md:col-2 flex flex-column gap-2" style={{ justifyContent: "flex-end" }}>
                        <Button label="Analyze Data" icon="pi pi-search" className="pc-btn-primary w-full" onClick={getDlrData} />
                        {dlrData && (
                            <Button label="Export Excel" icon="pi pi-file-excel" className="pc-btn-excel w-full" 
                                onClick={() => exportSingleGraphToExcel(dlrData, "DLR")} />
                        )}
                    </div>
                </div>

                {dlrData && (
                    <div className="pc-chart-wrapper">
                        <div className="pc-chart-title"><i className="pi pi-chart-bar" style={{ color: "#0ea5e9" }}></i> DLR Graph</div>
                        <Dlrgraph dlr_data={dlrData} Selected_dlr_states={selectedDlrStates} />
                    </div>
                )}
            </div>
            
        </div>
    );
}
