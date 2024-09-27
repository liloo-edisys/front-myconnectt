/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import DatePicker from "react-datepicker";
import moment from "moment";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import { isNull } from "lodash";
registerLocale("fr", fr);

export function BankEditModal({
  show,
  onHide,
  intl,
  row,
  files,
  editBankInfos,
  currentType,
  isVerso,
  birthDay,
  socialNumber,
  cityBirth,
  birthDep,
  parsed,
  isEdit,
  file
}) {
  const [startDate, setStartDate] = useState(
    isEdit && file ? file.issueDate : null
  );
  const [endDate, setEndDate] = useState(
    isEdit && file ? file.expirationDate : null
  );
  const [birthDate, setBirthDate] = useState(undefined);
  const [docType, setDocType] = useState(
    isEdit && file ? file.documentType : null
  );
  const [docName, setDocName] = useState(null);
  const [docNumber, setDocNumber] = useState(
    isEdit && file ? file.documentNumber : null
  );
  const [birthDepartment, setBirthDepartment] = useState(null);
  const [birthLoaction, setBirthLocation] = useState(null);
  const [err, setErr] = useState(null);
  const [birthErr, setBirthErr] = useState(null);

  const [bankName, setBankName] = useState(null);
  const [rib, setRib] = useState(null);
  const [bic, setBic] = useState(null);
  const [ribError, setRibError] = useState(null);
  const [bicError, setBicError] = useState(null);

  useEffect(() => {
    !isNullOrEmpty(socialNumber) &&
      docNumber === null &&
      setDocNumber(socialNumber);
    !isNullOrEmpty(birthDep) &&
      birthDepartment === null &&
      setBirthDepartment(birthDep);
    !isNullOrEmpty(cityBirth) &&
      birthLoaction === null &&
      setBirthLocation(cityBirth);
    !isNullOrEmpty(birthDay) &&
      birthDate === undefined &&
      setBirthDate(birthDay);
  });

  useEffect(() => {
    bankName === null &&
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.bankName) &&
      setBankName(parsed.bankName);
    rib === null &&
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.iban) &&
      setRib(parsed.iban);
    bic === null &&
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.bic) &&
      setBic(parsed.bic);
  }, [rib, bic]);
  useEffect(() => {
    if (!isNullOrEmpty(row)) {
      !isNullOrEmpty(row.startDate)
        ? setStartDate(moment(row.startDate).toDate())
        : setStartDate(new Date());
      !isNullOrEmpty(row.endDate)
        ? setEndDate(moment(row.endDate).toDate())
        : setStartDate(new Date());
    }
  }, [row]);

  const TypeSelect = () => {
    return (
      <div className="row">
        <select
          name="docType"
          className="col-lg-12 form-control"
          type="text"
          placeholder={intl.formatMessage({ id: "MODEL.DESIGNATION" })}
          value={docType}
          onChange={e => {
            setDocType(parseInt(e.target.value));
          }}
        >
          <option disabled value={0}>
            -- {intl.formatMessage({ id: "SELECT.CHOSE.DOCUMENT.TYPE" })} --
          </option>
          <option
            key={8}
            selected={docType === 8}
            label={intl.formatMessage({ id: "DOCUMENT.ID.CARD" })}
            value={8}
          >
            <FormattedMessage id="DOCUMENT.ID.CARD" />
          </option>
          <option
            key={9}
            selected={docType === 9}
            label="Carte de séjour"
            value={9}
          >
            Carte de séjour
          </option>
          ;
        </select>
      </div>
    );
  };
  const isValidIBANNumber = input => {
    var CODE_LENGTHS = {
      AD: 24,
      AE: 23,
      AT: 20,
      AZ: 28,
      BA: 20,
      BE: 16,
      BG: 22,
      BH: 22,
      BR: 29,
      CH: 21,
      CR: 21,
      CY: 28,
      CZ: 24,
      DE: 22,
      DK: 18,
      DO: 28,
      EE: 20,
      ES: 24,
      FI: 18,
      FO: 18,
      FR: 27,
      GB: 22,
      GI: 23,
      GL: 18,
      GR: 27,
      GT: 28,
      HR: 21,
      HU: 28,
      IE: 22,
      IL: 23,
      IS: 26,
      IT: 27,
      JO: 30,
      KW: 30,
      KZ: 20,
      LB: 28,
      LI: 21,
      LT: 20,
      LU: 20,
      LV: 21,
      MC: 27,
      MD: 24,
      ME: 22,
      MK: 19,
      MR: 27,
      MT: 31,
      MU: 30,
      NL: 18,
      NO: 15,
      PK: 24,
      PL: 28,
      PS: 29,
      PT: 25,
      QA: 29,
      RO: 24,
      RS: 22,
      SA: 24,
      SE: 24,
      SI: 19,
      SK: 24,
      SM: 27,
      TN: 24,
      TR: 26,
      AL: 28,
      BY: 28,
      CR: 22,
      EG: 29,
      GE: 22,
      IQ: 23,
      LC: 32,
      SC: 31,
      ST: 25,
      SV: 28,
      TL: 23,
      UA: 29,
      VA: 22,
      VG: 24,
      XK: 20
    };
    var iban = String(input)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ""),
      code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/),
      digits;
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
      return false;
    }
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function(letter) {
      return letter.charCodeAt(0) - 55;
    });
    return mod97(digits);
  };
  const mod97 = string => {
    var checksum = string.slice(0, 2),
      fragment;
    for (var offset = 2; offset < string.length; offset += 7) {
      fragment = String(checksum) + string.substring(offset, offset + 7);
      checksum = parseInt(fragment, 10) % 97;
    }
    return checksum;
  };
  const handleBlur = () => {
    if (isValidIBANNumber(rib) === false) {
      setRibError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
    } else {
      setRibError(null);
    }
  };
  const handleBlurBic = e => {
    let value = e.match(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/);
    if (value === null) {
      setBicError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
    } else {
      setBicError(null);
    }
  };
  const renderBankForm = () => {
    return (
      <div className="row">
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.BANK" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-calendar-alt text-primary"></i>
                </span>
              </div>
              <input
                type="text"
                className={`form-control h-auto py-5 px-6`}
                value={bankName}
                onChange={e => {
                  setBankName(e.target.value);
                }}
              />
            </div>
            {!isNull(err) ? <div className="asterisk">{err}</div> : null}
          </div>
        </div>

        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.RIB" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-calendar-alt text-primary"></i>
                </span>
              </div>
              <input
                type="text"
                className={`form-control h-auto py-5 px-6`}
                value={rib}
                onBlur={() => handleBlur()}
                onChange={e => {
                  setRib(e.target.value);
                }}
              />
            </div>
            {!isNull(ribError) ? (
              <div className="asterisk">{ribError}</div>
            ) : null}
          </div>
        </div>
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.BIC" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-calendar-alt text-primary"></i>
                </span>
              </div>
              <input
                type="text"
                className={`form-control h-auto py-5 px-6`}
                value={bic}
                onBlur={e => handleBlurBic(e.target.value)}
                onChange={e => {
                  setBic(e.target.value);
                }}
              />
            </div>
            {!isNull(bicError) ? (
              <div className="asterisk">{bicError}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const handleValidate = files => {
    editBankInfos(bankName, rib, bic);
    setStartDate(null);
    setEndDate(null);
    setDocType(null);
    setDocName(null);
    setDocNumber(null);
    setBirthDepartment(null);
    setBirthLocation(null);
    setBirthDate(null);
  };

  const hideBankEdit = () => {
    if (isNullOrEmpty(rib)) {
      setRib(null);
      setRibError(null);
    }
    if (isNullOrEmpty(bic)) {
      setBic(null);
      setBicError(null);
    }
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={() => hideBankEdit()}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.EDIT.DOC" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="wizard-body py-8 px-8">
          <div className="row mx-10">
            <div className="pb-5 width-full">
              {currentType === 8 && TypeSelect()}
              {!isNullOrEmpty(docType) ? (
                <div>
                  <div className="row"></div>{" "}
                </div>
              ) : null}
              {currentType === 12 ? renderBankForm() : null}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={() => hideBankEdit()}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <> </>
          <button
            type="button"
            disabled={
              err !== null ||
              birthErr !== null ||
              ribError !== null ||
              bicError !== null
            }
            onClick={() => handleValidate(files)}
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            {!row ? (
              <FormattedMessage id="TEXT.ADD" />
            ) : (
              <FormattedMessage id="BUTTON.EDIT" />
            )}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
