import React, { useEffect, useState } from "react";
import { useParams, Link, Route, useHistory } from "react-router-dom";
import SVG from "react-inlinesvg";
import { Formik, Form, Field } from "formik";
import BootstrapTable from "react-bootstrap-table-next";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import { FormattedMessage, useIntl } from "react-intl";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import { ApplicantListModal } from "./applicant-list-modal";
import { approveByCustomer } from "actions/client/ApplicantsActions";
import { useDispatch } from "react-redux";

function CustomerOrder(props) {
  const intl = useIntl();
  const history = useHistory();
  const { missionId } = useParams();
  const dispatch = useDispatch();
  const { refresh } = props;
  const [activeCustomerOrder, setActiveCustomerOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAnaelID, setLoadingAnaelID] = useState(false);
  const [toogleApplicantList, setToogleApplicantList] = useState(false);
  /*const optionsTime = {
    hours: "short",
    minutes: "numeric",
  };*/

  const initialValuesRib = {
    anaelID:
      activeCustomerOrder && activeCustomerOrder.vacancy.anaelID
        ? activeCustomerOrder.vacancy.anaelID
        : ""
  };

  const RibSchema = Yup.object().shape({
    anaelID: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .min(6, intl.formatMessage({ id: "WARNING.ANAEL.CUSTOMER.ORDER.LENGTH" }))
      .max(6, intl.formatMessage({ id: "WARNING.ANAEL.CUSTOMER.ORDER.LENGTH" }))
  });

  useEffect(() => {
    getData();
  }, [missionId, refresh]);

  const applicationStatus = [
    {
      name: intl.formatMessage({ id: "STATUS.MATCHING.DENIED" }),
      id: 0,
      color: "label font-weight-bold label-light-gray label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.APPLICANT.INVITED" }),
      id: 1,
      color: "label font-weight-bold label-light-primary label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.SPONTANEOUS.APPLICATION" }),
      id: 2,
      color: "label font-weight-bold label-light-primary label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.APPLICATION.DECLINED" }),
      id: 3,
      color: "label font-weight-bold label-light-danger label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.APPLICATION.DENIED" }),
      id: 4,
      color: "label font-weight-bold label-light-danger label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.SELECTED" }),
      id: 5,
      color: "label font-weight-bold label-light-success label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.CANCEL.VACANCY" }),
      id: 6,
      color: "label font-weight-bold label-light-success label-inline"
    }
  ];

  const statusArray = [
    { value: 0, label: intl.formatMessage({ id: "STATUS.DRAFT" }) },
    { value: 1, label: intl.formatMessage({ id: "STATUS.NON.PROVIDED" }) },
    {
      value: 2,
      label: intl.formatMessage({ id: "STATUS.PARTIALLY.PROVIDED" })
    },
    { value: 3, label: intl.formatMessage({ id: "STATUS.PROVIDED" }) },
    {
      value: 4,
      label: intl.formatMessage({ id: "STATUS.PROPOSITION.CANCELED" })
    },
    {
      value: 5,
      label: intl.formatMessage({ id: "STATUS.VALIDATED.MYCONNECTT" })
    }
  ];

  const statusEntrepriseArray = [
    { id: 0, value: 0, name: "" },
    { id: 1, value: 1, name: intl.formatMessage({ id: "STATUS.REGISTERED" }) },
    { id: 2, value: 2, name: intl.formatMessage({ id: "STATUS.MODIFIED" }) },
    {
      id: 3,
      value: 3,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.COMMERCIALS.ENCOURS" })
    },
    {
      id: 4,
      value: 4,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.COMMERCIALS" })
    },
    {
      id: 5,
      value: 5,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.ENCOURS" })
    },
    {
      id: 6,
      value: 6,
      name: intl.formatMessage({ id: "STATUS.ANAEL.UPDATED" })
    }
  ];

  const getData = () => {
    setLoading(true);
    const CUSTOMER_ORDER_URL =
      process.env.REACT_APP_WEBAPI_URL + "api/Vacancy/CommandeClient";
    const body = {
      id1: 1,
      id2: parseInt(missionId)
    };

    axios
      .post(CUSTOMER_ORDER_URL, body)
      .then(res => {
        setActiveCustomerOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
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
          <FormattedMessage id="MESSAGE.APPLICANT.VACANCY" />
        </div>
      </div>
    </div>
  );

  const sendAnael = () => {
    axios
      .get(
        process.env.REACT_APP_WEBAPI_URL +
          "api/vacancy/SendToAnael/" +
          missionId
      )
      .then(res => {
        getData();
        toastr.success(
          intl.formatMessage({ id: "TITLE.VACANCY.EDIT" }),
          intl.formatMessage({ id: "MESSAGE.VACANCY.ANAEL.FAIL" })
        );
      })
      .catch(err => {
        toastr.error(
          intl.formatMessage({ id: "TITLE.VACANCY.EDIT" }),
          intl.formatMessage({ id: err.response.data })
        );
      });
  };

  function encoreUrl(str) {
    let newUrl = "";
    const len = str && str.length;
    let url;
    for (let i = 0; i < len; i++) {
      let c = str.charAt(i);
      let code = str.charCodeAt(i);

      if (c === " ") {
        newUrl += "+";
      } else if (
        (code < 48 && code !== 45 && code !== 46) ||
        (code < 65 && code > 57) ||
        (code > 90 && code < 97 && code !== 95) ||
        code > 122
      ) {
        newUrl += "%" + code.toString(16);
      } else {
        newUrl += c;
      }
    }
    if (newUrl.indexOf(".doc") > 0 || newUrl.indexOf(".docx") > 0) {
      url = "https://view.officeapps.live.com/op/embed.aspx?src=" + newUrl;
    } else {
      url =
        "https://docs.google.com/gview?url=" +
        newUrl +
        "&embedded=true&SameSite=None";
    }
    return url;
  }

  let columns = [
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "COLUMN.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "status",
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      formatter: value => (
        <div className={applicationStatus[value].color}>
          {applicationStatus[value].name}
        </div>
      )
    },
    {
      dataField: "applicant",
      text: intl.formatMessage({ id: "TEXT.APPLICANT" }),
      formatter: value => (
        <span>
          {value.firstname} {value.lastname}
        </span>
      )
    },
    {
      text: intl.formatMessage({ id: "MODEL.VACANCY.MEETING_PHONE" }),
      formatter: (value, row) => (
        <span>
          {row.applicant.mobilePhoneNumber
            ? row.applicant.mobilePhoneNumber.match(/.{1,2}/g).join(" ")
            : row.applicant.mobilePhoneNumber}
        </span>
      )
    },
    {
      text: intl.formatMessage({ id: "MODEL.EMAIL" }),
      formatter: (value, row) => <span>{row.applicant.email}</span>
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <>
          <Link
            to={`/customer-order/${missionId}/applicant/${row.applicant.id}`}
            className="btn  btn-light-primary mr-2"
          >
            <FormattedMessage id="BUTTON.SEE.PROFILE" />
          </Link>
          {row.status === 1 ? (
            <a
              onClick={e => {
                e.stopPropagation();
                openDeleteApplicationDialog(row);
              }}
              title="Annuler l'invitation"
              className="btn btn-icon btn-light-danger mr-2"
            >
              <i className="far fa-trash-alt"></i>
            </a>
          ) : null}
          {row.status === 2 ? (
            <>
              <a
                onClick={e => {
                  e.stopPropagation();
                  openValidateDialog(row);
                }}
                title="Valider"
                className="btn btn-icon btn-light-success mr-2"
              >
                <i className="far fa-handshake"></i>
              </a>
              <a
                onClick={e => {
                  e.stopPropagation();
                  openDeclineDialog(row);
                }}
                title="Décliner"
                className="btn btn-icon btn-light-danger mr-2"
              >
                <i className="flaticon2-cancel"></i>
              </a>
            </>
          ) : null}
        </>
      )
    },
    {
      /*
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          <Link
            to={`/customer-order/${missionId}/applicant/${row.applicant.id}`}
            className="btn  btn-light-primary mr-2"
          >
            <FormattedMessage id="BUTTON.SEE.PROFILE" />
          </Link>
          <Link
            to={`/interimaire/edit/${row.applicant.id}`}
            className="btn btn-light-warning mr-2"
          >
            <FormattedMessage id="BUTTON.EDIT" />
          </Link>
          {row.status === 1 ||
            (row.status === 2 && (
              <div
                className="btn btn-light-success mr-2"
                onClick={() => onApproveByBackoffice(row)}
              >
                <FormattedMessage id="CANDIDATE.ACCEPT.TITLE" />
              </div>
            ))}
        </div>
      )
            */
    }
  ];

  const openDeleteApplicationDialog = row => {
    const newRow = {
      ...row,
      applicationID: row.id
    };
    history.push(`/customer-order/${missionId}/delete`, newRow);
  };

  const openValidateDialog = row => {
    const newRow = {
      ...row,
      applicationID: row.id
    };
    history.push(`/customer-order/${missionId}/validate`, newRow);
  };

  const openDeclineDialog = row => {
    const newRow = {
      ...row,
      applicationID: row.id
    };
    history.push(`/customer-order/${missionId}/decline`, newRow);
  };

  const showApplicantList = () => {
    history.push(
      `/customer-order/${missionId}/match`,
      activeCustomerOrder.vacancy,
      "2"
    );
    //setToogleApplicantList(true);
  };
  const hideApplicantList = () => {
    setToogleApplicantList(false);
  };
  const onApproveByBackoffice = row => {
    const body = {
      id1: activeCustomerOrder.vacancy.id,
      id2: row.applicant.id
    };
    const APPLICATION_URL =
      process.env.REACT_APP_WEBAPI_URL +
      "api/MissionApplication/ApproveByBackOffice";
    axios
      .post(APPLICATION_URL, body)
      .then(res => getData())
      .catch(err => getData());
  };
  return (
    <div>
      {toogleApplicantList && (
        <ApplicantListModal onHide={hideApplicantList} getData={getData} />
      )}
      <div
        className="alert alert-white alert-shadow fade show gutter-b ribbon ribbon-top ribbon-ver width-100"
        role="alert"
      >
        {loading ? (
          <span className="colmx-auto spinner spinner-primary"></span>
        ) : (
          activeCustomerOrder && (
            <div>
              <div>
                <h2 className="font-weight-bolder text-dark">
                  {activeCustomerOrder.vacancy.vacancyTitle} -{" "}
                  {statusArray[activeCustomerOrder.vacancy.status].label}
                </h2>
              </div>
              <div className="d-flex align-items-space-between pr-10">
                <div className="col-lg-4">
                  <div className="d-flex align-items-left p-5">
                    <div className="mr-6">
                      <span className="svg-icon svg-icon-primary svg-icon-4x">
                        <SVG
                          className=""
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Layout/Layout-grid.svg"
                          )}
                        />
                      </span>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="text-dark font-weight-bold font-size-h5">
                        Créée le{" "}
                        {new Date(
                          activeCustomerOrder.vacancy.creationDate
                        ).toLocaleDateString("fr-FR")}{" "}
                      </span>
                      <span className="text-dark font-weight-bold font-size-h5">
                        {activeCustomerOrder.vacancy.vacancyNumberOfJobs -
                          activeCustomerOrder.vacancy
                            .vacancyNumberOfOccupiedJobs}{" "}
                        <FormattedMessage id="MESSAGE.JOBS.REMAINING" />{" "}
                        {activeCustomerOrder.vacancy.vacancyNumberOfJobs}.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="d-flex align-items-left p-5">
                    <div className="mr-6">
                      <span className="svg-icon svg-icon-primary svg-icon-4x">
                        <SVG
                          className=""
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Layout/Layout-top-panel-5.svg"
                          )}
                        />
                      </span>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="text-dark font-weight-bold font-size-h5">
                        Client {activeCustomerOrder.entreprise.name} -{" "}
                        {
                          statusEntrepriseArray[
                            activeCustomerOrder.entreprise.accountStatusID
                          ].name
                        }
                      </span>
                      <span className="text-dark font-weight-bold font-size-h5">
                        <FormattedMessage id="MODEL.VACANCY.LOCATION" />{" "}
                        {activeCustomerOrder.chantier.name} -{" "}
                        {
                          statusEntrepriseArray[
                            activeCustomerOrder.chantier.accountStatusID
                          ].name
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-2">
                  {activeCustomerOrder.vacancy.status < 3 && (
                    <button
                      className="btn  btn-light-primary mr-2"
                      onClick={showApplicantList}
                    >
                      <FormattedMessage id="TEXT.CLIENT.MATCHING" />
                    </button>
                  )}
                </div>
              </div>
              <div className="card card-custom gutter-b bg-diagonal bg-diagonal-light-primary mt-5">
                <div className="card-body p-2">
                  <div className="d-flex align-items-left justify-content-between p-4 flex-lg-wrap flex-xl-nowrap">
                    <BootstrapTable
                      remote
                      rowClasses={["dashed"]}
                      wrapperClasses="table-responsive"
                      bordered={false}
                      classes="table table-head-custom table-vertical-center overflow-hidden"
                      bootstrap4
                      keyField="id"
                      data={
                        activeCustomerOrder &&
                        activeCustomerOrder.missionApplications
                      }
                      columns={columns}
                      noDataIndication={() => <NoDataIndication />}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default CustomerOrder;
