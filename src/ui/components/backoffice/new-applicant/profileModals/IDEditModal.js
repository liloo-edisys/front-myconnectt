/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import DatePicker from "react-datepicker";
import moment from "moment";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale("fr", fr);

export function IDEditModal({
  show,
  onHide,
  intl,
  row,
  files,
  editIdInfos,
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
    isEdit && parsed ? parsed.idCardIssueDate : null
  );
  const [endDate, setEndDate] = useState(
    isEdit && parsed ? parsed.idCardExpirationDate : null
  );
  const [birthDate, setBirthDate] = useState(undefined);
  const [docType, setDocType] = useState(
    isEdit && currentType ? currentType : null
  );
  const [setDocName] = useState(null);
  const [docNumber, setDocNumber] = useState(
    isEdit && parsed ? parsed.idCardNumber : null
  );
  const [birthDepartment, setBirthDepartment] = useState(null);
  const [birthLoaction, setBirthLocation] = useState(null);
  const [err] = useState(null);
  const [birthErr] = useState(null);
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
    startDate === null &&
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.idCardIssueDate) &&
      setStartDate(parsed.idCardIssueDate);
    endDate === null &&
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.idCardExpirationDate) &&
      setEndDate(parsed.idCardExpirationDate);
    docNumber === null &&
      !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.idCardNumber) &&
      setDocNumber(parsed.idCardNumber);
    docType === null &&
      !isNullOrEmpty(file) &&
      !isNullOrEmpty(file.documentType) &&
      setDocType(file.documentType);
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

  const handleValidate = files => {
    editIdInfos(
      docType,
      startDate,
      endDate,
      docNumber,
      birthDepartment,
      birthLoaction,
      birthDate
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
          <FormattedMessage id="TEXT.EDIT.DOC" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="wizard-body py-8 px-8">
          <div className="row mx-10">
            <div className="pb-5 width-full">
              {currentType === 8 || currentType === 9 ? renderIdForm() : null}
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
            disabled={err !== null || birthErr !== null}
            onClick={() => handleValidate(files)}
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            {!row ? (
              <FormattedMessage id="TEXT.ADD" />
            ) : (
              <FormattedMessage id="BUTTON.SAVE.DONE" />
            )}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
