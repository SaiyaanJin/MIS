import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import "../cssFiles/PasswordDemo.css";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "../cssFiles/ButtonDemo.css";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import Dlrgraph from "../graphs/dlrgraph";
import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Dlr() {
  const [start_date, setStart_Date] = useState();
  const [end_date, setEnd_Date] = useState();
  const [dlr_states, setdlr_states] = useState();
  const [Selected_dlr_states, setSelected_dlr_states] = useState();
  const [dlr_data, setdlr_data] = useState();

  const [graphenable, setgraphenable] = useState(true);

  useEffect(() => {
    if (start_date && end_date) {
      axios
        .post(
          "http://10.3.200.63:5010/dlrNames?startDate=" +
            moment(start_date).format("YYYY-MM-DD") +
            "&endDate=" +
            moment(end_date).format("YYYY-MM-DD"),
          {}
        )
        .then((response) => {
          setdlr_states(response.data);
        })
        .catch((error) => {});
    }
  }, [start_date, end_date]);

  const getdlrdata = () => {
    if (start_date && end_date && Selected_dlr_states) {
      axios
        .post(
          "http://10.3.200.63:5010/GetdlrData?startDate=" +
            moment(start_date).format("YYYY-MM-DD") +
            "&endDate=" +
            moment(end_date).format("YYYY-MM-DD") +
            "&stationName=" +
            Selected_dlr_states,
          {}
        )
        .then((response) => {
          // console.log(response);
          setdlr_data(response.data);
          setgraphenable(false);
        });
    }
  };

  return (
    <>
      <br />
      <br />
      <Fieldset legend="dlr data" toggleable>
        <div className="grid">
          <div className="col">
            {" "}
            <div className="field col-12 md:col-4">
              <label htmlFor="range">From</label> <br />
              <Calendar
                placeholder="Start Date"
                dateFormat="dd-mm-yy"
                value={start_date}
                onChange={(e) => {
                  setStart_Date(e.value);
                }}
                // onClick={() => {
                //   dlrNames();
                // }}
                monthNavigator
                yearNavigator
                yearRange="2010:2025"
                showButtonBar
              ></Calendar>
            </div>
          </div>
          <div className="col">
            {" "}
            <div className="field col-12 md:col-4">
              <label htmlFor="range">To</label> <br />
              <Calendar
                placeholder="End Date"
                dateFormat="dd-mm-yy"
                value={end_date}
                onChange={(e) => {
                  setEnd_Date(e.value);
                }}
                // onClick={() => {
                //   dlrNames();
                // }}
                monthNavigator
                yearNavigator
                yearRange="2010:2025"
                showButtonBar
              ></Calendar>
            </div>
          </div>
          <div className="col">
            <label htmlFor="range">Select substation : </label>
            <br />
            <MultiSelect
              display="chip"
              placeholder="dlr Region(s)"
              value={Selected_dlr_states}
              options={dlr_states}
              onChange={(e) => setSelected_dlr_states(e.value)}
              filter
            />{" "}
          </div>{" "}
          <div className="col">
            {" "}
            Fetch dlr data:
            <br />
            <Button
              style={{
                // backgroundColor: "transparent",
                // shadowOpacity: 0,
                width: "auto",
                float: "center",
              }}
              label="Get dlr Data"
              aria-label="dlr Data"
              onClick={() => {
                getdlrdata();
              }}
            />
          </div>
        </div>
        <Divider />
        <div hidden={graphenable}>
          <Dlrgraph
            dlr_data={dlr_data}
            Selected_dlr_states={Selected_dlr_states}
          />
        </div>
      </Fieldset>
    </>
  );
}
