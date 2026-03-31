import React, { useState, useEffect } from "react";

import { Modal } from "react-bootstrap";
import { useHistory, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import axios from "axios";
import { useIntl } from "react-intl";

function ClientDetails(props) {
  const history = useHistory();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { id } = useParams();
  const onHideMissionModal = () => {
    history.goBack();
  };
  const [activeClient, setActiveClient] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const ACCOUNT_URL = `${process.env.REACT_APP_WEBAPI_URL}api/account/${id}`;
    axios
      .get(ACCOUNT_URL)
      .then(res => {
        setActiveClient(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  return (
    <Modal
      show={true}
      onHide={onHideMissionModal}
      aria-labelledby="example-modal-sizes-title-lg"
      size="xl"
    >
      <>
        <Modal.Header closeButton>
          {!activeClient ? (
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
                    {intl.formatMessage({ id: "TEXT.COMPANY" }) + " : "}{" "}
                    {activeClient.name}
                    <i className="flaticon2-correct text-success font-size-h5 ml-2" />
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
          {!activeClient ? (
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
                        {intl.formatMessage({ id: "TEXT.DETAILS" })}
                      </span>
                      <div className="text-dark">
                        <div>
                          <span className="text-dark text-hover-primary font-weight-bold">
                            {intl.formatMessage({
                              id: "MODEL.ACCOUNT.ADDRESS"
                            }) + " :"}
                          </span>
                          <span className="ml-2">
                            {activeClient.address +
                              " " +
                              activeClient.postalCode +
                              " " +
                              activeClient.city}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-dark text-hover-primary font-weight-bold">
                            {intl.formatMessage({ id: "MODEL.ACCOUNT.SIRET" }) +
                              " :"}
                          </span>
                          <span className="ml-2">{activeClient.siret}</span>
                        </div>
                        {/*<div className="mt-3">
                          <span className="text-dark text-hover-primary font-weight-bold">
                            {intl.formatMessage({
                              id: "MODEL.ACCOUNT.COMPANYSTATUS"
                            }) + " :"}
                          </span>
                          <span className="ml-2">
                            {activeClient.companyStatus}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-dark text-hover-primary font-weight-bold">
                            {intl.formatMessage({
                              id: "MODEL.ACCOUNT.APENUMBER"
                            }) + " :"}
                          </span>
                          <span className="ml-2">{activeClient.apeNumber}</span>
                          </div>
                        <div className="mt-3">
                          <span className="text-dark text-hover-primary font-weight-bold">
                            {intl.formatMessage({
                              id: "MODEL.ACCOUNT.TVANUMBER"
                            }) + " :"}
                          </span>
                          <span className="ml-2">{activeClient.tvaNumber}</span>
                        </div>*/}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </>
    </Modal>
  );
}

export default ClientDetails;
