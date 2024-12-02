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
import Mvargraph from "../graphs/mvargraph";
import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";

import { InputSwitch } from "primereact/inputswitch";

import { InputNumber } from "primereact/inputnumber";

import { Checkbox } from "primereact/checkbox";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

export default function Mvar() {
  const [start_date, setStart_Date] = useState(
    new Date(
      moment()
        .set("hour", 0)
        .set("minute", 0)
        .set("second", 0)
        .subtract(2, "day")._d
    )
  );
  const [end_date, setEnd_Date] = useState(
    new Date(
      moment()
        .set("hour", 23)
        .set("minute", 59)
        .set("second", 0)
        .subtract(2, "day")._d
    )
  );
  const [mvar_states, setmvar_states] = useState();
  const [Selected_mvar_states, setSelected_mvar_states] = useState();
  const [mvar_data, setmvar_data] = useState();
  const [enable, setenable] = useState(true);
  const [graphenable, setgraphenable] = useState(true);

  const [multiple_date, setMultiple_Date] = useState();
  const [multiple_mvar_states, setmultiplemvar_states] = useState();
  const [multiple_Selected_mvar_states, setmultipleSelected_mvar_states] =
    useState();
  const [multiple_mvar_data, setmultiplemvar_data] = useState();
  const [graphenable2, setgraphenable2] = useState(true);
  const temp_multi_date = [];

  const [multiple_month, setMultiple_Month] = useState();

  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);

  const [checked3, setChecked3] = useState(false);
  const [minutes, setminutes] = useState(1);
  const [checked4, setChecked4] = useState(false);
  const [multiminutes, setmultiminutes] = useState(1);

  const [frequency, setfrequency] = useState();
  const [multifrequency, setmultifrequency] = useState();
  const [freq_region, setfreq_region] = useState([]);

  useEffect(() => {
    if (start_date && end_date) {
      axios
        .post(
          "http://10.3.200.63:5010/MVARNames?startDate=" +
            moment(start_date).format("YYYY-MM-DD") +
            "&endDate=" +
            moment(end_date).format("YYYY-MM-DD"),
          {}
        )
        .then((response) => {
          setmvar_states(response.data);
        })
        .catch((error) => {});
    }

    if (multiple_date) {
      for (var i = 0; i < multiple_date.length; i++) {
        temp_multi_date.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
      }

      if (i === multiple_date.length) {
        axios
          .post(
            "http://10.3.200.63:5010/MultiMVARNames?MultistartDate=" +
              temp_multi_date,
            {}
          )
          .then((response) => {
            setmultiplemvar_states(response.data);
          })
          .catch((error) => {});
      }
    }

    if (multiple_month) {
      var temp_multi_month = [];

      var temp_multi_month = [];
      for (var j = 0; j < multiple_month.length; j++) {
        temp_multi_month.push(moment(multiple_month[j]).format("YYYY-MM-DD"));
      }

      if (j === multiple_month.length) {
        axios
          .post(
            "http://10.3.200.63:5010/MultiMVARNames?MultistartDate=" +
              temp_multi_month,
            {}
          )
          .then((response) => {
            setmultiplemvar_states(response.data);
          })
          .catch((error) => {});
      }
    }
  }, [start_date, end_date, multiple_date, multiple_month]);

  const getmvardata = () => {
    if (start_date && end_date && Selected_mvar_states) {
      if (minutes && checked3) {
        axios
          .post(
            "http://10.3.200.63:5010/GetMVARData?startDate=" +
              moment(start_date).format("YYYY-MM-DD") +
              "&endDate=" +
              moment(end_date).format("YYYY-MM-DD") +
              "&stationName=" +
              Selected_mvar_states +
              "&time=" +
              minutes,
            {}
          )
          .then((response) => {
            setmvar_data(response.data);
            setenable(false);
            setgraphenable(false);
          });
        axios
          .post(
            "http://10.3.200.63:5010/GetFrequencyData?startDate=" +
              moment(start_date).format("YYYY-MM-DD") +
              "&endDate=" +
              moment(end_date).format("YYYY-MM-DD") +
              "&stationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
              "&time=" +
              minutes,
            {}
          )
          .then((response) => {
            setfrequency(response.data);
          });
      } else {
        axios
          .post(
            "http://10.3.200.63:5010/GetMVARData?startDate=" +
              moment(start_date).format("YYYY-MM-DD") +
              "&endDate=" +
              moment(end_date).format("YYYY-MM-DD") +
              "&stationName=" +
              Selected_mvar_states +
              "&time=1",
            {}
          )
          .then((response) => {
            setmvar_data(response.data);
            setenable(false);
            setgraphenable(false);
          });
        axios
          .post(
            "http://10.3.200.63:5010/GetFrequencyData?startDate=" +
              moment(start_date).format("YYYY-MM-DD") +
              "&endDate=" +
              moment(end_date).format("YYYY-MM-DD") +
              "&stationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
              "&time=1",
            {}
          )
          .then((response) => {
            // console.log(response);
            setfrequency(response.data);
          });
      }
    }
  };

  const getmultimvardata = () => {
    if (multiple_date && checked1) {
      if (multiminutes && checked4) {
        var temp1 = [];

        for (var i = 0; i < multiple_date.length; i++) {
          temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
        }

        if (temp1 && multiple_Selected_mvar_states) {
          axios
            .post(
              "http://10.3.200.63:5010/GetMultiMVARData?MultistartDate=" +
                temp1 +
                "&MultistationName=" +
                multiple_Selected_mvar_states +
                "&Type=Date" +
                "&time=" +
                multiminutes,
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultiplemvar_data(response.data);
              // setenable(false);
              setgraphenable2(false);
            });
          axios
            .post(
              "http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
                temp1 +
                "&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
                "&Type=Date" +
                "&time=" +
                multiminutes,
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultifrequency(response.data);
            });
        }
      } else {
        var temp1 = [];

        for (var i = 0; i < multiple_date.length; i++) {
          temp1.push(moment(multiple_date[i]).format("YYYY-MM-DD"));
        }

        if (temp1 && multiple_Selected_mvar_states) {
          axios
            .post(
              "http://10.3.200.63:5010/GetMultiMVARData?MultistartDate=" +
                temp1 +
                "&MultistationName=" +
                multiple_Selected_mvar_states +
                "&Type=Date" +
                "&time=1",
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultiplemvar_data(response.data);
              // setenable(false);
              setgraphenable2(false);
            });
          axios
            .post(
              "http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
                temp1 +
                "&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
                "&Type=Date" +
                "&time=1",
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultifrequency(response.data);
            });
        }
      }
    }

    if (multiple_month && checked2) {
      if (multiminutes && checked4) {
        var temp2 = [];

        for (var i = 0; i < multiple_month.length; i++) {
          temp2.push(moment(multiple_month[i]).format("YYYY-MM-DD"));
        }

        if (temp2 && multiple_Selected_mvar_states) {
          axios
            .post(
              "http://10.3.200.63:5010/GetMultiMVARData?MultistartDate=" +
                temp2 +
                "&MultistationName=" +
                multiple_Selected_mvar_states +
                "&Type=Month" +
                "&time=" +
                multiminutes,
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultiplemvar_data(response.data);
              // setenable(false);
              setgraphenable2(false);
            });

          axios
            .post(
              "http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
                temp2 +
                "&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
                "&Type=Month" +
                "&time=" +
                multiminutes,
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultifrequency(response.data);
            });
        }
      } else {
        var temp2 = [];

        for (var i = 0; i < multiple_month.length; i++) {
          temp2.push(moment(multiple_month[i]).format("YYYY-MM-DD"));
        }

        if (temp2 && multiple_Selected_mvar_states) {
          axios
            .post(
              "http://10.3.200.63:5010/GetMultiMVARData?MultistartDate=" +
                temp2 +
                "&MultistationName=" +
                multiple_Selected_mvar_states +
                "&Type=Month" +
                "&time=1",
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultiplemvar_data(response.data);
              // setenable(false);
              setgraphenable2(false);
            });

          axios
            .post(
              "http://10.3.200.63:5010/GetMultiFrequencyData?MultistartDate=" +
                temp2 +
                "&MultistationName=400 kV Durgapur_A,400 kV Jeypore,400 kV Sasaram_North" +
                "&Type=Month" +
                "&time=1",
              {}
            )
            .then((response) => {
              // console.log(response);
              setmultifrequency(response.data);
            });
        }
      }
    }
  };

  const frequency_region_change = (e) => {
    let selectedregions = [...freq_region];

    if (e.checked) selectedregions.push(e.value);
    else selectedregions.splice(selectedregions.indexOf(e.value), 1);

    setfreq_region(selectedregions);
  };

  return (
    <>
      <br />
      <br />
      <Fieldset legend="Lines MVAR Data" toggleable>
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
                //   mvarNames();
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
                //   mvarNames();
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
            <div
              className="field col-12 md:col-10"
              style={{ marginTop: "-3%" }}
            >
              <InputSwitch
                checked={checked3}
                onChange={(e) => {
                  setChecked3(e.value);
                }}
              />
              {"  "}
              <label htmlFor="range">Interval (1 to 1440 minutes)</label>
              <InputNumber
                min={1}
                max={1440}
                disabled={!checked3}
                value={minutes}
                onValueChange={(e) => setminutes(e.value)}
                suffix=" minutes"
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-danger"
                incrementButtonClassName="p-button-success"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
            </div>
          </div>
          <div className="col">
            <label htmlFor="range">Select substation : </label>
            <br />
            <MultiSelect
              selectionLimit={5}
              display="chip"
              placeholder="Select 220/400/765KV Line(s)"
              value={Selected_mvar_states}
              options={mvar_states}
              onChange={(e) => setSelected_mvar_states(e.value)}
              filter
            />{" "}
          </div>{" "}
          <div className="col">
            {" "}
            Fetch mvar data:
            <br />
            <Button
              style={{
                // backgroundColor: "transparent",
                // shadowOpacity: 0,
                width: "auto",
                float: "center",
              }}
              label="Get mvar Data"
              aria-label="mvar Data"
              onClick={() => {
                getmvardata();
              }}
            />
            <div className="col-2">
              <a
                hidden={enable}
                href={
                  "http://10.3.200.63:5010/GetMVARDataExcel?startDate=" +
                  moment(start_date).format("YYYY-MM-DD") +
                  "&endDate=" +
                  moment(end_date).format("YYYY-MM-DD") +
                  "&stationName=" +
                  Selected_mvar_states
                }
              >
                {" "}
                Download{" "}
              </a>
            </div>
            <div className="field-checkbox">
              Show Frequency:
              <Checkbox
                inputId="1"
                name="city"
                value="Durgapur"
                onChange={frequency_region_change}
                checked={freq_region.indexOf("Durgapur") !== -1}
              />
              <label htmlFor="1">Durgapur</label>
              <Checkbox
                inputId="2"
                name="city"
                value="Jeypore"
                onChange={frequency_region_change}
                checked={freq_region.indexOf("Jeypore") !== -1}
              />
              <label htmlFor="2">Jeypore</label>
              <Checkbox
                inputId="3"
                name="city"
                value="Sasaram"
                onChange={frequency_region_change}
                checked={freq_region.indexOf("Sasaram") !== -1}
              />
              <label htmlFor="3">Sasaram</label>
            </div>
          </div>
        </div>
        <Divider />
        <div hidden={graphenable}>
          <Mvargraph
            mvar_data={mvar_data}
            Selected_mvar_states={Selected_mvar_states}
            frequency={frequency}
            freq_region={freq_region}
          />
        </div>
      </Fieldset>

      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <br />
      <br />
      <Fieldset legend=" Compare Lines MVAR Data" toggleable>
        <div className="grid">
          <div className="col">
            {" "}
            <div className="field col-12 md:col-6">
              <InputSwitch
                checked={checked1}
                onChange={(e) => {
                  setChecked1(e.value);
                  setChecked2(!e.value);
                }}
              />
              <br></br>
              <label htmlFor="range">Date-wise comparison: </label> <br />
              <Calendar
                disabled={checked2}
                selectionMode="multiple"
                placeholder="Start Date"
                dateFormat="dd-mm-yy"
                value={multiple_date}
                onChange={(e) => {
                  setMultiple_Date(e.value);
                }}
                monthNavigator
                yearNavigator
                yearRange="2010:2025"
                showButtonBar
              ></Calendar>
            </div>
          </div>
          <div className="col">
            {" "}
            <div className="field col-12 md:col-6">
              <InputSwitch
                checked={checked2}
                onChange={(e) => {
                  setChecked2(e.value);
                  setChecked1(!e.value);
                }}
              />
              <br></br>
              <label htmlFor="range">Month-wise comparison: </label> <br />
              <Calendar
                disabled={checked1}
                selectionMode="multiple"
                placeholder="Start Date"
                view="month"
                dateFormat="MM-yy"
                value={multiple_month}
                onChange={(e) => {
                  setMultiple_Month(e.value);
                }}
                monthNavigator
                yearNavigator
                yearRange="2010:2025"
                showButtonBar
              ></Calendar>
            </div>
          </div>
          <div className="col">
            {" "}
            <div className="field col-12 md:col-10">
              <InputSwitch
                checked={checked4}
                onChange={(e) => {
                  setChecked4(e.value);
                }}
              />
              {"  "}
              <label htmlFor="range">Interval (1 to 1440 minutes)</label>
              <InputNumber
                min={1}
                max={1440}
                disabled={!checked4}
                value={multiminutes}
                onValueChange={(e) => setmultiminutes(e.value)}
                suffix=" minutes"
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-danger"
                incrementButtonClassName="p-button-success"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
            </div>
          </div>
          <div className="col">
            <label htmlFor="range">Select substation : </label>
            <br />
            <MultiSelect
              selectionLimit={5}
              display="chip"
              placeholder="Select 220/400/765KV Line(s)"
              value={multiple_Selected_mvar_states}
              options={multiple_mvar_states}
              onChange={(e) => setmultipleSelected_mvar_states(e.value)}
              filter
            />{" "}
          </div>{" "}
          <div className="col">
            {" "}
            Fetch Multi-MVAR data:
            <br />
            <Button
              style={{
                width: "auto",
                float: "center",
              }}
              label="Get Multi-MVAR Data"
              aria-label="multiMVAR Data"
              onClick={() => {
                getmultimvardata();
              }}
            />
            <div className="field-checkbox">
              Show Frequency:
              <Checkbox
                inputId="1"
                name="city"
                value="Durgapur"
                onChange={frequency_region_change}
                checked={freq_region.indexOf("Durgapur") !== -1}
              />
              <label htmlFor="1">Durgapur</label>
              <Checkbox
                inputId="2"
                name="city"
                value="Jeypore"
                onChange={frequency_region_change}
                checked={freq_region.indexOf("Jeypore") !== -1}
              />
              <label htmlFor="2">Jeypore</label>
              <Checkbox
                inputId="3"
                name="city"
                value="Sasaram"
                onChange={frequency_region_change}
                checked={freq_region.indexOf("Sasaram") !== -1}
              />
              <label htmlFor="3">Sasaram</label>
            </div>
          </div>
        </div>
        <Divider />
        <div hidden={graphenable2}>
          <Mvargraph
            mvar_data={multiple_mvar_data}
            Selected_mvar_states={multiple_Selected_mvar_states}
            date_time={true}
            check1={checked1}
            check2={checked2}
            frequency={multifrequency}
            freq_region={freq_region}
          />
        </div>
      </Fieldset>
    </>
  );
}
