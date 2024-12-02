import React, { useState, useRef, useEffect } from "react";
import "../cssFiles/Animation.css";
import { TabView, TabPanel } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
// import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import axios from "axios";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Divider } from "primereact/divider";
// import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { FloatLabel } from "primereact/floatlabel";
import { DownloadTableExcel } from "react-export-table-to-excel";

export default function Outage() {
	const report_table = useRef(null);
	const dt = useRef(null);
	const [date, setDate] = useState([]);
	const [reportdate, setreportdate] = useState(null);
	const [reportdate1, setreportdate1] = useState(null);
	const [showreportbutton, setshowreportbutton] = useState(false);

	const dummy = {
		Planned: {
			Revived: [],
			Out: [],
		},
		Forced: {
			Revived: [],
			Out: [],
		},
		Shortage: {
			Revived: [],
			Out: [],
		},
	};

	const [reportcoaldata, setreportcoaldata] = useState(dummy);
	const [reporthydrodata, setreporthydrodata] = useState(dummy);
	const [reportnucleardata, setreportnucleardata] = useState(dummy);
	const [data, setdata] = useState();
	const [coaldata, setcoaldata] = useState([]);
	const [hydrodata, sethydrodata] = useState([]);
	const [nucleardata, setnucleardata] = useState([]);
	const [showreport, setshowreport] = useState(false);
	const toast = useRef();
	let today = new Date();
	today.setDate(today.getDate() - 1);


	useEffect(() => {
		if (reportdate) {
			var r_date = [];
			r_date.push(moment(reportdate).format("DD-MM-YYYY"));
			r_date.push(moment(reportdate).format("DD-MM-YYYY"));
			setreportdate1(moment(reportdate).format("DD-MM-YYYY"))

			axios
				.post("http://10.3.200.63:5010/outage?daterange=" + r_date, {})
				.then((response) => {
					// console.log(response.data);
					setreportcoaldata(response.data.COAL[1]);
					setreporthydrodata(response.data.HYDRO[1]);
					setreportnucleardata(response.data.NUCLEAR[1]);
					setshowreportbutton(true);
				})
				.catch((error) => {});
		}
	}, [reportdate]);

	const generate_report = () => {
		if (date) {
			var date_range = [];
			if (date[1] === null) {
				date_range.push(moment(date[0]).format("DD-MM-YYYY"));
				date_range.push(moment(date[0]).format("DD-MM-YYYY"));
			} else {
				date_range.push(moment(date[0]).format("DD-MM-YYYY"));
				date_range.push(moment(date[1]).format("DD-MM-YYYY"));
			}

			axios
				.post("http://10.3.200.63:5010/outage?daterange=" + date_range, {})
				.then((response) => {
					setdata(response.data);
					setcoaldata(response.data.COAL[0]);
					sethydrodata(response.data.HYDRO[0]);
					setnucleardata(response.data.NUCLEAR[0]);
					setshowreport(true);
				})
				.catch((error) => {});
		}
	};

	const DateBodyTemplate = (rowData) => {
		return (
			<div className="flex align-items-center gap-2">
				<span className="font-bold">{rowData.Date}</span>
			</div>
		);
	};

	const rowClassName = (data) =>
		Number(data.Date.split("-")[0]) % 2 === 0 ? "p-rowgroup" : "p-rowgroup1";

	const headerGroup = (
		<ColumnGroup>
			<Row>
				<Column header="Annexure-1" colSpan={8} />
			</Row>
			<Row>
				<Column
					header={"Unit-wise revival/outage details as on 00:00Hrs of Current Day ("+reportdate1+")"}
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="1. Coal Based" colSpan={8} />
			</Row>
			<Row>
				<Column header="A. Planned" colSpan={8} align="left" />
			</Row>
			<Row>
				<Column header="A.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);

	const headerGroup1 = (
		<ColumnGroup>
			<Row>
				<Column
					header="A.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date " colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup2 = (
		<ColumnGroup>
			<Row>
				<Column header="B. Forced" colSpan={8} />
			</Row>
			<Row>
				<Column header="B.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup3 = (
		<ColumnGroup>
			<Row>
				<Column
					header="B.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup4 = (
		<ColumnGroup>
			<Row>
				<Column header="C. Coal Shortage" colSpan={8} />
			</Row>
			<Row>
				<Column header="C.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup5 = (
		<ColumnGroup>
			<Row>
				<Column
					header="C.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup6 = (
		<ColumnGroup>
			<Row>
				<Column header="D. Commercial/PPA issue" colSpan={8} />
			</Row>
			<Row>
				<Column header="D.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup7 = (
		<ColumnGroup>
			<Row>
				<Column
					header="D.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup8 = (
		<ColumnGroup>
			<Row>
				<Column header="2. Hydro" colSpan={8} />
			</Row>
			<Row>
				<Column header="A. Planned" colSpan={8} />
			</Row>
			<Row>
				<Column header="A.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup9 = (
		<ColumnGroup>
			<Row>
				<Column
					header="A.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup10 = (
		<ColumnGroup>
			<Row>
				<Column header="B. Forced" colSpan={8} />
			</Row>
			<Row>
				<Column header="B.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup11 = (
		<ColumnGroup>
			<Row>
				<Column
					header="B.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup12 = (
		<ColumnGroup>
			<Row>
				<Column header="3. Nuclear" colSpan={8} />
			</Row>
			<Row>
				<Column header="A. Planned" colSpan={8} />
			</Row>
			<Row>
				<Column header="A.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup13 = (
		<ColumnGroup>
			<Row>
				<Column
					header="A.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup14 = (
		<ColumnGroup>
			<Row>
				<Column header="B. Forced" colSpan={8} />
			</Row>
			<Row>
				<Column header="B.1 Revived capacity (Previous Day)" colSpan={8} />
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Revival date" colSpan={1} />
				<Column header="Remark" colSpan={1} />
			</Row>
		</ColumnGroup>
	);
	const headerGroup15 = (
		<ColumnGroup>
			<Row>
				<Column
					header="B.2 Capacity under outage (as on 00:00hrs of Current Day)"
					colSpan={8}
				/>
			</Row>
			<Row>
				<Column header="S.No" colSpan={1} />
				<Column header="Plant Name" colSpan={1} />
				<Column header="Unit No" colSpan={1} />
				<Column header="Capacity" colSpan={1} />
				<Column header="State/ Utility" colSpan={1} />
				<Column header="Reason for outage" colSpan={1} />
				<Column header="Outage date" colSpan={1} />
				<Column header="Expected Revival" colSpan={1} />
			</Row>
		</ColumnGroup>
	);


	return (
		<>
			<Toast ref={toast} />
			<Divider align="left">
				<span
					className="p-tag"
					style={{
						// backgroundColor: "#4bf0a5",
						fontSize: "large",
						// color: "#000000",
					}}
				>
					Outage Report
				</span>
			</Divider>

			<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
			<div className="field"></div>
				<div className="field">
					<span className="p-float-label">
						Date Range:{" "}
						<Calendar
							placeholder="Select Date Range"
							dateFormat="dd/mm/yy"
							value={date}
							onChange={(e) => setDate(e.value)}
							showIcon
							selectionMode="range"
							readOnlyInput
						/>
					</span>
				</div>
				<div className="field">
					<Button
						severity="danger"
						size="small"
						rounded
						raised
						// style={{ backgroundColor: "#46bf0a5", color: "#000000" }}
						label="Generate Table"
						onClick={() => {
							generate_report();
						}}
					/>
				</div>
				<Divider layout="vertical">
					<div className="inline-flex align-items-center">
						<b>Report</b>
						<i className="pi pi-arrow-right"></i>
					</div>
				</Divider>
				<div className="field">

					<FloatLabel>
						<Calendar
							showIcon
							inputId="report_date"
							value={reportdate}
							onChange={(e) => setreportdate(e.value)}
							maxDate={today}
							dateFormat="dd/mm/yy"
						/>
						<label htmlFor="report_date">Report Date</label>
					</FloatLabel>
					{/* </span> */}
				</div>
				<div className="field" hidden={!showreportbutton}>
					<DownloadTableExcel
						filename={"Outage Report:" + moment(reportdate).format("DD/MM/YY")}
						sheet="Reports"
						currentTableRef={report_table.current}
					>
						<Button
							style={{ backgroundColor: "#67cd4d", color: "white" }}
							icon="pi pi-download"
							rounded
							outlined
							// text
							raised
							// severity="secondary"
							// aria-label="Bookmark"
						/>
					</DownloadTableExcel>{" "}
				</div>
				<div className="field"></div>
				<div className="field"></div>
				<div className="field"></div>
			</div>
			

			<div hidden={!showreport}>
				<Divider align="center">
					<span className="p-tag">Outage Report</span>
				</Divider>

				<TabView>
					<TabPanel header="Coal Report" leftIcon="pi pi-bolt mr-2">
						<div className="card">
							<DataTable
								size="small"
								value={coaldata}
								rows={10}
								scrollable
								scrollHeight="830px"
								paginator
								rowsPerPageOptions={[10, 15, 20, coaldata.length]}
								paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
								currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Elements"
								rowGroupMode="rowspan"
								groupRowsBy="Date"
								sortMode="single"
								sortField="Date"
								sortOrder={1}
								tableStyle={{ minWidth: "50rem" }}
								showGridlines
								rowClassName={rowClassName}
							>
								<Column
									header="#"
									headerStyle={{ width: "3rem" }}
									body={(data, options) => options.rowIndex + 1}
									frozen
									headerClassName="p-outagehead"
								></Column>

								{data
									? Object.keys(coaldata[0]).map((e) =>
											e === "Date" ? (
												<Column
													field="Date"
													header="Date"
													body={DateBodyTemplate}
													style={{ minWidth: "130px" }}
													frozen
													headerClassName="p-outagehead"
												></Column>
											) : (
												<Column
													headerClassName="p-outagehead"
													field={e}
													header={e.split("_").join(" ")}
													style={{ minWidth: "125px", whiteSpace: "pre-wrap" }}
												></Column>
											)
									  )
									: console.log("hi")}
							</DataTable>
						</div>
					</TabPanel>
					<TabPanel header="Hydro Report" leftIcon="pi pi-sliders-v ml-2">
						<div className="card">
							<DataTable
								size="small"
								value={hydrodata}
								rows={10}
								scrollable
								scrollHeight="830px"
								paginator
								rowsPerPageOptions={[10, 15, 20, coaldata.length]}
								paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
								currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Elements"
								rowGroupMode="rowspan"
								groupRowsBy="Date"
								sortMode="single"
								sortField="Date"
								sortOrder={1}
								tableStyle={{ minWidth: "50rem" }}
								showGridlines
								rowClassName={rowClassName}
							>
								<Column
									header="#"
									headerStyle={{ width: "3rem" }}
									body={(data, options) => options.rowIndex + 1}
									headerClassName="p-outagehead"
								></Column>

								{data
									? Object.keys(hydrodata[0]).map((e) =>
											e === "Date" ? (
												<Column
													field="Date"
													header="Date"
													body={DateBodyTemplate}
													style={{ minWidth: "130px" }}
													headerClassName="p-outagehead"
												></Column>
											) : (
												<Column
													field={e}
													header={e.split("_").join(" ")}
													style={{ minWidth: "125px", whiteSpace: "pre-wrap" }}
													headerClassName="p-outagehead"
												></Column>
											)
									  )
									: console.log("hi")}
							</DataTable>
						</div>
					</TabPanel>
					<TabPanel
						header="Nuclear Report"
						leftIcon="pi pi-exclamation-triangle mr-2"
					></TabPanel>
				</TabView>
			</div>

			<div ref={report_table} hidden={true} id="table">
				<DataTable
					headerColumnGroup={headerGroup}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportcoaldata.Planned.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>
				<DataTable
					headerColumnGroup={headerGroup1}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportcoaldata.Planned.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup2}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportcoaldata.Forced.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup3}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportcoaldata.Forced.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>
				<DataTable
					headerColumnGroup={headerGroup4}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportcoaldata.Shortage.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup5}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportcoaldata.Shortage.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup6}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportnucleardata.Forced.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup7}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportnucleardata.Forced.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup8}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reporthydrodata.Planned.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup9}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reporthydrodata.Planned.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup10}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reporthydrodata.Forced.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup11}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reporthydrodata.Forced.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup12}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportnucleardata.Planned.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup13}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportnucleardata.Planned.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup14}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportnucleardata.Forced.Revived}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Revival date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Remark"
					/>
				</DataTable>

				<DataTable
					headerColumnGroup={headerGroup15}
					ref={dt}
					// header={header}
					// hidden={!show_coal_table}
					value={reportnucleardata.Forced.Out}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
				>
					<Column
						header="S.No"
						headerStyle={{ width: "3rem" }}
						body={(data, options) => options.rowIndex + 1}
						frozen
						headerClassName="p-outagehead"
					></Column>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="ELEMENT_NAME"
						header="Plant Name"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="UNIT_NUMBER"
						header="Unit No"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="INSTALLED_CAPACITY"
						header="Capacity"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="LOCATION"
						header="State/ Utility"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUT_REASON"
						header="Reason for outage"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="OUTAGE_DATE"
						header="Outage date"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						field="EXPECTED_REVIVAL_DATE"
						header="Expected Revival"
					/>
				</DataTable>
			</div>
		</>
	);
}
