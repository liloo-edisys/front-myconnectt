import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import { approveByApplicant } from "../../../../../business/actions/client/ApplicantsActions";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { toastr } from "react-redux-toastr";

function ApplicantListModal(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { missionId } = useParams();
  const { onHide, getData } = props;
  const [selectedName, setSelectedName] = useState("");
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [interimairesList, setInterimairesList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);

  const onSearchFilteredApplicant = () => {
    setLoading(true);
    let body = {
      tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
      firstName: selectedFirstName,
      lastName: selectedName,
      email: selectedEmail,
      phoneNumber: selectedPhone
    };
    const INTERIMAIRES_LIST_URL =
      process.env.REACT_APP_WEBAPI_URL + "api/applicant/searchapplicants";
    axios
      .post(INTERIMAIRES_LIST_URL, body)
      .then(res => {
        setInterimairesList(res.data.list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    //(body, dispatch);
    //setIsExtension(true);
  };
  const handleApprove = applicantId => {
    setInvitationLoading(true);
    const body = {
      id1: parseInt(missionId),
      id2: parseInt(applicantId)
    };
    const APPLICATION_URL =
      process.env.REACT_APP_WEBAPI_URL +
      "api/MissionApplication/ApproveByBackOffice";

    axios
      .post(APPLICATION_URL, body)
      .then(res => {
        setInvitationLoading(false);
        toastr.success("Succès", "L'intérimaire a bien été ajouté.");
        getData();
        onHide();
      })
      .catch(err => {
        setInvitationLoading(false);
        console.log(err);
        toastr.error(intl.formatMessage({ id: "ERROR" }), err);
      });
  };

  const renderNameSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.LASTNAME" />
        </small>
      </div>
    );
  };

  const renderFirstNameSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedFirstName}
          onChange={e => setSelectedFirstName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.FIRSTNAME" />
        </small>
      </div>
    );
  };

  const renderEmailSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedEmail}
          onChange={e => setSelectedEmail(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.EMAIL" />
        </small>
      </div>
    );
  };

  const renderPhoneInput = () => {
    return (
      <div className="col-lg-2">
        <input
          name="phone"
          className="form-control"
          type="text"
          value={selectedPhone}
          onChange={e => setSelectedPhone(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="COLUMN.PHONE.NUMBER" />
        </small>
      </div>
    );
  };

  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">
          <FormattedMessage
            id="NO.CORRESPONDING"
            values={{ name: intl.formatMessage({ id: "TEXT.APPLICANT" }) }}
          />
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      dataField: "anaelID",
      text: intl.formatMessage({ id: "COLUMN.ANAEL.ID" })
    },
    {
      dataField: "id",
      text: intl.formatMessage({ id: "COLUMN.MYCONNECTT.ID" })
    },
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "COLUMN.NAME" })
    },
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" })
    },
    {
      dataField: "postalCode",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.POSTALCODE" })
    },
    {
      dataField: "mobilePhoneNumber",
      text: intl.formatMessage({ id: "COLUMN.PHONE.NUMBER" }),
      formatter: value => (
        <span>{value && value.match(/.{1,2}/g).join(" ")}</span>
      )
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" })
    },
    {
      dataField: "nationality.frenchName",
      text: intl.formatMessage({ id: "COLUMN.NATIONALITY" })
    },
    {
      dataField: "applicantStatusID",
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      formatter: value => (
        <span>
          {value === 1
            ? intl.formatMessage({ id: "STATUS.REGISTERED" })
            : value === 2
            ? intl.formatMessage({ id: "TEXT.COMPLETE" })
            : value === 3
            ? intl.formatMessage({ id: "STATUS.VALIDATED.BACKOFFICE" })
            : value === 4
            ? intl.formatMessage({ id: "STATUS.ANAEL.UPDATED" })
            : value === 6
            ? intl.formatMessage({ id: "STATUS.CAN_MATCH" })
            : intl.formatMessage({ id: "STATUS.REGISTERED" })}
        </span>
      )
    },
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "MODEL.VACANCY.CREATIONDATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <button
          className="btn  btn-light-primary mr-2"
          onClick={() => handleApprove(row.id)}
        >
          <FormattedMessage id="TEXT.INVITE.INTERIMAIRE" />
          {invitationLoading && (
            <span className="ml-3 spinner spinner-white"></span>
          )}
        </button>
      )
    }
  ];

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <FormattedMessage id="TEXT.INVITE.INTERIMAIRE" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-0">
        <>
          <div className="row mb-5 mx-15 mt-10">
            {renderNameSelector()}
            {renderFirstNameSelector()}
            {renderEmailSelector()}
            {renderPhoneInput()}
            <div className="col-lg-2">
              <button
                onClick={onSearchFilteredApplicant}
                className="btn btn-success font-weight-bold ml-10 mb-10 px-10"
                style={{
                  width: "100%"
                }}
              >
                <i className="fa fa-search mr-5"></i>
                <span>
                  <FormattedMessage id="BUTTON.SEARCH" />
                </span>
              </button>
            </div>
          </div>
          <div style={{ minHeight: 50 }}>
            {loading ? (
              <span className="colmx-auto spinner spinner-primary"></span>
            ) : (
              interimairesList && (
                <div className="mb-5">
                  <BootstrapTable
                    remote
                    rowClasses={["dashed"]}
                    wrapperClasses="table-responsive"
                    bordered={false}
                    classes="table table-head-custom table-vertical-center overflow-hidden"
                    bootstrap4
                    keyField="id"
                    data={interimairesList}
                    columns={columns}
                    noDataIndication={() => <NoDataIndication />}
                  />
                </div>
              )
            )}
          </div>
        </>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn  btn-light-primary mr-2" onClick={onHide}>
          <FormattedMessage id="MATCHING.MODAL.CLOSE" />
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ApplicantListModal;
