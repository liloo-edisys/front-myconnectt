import React, { useEffect, useState } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import { toastr } from "react-redux-toastr";
import axios from "axios";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

function ComplaintsList(props) {
  const { id } = useParams();
  const intl = useIntl();
  const { getRH } = props;
  const history = useHistory();
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));
  const [
    customersComplaintsListData,
    setCustomersComplaintsListData
  ] = useState([]);
  const [complaint, setComplaint] = useState("");
  const [
    applicantsComplaintsListData,
    setApplicantsComplaintsListData
  ] = useState([]);

  useEffect(() => {
    getData();
  }, [id]);

  const getData = () => {
    const GET_TIME_RECORDS_COMPLAINTS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/timerecordclaim/gettimerecordclaims/${id}`;
    axios
      .get(GET_TIME_RECORDS_COMPLAINTS_URL)
      .then(res => {
        setCustomersComplaintsListData(
          res.data.filter(claim => claim.type === 1)
        );
        /*setApplicantsComplaintsListData(
          res.data.filter((claim) => claim.type === 2)
        );*/
      })
      .catch(err => console.log(err));
  };

  const setAsProcessed = claimId => {
    const SET_AS_PROCESSED_TIME_RECORDS_COMPLAINTS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/timerecordclaim/setasprocessed/${claimId}`;
    axios
      .get(SET_AS_PROCESSED_TIME_RECORDS_COMPLAINTS_URL)
      .then(res => {
        getData();
        getRH();
      })
      .catch(err => console.log(err));
  };

  const rowStyle = (row, rowIndex) => {
    return {
      backgroundColor: row.status === 2 ? "#C9F7F5" : ""
    };
  };

  const sendComplaint = complainId => {
    const POST_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/claimmessage`;

    if (!isNullOrEmpty(complaint)) {
      const body = {
        tenantID: user.tenantID,
        timeRecordClaimID: parseInt(complainId),
        message: complaint,
        claimType: 1,
        senderType: 2
      };
      axios
        .post(POST_TIME_RECORDS_URL, body)
        .then(res => {
          toastr.success(
            intl.formatMessage({ id: "SUCCESS" }),
            intl.formatMessage({ id: "SUCCESS.MESSAGE" })
          );
          //history.goBack();
          getRH();
          setComplaint("");
          getData();
        })
        .catch(err => console.log(err));
    } else
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        intl.formatMessage({ id: "ERROR.CLAIM" })
      );
  };

  /*const columns = [
    {
      dataField: "description",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.DESCRIPTION" }),
      formatter: (value, row) => (
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      headerStyle: (colum, colIndex) => {
        return { width: "160px" };
      },
      formatter: (value, row) => {
        return (
          <>
            {row.status === 1 && <div>En cours</div>}
            {row.status === 2 && (
              <span style={{ color: "#15BCBD" }}>
                <FormattedMessage id="STATUS.PROCESSED" />
              </span>
            )}
          </>
        );
      }
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      headerStyle: (colum, colIndex) => {
        return { width: "160px" };
      },
      formatter: (value, row) => {
        return (
          <>
            {row.status === 1 && (
              <button className="btn btn-light-primary">
                Voir les message
              </button>
            )}
          </>
        );
      }
    }
  ];*/

  return (
    <Modal
      show={true}
      onHide={() => history.push("/cra")}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage id="TEXT.COMPLAINTS.LIST" />
          </p>
        </Modal.Title>
        <button
          onClick={() => history.push("/cra")}
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body className="py-0 m-5">
        {customersComplaintsListData != null &&
          customersComplaintsListData.length > 0 && (
            <div className="mb-10 p-5 bg-light-primary font-weight-bold">
              <h4
                className="pb-2 mb-5"
                style={{ borderBottom: "2px solid black" }}
              >
                <strong>
                  <FormattedMessage id="TEXT.YOUR.COMPLAINTS" />
                </strong>
              </h4>
              {customersComplaintsListData[0].messages.map(message => (
                <div
                  style={{ borderBottom: "1px solid grey" }}
                  className="px-10 pb-3"
                >
                  <Row>
                    <Col lg={1}>{message.senderInitials}</Col>
                    <Col lg={10}>
                      <div>
                        <div
                          dangerouslySetInnerHTML={{ __html: message.message }}
                        />
                        <div>-- {message.senderName} --</div>
                      </div>
                    </Col>
                    <Col lg={1}>
                      {new Date(message.creationDate).toLocaleString()}
                    </Col>
                  </Row>
                </div>
              ))}
              <Row className="mt-10 mb-10">
                <Col lg={1} />
                <Col lg={10}>
                  <div>
                    <textarea
                      values={complaint}
                      placeholder="Répondez ici..."
                      rows="5"
                      style={{ width: "100%" }}
                      onChange={e => setComplaint(e.target.value)}
                    />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-shadow font-weight-bold px-9 py-5 mt-5"
                      onClick={() =>
                        sendComplaint(customersComplaintsListData[0].id)
                      }
                    >
                      <FormattedMessage id="BUTTON.SAVE.DONE" />
                    </button>
                  </div>
                </Col>
                <Col lg={1} />
              </Row>
              {/*<BootstrapTable
                remote
                rowClasses={["dashed"]}
                wrapperClasses="table-responsive"
                bordered={false}
                classes="table table-head-custom table-vertical-center overflow-hidden"
                bootstrap4
                keyField="id"
                data={customersComplaintsListData}
                columns={columns}
                rowStyle={rowStyle}
              />*/}
            </div>
          )}
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => history.push("/cra")}
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ComplaintsList;
