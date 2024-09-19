import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { createCommercialAgreement } from "../../../../../business/actions/backoffice/commercialAgreementsActions";
import "./styles.scss";

export function CommercialAgreementCreateDialog({ onHide }) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const {
    user,
    commercialAgreement,
    groups,
    jobTitles,
    accounts
  } = useSelector(
    state => ({
      user: state.user.user,
      groups: state.lists.accountGroups,
      accounts: state.lists.accounts,
      jobTitles: state.lists.jobTitles
    }),
    shallowEqual
  );

  let filteredCompanies = accounts.length
    ? accounts.filter(company => company.parentID === null)
    : [];

  const [coefficient, setCoefficient] = useState("");
  const [groupID, setGroupID] = useState("");
  const [accountID, setAccountID] = useState("");
  const [qualificationID, setQualificationID] = useState("");

  const editor = useRef(null);

  const config = {
    readonly: false
  };

  useEffect(() => {}, [commercialAgreement]);

  const renderCompanySelect = () => {
    return (
      <div className="form-group row">
        <label>
          <FormattedMessage id="TEXT.COMPANY" />
        </label>
        <select
          className="form-control"
          name="accountID"
          value={accountID}
          onChange={e => {
            setAccountID(e.target.value);
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.COMPANY" })} --
          </option>
          {filteredCompanies.map(data => (
            <option key={data.id} label={data.name} value={data.id}>
              {data.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderGroupSelect = () => {
    return (
      <div className="form-group row">
        <label>
          <FormattedMessage id="MODEL.ACCOUNT.GROUP" />
        </label>
        <select
          className="form-control"
          name="jobTitleID"
          value={groupID}
          onChange={e => {
            setGroupID(e.target.value);
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "MODEL.ACCOUNT.GROUP" })} --
          </option>
          {groups.map(group => (
            <option key={group.id} label={group.name} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderJobTitlesSelect = () => {
    return (
      <div className="form-group row">
        <label>
          <FormattedMessage id="TEXT.QUALIFICATION" />
        </label>
        <select
          className="form-control"
          name="jobTitleID"
          value={qualificationID}
          onChange={e => {
            setQualificationID(e.target.value);
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.QUALIFICATION" })} --
          </option>
          {jobTitles.map(jobTitle => (
            <option key={jobTitle.id} label={jobTitle.name} value={jobTitle.id}>
              {jobTitle.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const handleClose = () => {
    onHide();
  };

  const create = () => {
    dispatch(
      createCommercialAgreement.request({
        tenantID: user.tenantID,
        qualificationID: qualificationID != "" ? parseInt(qualificationID) : 0,
        groupID: groupID != "" ? parseInt(groupID) : null,
        accountID: accountID != "" ? parseInt(accountID) : null,
        coefficient: parseFloat(coefficient)
      })
    );
    onHide();
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage id="COMMERCIAL.AGREEMENT" />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage id="COMMERCIAL.AGREEMENT" />
          </p>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={() => handleClose()}
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
        <div className="form-group row">
          <label>
            <FormattedMessage id="TEXT.COEFFICIENT" />
          </label>
          <textarea
            className="form-control"
            onChange={e => setCoefficient(e.target.value)}
            value={coefficient}
            style={{
              resize: "none",
              maxHeight: "40px",
              minHeight: "35px"
            }}
          />
        </div>
        {renderCompanySelect()}
        {renderGroupSelect()}
        {renderJobTitlesSelect()}
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={create}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="TEXT.CREATE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
