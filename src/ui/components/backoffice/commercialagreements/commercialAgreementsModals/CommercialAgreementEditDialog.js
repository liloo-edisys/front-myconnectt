import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { updateCommercialAgreement } from "../../../../../business/actions/backoffice/CommercialAgreementsActions";
import "./styles.scss";

export function CommercialAgreementEditDialog({ onHide }) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const {
    loading,
    commercialAgreement,
    groups,
    jobTitles,
    accounts
  } = useSelector(
    state => ({
      loading: state.commercialAgreementsdReducerData.loading,
      commercialAgreement:
        state.commercialAgreementsdReducerData.commercialAgreement,
      accounts: state.lists.accounts,
      groups: state.lists.accountGroups,
      jobTitles: state.lists.jobTitles
    }),
    shallowEqual
  );

  let filteredCompanies = accounts.length
    ? accounts.filter(company => company.parentID === null)
    : [];

  const [coefficient, setCoefficient] = useState("");
  const [groupID, setGroupID] = useState("");
  const [qualificationID, setQualificationID] = useState("");
  const [accountID, setAccountID] = useState("");

  const editor = useRef(null);

  const config = {
    readonly: false
  };

  useEffect(() => {
    setGroupID(commercialAgreement.groupID);
    setQualificationID(commercialAgreement.qualificationID);
    setCoefficient(commercialAgreement.coefficient);
    setAccountID(commercialAgreement.accountID);
  }, [commercialAgreement]);

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

  const modifyCommercialAgreement = () => {
    dispatch(
      updateCommercialAgreement.request({
        ...commercialAgreement,
        groupID: parseInt(groupID),
        accountID: parseInt(accountID),
        qualificationID: parseInt(qualificationID),
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
      dialogClassName="modal-90w"
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
            onClick={modifyCommercialAgreement}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.SAVE.DONE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
