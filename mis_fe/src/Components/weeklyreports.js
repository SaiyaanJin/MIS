import React, { useState, useEffect, useRef } from "react";
import "../cssFiles/Animation.css";
import { TabView, TabPanel } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import axios from "axios";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useTheme } from "../context/ThemeContext";

const weeklyStyles = `
@keyframes weekly-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes weekly-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  70%  { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}

.weekly-hero {
  overflow: hidden;
  border-radius: 12px;
  padding: 16px 22px;
  margin-bottom: 0;
  background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 45%, #ef4444 100%);
  box-shadow: 0 12px 28px -8px rgba(239,68,68,0.40);
  animation: weekly-fade-up 0.5s cubic-bezier(.16,1,.3,1) both;
}
.weekly-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.8;
}
.weekly-hero-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  animation: weekly-pulse-ring 2.4s ease-in-out infinite;
  flex-shrink: 0;
}
.weekly-hero-badge {
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
.weekly-section-accent {
  border-left: 3px solid #ef4444 !important;
}
.weekly-ctrl-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1.5px solid rgba(239,68,68,0.2);
  box-shadow: 0 8px 32px -4px rgba(0,0,0,0.06);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}
.weekly-ctrl-card:hover {
  border-color: rgba(239,68,68,0.45);
  box-shadow: 0 8px 32px -4px rgba(0,0,0,0.1), 0 0 0 3px rgba(239,68,68,0.07);
}
.dark-mode .weekly-section-accent {
  border-left: 3px solid #ef4444 !important;
}
.weekly-ctrl-card {
  background: rgba(15,23,42,0.6);
  border-borderColor: rgba(255,255,255,0.08);
}
.weekly-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
}
.dark-mode .weekly-input-group {
  background: #1e293b;
  border-color: #334155;
}
.weekly-input-group:focus-within {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.1);
}
.dark-mode .weekly-input-group:focus-within {
  background: #0f172a;
}
.weekly-title {
  font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0;
}
.weekly-subtitle {
  font-size: 0.85rem; color: rgba(255,255,255,0.8); margin: 0;
}
.p-head {
  background: #ecfdf5 !important;
  color: #065f46 !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.025em;
}
.p-head1 {
  background: #f0fdf4 !important;
  color: #047857 !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.7rem;
}
.dark-mode .p-head {
  background: #064e3b !important;
  color: #ffffff !important;
}
.dark-mode .p-head1 {
  background: #065f46 !important;
  color: #d1fae5 !important;
}
.weekly-tabview .p-tabview-nav {
  background: transparent !important;
  border: none !important;
  gap: 8px;
  margin-bottom: 20px;
}
.weekly-tabview .p-tabview-nav li .p-tabview-nav-link {
  border-radius: 10px !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
}
.weekly-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
  background: #ecfdf5 !important;
  border-color: #10b981 !important;
  color: #059669 !important;
}
.dark-mode .weekly-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
  background: #064e3b !important;
  border-color: #34d399 !important;
  color: #ffffff !important;
}
`;

export default function WeeklyReports() {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const report_table = useRef(null);
	const [date, setDate] = useState([]);
	const [freq_data, setfreq_data] = useState();
	const [freq_data_footer, setfreq_data_footer] = useState([]);
	const [show_freq_table, setshow_freq_table] = useState(false);
	const [show_volt_table, setshow_volt_table] = useState(false);
	const [volt_data_400, setvolt_data_400] = useState([]);
	const [volt_data_765, setvolt_data_765] = useState([]);
	const [elements_breakdown, setelements_breakdown] = useState([]);
	const [show_element_table, setshow_element_table] = useState(false);
	const [gen_breakdown, setgen_breakdown] = useState([]);
	const [show_gen_table, setshow_gen_table] = useState(false);
	const [line_tripping, setline_tripping] = useState([]);
	const [show_line_table, setshow_line_table] = useState(false);
	const [nc_iegc, setnc_iegc] = useState([]);
	const [show_iegc_table, setshow_iegc_table] = useState(false);
	const dt = useRef(null);
	const items = Array.from({ length: 7 }, (v, i) => i);
	const [show_freq_skeleton, setshow_freq_skeleton] = useState(false);
	const [show_volt_skeleton, setshow_volt_skeleton] = useState(false);
	const [show_gen_skeleton, setshow_gen_skeleton] = useState(false);
	const [show_line_skeleton, setshow_line_skeleton] = useState(false);
	const [show_element_skeleton, setshow_element_skeleton] = useState(false);
	const [show_iegc_skeleton, setshow_iegc_skeleton] = useState(false);
	const [show_report, setshow_report] = useState(false);
	const [value, setValue] = useState(0);
	const toast = useRef();
	const interval = useRef(null);

	const cols = [
		{ field: "Date_Val", header: "Date" },
		{ field: "Max", header: "Maximum (Hz)" },
		{ field: "Max_Time", header: "time" },
		{ field: "Min", header: "Minimum" },
		{ field: "Min_Time", header: "time" },
		{ field: "Avg", header: "Average" },
		{
			field: "FDI_Time",
			header: "FDI (%in time)",
		},
		{ field: "FDI_Hour", header: "in Hours" },
		{ field: "49.9", header: "< 49.9" },
		{ field: "Band", header: ">= 49.9 - <=50.05" },
		{ field: "50.05", header: "> 50.05" },
	];

	useEffect(() => {
		let _val = value;

		interval.current = setInterval(() => {
			_val += Math.floor(Math.random() * 10) + 1;

			if (_val >= 100) {
				_val = 100;

				clearInterval(interval.current);
			}

			setValue(_val);
		}, 2000);

		return () => {
			if (interval.current) {
				clearInterval(interval.current);
				interval.current = null;
			}
		};
	}, []);

	const generate_report = (type) => {
		var date_range = [];
		if (date[1] === null) {
			date_range.push(moment(date[0]).format("DD-MM-YYYY"));
			date_range.push(moment(date[0]).format("DD-MM-YYYY"));
		} else {
			date_range.push(moment(date[0]).format("DD-MM-YYYY"));
			date_range.push(moment(date[1]).format("DD-MM-YYYY"));
		}

		setshow_freq_table(false);
		setshow_volt_table(false);
		setshow_element_table(false);
		setshow_gen_table(false);
		setshow_line_table(false);
		setshow_iegc_table(false);

		if (date && type) {
			axios
				.post(
					baseUrl + "/reports?date_val=" +
						date_range +
						"&category=" +
						type,
					{}
				)
				.then((response) => {
					if (response.data[0] === "frequency") {
						setfreq_data(response.data[1]);
						setfreq_data_footer(response.data[2][0]);
						setshow_freq_table(true);
						setshow_freq_skeleton(false);
					}
					if (response.data[0] === "Voltage") {
						
						setvolt_data_400(response.data[1]['400KV'])
						setvolt_data_765(response.data[1]['765KV'])
						console.log(response.data[1])
						setshow_volt_table(true);
						
						setshow_volt_skeleton(false);
					}
					if (response.data[0] === "ElementBreakdown") {
						setelements_breakdown(response.data[1]);
						setshow_element_table(true);
						setshow_element_skeleton(false);
					}

					if (response.data[0] === "GeneratorBreakdown") {
						setgen_breakdown(response.data[1]);
						setshow_gen_table(true);
						setshow_gen_skeleton(false);
					}
					if (response.data[0] === "LineTrippingReport") {
						setline_tripping(response.data[1]);
						setshow_line_table(true);
						setshow_line_skeleton(false);
					}
					if (response.data[0] === "NC_IEGC") {
						setnc_iegc(response.data[1]);
						setshow_iegc_table(true);
						setshow_iegc_skeleton(false);
					}
				})
				.catch((error) => {});
		}
	};

	const freq_headerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="दिनांक"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="अधिकतम/ Maximum"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="न्यूनतम/ Minimum"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="औसत"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="आवृत्ति विचलन सूचकांक (FDI)"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="आवृत्ति सीमा (% समय) (Frequency limit in % of time)"
					colSpan={3}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="Date"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="आवृत्ति (Hz)"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="समय (time)"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="आवृत्ति (Hz)"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="समय(time)"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="Average"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="% समय (%in time)"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="घंटे(in Hours)"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="< 49.9"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header=">= 49.9 - <=50.05"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="> 50.05"
					colSpan={1}
				/>
			</Row>
		</ColumnGroup>
	);

	const freq_footerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					align="center"
					style={{ minWidth: "10rem", maxWidth: "10rem" }}
					footer="साप्ताहिक मूल्य (Weekly Value):"
					colSpan={1}
					footerStyle={{ textAlign: "right" }}
				/>
				<Column align="center" colSpan={2} footer={freq_data_footer.Max_f} />
				<Column align="center" colSpan={2} footer={freq_data_footer.Min_f} />
				<Column align="center" colSpan={1} footer={freq_data_footer.Avg_f} />
				<Column align="center" colSpan={1} footer={freq_data_footer.v1} />
				<Column align="center" colSpan={1} footer={freq_data_footer.v2} />
				<Column align="center" colSpan={1} footer={freq_data_footer.v3} />
				<Column align="center" colSpan={1} footer={freq_data_footer.v4} />
				<Column align="center" colSpan={1} footer={freq_data_footer.v5} />
			</Row>
		</ColumnGroup>
	);

	const volt_headerGroup = (f) => {
		if (f[1]===3){
			var e= f[0]

			return (
				<ColumnGroup>
					<Row>
						<Column
							alignHeader="center"
							headerClassName="p-head"
							header="दिनांक"
							colSpan={1}
						/>
						<Column
							alignHeader="center"
							headerClassName="p-head1"
							header={e[0].Name}
							colSpan={3}
						/>
						<Column
							alignHeader="center"
							headerClassName="p-head"
							header={e[0].Name1}
							colSpan={3}
						/>
						<Column
							alignHeader="center"
							headerClassName="p-head1"
							header={e[0].Name2}
							colSpan={3}
						/>
					</Row>
					<Row>
						<Column
							style={{
								maxWidth: "5rem",
								minWidth: "5rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="Date"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="अधिकतम (Max)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="न्यूनतम (Min)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "12rem",
								minWidth: "12rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="वीडीआई (% समय) VDI (% in time)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="अधिकतम (Max)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="न्यूनतम (Min)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "12rem",
								minWidth: "12rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="वीडीआई (% समय) VDI (% in time)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="अधिकतम (Max)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="न्यूनतम (Min)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "12rem",
								minWidth: "12rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="वीडीआई (% समय) VDI (% in time)"
							colSpan={1}
						/>
					</Row>
				</ColumnGroup>
				);
		}
		if (f[1]===2){
			var e= f[0]

			return (
				<ColumnGroup>
					<Row>
						<Column
							alignHeader="center"
							headerClassName="p-head"
							header="दिनांक"
							colSpan={1}
						/>
						<Column
							alignHeader="center"
							headerClassName="p-head1"
							header={e[0].Name}
							colSpan={3}
						/>
						<Column
							alignHeader="center"
							headerClassName="p-head"
							header={e[0].Name1}
							colSpan={3}
						/>
						
					</Row>
					<Row>
						<Column
							style={{
								maxWidth: "5rem",
								minWidth: "5rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="Date"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="अधिकतम (Max)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="न्यूनतम (Min)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "12rem",
								minWidth: "12rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="वीडीआई (% समय) VDI (% in time)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="अधिकतम (Max)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="न्यूनतम (Min)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "12rem",
								minWidth: "12rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="वीडीआई (% समय) VDI (% in time)"
							colSpan={1}
						/>
						
					</Row>
				</ColumnGroup>
				);
		}
		if (f[1]===1){
			var e= f[0]

			return (
				<ColumnGroup>
					<Row>
						<Column
							alignHeader="center"
							headerClassName="p-head"
							header="दिनांक"
							colSpan={1}
						/>
						<Column
							alignHeader="center"
							headerClassName="p-head1"
							header={e[0].Name}
							colSpan={3}
						/>
						
					</Row>
					<Row>
						<Column
							style={{
								maxWidth: "5rem",
								minWidth: "5rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="Date"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="अधिकतम (Max)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "7rem",
								minWidth: "7rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head"
							header="न्यूनतम (Min)"
							colSpan={1}
						/>
						<Column
							style={{
								maxWidth: "12rem",
								minWidth: "12rem",
								wordBreak: "break-word",
							}}
							alignHeader="center"
							headerClassName="p-head1"
							header="वीडीआई (% समय) VDI (% in time)"
							colSpan={1}
						/>
						
					</Row>
				</ColumnGroup>
				);
		}
	};


	const generator_headerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="सप्ताह के दौरान मेजर जेनरेटर ट्रिप या पुनः सिंक्रनाइज़ किए गए/ Major generators tripped or re-synchronized during the week"
					colSpan={10}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="क्रम सं"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="स्टेशन"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="संस्था"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="यूनिट क्रमांक"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="क्षमता"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="आउटेज/Outage"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="वापसी / Restoration"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="कारण"
					colSpan={1}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="SL NO"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="Station"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="(Agency)"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="Unit No"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="MW"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="दिनांक / Date"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="समय / Time"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="दिनांक / Date"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="समय / Time"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="Reason"
					colSpan={1}
				/>
			</Row>
		</ColumnGroup>
	);

	const Lines_headerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="सप्ताह के दौरान ट्रांसमिशन तत्वो का  ट्रिप या पुनः सिंक्रनाइज़/ IMPORTANT TRANSMISSION ELEMENTS TRIPPED / RESTORED DURING THE WEEK"
					colSpan={7}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="क्रम सं"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="लाइन / आईसीटी"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="आउटेज/Outage"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="वापसी / Restoration"
					colSpan={2}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="कारण / टिप्पणी "
					colSpan={1}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="SL NO"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="LINE / ICT"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="दिनांक / Date"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="समय / Time"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="दिनांक / Date"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="समय / Time"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="REASON / REMARKS"
					colSpan={1}
				/>
			</Row>
		</ColumnGroup>
	);

	const element_headerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="मुख्य तत्वो की अनुपलब्धता (एक सप्ताह से अधिक)/IMPORTANT ELEMENTS ARE UNDER BREAKDOWN (MORE THAN 01 WEEK):-"
					colSpan={5}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="क्रम सं"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="स्टेशन"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="मालिक"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="आउटेज दिनांक"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="आउटेज का कारण"
					colSpan={1}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="SL NO"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="Station"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="OWNER"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="OUTAGE FROM DATE"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="REASONS FOR OUTAGE"
					colSpan={1}
				/>
			</Row>
		</ColumnGroup>
	);

	const iegc_headerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="आईईजीसी के व्यक्तिगत / संगणकीय गैर-अनुपालन के दृष्टांत /INSTANCES OF PERSISTENT/SIGNIFICANT NON-COMPLIANCE OF IEGC :"
					colSpan={9}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="भेजे गए संदेशों की संख्या/Number of Messages sent"
					colSpan={9}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="क्रम सं"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="नाम"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="विचलन/DEVIATION"
					colSpan={3}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="आवृत्ति उल्लंघन"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="वोल्टेज उल्लंघन"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="शक्ति का प्रवाह का उल्लंघन"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="कुल"
					colSpan={1}
				/>
			</Row>
			<Row>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="SL NO"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="Name"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="चेतावनी/ALERT"
					colSpan={1}
				/>

				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="आपातकालीन/ EMERGENCY"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="गैर-अनुपालन/NON-COMPLIANCE"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="FREQUENCY VIOLATION"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="VOLTAGE VIOLATION"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head1"
					header="LOADING VIOLATION"
					colSpan={1}
				/>
				<Column
					alignHeader="center"
					headerClassName="p-head"
					header="Total"
					colSpan={1}
				/>
			</Row>
		</ColumnGroup>
	);

	const v1 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.Alert;
		}
		return sum;
	};
	const v2 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.Emergency;
		}
		return sum;
	};
	const v3 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.NCompliance;
		}
		return sum;
	};
	const v4 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.FV;
		}
		return sum;
	};
	const v5 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.VV;
		}
		return sum;
	};
	const v6 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.LV;
		}
		return sum;
	};
	const v7 = () => {
		let sum = 0;
		for (let vals of nc_iegc) {
			sum = sum + vals.Total;
		}
		return sum;
	};

	const iegc_footerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					align="center"
					style={{ minWidth: "10rem", maxWidth: "10rem" }}
					footer="कुल / TOTAL:"
					colSpan={2}
					footerStyle={{ textAlign: "center" }}
				/>
				<Column align="center" colSpan={1} footer={v1()} />
				<Column align="center" colSpan={1} footer={v2()} />
				<Column align="center" colSpan={1} footer={v3()} />
				<Column align="center" colSpan={1} footer={v4()} />
				<Column align="center" colSpan={1} footer={v5()} />
				<Column align="center" colSpan={1} footer={v6()} />
				<Column align="center" colSpan={1} footer={v7()} />
			</Row>
		</ColumnGroup>
	);

	const volt_max = (e) => {
		let max = 0;

		for (let vals of e) {
			if (vals.Max[0] > max) {
				max = vals.Max[0];
			}
		}

		return max;
	};
	const volt_min = (e) => {
		let min = e[0].Min;

		for (let vals of e) {
			if (vals.Min < min) {
				min = vals.Min;
			}
		}

		return min;
	};

	const volt_sum = (e) => {
		let sum = 0;

		var i = 0;
		for (let vals of e) {
			i = i + 1;
			sum = sum + vals.VDI;
		}

		return (sum / i).toFixed(2);
	};

	const volt_max1 = (e) => {
		let max = 0;

		for (let vals of e) {
			if (vals.Max1[0] > max) {
				max = vals.Max1[0];
			}
		}

		return max;
	};
	const volt_min1 = (e) => {
		let min = e[0].Min1;

		for (let vals of e) {
			if (vals.Min1 < min) {
				min = vals.Min1;
			}
		}
		return min;
	};

	const volt_sum1 = (e) => {
		let sum = 0;

		var i = 0;
		for (let vals of e) {
			i = i + 1;
			sum = sum + vals.VDI1;
		}
		return (sum / i).toFixed(2);
	};

	const volt_max2 = (e) => {
		let max = 0;
		
		for (let vals of e) {
			if (vals.Max2[0] > max) {
				max = vals.Max2[0];
			}
		}

		return max;
	};
	const volt_min2 = (e) => {
		let min = e[0].Min2;

		for (let vals of e) {
			if (vals.Min2 < min) {
				min = vals.Min2;
			}
		}

		return min;
	};

	const volt_sum2 = (e) => {
		let sum = 0;

		var i = 0;
		for (let vals of e) {
			i = i + 1;
			sum = sum + vals.VDI2;
		}

		return (sum / i).toFixed(2);
	};

	const copyTable = () => {
		const elTable = document.querySelector(".p-tabview-panels");

		let range, sel;

		// Ensure that range and selection are supported by the browsers
		if (document.createRange && window.getSelection) {
			range = document.createRange();
			sel = window.getSelection();
			// unselect any element in the page
			sel.removeAllRanges();

			try {
				range.selectNodeContents(elTable);
				sel.addRange(range);
			} catch (e) {
				range.selectNode(elTable);
				sel.addRange(range);
			}

			document.execCommand("copy");
		}

		sel.removeAllRanges();

		toast.current.show({
			severity: "success",
			summary: "Copied",
			detail: "Table Copied SuccessFully",
			life: 3000,
		});
	};

	const volt_footerGroup = (f) => {
		if (f[1]===3){
			var e= f[0]
		return (
			<ColumnGroup>
				<Row>
					<Column
						align="center"
						style={{ minWidth: "10rem", maxWidth: "10rem" }}
						footer="साप्ताहिक मूल्य (Weekly Value):"
						colSpan={1}
						footerStyle={{ textAlign: "right" }}
					/>
					<Column align="center" colSpan={1} footer={volt_max(e)} />
					<Column align="center" colSpan={1} footer={volt_min(e)} />
					<Column align="center" colSpan={1} footer={volt_sum(e)} />
					<Column align="center" colSpan={1} footer={volt_max1(e)} />
					<Column align="center" colSpan={1} footer={volt_min1(e)} />
					<Column align="center" colSpan={1} footer={volt_sum1(e)} />
					<Column align="center" colSpan={1} footer={volt_max2(e)} />
					<Column align="center" colSpan={1} footer={volt_min2(e)} />
					<Column align="center" colSpan={1} footer={volt_sum2(e)} />
				</Row>
			</ColumnGroup>
		);}
		if (f[1]===2){
			var e= f[0]
			return (
				<ColumnGroup>
					<Row>
						<Column
							align="center"
							style={{ minWidth: "10rem", maxWidth: "10rem" }}
							footer="साप्ताहिक मूल्य (Weekly Value):"
							colSpan={1}
							footerStyle={{ textAlign: "right" }}
						/>
						<Column align="center" colSpan={1} footer={volt_max(e)} />
						<Column align="center" colSpan={1} footer={volt_min(e)} />
						<Column align="center" colSpan={1} footer={volt_sum(e)} />
						<Column align="center" colSpan={1} footer={volt_max1(e)} />
						<Column align="center" colSpan={1} footer={volt_min1(e)} />
						<Column align="center" colSpan={1} footer={volt_sum1(e)} />
						
					</Row>
				</ColumnGroup>
			);}
			if (f[1]===1){
				var e= f[0]
				return (
					<ColumnGroup>
						<Row>
							<Column
								align="center"
								style={{ minWidth: "10rem", maxWidth: "10rem" }}
								footer="साप्ताहिक मूल्य (Weekly Value):"
								colSpan={1}
								footerStyle={{ textAlign: "right" }}
							/>
							<Column align="center" colSpan={1} footer={volt_max(e)} />
							<Column align="center" colSpan={1} footer={volt_min(e)} />
							<Column align="center" colSpan={1} footer={volt_sum(e)} />
							
						</Row>
					</ColumnGroup>
				);}
	};

	const cellClassName = (data) =>
		data === freq_data_footer.Max_f || data === freq_data_footer.Min_f
			? "p-max-min"
			: data.length === 2 && data[1] !== 100
			? "p-voltequals"
			: "";

	const freqbodyTemplate1 = (e) => {
		return <>{e["49.9"][0]}</>;
	};
	const freqbodyTemplate2 = (e) => {
		return <>{e["Band"][0]}</>;
	};
	const freqbodyTemplate3 = (e) => {
		return <>{e["50.05"][0]}</>;
	};

	const rowClassName = (data) =>
		data.length === 2 ? (data[1] ? "p-voltequals" : "") : "";

	const { isDarkMode } = useTheme();

	return (
		<div className={isDarkMode ? "dark-mode" : ""}>
			<style>{weeklyStyles}</style>
			<Toast ref={toast} />

			{/* ─── Hero Section ────────────────────────────────────────────────── */}
			<div className="weekly-hero" style={{ '--page-accent': '#ef4444' }}>
				<div className="flex align-items-center gap-4">
					<div className="weekly-hero-icon">
						<i className="pi pi-file-pdf text-white"></i>
					</div>
					<div className="flex-grow-1">
						<div className="weekly-hero-badge">
							<i className="pi pi-check-circle" style={{ fontSize: "8px" }}></i>
							Live Reports Manager
						</div>
						<h1 className="weekly-title">Weekly Operational Reports</h1>
						<p className="weekly-subtitle">Generate and audit comprehensive weekly power system performance metrics</p>
					</div>
					<div className="hidden md:flex align-items-center gap-3">
						<Avatar icon="pi pi-chart-bar" className="bg-white-alpha-20 text-white" shape="circle" />
						<Avatar icon="pi pi-calendar" className="bg-white-alpha-20 text-white" shape="circle" />
					</div>
				</div>
			</div>

			{/* ─── Control Card ────────────────────────────────────────────────── */}
			<div className="weekly-ctrl-card">
				<div className="flex flex-wrap align-items-center justify-content-between gap-4">
					<div className="flex flex-wrap align-items-center gap-4">
						<div className="flex flex-column gap-2">
							<label className="text-xs font-semibold text-500 uppercase tracking-wider ml-1">Report Time Range</label>
							<div className="weekly-input-group">
								<i className="pi pi-calendar text-primary text-sm"></i>
								<Calendar
									placeholder="Select Date Range"
									dateFormat="dd/mm/yy"
									value={date}
									onChange={(e) => {
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
									showIcon={false}
									selectionMode="range"
                                    hideOnRangeSelection
									readOnlyInput
									className="border-none"
									style={{ height: '32px' }}
								/>
							</div>
						</div>
					</div>

					<div className="flex align-items-center gap-3">
						<Button
							label="Generate Report"
							icon="pi pi-cog"
							loading={show_freq_skeleton}
							onClick={() => {
								setshow_freq_skeleton(true);
								setshow_volt_skeleton(true);
								setshow_gen_skeleton(true);
								setshow_line_skeleton(true);
								setshow_element_skeleton(true);
								setshow_iegc_skeleton(true);
								generate_report("Frequency");
								generate_report("Voltage");
								generate_report("ElementBreakdown");
								generate_report("GeneratorBreakdown");
								generate_report("LineTripping");
								generate_report("NC_IEGC_Report");
								setshow_report(true);
							}}
							className="p-button-success p-button-raised border-round-xl px-4 py-2"
						/>

						<div hidden={!show_report || !show_freq_table}>
							<DownloadTableExcel
								filename={"Weekly_Report_" + moment(date[0]).format("DDMMYY")}
								sheet="Reports"
								currentTableRef={report_table.current}
							>
								<Button
									type="button"
									icon="pi pi-download"
									tooltip="Export Full Data"
									className="p-button-outlined p-button-secondary border-round-xl"
								/>
							</DownloadTableExcel>
						</div>
					</div>
				</div>
			</div>

			<div hidden={!show_report} className="mb-4">
				<Divider align="left">
					<span className="text-sm font-bold text-500 uppercase tracking-widest px-3 border-left-3 border-primary">Report Analytics View</span>
				</Divider>
			</div>

			<div className="card" hidden={!show_report}>
				<TabView className="weekly-tabview">
					<TabPanel header="Frequency Report" leftIcon="pi pi-bolt mr-2">
						<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1">
							<DataTable
								hidden={!show_freq_skeleton}
								value={items}
								headerColumnGroup={freq_headerGroup}
								footerColumnGroup={freq_footerGroup}
								className="p-datatable-sm"
								stripedRows
								showGridlines
								responsiveLayout="scroll"
							>
								<Column
									field="1"
									header="1"
									style={{ width: "1%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="2"
									header="2"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="3"
									header="3"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="4"
									header="4"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="5"
									header="5"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="6"
									header="6"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="7"
									header="7"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="8"
									header="8"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="6"
									header="6"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="7"
									header="7"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="8"
									header="8"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
							</DataTable>
						</div>
						<div className="card" hidden={!show_freq_table}>
							<Button
								size="small"
								severity="help"
								rounded
								raised
								label="Copy this Table"
								onClick={() => {
									copyTable();
								}}
							/>
							<DataTable
								ref={dt}
								// header={header}
								hidden={!show_freq_table}
								value={freq_data}
								headerColumnGroup={freq_headerGroup}
								footerColumnGroup={freq_footerGroup}
								tableStyle={{ minWidth: "50rem" }}
								stripedRows
								showGridlines
								cellClassName={cellClassName}
							>
								<Column bodyStyle={{ textAlign: "center" }} field="Date_Val" />
								<Column bodyStyle={{ textAlign: "center" }} field="Max" />
								<Column bodyStyle={{ textAlign: "center" }} field="Max_Time" />
								<Column bodyStyle={{ textAlign: "center" }} field="Min" />
								<Column bodyStyle={{ textAlign: "center" }} field="Min_Time" />
								<Column bodyStyle={{ textAlign: "center" }} field="Avg" />
								<Column bodyStyle={{ textAlign: "center" }} field="FDI_Time" />
								<Column bodyStyle={{ textAlign: "center" }} field="FDI_Hour" />
								<Column
									bodyStyle={{ textAlign: "center" }}
									body={freqbodyTemplate1}
									field="49.9"
								/>
								<Column
									bodyStyle={{ textAlign: "center" }}
									body={freqbodyTemplate2}
									field="Band"
								/>
								<Column
									bodyStyle={{ textAlign: "center" }}
									body={freqbodyTemplate3}
									field="50.05"
								/>
							</DataTable>
						</div>
					</TabPanel>
					<TabPanel header="Voltage Report" leftIcon="pi pi-sliders-v ml-2">
						<div className="card" hidden={!show_volt_skeleton}>
							<ProgressBar value={value} style={{ height: '6px' }}></ProgressBar>
						</div>
						<div hidden={!show_volt_table}>
							<div className="flex justify-content-end mb-3">
								<Button
									size="small"
									severity="help"
									rounded
									raised
									icon="pi pi-copy"
									label="Copy all Tables"
									className="p-button-outlined border-round-xl"
									onClick={() => copyTable()}
								/>
							</div>
							
							<div className="mb-4">
								<Divider align="center">
									<span className="text-xs font-bold text-500 uppercase tracking-widest px-3">400 kv Stations</span>
								</Divider>
							</div>

							{volt_data_400.map((e) => e[e.length-1].Name1!==''? (e[e.length-1].Name2!==''?(
								<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
									<div className="field"></div>
									<div className="field">
										<DataTable
											ref={dt}
											value={e}
											headerColumnGroup={volt_headerGroup([e,3])}
											footerColumnGroup={volt_footerGroup([e,3])}
											stripedRows
											showGridlines
											cellClassName={rowClassName}
										>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Date_Val"
											/>
											<Column bodyStyle={{ textAlign: "center" }} field="Max" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Max1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Min1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="VDI1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Max2"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Min2"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="VDI2"
											/>
										</DataTable>
										<br />
									</div>
									<div className="field"></div>
								</div>
							):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,2])}
									footerColumnGroup={volt_footerGroup([e,2])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									<Column
												bodyStyle={{ textAlign: "center" }}
												field="Max1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Min1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="VDI1"
											/>
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
						</div>)):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,1])}
									footerColumnGroup={volt_footerGroup([e,1])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
						</div>))}

							<Divider align="center">
								<span className="p-tag">765 kv Stations</span>
							</Divider>

							{volt_data_765.map((e) =>  e[e.length-1].Name1!==''? (e[e.length-1].Name2!==''?(
								<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
									<div className="field"></div>
									<div className="field">
										<DataTable
											ref={dt}
											value={e}
											headerColumnGroup={volt_headerGroup([e,3])}
											footerColumnGroup={volt_footerGroup([e,3])}
											stripedRows
											showGridlines
											cellClassName={rowClassName}
										>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Date_Val"
											/>
											<Column bodyStyle={{ textAlign: "center" }} field="Max" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Max1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Min1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="VDI1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Max2"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Min2"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="VDI2"
											/>
										</DataTable>
										<br />
									</div>
									<div className="field"></div>
								</div>
							):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,2])}
									footerColumnGroup={volt_footerGroup([e,2])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									<Column
												bodyStyle={{ textAlign: "center" }}
												field="Max1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Min1"
											/>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="VDI1"
											/>
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
						</div>)):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,1])}
									footerColumnGroup={volt_footerGroup([e,1])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
						</div>))}

							
						</div>
					</TabPanel>
					<TabPanel
						header="Generator's Tripping Report"
						leftIcon="pi pi-building mr-2"
					>
						<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1" hidden={!show_gen_skeleton}>
							<DataTable
								value={items}
								headerColumnGroup={generator_headerGroup}
								className="p-datatable-sm"
								stripedRows
								showGridlines
							>
								<Column
									field="1"
									header="1"
									style={{ width: "1%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="2"
									header="2"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="9"
									header="9"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="3"
									header="3"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="4"
									header="4"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="5"
									header="5"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="6"
									header="6"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="7"
									header="7"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="8"
									header="8"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="6"
									header="6"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
							</DataTable>
						</div>
						<div hidden={!show_gen_table}>
							<div className="flex justify-content-end mb-3">
								<Button
									size="small"
									severity="help"
									rounded
									raised
									icon="pi pi-copy"
									label="Copy this Table"
									className="p-button-outlined border-round-xl"
									onClick={() => copyTable()}
								/>
							</div>
							<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1">
								<DataTable
									paginator
									rows={10}
									rowsPerPageOptions={[10, 25, 50, gen_breakdown.length]}
									paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
									currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Generators"
									value={gen_breakdown}
									showGridlines
									className="p-datatable-sm"
									tableStyle={{ minWidth: "50rem" }}
									removableSort
									headerColumnGroup={generator_headerGroup}
								>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="SNo"
									header="Name"
									sortable
								></Column>
								<Column
									headerClassName="p-head"
									alignHeader="center"
									field="Name"
									header="Name"
									sortable
								></Column>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Owner"
									header="Owner"
									sortable
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Unit_Number"
									header="Unit Number"
									sortable
								></Column>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="INSTALLED_CAPACITY"
									header="INSTALLED CAPACITY"
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="OUTAGE_DATE"
									header="OUTAGE DATE"
									sortable
								></Column>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="OUTAGE_TIME"
									header="OUTAGE TIME"
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="REVIVAL_DATE"
									header="REVIVAL DATE"
								></Column>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="REVIVAL_TIME"
									header="REVIVAL TIME"
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="OUT_REASON"
									header="OUTAGE REASON"
								></Column>
							</DataTable>
						</div>
						</div>
					</TabPanel>
					<TabPanel
						header="Transmission Elements Tripped"
						leftIcon="pi pi-list mr-2"
					>
						<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1" hidden={!show_line_skeleton}>
							<DataTable
								value={items}
								headerColumnGroup={Lines_headerGroup}
								className="p-datatable-sm"
								stripedRows
								showGridlines
							>
								<Column
									field="1"
									header="1"
									style={{ width: "1%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="2"
									header="2"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="3"
									header="3"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="4"
									header="4"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="5"
									header="5"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="6"
									header="6"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="7"
									header="7"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
							</DataTable>
						</div>
						<div hidden={!show_line_table}>
							<div className="flex justify-content-end mb-3">
								<Button
									size="small"
									severity="help"
									rounded
									raised
									icon="pi pi-copy"
									label="Copy this Table"
									className="p-button-outlined border-round-xl"
									onClick={() => copyTable()}
								/>
							</div>
							<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1">
								<DataTable
									paginator
									rows={10}
									rowsPerPageOptions={[10, 25, 50, line_tripping.length]}
									paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
									currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Elements"
									value={line_tripping}
									showGridlines
									className="p-datatable-sm"
									tableStyle={{ minWidth: "50rem" }}
									removableSort
									headerColumnGroup={Lines_headerGroup}
								>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="SNo"
									header="Name"
									sortable
								></Column>
								<Column
									headerClassName="p-head"
									alignHeader="center"
									field="Name"
									header="Name"
									sortable
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="TripDate"
									header="Out Date"
									sortable
								></Column>
								<Column
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="TripTime"
									header="Out Time"
									sortable
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="RevivalDate"
									header="Restoration Date"
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="RevivalTime"
									header="Restoration Time"
								></Column>
								<Column
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Reason"
									header="Reason"
								></Column>
							</DataTable>
						</div>
						</div>
					</TabPanel>
					<TabPanel
						header="Elements Under Breakdown"
						leftIcon="pi pi-globe mr-2"
					>
						<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1" hidden={!show_element_skeleton}>
							<DataTable
								value={items}
								headerColumnGroup={element_headerGroup}
								className="p-datatable-sm"
								stripedRows
								showGridlines
							>
								<Column
									field="1"
									header="1"
									style={{ width: "1%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="2"
									header="2"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="3"
									header="3"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="4"
									header="4"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="5"
									header="5"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
							</DataTable>
						</div>
						<div hidden={!show_element_table}>
							<div className="flex justify-content-end mb-3">
								<Button
									size="small"
									severity="help"
									rounded
									raised
									icon="pi pi-copy"
									label="Copy this Table"
									className="p-button-outlined border-round-xl"
									onClick={() => copyTable()}
								/>
							</div>
							<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1">
								<DataTable
									paginator
									rows={10}
									rowsPerPageOptions={[10, 25, 50, elements_breakdown.length]}
									paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
									currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Elements"
									value={elements_breakdown}
									showGridlines
									className="p-datatable-sm"
									tableStyle={{ minWidth: "50rem" }}
									removableSort
									headerColumnGroup={element_headerGroup}
									sortable
								>
								<Column
									style={{
										maxWidth: "4rem",
										minWidth: "4rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="SNo"
									header="Name"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "20rem",
										minWidth: "20rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									alignHeader="center"
									field="Name"
									header="Name"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "7rem",
										minWidth: "7rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Contituent"
									header="Contituent"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "7rem",
										minWidth: "7rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="OutDate"
									header="OutDate"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "50rem",
										minWidth: "50rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Reason"
									header="Reason"
								></Column>
							</DataTable>
						</div>
						</div>
					</TabPanel>
					<TabPanel
						header="NON-COMPLIANCE OF IEGC"
						leftIcon="pi pi-exclamation-triangle mr-2"
					>
						<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1" hidden={!show_iegc_skeleton}>
							<DataTable
								value={items}
								headerColumnGroup={iegc_headerGroup}
								footerColumnGroup={iegc_footerGroup}
								className="p-datatable-sm"
								stripedRows
								showGridlines
							>
								<Column
									field="1"
									header="1"
									style={{ width: "1%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="2"
									header="2"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="3"
									header="3"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="4"
									header="4"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="5"
									header="5"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="6"
									header="6"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="7"
									header="7"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="8"
									header="8"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
								<Column
									field="9"
									header="9"
									style={{ width: "2%" }}
									body={<Skeleton />}
								></Column>
							</DataTable>
						</div>
						<div hidden={!show_iegc_table}>
							<div className="flex justify-content-end mb-3">
								<Button
									size="small"
									severity="help"
									rounded
									raised
									icon="pi pi-copy"
									label="Copy this Table"
									className="p-button-outlined border-round-xl"
									onClick={() => copyTable()}
								/>
							</div>
							<div className="weekly-ctrl-card p-0 overflow-hidden border-none shadow-1">
								<DataTable
									paginator
									rows={10}
									rowsPerPageOptions={[10, 25, 50, nc_iegc.length]}
									paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
									currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Non-Compliance"
									value={nc_iegc}
									showGridlines
									className="p-datatable-sm"
									tableStyle={{ minWidth: "50rem" }}
									removableSort
									headerColumnGroup={iegc_headerGroup}
									footerColumnGroup={iegc_footerGroup}
									sortable
								>
								<Column
									style={{
										maxWidth: "4rem",
										minWidth: "4rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="SNo"
									header="Name"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "20rem",
										minWidth: "20rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									alignHeader="center"
									field="Name"
									header="Name"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "10rem",
										minWidth: "10rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Alert"
									header="Contituent"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "10rem",
										minWidth: "10rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Emergency"
									header="OutDate"
									sortable
								></Column>
								<Column
									style={{
										maxWidth: "10rem",
										minWidth: "10rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="NCompliance"
									header="Reason"
								></Column>
								<Column
									style={{
										maxWidth: "10rem",
										minWidth: "10rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="FV"
									header="Reason"
								></Column>
								<Column
									style={{
										maxWidth: "10rem",
										minWidth: "10rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="VV"
									header="Reason"
								></Column>
								<Column
									style={{
										maxWidth: "10rem",
										minWidth: "10rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head1"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="LV"
									header="Reason"
								></Column>
								<Column
									style={{
										maxWidth: "4rem",
										minWidth: "4rem",
										wordBreak: "break-word",
									}}
									headerClassName="p-head"
									bodyStyle={{ textAlign: "center" }}
									alignHeader="center"
									field="Total"
									header="Name"
									sortable
								></Column>
							</DataTable>
						</div>
						</div>
					</TabPanel>
				</TabView>
			</div>

			<div ref={report_table} hidden={true} id="table">
				<h4>(A) आवृदि प्रोफाइल / Frequency Profile*</h4>
				<DataTable
					ref={dt}
					// header={header}
					hidden={!show_freq_table}
					value={freq_data}
					headerColumnGroup={freq_headerGroup}
					footerColumnGroup={freq_footerGroup}
					tableStyle={{ minWidth: "50rem" }}
					stripedRows
					showGridlines
					cellClassName={cellClassName}
				>
					<Column bodyStyle={{ textAlign: "center" }} field="Date_Val" />
					<Column bodyStyle={{ textAlign: "center" }} field="Max" />
					<Column bodyStyle={{ textAlign: "center" }} field="Max_Time" />
					<Column bodyStyle={{ textAlign: "center" }} field="Min" />
					<Column bodyStyle={{ textAlign: "center" }} field="Min_Time" />
					<Column bodyStyle={{ textAlign: "center" }} field="Avg" />
					<Column bodyStyle={{ textAlign: "center" }} field="FDI_Time" />
					<Column bodyStyle={{ textAlign: "center" }} field="FDI_Hour" />
					<Column
						bodyStyle={{ textAlign: "center" }}
						body={freqbodyTemplate1}
						field="49.9"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						body={freqbodyTemplate2}
						field="Band"
					/>
					<Column
						bodyStyle={{ textAlign: "center" }}
						body={freqbodyTemplate3}
						field="50.05"
					/>
				</DataTable>
				* Based on available SCADA data
				<br />
				<h4>(B) वोल्टेज प्रोफाइल / Voltage Profile*</h4>
				{volt_data_400.map((e) => e[e.length-1].Name1!==''? (e[e.length-1].Name2!==''?(
								<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
									<div className="field"></div>
									<div className="field">
										<DataTable
											ref={dt}
											value={e}
											headerColumnGroup={volt_headerGroup([e,3])}
											footerColumnGroup={volt_footerGroup([e,3])}
											stripedRows
											showGridlines
											cellClassName={rowClassName}
										>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Date_Val"
											/>
											<Column bodyStyle={{ textAlign: "center" }} field="Max" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
											<Column bodyStyle={{ textAlign: "center" }} field="Max1" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min1" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI1" />
											<Column bodyStyle={{ textAlign: "center" }} field="Max2" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min2" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI2" />
										</DataTable>
										<br />
									</div>
									<div className="field"></div>
									<br />
								</div>
							):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,2])}
									footerColumnGroup={volt_footerGroup([e,2])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									<Column bodyStyle={{ textAlign: "center" }} field="Max1" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min1" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI1" />
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
							<br />
						</div>)):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,1])}
									footerColumnGroup={volt_footerGroup([e,1])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
							<br />
						</div>))}
				
				<Divider align="center">
					<span className="p-tag">765 kv Stations</span>
				</Divider>
				{volt_data_765.map((e) =>  e[e.length-1].Name1!==''? (e[e.length-1].Name2!==''?(
								<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
									<div className="field"></div>
									<div className="field">
										<DataTable
											ref={dt}
											value={e}
											headerColumnGroup={volt_headerGroup([e,3])}
											footerColumnGroup={volt_footerGroup([e,3])}
											stripedRows
											showGridlines
											cellClassName={rowClassName}
										>
											<Column
												bodyStyle={{ textAlign: "center" }}
												field="Date_Val"
											/>
											<Column bodyStyle={{ textAlign: "center" }} field="Max" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
											<Column bodyStyle={{ textAlign: "center" }} field="Max1" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min1" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI1" />
											<Column bodyStyle={{ textAlign: "center" }} field="Max2" />
											<Column bodyStyle={{ textAlign: "center" }} field="Min2" />
											<Column bodyStyle={{ textAlign: "center" }} field="VDI2" />
										</DataTable>
										<br />
									</div>
									<div className="field"></div>
									<br />
								</div>
							):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,2])}
									footerColumnGroup={volt_footerGroup([e,2])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									<Column bodyStyle={{ textAlign: "center" }} field="Max1" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min1" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI1" />
								</DataTable>
								<br />
							</div>
							<div className="field"></div>
							<br />
						</div>)):(<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
							<div className="field"></div>
							<div className="field">
								<DataTable
									ref={dt}
									value={e}
									headerColumnGroup={volt_headerGroup([e,1])}
									footerColumnGroup={volt_footerGroup([e,1])}
									stripedRows
									showGridlines
									cellClassName={rowClassName}
								>
									<Column
										bodyStyle={{ textAlign: "center" }}
										field="Date_Val"
									/>
									<Column bodyStyle={{ textAlign: "center" }} field="Max" />
									<Column bodyStyle={{ textAlign: "center" }} field="Min" />
									<Column bodyStyle={{ textAlign: "center" }} field="VDI" />
									
								</DataTable>
								
							</div>
							<div className="field"></div>
							<br />
						</div>))}
				
				* Based on available SCADA data
				<br />
				<h4>(C) Generators tripped or re-synchronized Report</h4>
				<DataTable
					value={gen_breakdown}
					showGridlines
					headerColumnGroup={generator_headerGroup}
				>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="SNo"
						header="Name"
					></Column>
					<Column
						headerClassName="p-head"
						alignHeader="center"
						field="Name"
						header="Name"
					></Column>
					<Column
						headerClassName="p-head"
						alignHeader="center"
						field="Owner"
						header="Owner"
						sortable
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Unit_Number"
						header="Unit Number"
					></Column>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="INSTALLED_CAPACITY"
						header="INSTALLED CAPACITY"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="OUTAGE_DATE"
						header="OUTAGE DATE"
					></Column>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="OUTAGE_TIME"
						header="OUTAGE TIME"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="REVIVAL_DATE"
						header="REVIVAL DATE"
					></Column>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="REVIVAL_TIME"
						header="REVIVAL TIME"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="OUT_REASON"
						header="OUTAGE REASON"
					></Column>
				</DataTable>
				<br />
				<h4>(D) TRANSMISSION ELEMENTS TRIPPED / RESTORED Report</h4>
				<DataTable
					value={line_tripping}
					showGridlines
					tableStyle={{ minWidth: "50rem" }}
					headerColumnGroup={Lines_headerGroup}
				>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="SNo"
						header="Name"
					></Column>
					<Column
						headerClassName="p-head"
						alignHeader="center"
						field="Name"
						header="Name"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="TripDate"
						header="Out Date"
					></Column>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="TripTime"
						header="Out Time"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="RevivalDate"
						header="Restoration Date"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="RevivalTime"
						header="Restoration Time"
					></Column>
					<Column
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Reason"
						header="Reason"
					></Column>
				</DataTable>
				<br />
				<h4>(E) Elements-Breakdown Report</h4>
				<DataTable
					value={elements_breakdown}
					showGridlines
					tableStyle={{ minWidth: "50rem" }}
					headerColumnGroup={element_headerGroup}
				>
					<Column
						style={{
							maxWidth: "4rem",
							minWidth: "4rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="SNo"
						header="Name"
					></Column>
					<Column
						style={{
							maxWidth: "20rem",
							minWidth: "20rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						alignHeader="center"
						field="Name"
						header="Name"
					></Column>
					<Column
						style={{
							maxWidth: "7rem",
							minWidth: "7rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Contituent"
						header="Contituent"
					></Column>
					<Column
						style={{
							maxWidth: "7rem",
							minWidth: "7rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="OutDate"
						header="OutDate"
					></Column>
					<Column
						style={{
							maxWidth: "50rem",
							minWidth: "50rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Reason"
						header="Reason"
					></Column>
				</DataTable>
				<br />
				<DataTable
					value={[
						{
							1: "1",
							2: "220 kV Waria-Bidhannagar 1 & 2 are in open condition to control overloading of 200 kV Waria-DSTPS(Andal) d/c line.",
						},
					]}
					showGridlines
				>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="1"
						header="(F)"
					></Column>
					<Column
						style={{
							maxWidth: "30rem",
							minWidth: "30rem",
							wordBreak: "break-word",
						}}
						colSpan={5}
						headerClassName="p-head"
						alignHeader="center"
						field="2"
						header="ग्रिड डिस्टर्बेंस/ट्रांसमिशन का प्रतिबंध(यदि कोई है)/GRID DISTURBANCES/TRANSMISSION CONSTRAINTS (IF ANY):"
					></Column>
				</DataTable>
				<br />
				<DataTable value={[{ 1: "", 2: "NIL" }]} showGridlines>
					<Column
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="1"
						header="(G)"
					></Column>
					<Column
						style={{
							maxWidth: "30rem",
							minWidth: "30rem",
							wordBreak: "break-word",
						}}
						colSpan={5}
						headerClassName="p-head"
						alignHeader="center"
						field="2"
						header="ट्रांसमिशन प्रणाली में अतिप्रजन के दृष्टांत / INSTANCES OF CONGESTION IN TRANSMISSION SYSTEM:"
					></Column>
				</DataTable>
				<br />
				<h4>(H) Non Compliance of IEGC Report</h4>
				<DataTable
					value={nc_iegc}
					showGridlines
					headerColumnGroup={iegc_headerGroup}
					footerColumnGroup={iegc_footerGroup}
					sortable
				>
					<Column
						style={{
							maxWidth: "4rem",
							minWidth: "4rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="SNo"
						header="Name"
					></Column>
					<Column
						style={{
							maxWidth: "20rem",
							minWidth: "20rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						alignHeader="center"
						field="Name"
						header="Name"
					></Column>
					<Column
						style={{
							maxWidth: "10rem",
							minWidth: "10rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Alert"
						header="Contituent"
					></Column>
					<Column
						style={{
							maxWidth: "10rem",
							minWidth: "10rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Emergency"
						header="OutDate"
					></Column>
					<Column
						style={{
							maxWidth: "10rem",
							minWidth: "10rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="NCompliance"
						header="Reason"
					></Column>
					<Column
						style={{
							maxWidth: "10rem",
							minWidth: "10rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="FV"
						header="Reason"
					></Column>
					<Column
						style={{
							maxWidth: "10rem",
							minWidth: "10rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="VV"
						header="Reason"
					></Column>
					<Column
						style={{
							maxWidth: "10rem",
							minWidth: "10rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head1"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="LV"
						header="Reason"
					></Column>
					<Column
						style={{
							maxWidth: "4rem",
							minWidth: "4rem",
							wordBreak: "break-word",
						}}
						headerClassName="p-head"
						bodyStyle={{ textAlign: "center" }}
						alignHeader="center"
						field="Total"
						header="Name"
					></Column>
				</DataTable>
			</div>
		</div>
	);
}
