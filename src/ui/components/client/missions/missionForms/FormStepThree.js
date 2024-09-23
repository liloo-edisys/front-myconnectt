/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";

import { Field, useFormikContext } from "formik";
import moment from "moment";
import TimePicker from "rc-time-picker";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import "rc-time-picker/assets/index.css";
import useLocalStorage from "../../../shared/PersistState";
import { toastr } from "react-redux-toastr";
import MissionWizzardHeader from "./missionWizzardHeader.jsx";
import { shallowEqual, useSelector } from "react-redux";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import _ from "lodash";

// var date = "2020-01-01";

function FormStepThree(props) {
  const { intl } = props;
  const { template, isTemplate, isDuplicate } = useSelector(
    state => ({
      template: state.missionsReducerData.mission,
      isTemplate:
        state.missionsReducerData.currentTemplate &&
        state.missionsReducerData.currentTemplate.length
          ? true
          : false,
      isDuplicate:
        state.missionsReducerData.currentDuplicate &&
        state.missionsReducerData.currentDuplicate.length
          ? true
          : false
    }),
    shallowEqual
  );
  const [startHour, onChangeStartHour] = useLocalStorage(
    "startHour",
    !isNullOrEmpty(template) &&
      !isNullOrEmpty(template.missionStartHour) &&
      !isTemplate
      ? moment(template.missionStartHour, "HH:mm").toDate()
      : null
  );
  let date = template && moment(template.missionStartHour, "HH:mm");

  const [endHour, onChangeEndHour] = useLocalStorage(
    "endHour",
    !isNullOrEmpty(template) &&
      !isNullOrEmpty(template.missionEndHour) &&
      !isTemplate
      ? moment(template.missionEndHour, "HH:mm").toDate()
      : null
  );
  const [weeklyHours, onChangeWeeklyHours] = useLocalStorage(
    "weeklyHours",
    !isNullOrEmpty(template) && !isTemplate
      ? template.missionWeeklyWorkHours
      : 0
  );
  const [complement, setComplement] = useLocalStorage(
    "complement",
    !isNullOrEmpty(template) && !isTemplate
      ? template.missionHourlySupplement
      : ""
  );
  useEffect(() => {
    if (props.formik.values.missionStartHour === null) {
      props.formik.setFieldValue(
        "missionStartHour",
        isDuplicate
          ? moment(template.missionStartHour, "HH:mm").toDate()
          : moment(startHour).format("HH:mm")
      );
      !isNullOrEmpty(props.formik.values.missionStartHour) &&
        props.formik.setFieldTouched("missionStartHour", true);
    }
    if (props.formik.values.missionEndHour === null) {
      props.formik.setFieldValue(
        "missionEndHour",
        isDuplicate
          ? moment(template.missionEndHour, "HH:mm").toDate()
          : moment(endHour).format("HH:mm")
      );
      !isNullOrEmpty(props.formik.values.missionEndHour) &&
        props.formik.setFieldTouched("missionEndHour", true);
    }
    if (!isNullOrEmpty(weeklyHours) && !isTemplate) {
      props.formik.setFieldValue(
        "missionWeeklyWorkHours",
        parseInt(weeklyHours)
      );
      !isNullOrEmpty(props.formik.values.missionWeeklyWorkHours) &&
        !isTemplate &&
        props.formik.setFieldTouched("missionWeeklyWorkHours", true);
    }
  }, [
    weeklyHours,
    props.formik.values.missionEndHour,
    props.formik.values.missionStartHour
  ]);

  const handleChangeStartHour = value => {
    onChangeStartHour(value);
    props.formik.setFieldValue(
      "missionStartHour",
      moment(value._d).format("HH:mm")
    );
  };

  const handleChangeEndHour = value => {
    onChangeEndHour(value);
    props.formik.setFieldValue(
      "missionEndHour",
      moment(value._d).format("HH:mm")
    );
  };

  useEffect(() => {
    if (!_.isEmpty(template) && isTemplate) {
      props.formik.values.missionStartHour !==
        moment(startHour._d).format("HH:mm") &&
        onChangeStartHour(
          isDuplicate
            ? template.missionStartHour
            : moment(date + " " + template.missionStartHour)
        );

      isNullOrEmpty(props.formik.values.missionStartHour) &&
        !isTemplate &&
        props.formik.setFieldValue(
          "missionStartHour",
          isDuplicate
            ? moment(template.missionStartHour)
            : moment(startHour._d).format("HH:mm")
        );
      !isNullOrEmpty(startHour) &&
        !isTemplate &&
        props.formik.setFieldTouched("missionStartHour", true);

      props.formik.values.missionEndHour !==
        moment(endHour._d).format("HH:mm") &&
        onChangeEndHour(moment(date + " " + template.missionEndHour));

      isNullOrEmpty(props.formik.values.missionEndHour) &&
        !isTemplate &&
        props.formik.setFieldValue(
          "missionEndHour",
          moment(endHour._d).format("HH:mm")
        );
      !isNullOrEmpty(endHour) &&
        !isTemplate &&
        props.formik.setFieldTouched("missionEndHour", true);

      props.formik.values.missionWeeklyWorkHours !== weeklyHours &&
        !isTemplate &&
        onChangeWeeklyHours(template.missionWeeklyWorkHours);

      isNullOrEmpty(props.formik.values.missionWeeklyWorkHours) &&
        props.formik.setFieldValue(
          "missionWeeklyWorkHours",
          !isTemplate ? template.missionWeeklyWorkHours : 0
        );
    }
  }, [template, props.formik.values]);

  const { errors, touched } = useFormikContext();

  const handleChangeWeeklyHours = (e, i) => {
    let value = e.replace(",", ".");
    onChangeWeeklyHours(value);
    props.formik.setFieldValue("missionWeeklyWorkHours", value);
  };
  let setFormik = () => {
    props.formik.setFieldValue(
      "missionWeeklyWorkHours",
      parseFloat(weeklyHours)
    );
  };

  const handleChangeComplement = e => {
    setComplement(e.target.value);
    props.formik.setFieldValue("missionHourlySupplement", e.target.value);
  };
  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <MissionWizzardHeader />
          <div className="wizard-body py-8 px-8">
            <div className="row mx-10">
              <div className="pb-5 width-full">
                <div className="mission-form mt-10 mb-10 p-0">
                  <h3 className="group-title">
                    <FormattedMessage id="TEXT.MISSION_HOURS" />
                  </h3>
                  <p className="required-desc">
                    <FormattedMessage id="TEXT.REQUIRED_DESC_PART1" />
                    <span className="asterisk">*</span>
                    <FormattedMessage id="TEXT.REQUIRED_DESC_PART2" />
                  </p>
                </div>
                <div className="row">
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.START_HOUR" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-clock text-primary"></i>
                          </span>
                        </div>
                        <TimePicker
                          showSecond={false}
                          className="col-lg-12 form-control"
                          style={{ border: "none" }}
                          value={
                            !isNullOrEmpty(startHour) ? moment(startHour) : null
                          }
                          onChange={handleChangeStartHour}
                          minuteStep={5}
                          clearIcon={false}
                          onBlur={props.formik.handleBlur}
                          name="missionStartHour"
                          addon={panel => (
                            <button
                              type="button"
                              className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-5 py-1 my-3 mx-4"
                              onClick={() => panel.close()}
                            >
                              <FormattedMessage id="BUTTON.VALIDATE" />
                            </button>
                          )}
                        ></TimePicker>
                      </div>
                      {touched.missionStartHour && errors.missionStartHour ? (
                        <div className="asterisk">
                          {errors["missionStartHour"]}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.END_HOUR" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-clock text-primary"></i>
                          </span>
                        </div>
                        <TimePicker
                          showSecond={false}
                          className="col-lg-12 form-control"
                          style={{ border: "none" }}
                          value={
                            !isNullOrEmpty(endHour) ? moment(endHour) : null
                          }
                          onChange={e => {
                            handleChangeEndHour(e);
                            onChangeEndHour(e);
                          }}
                          minuteStep={5}
                          clearIcon={false}
                          onBlur={props.formik.handleBlur}
                          name="missionEndHour"
                          addon={panel => (
                            <button
                              type="button"
                              className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-5 py-1 my-3 mx-4"
                              onClick={() => panel.close()}
                            >
                              <FormattedMessage id="BUTTON.VALIDATE" />
                            </button>
                          )}
                        ></TimePicker>
                      </div>
                      {touched.missionEndHour && errors.missionEndHour ? (
                        <div className="asterisk">
                          {errors["missionEndHour"]}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.NBR_HOUR" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-hashtag text-primary"></i>
                          </span>
                        </div>
                        <Field
                          as="input"
                          className="col-lg-12 form-control"
                          type="text"
                          name="missionWeeklyWorkHours"
                          placeholder="40,00H"
                          value={weeklyHours}
                          onBlur={props.formik.handleBlur}
                          onChange={e => {
                            handleChangeWeeklyHours(e.target.value);
                          }}
                        ></Field>
                      </div>
                      {touched.missionWeeklyWorkHours &&
                      errors.missionWeeklyWorkHours ? (
                        <div className="asterisk">
                          {errors["missionWeeklyWorkHours"]}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-12">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.COMPLEMENT_HOUR" />
                      </label>
                      <textarea
                        className="col-lg-12 form-control"
                        onChange={e => handleChangeComplement(e)}
                        value={complement}
                        maxLength="70"
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between border-top mt-5 pt-10">
                  <div className="mr-2">
                    <Link
                      to="/mission-create/step-two"
                      className="next col-lg p-0"
                    >
                      <button
                        type="button"
                        className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.BACK" />
                      </button>
                    </Link>
                  </div>
                  <div>
                    <Link
                      to={
                        !errors.missionStartHour &&
                        !errors.missionEndHour &&
                        !errors.missionWeeklyWorkHours
                          ? "/mission-create/step-four"
                          : "#"
                      }
                      className="next"
                    >
                      <button
                        type="submit"
                        className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() => {
                          setFormik();
                          props.formik.setFieldTouched(
                            "missionStartHour",
                            true
                          );
                          props.formik.setFieldTouched("missionEndHour", true);
                          props.formik.setFieldTouched(
                            "missionWeeklyWorkHours",
                            true
                          );

                          return errors.missionStartHour ||
                            errors.missionEndHour ||
                            errors.missionWeeklyWorkHours
                            ? toastr.error(
                                intl.formatMessage({
                                  id: "VALIDATION.REQUIRED_FIELDS.TITLE"
                                }),
                                intl.formatMessage({
                                  id: "VALIDATION.REQUIRED_FIELDS.DESC"
                                })
                              )
                            : null;
                        }}
                      >
                        <FormattedMessage id="BUTTON.NEXT" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(FormStepThree);
