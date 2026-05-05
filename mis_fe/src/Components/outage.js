import React, { useState, useRef, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import axios from "axios";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Toast } from "primereact/toast";
import { DownloadTableExcel } from "react-export-table-to-excel";
import "../cssFiles/pageCommon.css"; // The shared premium CSS

export default function Outage() {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const report_table = useRef(null);
    const dt = useRef(null);
    const [date, setDate] = useState([]);
    const [reportdate, setreportdate] = useState(null);
    const [reportdate1, setreportdate1] = useState(null);
    const [showreportbutton, setshowreportbutton] = useState(false);

    const dummy = { Planned: { Revived: [], Out: [] }, Forced: { Revived: [], Out: [] }, Shortage: { Revived: [], Out: [] } };
    const [reportcoaldata, setreportcoaldata] = useState(dummy);
    const [reporthydrodata, setreporthydrodata] = useState(dummy);
    const [reportnucleardata, setreportnucleardata] = useState(dummy);
    
    const [data, setdata] = useState();
    const [coaldata, setcoaldata] = useState([]);
    const [hydrodata, sethydrodata] = useState([]);
    const [nucleardata, setnucleardata] = useState([]);
    
    const [showreport, setshowreport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useRef();

    let today = new Date();
    today.setDate(today.getDate() - 1);

    useEffect(() => {
        if (reportdate) {
            setIsLoading(true);
            const r_date = [moment(reportdate).format("DD-MM-YYYY"), moment(reportdate).format("DD-MM-YYYY")];
            setreportdate1(moment(reportdate).format("DD-MM-YYYY"));

            axios.post(baseUrl + "/outage?daterange=" + r_date, {})
                .then((response) => {
                    setreportcoaldata(response.data.COAL[1] || dummy);
                    setreporthydrodata(response.data.HYDRO[1] || dummy);
                    setreportnucleardata(response.data.NUCLEAR[1] || dummy);
                    setshowreportbutton(true);
                    setIsLoading(false);
                })
                .catch(() => { setIsLoading(false); });
        }
    }, [reportdate]);

    const generate_report = () => {
        if (date && date[0]) {
            setIsLoading(true);
            const date_range = [];
            date_range.push(moment(date[0]).format("DD-MM-YYYY"));
            date_range.push(moment(date[1] || date[0]).format("DD-MM-YYYY"));

            axios.post(baseUrl + "/outage?daterange=" + date_range, {})
                .then((response) => {
                    setdata(response.data);
                    setcoaldata(response.data.COAL[0] || []);
                    sethydrodata(response.data.HYDRO[0] || []);
                    setnucleardata(response.data.NUCLEAR[0] || []);
                    setshowreport(true);
                    setIsLoading(false);
                })
                .catch(() => { setIsLoading(false); });
        }
    };

    const rowClassName = (data) => Number((data.Date || "0").split("-")[0]) % 2 === 0 ? "pc-row-even" : "pc-row-odd";

    const commonCols = [
        { field: "ELEMENT_NAME", header: "Plant Name" },
        { field: "UNIT_NUMBER", header: "Unit No" },
        { field: "INSTALLED_CAPACITY", header: "Capacity" },
        { field: "LOCATION", header: "State/ Utility" },
        { field: "OUT_REASON", header: "Reason for outage" }
    ];

    const renderDataTable = (val, cols, extraHeader1, extraHeader2) => (
        <DataTable value={val} stripedRows showGridlines size="small" className="pc-datatable-premium"
                   emptyMessage="No Outage Records Found">
            <Column header="#" headerStyle={{ width: "3rem" }} body={(data, options) => options.rowIndex + 1} frozen headerClassName="pc-table-header" />
            {cols.map(c => <Column key={c.field} bodyStyle={{ textAlign: "left" }} field={c.field} header={c.header} headerClassName="pc-table-header" />)}
            <Column bodyStyle={{ textAlign: "left" }} field={extraHeader1.field} header={extraHeader1.header} headerClassName="pc-table-header" />
            <Column bodyStyle={{ textAlign: "left" }} field={extraHeader2.field} header={extraHeader2.header} headerClassName="pc-table-header" />
        </DataTable>
    );

    return (
        <div style={{ padding: "0 10px" }}>
            <Toast ref={toast} />
            {isLoading && (
                <div className="pc-loading-overlay">
                    <div className="pc-loading-box">
                        <div className="pc-spinner"></div>
                        <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "14px", fontFamily: "Inter" }}>Loading Outages</div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>Fetching records...</div>
                    </div>
                </div>
            )}

            {/* HERO HEADER */}
            <div className="pc-hero">
                <div className="pc-hero-inner">
                    <div className="pc-hero-icon"><i className="pi pi-filter-slash" style={{ color: "#f43f5e", fontSize: "20px" }}></i></div>
                    <div className="pc-hero-text">
                        <div className="pc-hero-badge" style={{ borderColor: "rgba(244,63,94,0.5)", color: "#fda4af" }}>System Status</div>
                        <h1 className="pc-hero-title">Grid Outage Report</h1>
                        <p className="pc-hero-sub">Daily status of planned and forced generation unit outages</p>
                    </div>
                </div>
            </div>

            <div className="pc-section">
                <div className="pc-section-head">
                    <div className="pc-section-pill" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e" }}><i className="pi pi-calendar"></i></div>
                    <span className="pc-section-title">Query Configuration</span>
                </div>
                <div className="pc-section-body p-fluid grid formgrid align-items-end">
                    
                    {/* Range Selection */}
                    <div className="field col-12 md:col-5">
                        <label className="pc-label"><i className="pi pi-calendar-plus"></i> Date Range Query</label>
                        <div className="modern-cal-wrapper">
                            <Calendar selectionMode="range" readOnlyInput hideOnRangeSelection placeholder="Select Range"
                                dateFormat="dd-M-yy" value={date} onChange={(e) => {
                                    const val = e.value || [];
                                    const newRange = [...val];
                                    if (newRange[0] && (!date || !date[0] || newRange[0].toDateString() !== date[0].toDateString())) {
                                        newRange[0] = new Date(newRange[0]);
                                        newRange[0].setHours(0, 0, 0, 0);
                                    }
                                    if (newRange[1] && (!date || !date[1] || newRange[1].toDateString() !== date[1].toDateString())) {
                                        newRange[1] = new Date(newRange[1]);
                                        newRange[1].setHours(23, 59, 0, 0);
                                    }
                                    setDate(newRange);
                                }}
                                showIcon className="w-full" showButtonBar />
                        </div>
                    </div>
                    <div className="field col-12 md:col-2">
                        <Button label="Execute Query" icon="pi pi-bolt" className="pc-btn-primary w-full" onClick={generate_report} disabled={!date || date.length===0} />
                    </div>

                    <div className="col-12 md:col-1 flex justify-content-center">
                        <div style={{ width: "1px", height: "100%", background: "var(--pc-border)" }}></div>
                    </div>

                    {/* Report Selection */}
                    <div className="field col-12 md:col-3">
                        <label className="pc-label"><i className="pi pi-file-export"></i> Detailed Report Date</label>
                        <div className="modern-cal-wrapper">
                            <Calendar inputId="report_date" value={reportdate} onChange={(e) => setreportdate(e.value)}
                                maxDate={today} dateFormat="dd-M-yy" showIcon className="w-full" placeholder="Select Single Date" />
                        </div>
                    </div>
                    <div className="field col-12 md:col-1">
                        {showreportbutton && (
                            <DownloadTableExcel filename={"Outage_Report_" + moment(reportdate).format("DD_MMM_YY")} sheet="Reports" currentTableRef={report_table.current}>
                                <Button icon="pi pi-file-excel" className="pc-btn-excel w-full h-full" tooltip="Export to Excel" />
                            </DownloadTableExcel>
                        )}
                    </div>
                </div>
            </div>

            {showreport && (
                <div className="pc-section mt-4 animate-fade-in">
                    <TabView className="pc-premium-tabview">
                        <TabPanel header="Coal Report" leftIcon="pi pi-bolt mr-2 text-yellow-500">
                            <DataTable className="pc-datatable-premium" size="small" value={coaldata} rows={10} scrollable scrollHeight="600px" paginator
                                rowsPerPageOptions={[10, 20, 50]} rowGroupMode="rowspan" groupRowsBy="Date" sortMode="single" sortField="Date" sortOrder={1} 
                                showGridlines rowClassName={rowClassName}>
                                <Column header="#" headerStyle={{ width: "3rem" }} body={(data, options) => options.rowIndex + 1} frozen headerClassName="pc-table-header" />
                                {data && Object.keys(coaldata[0] || {}).map(e => (
                                    <Column key={e} field={e} header={e.replace(/_/g, " ")} style={{ minWidth: e==="Date"?"130px":"125px", whiteSpace: "pre-wrap" }} 
                                            frozen={e==="Date"} headerClassName="pc-table-header" body={e==="Date" ? (r)=>(<span className="font-bold">{r.Date}</span>) : null} />
                                ))}
                            </DataTable>
                        </TabPanel>
                        <TabPanel header="Hydro Report" leftIcon="pi pi-sliders-v ml-2 text-cyan-400">
                            <DataTable className="pc-datatable-premium" size="small" value={hydrodata} rows={10} scrollable scrollHeight="600px" paginator
                                rowsPerPageOptions={[10, 20, 50]} rowGroupMode="rowspan" groupRowsBy="Date" sortMode="single" sortField="Date" sortOrder={1} 
                                showGridlines rowClassName={rowClassName}>
                                <Column header="#" headerStyle={{ width: "3rem" }} body={(data, options) => options.rowIndex + 1} frozen headerClassName="pc-table-header" />
                                {data && Object.keys(hydrodata[0] || {}).map(e => (
                                    <Column key={e} field={e} header={e.replace(/_/g, " ")} style={{ minWidth: e==="Date"?"130px":"125px", whiteSpace: "pre-wrap" }} 
                                            frozen={e==="Date"} headerClassName="pc-table-header" body={e==="Date" ? (r)=>(<span className="font-bold">{r.Date}</span>) : null} />
                                ))}
                            </DataTable>
                        </TabPanel>
                        <TabPanel header="Nuclear Report" leftIcon="pi pi-exclamation-triangle mr-2 text-orange-400">
                            <DataTable className="pc-datatable-premium" size="small" value={nucleardata} rows={10} scrollable scrollHeight="600px" paginator
                                rowsPerPageOptions={[10, 20, 50]} rowGroupMode="rowspan" groupRowsBy="Date" sortMode="single" sortField="Date" sortOrder={1} 
                                showGridlines rowClassName={rowClassName}>
                                <Column header="#" headerStyle={{ width: "3rem" }} body={(data, options) => options.rowIndex + 1} frozen headerClassName="pc-table-header" />
                                {data && Object.keys(nucleardata[0] || {}).map(e => (
                                    <Column key={e} field={e} header={e.replace(/_/g, " ")} style={{ minWidth: e==="Date"?"130px":"125px", whiteSpace: "pre-wrap" }} 
                                            frozen={e==="Date"} headerClassName="pc-table-header" body={e==="Date" ? (r)=>(<span className="font-bold">{r.Date}</span>) : null} />
                                ))}
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            )}

            {/* Hidden Export Table */}
            <div ref={report_table} style={{display:'none'}} id="table">
                <table>
                    <thead>
                        <tr><th colSpan="8">Annexure-1</th></tr>
                        <tr><th colSpan="8">{"Unit-wise revival/outage details as on 00:00Hrs of Current Day ("+reportdate1+")"}</th></tr>
                        <tr><th colSpan="8">1. Coal Based</th></tr>
                        <tr><th colSpan="8" style={{textAlign:'left'}}>A. Planned</th></tr>
                        <tr><th colSpan="8">A.1 Revived capacity (Previous Day)</th></tr>
                    </thead>
                </table>
                {renderDataTable(reportcoaldata.Planned.Revived, commonCols, {field:"EXPECTED_REVIVAL_DATE", header:"Revival date"}, {field:"OUTAGE_DATE", header:"Remark"})}
                
                <table><thead><tr><th colSpan="8">A.2 Capacity under outage (as on 00:00hrs of Current Day)</th></tr></thead></table>
                {renderDataTable(reportcoaldata.Planned.Out, commonCols, {field:"OUTAGE_DATE", header:"Outage date"}, {field:"EXPECTED_REVIVAL_DATE", header:"Expected Revival"})}

                <table><thead><tr><th colSpan="8">B. Forced</th></tr><tr><th colSpan="8">B.1 Revived capacity (Previous Day)</th></tr></thead></table>
                {renderDataTable(reportcoaldata.Forced.Revived, commonCols, {field:"EXPECTED_REVIVAL_DATE", header:"Revival date"}, {field:"OUTAGE_DATE", header:"Remark"})}

                <table><thead><tr><th colSpan="8">B.2 Capacity under outage (as on 00:00hrs of Current Day)</th></tr></thead></table>
                {renderDataTable(reportcoaldata.Forced.Out, commonCols, {field:"OUTAGE_DATE", header:"Outage date"}, {field:"EXPECTED_REVIVAL_DATE", header:"Expected Revival"})}
            </div>
        </div>
    );
}
