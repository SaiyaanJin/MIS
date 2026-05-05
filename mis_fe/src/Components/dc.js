import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import axios from "axios";
import "../cssFiles/pageCommon.css"; // Reuse premium UI styles

export default function Dc() {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [dcRev1, setDcRev1] = useState([]);
    const [dcRev2, setDcRev2] = useState([]);
    const [dcRev3, setDcRev3] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Headers
    const [dcRevH1, setDcRevH1] = useState([]);
    const [dcRevH2, setDcRevH2] = useState([]);
    const [dcRevH3, setDcRevH3] = useState([]);
    const [show, setShow] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(baseUrl + "/cm_dc_revision", {});
            setDcRev1(response.data[0] || []);
            setDcRev2(response.data[1] || []);
            setDcRev3(response.data[2] || []);
            setDcRevH1(response.data[3] || []);
            setDcRevH2(response.data[4] || []);
            setDcRevH3(response.data[5] || []);
            setShow(true);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    return (
        <div style={{ padding: "0 10px" }}>
            {isLoading && (
                <div className="pc-loading-overlay">
                    <div className="pc-loading-box">
                        <div className="pc-spinner"></div>
                        <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "14px", fontFamily: "Inter" }}>Loading Revisions</div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>Processing DC data...</div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="pc-hero">
                <div className="pc-hero-inner">
                    <div className="pc-hero-icon"><i className="pi pi-table" style={{ color: "#84cc16", fontSize: "20px" }}></i></div>
                    <div className="pc-hero-text">
                        <div className="pc-hero-badge" style={{ borderColor: "rgba(132,204,22,0.5)", color: "#bef264" }}>Declared Capacity</div>
                        <h1 className="pc-hero-title">DC Revision Analysis</h1>
                        <p className="pc-hero-sub">Upward and downward capacity revision logs</p>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <Button label="Fetch Latest Data" icon="pi pi-database" className="pc-btn-primary" onClick={fetchData} />
                    </div>
                </div>
            </div>

            {show && (
                <div className="grid">
                    {/* Total Revisions Table */}
                    <div className="col-12" style={{ padding: "10px" }}>
                        <div className="pc-section h-full">
                            <div className="pc-section-head">
                                <div className="pc-section-pill" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}><i className="pi pi-list"></i></div>
                                <span className="pc-section-title">Total Revisions</span>
                            </div>
                            <div className="pc-section-body p-0">
                                <DataTable value={dcRev3} stripedRows showGridlines size="small"
                                    className="p-datatable-sm" emptyMessage="No revisions found.">
                                    {dcRevH3.map((e, idx) => (
                                        <Column key={idx} field={e} header={e} align="center" style={{ minWidth: "120px" }} />
                                    ))}
                                </DataTable>
                            </div>
                        </div>
                    </div>

                    {/* Downward Revisions Table */}
                    <div className="col-12 md:col-6" style={{ padding: "10px" }}>
                        <div className="pc-section h-full">
                            <div className="pc-section-head">
                                <div className="pc-section-pill" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}><i className="pi pi-arrow-down"></i></div>
                                <span className="pc-section-title">Downward Revisions</span>
                            </div>
                            <div className="pc-section-body p-0">
                                <DataTable value={dcRev1} stripedRows showGridlines size="small"
                                    className="p-datatable-sm" emptyMessage="No downward revisions.">
                                    {dcRevH1.map((e, idx) => (
                                        <Column key={idx} field={e} header={e} align="center" style={{ minWidth: "120px" }} />
                                    ))}
                                </DataTable>
                            </div>
                        </div>
                    </div>

                    {/* Upward Revisions Table */}
                    <div className="col-12 md:col-6" style={{ padding: "10px" }}>
                        <div className="pc-section h-full">
                            <div className="pc-section-head">
                                <div className="pc-section-pill" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}><i className="pi pi-arrow-up"></i></div>
                                <span className="pc-section-title">Upward Revisions</span>
                            </div>
                            <div className="pc-section-body p-0">
                                <DataTable value={dcRev2} stripedRows showGridlines size="small"
                                    className="p-datatable-sm" emptyMessage="No upward revisions.">
                                    {dcRevH2.map((e, idx) => (
                                        <Column key={idx} field={e} header={e} align="center" style={{ minWidth: "120px" }} />
                                    ))}
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
