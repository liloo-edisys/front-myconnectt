/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { shallowEqual, useSelector } from "react-redux";

const TENANTID = process.env.REACT_APP_TENANT_ID;

export function ProfileReferencesModal({
  show,
  onHide,
  intl,
  handleEditRefs,
  handleUpdateRefs,
  row
}) {
  const [manager, setManager] = useState(null);
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [contractType, setContractType] = useState(null);
  const [city, setCity] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [mailError, setMailError] = useState(null);

  const { contractTypes, user } = useSelector(
    state => ({
      user: state.auth.user,
      contractTypes: state.lists.contractType
    }),
    shallowEqual
  );
  useEffect(() => {
    checkPhone(phone);
    checkMail(email);

    if (!isNullOrEmpty(row)) {
      isNullOrEmpty(manager) &&
        !isNullOrEmpty(row.contactName) &&
        setManager(row.contactName);
      isNullOrEmpty(email) &&
        !isNullOrEmpty(row.contactEmail) &&
        setEmail(row.contactEmail);
      isNullOrEmpty(phone) &&
        !isNullOrEmpty(row.contactPhone) &&
        setPhone(row.contactPhone);
      isNullOrEmpty(company) &&
        !isNullOrEmpty(row.companyName) &&
        setCompany(row.companyName);
      isNullOrEmpty(city) && !isNullOrEmpty(row.city) && setCity(row.city);
      isNullOrEmpty(jobTitle) &&
        !isNullOrEmpty(row.jobTitle) &&
        setJobTitle(row.jobTitle);
      isNullOrEmpty(contractType) &&
        !isNullOrEmpty(row.contractTypeID) &&
        setContractType(row.contractTypeID);
    }
  }, [row, manager, email, phone, company, city, jobTitle, contractType]);

  const onClose = () => {
    setManager("");
    setEmail("");
    setPhone("");
    setCompany("");
    setJobTitle("");
    setContractType("");
    onHide();
  };

  const handleValidate = () => {
    // if(hasError()){
    //   toastr.error('Erreur', "Veuillez remplir les champs obligatoires.")
    // }
    isNullOrEmpty(row)
      ? handleEditRefs({
          id: 0,
          tenantID: parseInt(TENANTID),
          contactName: manager,
          contactEmail: email,
          contactPhone: phone,
          companyName: company,
          jobTitle: jobTitle,
          contractTypeID: contractType,
          applicantID: user.applicantID,
          city: city,
          isApproved: false
        })
      : handleUpdateRefs(
          {
            id: row.id,
            tenantID: parseInt(TENANTID),
            contactName: manager,
            contactEmail: email,
            contactPhone: phone,
            companyName: company,
            jobTitle: jobTitle,
            contractTypeID: contractType,
            applicantID: user.applicantID,
            city: city,
            isApproved: false
          },
          row.index
        );
    onClose();
  };
  const checkPhone = phone => {
    let value =
      phone &&
      phone.match(/^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/) !== null &&
      phone.match(/^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/)[0];
    if (value === false) {
      setPhoneError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
    } else {
      setPhoneError(null);
    }
    return (
      phone &&
      phone.match(/^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/) !== null &&
      phone.match(/^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/)[0]
    );
  };

  const checkMail = email => {
    let value =
      email &&
      email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) !== null &&
      email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)[0];
    if (value === false) {
      setMailError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
    } else {
      setMailError(null);
    }
    return (
      phone &&
      phone.match(/^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/) !== null &&
      phone.match(/^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/)[0]
    );
  };
  const hasError = () => {
    let hasErr = false;
    if (!isNullOrEmpty(mailError) || !isNullOrEmpty(phoneError)) {
      hasErr = true;
    } else if (isNullOrEmpty(company)) {
      hasErr = true;
    } else if (isNullOrEmpty(manager)) {
      hasErr = true;
    } else if (isNullOrEmpty(jobTitle)) {
      hasErr = true;
    } else hasErr = false;
    return hasErr;
  };

  return (
    <Modal
      show={show}
      onHide={() => onClose()}
      aria-labelledby="example-modal-sizes-title-lg"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {!row ? (
            <FormattedMessage id="TEXT.ADD.REF" />
          ) : (
            <FormattedMessage id="TEXT.EDIT.REF" />
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="wizard-body py-8 px-8">
          <div className="row mx-10">
            <div className="pb-5 width-full">
              <div className="row">
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.MANAGER" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "MODEL.MANAGER"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setManager(e.target.value)}
                        value={manager}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.EMAIL" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "MODEL.EMAIL"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                      />
                    </div>
                    {!isNullOrEmpty(mailError) ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{mailError}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.PHONE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "MODEL.PHONE"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setPhone(e.target.value)}
                        value={phone}
                      />
                    </div>
                    {!isNullOrEmpty(phoneError) ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{phoneError}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="TEXT.COMPANY" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "TEXT.COMPANY"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setCompany(e.target.value)}
                        value={company}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="TEXT.LOCATION" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "TEXT.LOCATION"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setCity(e.target.value)}
                        value={city}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="TEXT.PAST.JOB" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "TEXT.PAST.JOB"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setJobTitle(e.target.value)}
                        value={jobTitle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.CONTRACT.TYPE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <select
                        name="missionRemunerationItems"
                        className="col-lg-12 form-control"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "MODEL.DESIGNATION"
                        })}
                        value={contractType}
                        onChange={e => {
                          setContractType(parseInt(e.target.value));
                        }}
                      >
                        <option disabled selected value>
                          --{" "}
                          {intl.formatMessage({
                            id: "MODEL.ANOTHER_REMUNERATION"
                          })}{" "}
                          --
                        </option>
                        {!isNullOrEmpty(contractTypes) &&
                          contractTypes.map(job => (
                            <option
                              key={job.id}
                              label={job.name}
                              value={job.id}
                            >
                              {job.name}
                            </option>
                          ))}
                        ;
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <> </>
          {hasError() === true ? (
            <button
              type="button"
              disabled
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            >
              {!row ? (
                <FormattedMessage id="TEXT.ADD" />
              ) : (
                <FormattedMessage id="BUTTON.SAVE.DONE" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleValidate()}
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            >
              {!row ? (
                <FormattedMessage id="TEXT.ADD" />
              ) : (
                <FormattedMessage id="BUTTON.SAVE.DONE" />
              )}
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
