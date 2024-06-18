import React, { useEffect, useState } from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import DatePicker from "react-datepicker";
import moment from "moment";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import { getJobTitles } from "actions/shared/ListsActions";
registerLocale("fr", fr);
const TENANTID = +process.env.REACT_APP_TENANT_ID;
const newID = 0;
export function ProfileExperiencesModal({
  show,
  onHide,
  intl,
  handleEditExperience,
  handleUpdateExperience,
  row
}) {
  const dispatch = useDispatch();

  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(getJobTitles.request());
  }, []);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState("");
  const [current, setCurrent] = useState(false);
  const [desc, setDesc] = useState(null);

  const [jobTitleErr, setJobTitleErr] = useState(false);
  const [companyErr, setCompanyErr] = useState(false);

  const { user, jobTitleList } = useSelector(
    state => ({
      user: state.auth.user,
      jobTitleList: state.lists.jobTitles
    }),
    shallowEqual
  );

  const checkFields = () => {
    if (isNullOrEmpty(jobTitle) || isNullOrEmpty(company)) {
      return true;
    } else return false;
  };

  const handleValidate = () => {
    isNullOrEmpty(row)
      ? handleEditExperience({
          jobTitle: jobTitle,
          employerNameAndPlace: company,
          startDate: startDate,
          endDate: endDate,
          id: newID,
          isDeleted: null,
          deleteDate: null,
          tenantID: TENANTID,
          tenant: null,
          creationDate: null,
          lastModifiedDate: null,
          timestamp: null,
          applicantID: user.applicantID,
          applicant: null,
          place: location,
          description: desc,
          isCurrentItem: current === true ? "true" : "false"
        })
      : handleUpdateExperience(
          {
            jobTitle: jobTitle,
            employerNameAndPlace: company,
            startDate: startDate,
            endDate: endDate,
            id: row.id,
            isDeleted: null,
            deleteDate: null,
            tenantID: TENANTID,
            tenant: null,
            creationDate: null,
            lastModifiedDate: null,
            timestamp: null,
            applicantID: user.applicantID,
            applicant: null,
            place: location,
            description: desc,
            isCurrentItem: current === true ? "true" : "false"
          },
          row.index
        );
    setJobTitle("");
    setCompany("");
    setStartDate(null);
    setEndDate(null);
    setLocation("");
    setCurrent(false);
    setDesc(null);
    onHide();
  };

  useEffect(() => {
    if (current === true) {
      setEndDate(null);
    }
    if (!isNullOrEmpty(row)) {
      row.jobTitle && setJobTitle(row.jobTitle);
      !isNullOrEmpty(row.startDate)
        ? setStartDate(moment(row.startDate).toDate())
        : setStartDate(new Date());
      !isNullOrEmpty(row.endDate)
        ? setEndDate(moment(row.endDate).toDate())
        : setStartDate(new Date());
      row.employerNameAndPlace && setCompany(row.employerNameAndPlace);
      row.description && setDesc(row.description);
      row.isCurrentItem && row.isCurrentItem === "true"
        ? setCurrent(true)
        : setCurrent(false);
      row.place && setLocation(row.place);
    }
  }, [row, current]);
  const handleChangeJobTitle = e => {
    setJobTitle(e.target.value);
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {!row ? (
            <FormattedMessage id="TEXT.ADD.XP" />
          ) : (
            <FormattedMessage id="TEXT.EDIT.XP" />
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
                      <FormattedMessage id="TEXT.PAST.JOB" />
                      <span className="asterisk">*</span>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <select
                        className={`form-control h-auto py-5 px-6`}
                        name="jobTitleID"
                        value={jobTitle}
                        onChange={e => {
                          handleChangeJobTitle(e);
                        }}
                      >
                        <option disabled selected value="">
                          -- {intl.formatMessage({ id: "MODEL.JOBTITLE" })} --
                        </option>
                        {jobTitleList.map(job => (
                          <option
                            key={job.id}
                            selected={jobTitle === job.name}
                            label={job.name}
                            value={job.name}
                          >
                            {job.name}
                          </option>
                        ))}
                        ;
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="TEXT.COMPANY" />
                      <span className="asterisk">*</span>
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
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.STARTDATE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-calendar-alt text-primary"></i>
                        </span>
                      </div>
                      <DatePicker
                        className={`form-control h-auto py-5  px-6`}
                        style={{ width: "100%" }}
                        showMonthDropdown
                        showYearDropdown
                        maxDate={new Date()}
                        yearItemNumber={9}
                        locale="fr"
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
                      />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="form-group">
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.ENDDATE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-calendar-alt text-primary"></i>
                        </span>
                      </div>
                      <DatePicker
                        className="form-control h-auto py-5 px-6"
                        showMonthDropdown
                        showYearDropdown
                        maxDate={new Date()}
                        yearItemNumber={9}
                        locale="fr"
                        minDate={(startDate && new Date(startDate)) || null}
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
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.VACANCY.LOCATION" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <input
                        placeholder={intl.formatMessage({
                          id: "MODEL.VACANCY.LOCATION"
                        })}
                        type="text"
                        className={`form-control h-auto py-5 px-6`}
                        name="firstname"
                        onChange={e => setLocation(e.target.value)}
                        value={location}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12">
                  <div className="form-group">
                    <label>
                      <FormattedMessage id="MODEL.ACCOUNT.DESCRIPTION" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-clock text-primary"></i>
                        </span>
                      </div>
                      <textarea
                        name="mission35HInformation"
                        className="col-lg-12 form-control lg"
                        type="text"
                        maxLength="210"
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.DESCRIPTION"
                        })}
                        value={desc}
                        onChange={e => {
                          setDesc(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="d-flex align-items-center form-group mb-0 col-lg-3">
                  <label className=" col-form-label">En poste</label>
                  <div className="col-1">
                    <span className="switch switch switch-sm">
                      <label>
                        <input
                          type="checkbox"
                          onChange={() => setCurrent(!current)}
                          checked={current}
                          name=""
                        />
                        <span></span>
                      </label>
                    </span>
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
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <> </>
          <button
            disabled={checkFields()}
            type="button"
            onClick={() => handleValidate()}
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
