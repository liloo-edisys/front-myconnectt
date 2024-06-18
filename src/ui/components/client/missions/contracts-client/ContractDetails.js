import React, { useState, useEffect } from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import axios from "axios";
import { getCompanies } from "../../../../../business/actions/client/CompaniesActions";
import { ListGroup } from "react-bootstrap";

function ContractDetails(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { worksites, companies } = useSelector(
    state => ({
      companies: state.companies.companies
    }),
    shallowEqual
  );
  const onHideMissionModal = () => {
    history.goBack();
  };
  const [activeContract, setActiveContract] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (!companies.length) {
      dispatch(getCompanies.request());
    }
    if (companies.length) {
      const CONTRACT_URL = `${process.env.REACT_APP_WEBAPI_URL}api/contract/${id}`;
      axios
        .get(CONTRACT_URL)
        .then(res => {
          let company = companies.filter(
            company => company.id === res.data.entrepriseID
          )[0];
          let worksite = companies.filter(
            company => company.id === res.data.chantierID
          )[0];
          let response = {
            ...res.data,
            companyName: company && company.name ? company.name : "",
            worksiteName: worksite && worksite.name ? worksite.name : ""
          };
          setActiveContract(response);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    }
  }, [companies]);

  const calculateSalary = () => {
    let salary = 0;
    if (activeContract.vacancy.vacancyContractualProposedHourlySalary) {
      let first =
        activeContract.vacancy.vacancyContractualProposedHourlySalary +
        activeContract.vacancy.vacancyContractualProposedHourlySalary * 0.1;
      salary = first + first * 0.1;
    }

    return Math.round(salary * 100) / 100;
  };

  return (
    <Modal
      show={true}
      onHide={onHideMissionModal}
      aria-labelledby="example-modal-sizes-title-lg"
      size="xl"
    >
      <>
        <Modal.Header closeButton>
          {!activeContract ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ width: "100%" }}
            >
              <span className="colmx-auto spinner spinner-primary"></span>
            </div>
          ) : (
            <>
              <Modal.Title
                id="example-modal-sizes-title-lg"
                style={{ width: "100%" }}
              >
                <div className="d-flex align-items-space-between pr-10">
                  <div className="pageSubtitle pageModalSubtitle">
                    Contrat N°: {activeContract.contractNumber}
                    <i className="flaticon2-correct text-success font-size-h5 ml-2" />
                  </div>
                </div>
                <div className="separator separator-solid mt-4"></div>
                <div className="d-flex align-items-space-around flex-wrap mt-4">
                  <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
                    <span className="mr-4">
                      <i className="display-4 text-primary flaticon-calendar-with-a-clock-time-tools"></i>
                    </span>
                    <div className="d-flex flex-column text-dark-75">
                      <span className="font-weight-bolder font-size-h5">
                        <span className="font-weight-bolder font-size-sm">
                          du{" "}
                        </span>
                        {new Date(
                          activeContract.startDate
                        ).toLocaleDateString()}
                      </span>
                      <span className="font-weight-bolder font-size-h5">
                        <span className="font-weight-bolder font-size-sm">
                          au{" "}
                        </span>
                        {new Date(activeContract.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
                    <span className="mr-4">
                      <i className="display-4 text-primary flaticon2-world"></i>
                    </span>
                    <div className="d-flex flex-column text-dark-75">
                      <span className="font-weight-bolder font-size-sm">
                        <FormattedMessage id="TEXT.COMPANY" />
                      </span>
                      <span className="font-weight-bolder font-size-h5">
                        {activeContract.companyName}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
                    <span className="mr-4">
                      <i className="display-4 text-primary flaticon-map-location"></i>
                    </span>
                    <div className="d-flex flex-column text-dark-75">
                      <span className="font-weight-bolder font-size-sm">
                        <FormattedMessage id="MODEL.ACCOUNT.SITE.NAME" />
                      </span>
                      <span className="font-weight-bolder font-size-h5">
                        {activeContract.worksiteName}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
                    <span className="mr-4">
                      <i className="display-4 text-primary flaticon-coins"></i>
                    </span>
                    <div className="d-flex flex-column text-dark-75">
                      <span className="font-weight-bolder font-size-sm">
                        <FormattedMessage id="DISPLAY.HOURLY.SALARY" />
                      </span>
                      <span className="font-weight-400 font-size-sm">
                        <FormattedMessage id="DISPLAY.IFM.CP" />
                      </span>
                      <span className="font-weight-bolder font-size-h5">
                        {calculateSalary()}
                        <span className="text-dark-50 font-weight-bold ml-1">
                          €
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Modal.Title>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Fermer"
                onClick={onHideMissionModal}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px"
                }}
              >
                <i aria-hidden="true" className="ki ki-close"></i>
              </button>
            </>
          )}
        </Modal.Header>
        <Modal.Body className="py-0 background-gray pt-5">
          {!activeContract ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: 50 }}
            >
              <span className="colmx-auto spinner spinner-primary"></span>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="card card-custom gutter-b bg-diagonal bg-diagonal-light-primary">
                <div className="card-body p-2">
                  <div className="d-flex align-items-left p-5">
                    <div className="mr-6">
                      <span className="svg-icon svg-icon-danger svg-icon-4x"></span>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="text-dark text-hover-primary font-weight-bold font-size-h4 mb-3">
                        <FormattedMessage id="TEXT.MISSION" />
                      </span>
                      <div className="text-dark">
                        <div>
                          <FormattedMessage id="MODEL.ACCOUNT.CITY" /> :{" "}
                          {activeContract.city}
                        </div>
                        <div>
                          <FormattedMessage id="TEXT.QUALIFICATION" /> :{" "}
                          {activeContract.qualification}
                        </div>
                        <div>
                          <FormattedMessage id="TEXT.MISSION.DESCRIPTION" /> :{" "}
                          {activeContract.vacancy.vacancyMissionDescription}
                        </div>
                        <div>
                          <FormattedMessage id="MODEL.VACANCY.MOTIF" /> :{" "}
                          {activeContract.recourseReason}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-custom card-stretch gutter-b ribbon ribbon-top ribbon-ver">
                <div className="ribbon-target bg-int ribbon-right">
                  <i className="fas fa-exclamation-triangle text-white"></i>
                </div>
                <div className="card-header border-0 pt-5 ml-5">
                  <h3 className="card-title align-items-start flex-column">
                    <span className="text-dark text-hover-primary font-weight-bold font-size-h4 mb-3">
                      <FormattedMessage id="TEXT.AVENANTS" />
                    </span>
                  </h3>
                </div>
                <div className="mx-15 mb-5">
                  <ListGroup>
                    <ListGroup.Item as="li" disabled>
                      <div className="row">
                        <div className="col-3">
                          <FormattedMessage id="COLUMN.AMENDMENT.NUMBER" />
                        </div>
                        <div className="col-3">
                          <FormattedMessage id="MODEL.ACCOUNT.SITE.NAME" />
                        </div>
                        <div className="col-2">
                          <FormattedMessage id="MODEL.ACCOUNT.CITY" />{" "}
                        </div>
                        <div className="col-2">
                          <FormattedMessage id="TEXT.STARTDATE" />
                        </div>
                        <div className="col-2">
                          <FormattedMessage id="Date de Fin" />
                        </div>
                      </div>
                    </ListGroup.Item>
                    {activeContract.childs.map(avenant => (
                      <ListGroup.Item>
                        <div className="row">
                          <div className="col-3">{avenant.contractNumber}</div>
                          <div className="col-3">{avenant.chantierName}</div>
                          <div className="col-2">{avenant.city}</div>
                          <div className="col-2">
                            {new Date(avenant.startDate).toLocaleDateString()}
                          </div>
                          <div className="col-2">
                            {new Date(avenant.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
                <div className="separator separator-solid"></div>
              </div>
            </div>
          )}
        </Modal.Body>
      </>
    </Modal>
  );
}

export default ContractDetails;
