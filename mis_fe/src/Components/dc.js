import React, { useState, useEffect, useRef } from "react";
import "../cssFiles/Animation.css";
import { TabView, TabPanel } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
// import { Fieldset } from "primereact/fieldset";
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
import { Container, Col, Row as rows } from "react-grid-system";

export default function Dc() {
	const [dc_rev1, setdc_rev1] = useState([]);
	const [dc_rev2, setdc_rev2] = useState([]);
	const [dc_rev3, setdc_rev3] = useState([]);
	const [loading_show, setloading_show] = useState(false);
	const [dc_rev_h1, setdc_rev_h1] = useState([]);
	const [dc_rev_h2, setdc_rev_h2] = useState([]);
	const [dc_rev_h3, setdc_rev_h3] = useState([]);
	const [show, setshow] = useState(false);

	const data = () => {
		axios
			.post("http://10.3.230.62:5010/cm_dc_revision", {})
			.then((response) => {
				setdc_rev1(response.data[0]);
				setdc_rev2(response.data[1]);
				setdc_rev3(response.data[2]);
				setdc_rev_h1(response.data[3]);
				setdc_rev_h2(response.data[4]);
				setdc_rev_h3(response.data[5]);
				setshow(true);
				setloading_show(false);
			})
			.catch((error) => {});
	};

	return (
		<>
			<div hidden={!loading_show}>
				<div className="loader">
					<div className="spinner"></div>
				</div>
			</div>
			<Divider align="left">
				<span
					className="p-tag"
					style={{
						backgroundColor: "#ffffff",
						fontSize: "large",
						color: "#000000",
					}}
				>
					{/* <Avatar
						icon="pi pi-chart-line"
						style={{ backgroundColor: "#ffa500", color: "#000000" }}
						shape="square"
					/> */}
					DC Tab
				</span>
			</Divider>

			<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
				<div className="field"></div>
				<div className="field">
					<Button
						label="Fetch Data"
						severity="success"
						rounded
						raised
						onClick={() => {
							data();
							setloading_show(true);
						}}
					/>
				</div>
				<div className="field"></div>
			</div>
			
			<div hidden={!show}>
				<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
					<div className="field"></div>
					<div className="field">
						<h3>Total</h3>
						<DataTable value={dc_rev3} stripedRows showGridlines size="small">
							{dc_rev_h3.map((e) => (
								<Column
									style={{ minWidth: "8rem" }}
									alignHeader={"center"}
									bodyStyle={{ textAlign: "center" }}
									field={e}
									header={e}
									headerClassName="p-head1"
								/>
							))}
						</DataTable>
					</div>
					<div className="field"></div>
				</div>
				<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
					<div className="field"></div>
					<div className="field">
						<h3>Downward</h3>
						<DataTable value={dc_rev1} stripedRows showGridlines size="small">
							{dc_rev_h1.map((e) => (
								<Column
								style={{ minWidth: "8rem" }}
									alignHeader={"center"}
									bodyStyle={{ textAlign: "center" }}
									field={e}
									header={e}
									headerClassName="p-head"
								/>
							))}
						</DataTable>
					</div>
					<div className="field"></div>
				</div>
				<div className="flex flex-wrap gap-1 justify-content-between align-items-center">
					<div className="field"></div>
					<div className="field">
						<h3>Upward</h3>
						<DataTable value={dc_rev2} stripedRows showGridlines size="small">
							{dc_rev_h2.map((e) => (
								<Column
								style={{ minWidth: "8rem" }}
									alignHeader={"center"}
									bodyStyle={{ textAlign: "center" }}
									field={e}
									header={e}
									headerClassName="p-head1"
								/>
							))}
						</DataTable>
						<br />
					</div>
					<div className="field"></div>
				</div>
			</div>
		</>
	);
}
