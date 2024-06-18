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

export function DocumentModal({
  show,
  onHide,
  intl,
  row,
  files,
  manageFile,
  currentType,
  isVerso,
  birthDay,
  socialNumber,
  cityBirth,
  birthDep,
  parsed
}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [birthDate, setBirthDate] = useState(undefined);
  const [docType, setDocType] = useState(null);
  const [docName, setDocName] = useState(null);
  const [docNumber, setDocNumber] = useState(null);
  const [birthDepartment, setBirthDepartment] = useState(null);
  const [birthLoaction, setBirthLocation] = useState(null);
  const [err, setErr] = useState(null);
  const [birthErr, setBirthErr] = useState(null);

  const [bankName, setBankName] = useState(null);
  const [rib, setRib] = useState(null);
  const [bic, setBic] = useState(null);
  const [ribError, setRibError] = useState(null);
  const [bicError, setBicError] = useState(null);

  const checkFields = () => {
    let val;
    if (currentType === 8 || currentType === 9) {
      val =
        startDate === null || endDate === null || docNumber === null
          ? true
          : false;
    }
    if (currentType === 12) {
      val = rib === null || bic === null || bankName === null ? true : false;
    }
    return val;
  };
  useEffect(() => {
    docType === null && setDocType(currentType);
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
    if (!isNullOrEmpty(row)) {
      !isNullOrEmpty(row.startDate)
        ? setStartDate(moment(row.startDate).toDate())
        : setStartDate(new Date());
      !isNullOrEmpty(row.endDate)
        ? setEndDate(moment(row.endDate).toDate())
        : setStartDate(new Date());
    }
  }, [row]);

  const handleChangeDocNumber = e => {
    let str = e;

    let birthYear = birthDate && birthDate[2].concat(birthDate[3]);
    let birthMonth = birthDate && birthDate[5].concat(birthDate[6]);
    let ssnYear = e.length >= 4 && str[1].concat(str[2]);
    let ssnMonth = e.length >= 4 && str[3].concat(str[4]);
    let dep;
    dep =
      e.length >= 6 ? str[5].concat(str[6] !== undefined ? str[6] : "") : "";

    e.length >= 5 && (birthYear !== ssnYear || birthMonth !== ssnMonth)
      ? setBirthErr(intl.formatMessage({ id: "MESSAGE.CHECK.SOCIAL.NUMBER" }))
      : setBirthErr(null);
    setBirthDepartment(dep);

    if (e.length === 15) {
      str = str.substring(0, 1) + " " + e.substring(1);
      str = str.substring(0, 4) + " " + str.substring(4);
      str = str.substring(0, 7) + " " + str.substring(7);
      str = str.substring(0, 10) + " " + str.substring(10);
      str = str.substring(0, 14) + " " + str.substring(14);
      str = str.substring(0, 18) + " " + str.substring(18);
    }
    e.length < 15
      ? setErr(intl.formatMessage({ id: "MESSAGE.SOCIAL.NUMBER.INVALID" }))
      : setErr(null);
    e.length === 15 ? setDocNumber(str) : setDocNumber(str.replace(" ", ""));
  };

  const handleChangeBirthDate = val => {
    let birthYear =
      val &&
      moment(val)
        .locale("fr")
        .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)[2]
        .concat(
          moment(val)
            .locale("fr")
            .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)[3]
        );
    let birthMonth =
      val &&
      moment(val)
        .locale("fr")
        .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)[5]
        .concat(
          moment(val)
            .locale("fr")
            .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)[6]
        );
    let ssnYear = docNumber.length >= 4 && docNumber[2].concat(docNumber[3]);
    let ssnMonth = docNumber.length >= 4 && docNumber[5].concat(docNumber[6]);
    birthYear !== ssnYear || birthMonth !== ssnMonth
      ? setBirthErr(intl.formatMessage({ id: "MESSAGE.CHECK.SOCIAL.NUMBER" }))
      : setBirthErr(null);

    val !== null
      ? setBirthDate(
          moment(val)
            .locale("fr")
            .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)
        )
      : setBirthDate(null);
  };

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

  const renderIdForm = () => {
    return !isVerso ? (
      <div className="row">
        <div className="col-xl-12">
          <div className="form-group">
            <label className=" col-form-label">
              <FormattedMessage id="TEXT.NUMBER" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-laptop-code text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({
                  id: "TEXT.NUMBER"
                })}
                type="text"
                className={`form-control h-auto py-5 px-6`}
                name="docName"
                onChange={e => setDocNumber(e.target.value)}
                value={docNumber}
              />
            </div>
          </div>
        </div>
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.ID.STARTDATE" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-calendar-alt text-primary"></i>
                </span>
              </div>
              <DatePicker
                className={`col-lg-12 form-control`}
                style={{ width: "100%" }}
                selected={(startDate && new Date(startDate)) || null}
                onChange={val => {
                  setStartDate(
                    moment(val)
                      .locale("fr")
                      .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)
                  );
                }}
                dateFormat="dd/MM/yyyy"
                popperPlacement="top-start"
                showMonthDropdown
                showYearDropdown
                maxDate={new Date()}
                yearItemNumber={9}
                locale="fr"
              />
            </div>
          </div>
        </div>
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.ID.ENDDATE" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-calendar-alt text-primary"></i>
                </span>
              </div>
              <DatePicker
                className={`col-lg-12 form-control`}
                style={{ width: "100%" }}
                selected={(endDate && new Date(endDate)) || null}
                onChange={val => {
                  setEndDate(
                    moment(val)
                      .locale("fr")
                      .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)
                  );
                }}
                dateFormat="dd/MM/yyyy"
                popperPlacement="top-start"
                showMonthDropdown
                showYearDropdown
                yearItemNumber={9}
                locale="fr"
                minDate={startDate ? new Date(startDate) : null}
              />
            </div>
          </div>
        </div>
      </div>
    ) : null;
  };

  const renderHealthForm = () => {
    return (
      <div className="row">
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.SOCIAL.NUMBER" />
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
                value={docNumber}
                onChange={e => {
                  handleChangeDocNumber(e.target.value);
                }}
              />
            </div>
            {!isNull(err) ? <div className="asterisk">{err}</div> : null}
          </div>
        </div>
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="TEXT.BIRTHDATE" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-calendar-alt text-primary"></i>
                </span>
              </div>
              <DatePicker
                className={`col-lg-12 form-control`}
                style={{ width: "100%" }}
                selected={(birthDate && new Date(birthDate)) || null}
                onChange={val => {
                  handleChangeBirthDate(val);
                }}
                dateFormat="dd/MM/yyyy"
                popperPlacement="top-start"
                showMonthDropdown
                showYearDropdown
                maxDate={moment(new Date()).subtract(18, "years")._d}
                yearItemNumber={9}
                locale="fr"
              />
            </div>
            {!isNull(birthErr) ? (
              <div className="asterisk">{birthErr}</div>
            ) : null}
          </div>
        </div>
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="TEXT.BIRTH.LOCATION" />
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
                value={birthLoaction}
                onChange={e => {
                  setBirthLocation(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-xl-12">
          <div className="form-group">
            <label>
              <FormattedMessage id="TEXT.BIRTH.DEPARTMENT" />
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
                value={birthDepartment}
                onChange={e => {
                  setBirthDepartment(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
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
              <FormattedMessage id="MODEL.IBAN" />
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
    manageFile(
      files,
      docType,
      docName,
      startDate,
      endDate,
      docNumber,
      birthDepartment,
      birthLoaction,
      birthDate,
      bankName,
      rib,
      bic
    );
    setStartDate(null);
    setEndDate(null);
    setDocType(null);
    setDocName(null);
    setDocNumber(null);
    setBirthDepartment(null);
    setBirthLocation(null);
    setBirthDate(null);
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {!row ? (
            <FormattedMessage id="TEXT.ADD.DOC" />
          ) : (
            <FormattedMessage id="TEXT.EDIT.XP" />
          )}
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
              {currentType === 8 || currentType === 9 ? renderIdForm() : null}
              {currentType === 10 ? renderHealthForm() : null}
              {currentType === 12 ? renderBankForm() : null}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
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
              bicError !== null ||
              checkFields() === true
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
