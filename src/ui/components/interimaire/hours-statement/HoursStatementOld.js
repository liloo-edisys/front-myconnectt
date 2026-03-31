import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";
import axios from "axios";

function HoursStatement(props) {
  const [rhList, setRhList] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    const body = {
      tenantID: 1,
      applicantID: 0,
      status: 0,
      pageSize: 0,
      pageNumber: 0
    };
    /*let body = {
      tenantID: 0,
      accountID: 0,
      chantierID: 0,
      applicantID: 0,
      status: 1,
      startDate: "2021-11-08T12:28:45.680Z",
      endDate: "2021-11-08T12:28:45.680Z",
      qualificationID: 0,
      contractNumber: "string",
      applicantName: "string",
      pageSize: 0,
      pageNumber: 0,
    };*/
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/SearchTimeRecords`,
        body
      )
      .then(res => {
        setRhList(res.data.list);
        setTotalCount(res.data.list.length);
      })
      .catch(err => console.log(err));
  }, []);
  return (
    <div>
      <Card>
        <CardHeader title="Hours statement">
          <CardHeaderToolbar>
            <button
              onClick={() => this.handleUpdateChildren()}
              className="btn btn-icon btn-light-primary pulse pulse-primary mr-5"
            >
              <i className="flaticon-refresh"></i>
              <span className="pulse-ring"></span>
            </button>
          </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          {rhList &&
            rhList.map((item, i) => (
              <div
                className="mb-10"
                style={{ border: "2px solid lightgrey", position: "relative" }}
              >
                <div
                  style={{
                    backgroundColor: "lightgrey",
                    textAlign: "center",
                    fontSize: 16
                  }}
                  className="p-5"
                >
                  <strong>Semaine N°{item.weekNumber}</strong>
                  <button
                    style={{ position: "absolute", right: 10, top: 10 }}
                    className="btn btn-light-danger font-weight-bold px-9"
                  >
                    Réclamation
                  </button>
                </div>
                <div
                  className="row mx-10 py-2 mt-5"
                  style={{ borderBottom: "1px solid lightgrey" }}
                >
                  <div style={{ width: "12.5%" }} />
                  {item.dailyTimeRecords &&
                    item.dailyTimeRecords.map((day, j) => (
                      <div style={{ width: "12.5%", textAlign: "center" }}>
                        <div>{new Date(day.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                </div>
                <div
                  className="row mx-10 py-2"
                  style={{ borderBottom: "1px solid lightgrey" }}
                >
                  <div style={{ width: "12.5%" }} className="mt-2">
                    Heures de jour
                  </div>
                  {item.dailyTimeRecords &&
                    item.dailyTimeRecords.map((day, j) => (
                      <div
                        style={{
                          width: "12.5%",
                          display: "flex",
                          justifyContent: "center"
                        }}
                      >
                        <div>
                          <span>{day.dayHours}</span>h
                          <span>{day.dayMinutes}</span>
                        </div>
                      </div>
                    ))}
                </div>
                <div
                  className="row mx-10 py-2 mb-5"
                  style={{ borderBottom: "1px solid lightgrey" }}
                >
                  <div style={{ width: "12.5%" }} className="mt-2">
                    Heures de nuit
                  </div>
                  {item.dailyTimeRecords &&
                    item.dailyTimeRecords.map((day, j) => (
                      <div
                        style={{
                          width: "12.5%",
                          display: "flex",
                          justifyContent: "center"
                        }}
                      >
                        <div>
                          <span>{day.nightHours}</span>h
                          <span>{day.nightMinutes}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </CardBody>
      </Card>
    </div>
  );
}

export default HoursStatement;
