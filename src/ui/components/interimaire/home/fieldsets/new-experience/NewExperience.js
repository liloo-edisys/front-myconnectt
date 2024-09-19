import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Modal,
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import Select from "react-select";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import moment from "moment";
import { addExperience } from "../../../../../../business/actions/interimaire/interimairesActions";
import axios from "axios";

import "./styles.scss";
import { useState } from "react";

function NewExperience(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [jobTitles, setJobTitles] = useState([]);
  const [endDateError, setEndDateError] = useState(false);
  const [job, setJob] = useState("");
  const {
    toogleExperienceForm,
    hideExperienceForm,
    selectedExperience,
    setSelectedExperience,
    setEmptyArrayError,
    errorArray,
    setErrorArray
  } = props;
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");

  let initialValues = {
    jobTitle: "",
    employerNameAndPlace: "",
    startDate: "",
    endDate: "",
    isCurrentItem: "False"
  };

  let initialValuesFromParent = selectedExperience;

  const NewExperienceSchema = Yup.object().shape({
    jobTitle: Yup.string(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ).required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    employerNameAndPlace: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    startDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
    /*endDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )*/
  });

  useEffect(() => {
    if (selectedExperience) {
      setStartDate(selectedExperience.startDate);
    }
    let URL = `${process.env.REACT_APP_WEBAPI_URL}api/JobTitle`;
    axios
      .get(URL)
      .then(res => {
        setJobTitles(res.data);
      })
      .catch(err => console.log(err));
  }, [selectedExperience]);

  const createOption = (label, value) => ({
    label,
    value
  });

  let formatedRole = jobTitles.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });

  const handleChangeRole = (setFieldValue, newValue) => {
    setJob(newValue);
    setFieldValue("jobTitle", newValue.label);
  };
  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "transparent",
      margin: "-9px",
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      borderColor: "transparent",
      boxShadow: null,
      "&:hover": {
        borderColor: "transparent"
      }
    }),
    menu: base => ({
      ...base,
      borderRadius: 0,
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      padding: 0
    })
  };

  const onChangeStartDate = (date, setFieldValue, values) => {
    if (date === null) {
      setStartDate("");
      setFieldValue("startDate", "");
      return;
    }
    const { endDate } = values;
    const newDate = moment(date);
    setStartDate(newDate);
    setFieldValue("startDate", newDate);
    if (moment(endDate)._i < date) {
      setFieldValue("endDate", "");
      setEndDate("");
    }
  };

  const onChangeEndDate = (date, setFieldValue) => {
    if (date === null) {
      setEndDate("");
      setFieldValue("endDate", "");
      return;
    }
    const newDate = moment(date);
    setEndDate(newDate);
    setFieldValue("endDate", newDate);
    setFieldValue("isCurrentItem", "False");
  };

  const closeModal = () => {
    hideExperienceForm();
    setSelectedExperience(null);
  };

  return (
    <Modal show={toogleExperienceForm} width={600} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage
            id={selectedExperience ? "TEXT.EDIT.XP" : "TEXT.ADD.XP"}
          />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={
          selectedExperience ? initialValuesFromParent : initialValues
        }
        validationSchema={NewExperienceSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          if (values.isCurrentItem === "False" && !values.endDate) {
            return setEndDateError(true);
          }
          setJob("");
          if (selectedExperience) {
            const id = selectedExperience.id
              ? selectedExperience.id
              : selectedExperience.id_temp;
            const tempErrorArray = errorArray;
            const index = tempErrorArray.indexOf(id);
            if (index > -1) {
              tempErrorArray.splice(index, 1);
              setErrorArray(tempErrorArray);
            }
          }
          //setEmptyArrayError(false);
          addExperience(values, dispatch);
          hideExperienceForm();
          setSelectedExperience(null);
        }}
      >
        {({ values, touched, errors, status, handleSubmit, setFieldValue }) => (
          <Form
            id="kt_login_signin_form"
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            onSubmit={handleSubmit}
          >
            <Modal.Body>
              <div className="my-10">
                <label htmlFor="jobTitle">
                  <FormattedMessage id="MODEL.JOBTITLE" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l fas fa-desktop text-primary"></i>
                    </span>
                  </div>
                  <Select
                    onChange={e => handleChangeRole(setFieldValue, e)}
                    placeholder={intl.formatMessage({
                      id: "MODEL.JOBTITLE"
                    })}
                    options={formatedRole}
                    styles={customStyles}
                    value={job}
                    className="col-lg-12 form-control p-5"
                  ></Select>
                </div>
              </div>
              <div className="my-10">
                <label htmlFor="jobTitle">
                  <FormattedMessage id="MODEL.VACANCY.TITLE" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l fas fa-laptop text-primary"></i>
                    </span>
                  </div>
                  <Field
                    name="jobTitle"
                    render={({ field }) => (
                      <input
                        {...field}
                        disabled={!job}
                        className={`form-control h-auto py-5 px-6`}
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "MODEL.VACANCY.TITLE"
                        })}
                      />
                    )}
                  />
                </div>
                {touched.jobTitle && errors.jobTitle ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.jobTitle}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-10">
                <label htmlFor="employerNameAndPlace">
                  <FormattedMessage id="MODEL.VACANCY.LOCATION" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl fas fa-map-pin text-primary px-1"></i>
                    </span>
                  </div>
                  <Field
                    placeholder={intl.formatMessage({
                      id: "MODEL.VACANCY.LOCATION"
                    })}
                    type="text"
                    className={`form-control h-auto py-5 px-6`}
                    name="employerNameAndPlace"
                  />
                </div>
                {touched.employerNameAndPlace && errors.employerNameAndPlace ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {errors.employerNameAndPlace}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="my-10">
                <Row>
                  <Col lg={6} md={12} className="mb-10">
                    <label htmlFor="startDate">
                      <FormattedMessage id="MODEL.VACANCY.STARTDATE" />
                      <span className="required_asterix">*</span>
                    </label>
                    <div className="input-group datepicker_container_55">
                      <div
                        className="input-group-prepend"
                        style={{ height: 55 }}
                      >
                        <span className="input-group-text">
                          <i className="icon-xl far fa-calendar-alt text-primary"></i>
                        </span>
                      </div>
                      <DatePicker
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="startDate"
                        maxDate={moment().toDate()}
                        selected={
                          (values.startDate && new Date(values.startDate)) ||
                          null
                        }
                        onChange={date =>
                          onChangeStartDate(date, setFieldValue, values)
                        }
                        showMonthDropdown
                        showYearDropdown
                        yearItemNumber={9}
                        locale="fr"
                      />
                    </div>
                    {/*<DatePickerFieldExperience
                      component={DatePickerFieldExperience}
                      className={`form-control h-auto py-5 px-6 date-input-content`}
                      iconHeight="55px"
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      name="startDate"
                      maxDate={moment().toDate()}
                      onChange={date =>
                        onChangeStartDate(date, setFieldValue, values)
                      }
                      onChange={date => {
                            setEndDate(date);
                            props.formik.setFieldValue(
                                "VacancyContractualVacancyEmploymentContractTypeEndDate",
                                moment(date)
                            );
                            let data = props.formik.values;
                            props.formik &&
                                props.formik.values.missionHasVehicle === null &&
                                delete data["missionHasVehicle"];
                            dispatch(
                                countMatching.request({
                                    ...data,
                                    jobTitleID: parseInt(selectedJobTitle)
                                })
                            );
                        }}
                      showMonthDropdown
                      showYearDropdown
                      yearItemNumber={9}
                      locale="fr"
                    />*/}
                    {touched.startDate && errors.startDate ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.startDate}</div>
                      </div>
                    ) : null}
                  </Col>
                  <Col span={6}>
                    <label htmlFor="endDate" className="row">
                      <div className="mr-2">
                        <FormattedMessage id="MODEL.VACANCY.ENDDATE" />
                      </div>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id="user-notification-tooltip">
                            Si vous êtes toujours en poste, laissez la date de
                            fin de la mission à vide et cochez "En poste"
                          </Tooltip>
                        }
                      >
                        <i className="far fa-question-circle"></i>
                      </OverlayTrigger>
                    </label>
                    <div className="input-group datepicker_container_55">
                      <div
                        className="input-group-prepend"
                        style={{ height: 55 }}
                      >
                        <span className="input-group-text">
                          <i className="icon-xl far fa-calendar-alt text-primary"></i>
                        </span>
                      </div>
                      <DatePicker
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="endDate"
                        maxDate={moment().toDate()}
                        selected={
                          (values.endDate && new Date(values.endDate)) || null
                        }
                        onChange={date => onChangeEndDate(date, setFieldValue)}
                        showMonthDropdown
                        showYearDropdown
                        yearItemNumber={9}
                        locale="fr"
                      />
                    </div>

                    {/*<DatePickerFieldExperience
                      component={DatePickerFieldExperience}
                      iconHeight="55px"
                      className={`form-control h-auto py-5 px-6 date-input-content`}
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      name="endDate"
                      minDate={moment(startDate).toDate()}
                      maxDate={new Date()}
                      onChange={date => onChangeEndDate(date, setFieldValue)}
                      onChange={date => {
                            setEndDate(date);
                            props.formik.setFieldValue(
                                "VacancyContractualVacancyEmploymentContractTypeEndDate",
                                moment(date)
                            );
                            let data = props.formik.values;
                            props.formik &&
                                props.formik.values.missionHasVehicle === null &&
                                delete data["missionHasVehicle"];
                            dispatch(
                                countMatching.request({
                                    ...data,
                                    jobTitleID: parseInt(selectedJobTitle)
                                })
                            );
                        }}
                      showMonthDropdown
                      showYearDropdown
                      yearItemNumber={9}
                      locale="fr"
                      />*/}
                    {endDateError ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          Si vous êtes toujours en poste, laissez la date de fin
                          de la mission à vide et cochez "En poste"
                        </div>
                      </div>
                    ) : null}
                  </Col>
                </Row>
                <div>
                  <div className="form-group row">
                    <label
                      htmlFor="endDate"
                      className="row col-3 col-form-label"
                    >
                      <div className="mr-2">En poste</div>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id="user-notification-tooltip">
                            Si vous êtes toujours en poste, laissez la date de
                            fin de la mission à vide et cochez "En poste"
                          </Tooltip>
                        }
                      >
                        <i className="far fa-question-circle"></i>
                      </OverlayTrigger>
                    </label>
                    <div className="col-3 text-right">
                      <span
                        className={
                          values.endDate
                            ? "switch switch-sm disbale_switch"
                            : "switch switch-sm"
                        }
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={values.isCurrentItem === "True"}
                            onChange={() => {
                              const newValue =
                                values.isCurrentItem === "True"
                                  ? "False"
                                  : "True";
                              setFieldValue("isCurrentItem", newValue);
                            }}
                            disabled={values.endDate}
                          />
                          <span></span>
                        </label>
                      </span>
                    </div>
                  </div>
                </div>
                {/*<div
                      className="alert alert-custom alert-notice alert-light-warning fade show py-0"
                      style={{alignItems: "center"}}
                      role="alert"
                    >
                      <div className="alert-icon">
                        <i className="flaticon-warning"></i>
                      </div>
                      <div>
                          Si vous êtes toujours en poste, laissez la date de fin
                          de la mission à vide et cochez "En poste"
                      </div>
                    </div>*/}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={closeModal}
              >
                <span>
                  <FormattedMessage id="BUTTON.CANCEL" />
                </span>
              </div>
              <button
                id="kt_login_signin_submit"
                type="submit"
                className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
              >
                <span>
                  <FormattedMessage
                    id={selectedExperience ? "BUTTON.SAVE.DONE" : "TEXT.ADD.XP"}
                  />
                </span>
              </button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default NewExperience;
