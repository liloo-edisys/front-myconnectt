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

export function HealthEditModal({
  show,
  onHide,
  intl,
  row,
  files,
  editHealthInfos,
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
    isEdit && parsed ? parsed.socialSecurityNumber : null
  );
  const [birthDepartment, setBirthDepartment] = useState(null);
  const [birthLoaction, setBirthLocation] = useState(null);
  const [err, setErr] = useState(null);
  const [birthErr, setBirthErr] = useState(null);

  useEffect(() => {
    if (parsed) {
      birthDepartment === null && setBirthDepartment(parsed.birthDepartment);
      birthLoaction === null && setBirthLocation(parsed.birthPlace);
      docNumber === null &&
        !isNullOrEmpty(parsed) &&
        !isNullOrEmpty(parsed.socialSecurityNumber) &&
        setDocNumber(parsed.socialSecurityNumber);
      birthDate === undefined &&
        !isNullOrEmpty(parsed) &&
        !isNullOrEmpty(parsed.birthDate) &&
        setBirthDate(parsed.birthDate);
    }
  }, [birthDepartment, birthLoaction, docNumber, birthDate, parsed]);

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
                maxDate={moment().subtract(18, "years")._d}
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

  const handleValidate = files => {
    editHealthInfos(docNumber, birthDate, birthLoaction, birthDepartment);
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
    setStartDate(null);
    setEndDate(null);
    setDocType(null);
    setDocName(null);
    setDocNumber(null);
    setBirthDepartment(null);
    setBirthLocation(null);
    setBirthDate(undefined);
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
              {!isNullOrEmpty(docType) ? (
                <div>
                  <div className="row"></div>{" "}
                </div>
              ) : null}
              {currentType === 10 ? renderHealthForm() : null}
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
            disabled={err !== null || birthErr !== null}
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
