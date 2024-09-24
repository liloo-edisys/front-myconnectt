import React, { useEffect, useState } from "react";
import { useParams, Link, Route, useHistory } from "react-router-dom";
import SVG from "react-inlinesvg";
import BootstrapTable from "react-bootstrap-table-next";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import { FormattedMessage, useIntl } from "react-intl";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import { ApplicantListModal } from "./applicant-list-modal";
import CompanyEditModal from "../customers/companiesModals/CompanyEditModal";
import WorksiteEditModal from "../customers/companiesModals/WorksiteEditModal";
import { updateCompany } from "actions/client/companiesActions";
import { useDispatch } from "react-redux";

function CustomerOrder(props) {
  const intl = useIntl();
  const history = useHistory();
  const { missionId } = useParams();
  const dispatch = useDispatch();
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
  }, [missionId]);

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
        if (err.response) {
          toastr.error(
            intl.formatMessage({ id: "ERROR" }),
            intl.formatMessage({ id: err.response.data })
          );
        } else {
          toastr.error(
            intl.formatMessage({ id: "ERROR" }),
            intl.formatMessage({ id: "TEXT.ERROR.FRIENDLY" })
          );
        }
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
        <div
          className={
            applicationStatus[value] ? applicationStatus[value].color : ""
          }
        >
          {applicationStatus[value] ? applicationStatus[value].name : ""}
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
      formatter: (value, row) => <span>{row.applicant.user.email}</span>
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          <Link
            to={`/customer-order/${missionId}/${row.applicant.id}`}
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
    }
  ];
  const showApplicantList = () => {
    setToogleApplicantList(true);
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
      <Route path="/customer-order/:missionId/edit/:id">
        {({ history, match }) => (
          <CompanyEditModal
            show={match != null}
            id={match && match.id}
            getData={getData}
            history={history}
            updateCompany={updateCompany}
            onHide={() => {
              history.push(`/customer-order/${missionId}`);
            }}
          />
        )}
      </Route>{" "}
      <Route path="/customer-order/:missionId/edit-worksite/:id">
        {({ history, match }) => (
          <WorksiteEditModal
            show={match != null}
            id={match && match.params.id}
            history={history}
            getData={getData}
            updateCompany={updateCompany}
            onHide={() => {
              history.push(`/customer-order/${missionId}`);
            }}
          />
        )}
      </Route>
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
                      <span className="text-dark text-hover-primary font-weight-bold font-size-h5">
                        Créée le{" "}
                        {new Date(
                          activeCustomerOrder.vacancy.creationDate
                        ).toLocaleDateString("fr-FR")}{" "}
                      </span>
                      <span className="text-dark text-hover-primary font-weight-bold font-size-h5">
                        {activeCustomerOrder.vacancy.vacancyNumberOfJobs -
                          activeCustomerOrder.vacancy
                            .vacancyNumberOfOccupiedJobs}{" "}
                        <FormattedMessage id="MESSAGE.JOBS.REMAINING" />{" "}
                        {activeCustomerOrder.vacancy.vacancyNumberOfJobs}.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
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
                      <span
                        onClick={() =>
                          history.push(
                            `/customer-order/${missionId}/edit/${activeCustomerOrder.entreprise.id}`,
                            activeCustomerOrder.entreprise
                          )
                        }
                        className="text-dark text-hover-primary font-weight-bold font-size-h5"
                        style={{ cursor: "pointer" }}
                      >
                        Client {activeCustomerOrder.entreprise.name} -{" "}
                        {statusEntrepriseArray[
                          activeCustomerOrder.chantier.accountStatusID
                        ]
                          ? statusEntrepriseArray[
                              activeCustomerOrder.chantier.accountStatusID
                            ].name
                          : ""}
                      </span>
                      <span
                        onClick={() =>
                          history.push(
                            `/customer-order/${missionId}/edit-worksite/${activeCustomerOrder.chantier.id}`,
                            activeCustomerOrder.chantier
                          )
                        }
                        className="text-dark text-hover-primary font-weight-bold font-size-h5"
                        style={{ cursor: "pointer" }}
                      >
                        <FormattedMessage id="MODEL.VACANCY.LOCATION" />{" "}
                        {activeCustomerOrder.chantier.name} -{" "}
                        {statusEntrepriseArray[
                          activeCustomerOrder.chantier.accountStatusID
                        ]
                          ? statusEntrepriseArray[
                              activeCustomerOrder.chantier.accountStatusID
                            ].name
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row text-dark font-weight-bold font-size-h5">
                    <div className="col-lg-8">
                      <div className="row">
                        <FormattedMessage id="COLUMN.ANAEL.ID" /> :{" "}
                        <strong className="ml-5">
                          {activeCustomerOrder &&
                          activeCustomerOrder.vacancy.anaelID
                            ? activeCustomerOrder.vacancy.anaelID
                            : ""}
                        </strong>
                      </div>
                      {/*<Formik
                        enableReinitialize={true}
                        initialValues={initialValuesRib}
                        validationSchema={RibSchema}
                        setFieldValue
                        onSubmit={(values, { setSubmitting }) => {
                          setLoadingAnaelID(true);
                          let body = {
                            ...activeCustomerOrder.vacancy,
                            anaelID: values.anaelID
                          };
                          axios
                            .post(
                              `${process.env.REACT_APP_WEBAPI_URL}api/Vacancy/UpdateAnaelID`,
                              body
                            )
                            .then(() => {
                              setLoadingAnaelID(false);
                              toastr.success(
                                "Sccèss",
                                "Le matricule Anael a bien été mis à jour."
                              );
                              getData();
                            })
                            .catch(() => {
                              setLoadingAnaelID(false);
                              toastr.error(
                                "Erreur",
                                "Une erreur s'est produite lors de l'enregistrement du matricule Anael."
                              );
                            });
                        }}
                      >
                        {({
                          values,
                          touched,
                          errors,
                          status,
                          handleSubmit,
                          setFieldValue
                        }) => (
                          <Form
                            id="kt_login_signin_form"
                            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
                            onSubmit={handleSubmit}
                          >
                            <div className="row">
                              <div
                                className="col-lg-3"
                                style={{
                                  display: "flex",
                                  alignItems: "center"
                                }}
                              >
                                <label htmlFor="anaelID">
                                  <FormattedMessage id="COLUMN.ANAEL.ID" />
                                </label>
                              </div>
                              <div className="col-lg-9">
                                <div
                                  className="input-group width-100"
                                  style={{
                                    width: "100%"
                                  }}
                                >
                                  <Field
                                    placeholder={intl.formatMessage({
                                      id: "COLUMN.ANAEL.ID"
                                    })}
                                    type="text"
                                    className={`form-control`}
                                    name="anaelID"
                                  />
                                  <div className="input-group-append">
                                    <button
                                      type="submit"
                                      className="input-group-text"
                                    >
                                      {loadingAnaelID ? (
                                        <span className="ml-3 spinner spinner-white"></span>
                                      ) : (
                                        <i className="icon-l far fa-save text-primary"></i>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {touched.anaelID && errors.anaelID ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.anaelID}
                                </div>
                              </div>
                            ) : null}
                          </Form>
                        )}
                      </Formik>*/}
                    </div>
                    <div className="col-lg-4">
                      {activeCustomerOrder.vacancy.status < 3 && (
                        <button
                          className="btn  btn-light-primary mr-2"
                          onClick={showApplicantList}
                        >
                          <FormattedMessage id="TEXT.INVITE.INTERIMAIRE" />
                        </button>
                      )}
                      {activeCustomerOrder &&
                        activeCustomerOrder.vacancy.status >= 3 &&
                        !activeCustomerOrder.vacancy.anaelID && (
                          <button
                            className="btn  btn-light-info mr-2"
                            onClick={sendAnael}
                          >
                            <FormattedMessage id="SEND.TO.ANAEL" />
                          </button>
                        )}
                    </div>
                  </div>
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
