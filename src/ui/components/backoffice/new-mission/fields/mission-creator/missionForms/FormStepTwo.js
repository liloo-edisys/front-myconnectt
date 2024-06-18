/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useCallback, useEffect } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMissionRemuneration } from "../../../../../../../business/actions/shared/ListsActions";
import { getMissionSalaries } from "actions/client/MissionsActions";
import _, { debounce, isNull } from "lodash";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../../../shared/PersistState";
import { toastr } from "react-redux-toastr";
import MissionWizzardHeader from "./MissionWizzardHeader";
import { VictoryBar, VictoryTooltip } from "victory";
import FlyOut from "./CustomToolTip";
import { countMatching } from "actions/client/ApplicantsActions";
import isNullOrEmpty from "../../../../../../../utils/isNullOrEmpty";

function FormStepTwo(props) {
  const dispatch = useDispatch();
  const { intl, goToFirstStep, goToThirdStep } = props;

  const {
    missionRemuneration,
    user,
    template,
    missionSalaries,
    isTemplate,
    isDuplicate
  } = useSelector(
    state => ({
      missionRemuneration: state.lists.missionRemuneration,
      user: state.auth.user,
      template: state.missionsReducerData.mission,
      missionSalaries: state.missionsReducerData.missionSalaries,
      isTemplate:
        state.missionsReducerData.currentTemplate &&
        !isNullOrEmpty(state.missionsReducerData.currentTemplate)
          ? true
          : false,
      isDuplicate:
        state.missionsReducerData.currentDuplicate &&
        !isNullOrEmpty(state.missionsReducerData.currentDuplicate)
          ? true
          : false
    }),
    shallowEqual
  );
  const [hourlyRate, setHourlyRate] = useLocalStorage("hourlyRate", null);
  const [remunerations, setRemunerations] = useLocalStorage(
    "remunerations",
    null
  );
  const [salaryComplement, setSalaryComplement] = useLocalStorage(
    "salaryComplement",
    null
  );
  useEffect(() => {
    setHourlyRate(props.formik.values.vacancyContractualProposedHourlySalary);
    dispatch(getMissionRemuneration.request());
    if (!isNullOrEmpty(props.formik.values)) {
      // if (remunerations.length) setRemunerationElements(remunerations.length);
      isNull(remunerations) &&
        formattedPropsRemuneration(
          props.formik.values.missionRemunerationItems
        );
    }
  }, []);
  /*useEffect(() => {
    if (!_.isEmpty(template)) {
      if (!isNull(remunerations) && remunerations.length >= 1)
        setRemunerationElements(remunerations.length);
      // isNullOrEmpty(remunerations) &&
      //   formattedPropsRemuneration(template.missionRemunerationItems);

      isNullOrEmpty(salaryComplement) &&
        props.formik.setFieldValue(
          "missionSalarySupplement",
          template.missionSalarySupplement
        );

      isNullOrEmpty(hourlyRate) &&
        props.formik.setFieldValue(
          "vacancyContractualProposedHourlySalary",
          template.vacancyContractualProposedHourlySalary
        );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const useMountEffect = (fun) => useEffect(fun, []);*/

  /*useMountEffect(() => {
    dispatch(getMissionRemuneration.request());
    dispatch(
      getMissionSalaries.request({
        id1: user.tenantID,
        id2: parseInt(selectedJobTitle),
      })
    );
    if (!isNullOrEmpty(template)) {
      // if (remunerations.length) setRemunerationElements(remunerations.length);
      isNull(remunerations) &&
        formattedPropsRemuneration(template.missionRemunerationItems);
    }
  });*/

  const [selectedJobTitle] = useLocalStorage("jobTitleID", "0");
  /*useEffect(() => {
    if (!_.isEmpty(template)) {
      isNullOrEmpty(hourlyRate) &&
        setHourlyRate(template.vacancyContractualProposedHourlySalary);

      isNullOrEmpty(
        props.formik.values.vacancyContractualProposedHourlySalary
      ) &&
        props.formik.setFieldValue(
          "vacancyContractualProposedHourlySalary",
          parseFloat(template.vacancyContractualProposedHourlySalary)
        );
      !isNullOrEmpty(hourlyRate) &&
        !isNullOrEmpty(
          props.formik.values.vacancyContractualProposedHourlySalary
        ) &&
        props.formik.setFieldTouched("vacancyContractualProposedHourlySalary");
      isNull(salaryComplement) &&
        setSalaryComplement(template.missionSalarySupplement);
    }
  }, []);*/

  /*useEffect(() => {
    !isNullOrEmpty(hourlyRate) &&
      isNullOrEmpty(
        props.formik.values.vacancyContractualProposedHourlySalary
      ) &&
      props.formik.setFieldValue(
        "vacancyContractualProposedHourlySalary",
        parseFloat(hourlyRate)
      );
    !isNullOrEmpty(hourlyRate) &&
      !isNullOrEmpty(
        props.formik.values.vacancyContractualProposedHourlySalary
      ) &&
      props.formik.setFieldTouched("vacancyContractualProposedHourlySalary");
    isNull(salaryComplement) &&
      setSalaryComplement(template.missionSalarySupplement);
  }, []);*/
  const addRemunerationElement = value => {
    setRemunerationElements(value);
    let newRemuneration = remunerations;
    newRemuneration.push({
      missionRemunerationID: null,
      label: "",
      base: 1,
      amount: null
    });
    setRemunerations(newRemuneration);
  };
  const [remunerationElements, setRemunerationElements] = useLocalStorage(
    "remunerationElements",
    !isNullOrEmpty(remunerations) ? remunerations.length : 1
  );

  const handleChangeBase = (e, i) => {
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    let value = e.target.value.replace(",", ".");
    currentRemuneration[i].base = value;
    setRemunerations(currentRemuneration);
    props.formik.setFieldValue("missionRemunerationItems", currentRemuneration);
  };

  const handleChangeAmount = (e, i) => {
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    let value = e.target.value.replace(",", ".");
    currentRemuneration[i].amount = value;

    setRemunerations(currentRemuneration);
    props.formik.setFieldValue("missionRemunerationItems", currentRemuneration);
  };

  const handleChangeRemuneration = (e, i) => {
    let filteredValue = missionRemuneration.filter(
      mission => mission.id === parseInt(e.target.value)
    );
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    if (!currentRemuneration.includes(formattedRemuneration(filteredValue)))
      currentRemuneration[i] = formattedRemuneration(filteredValue);
    setRemunerations(currentRemuneration);
    props.formik.setFieldValue("missionRemunerationItems", currentRemuneration);
  };

  let formattedRemuneration = remuneration => {
    let newRemuneration = {};
    newRemuneration["missionRemunerationID"] = remuneration[0]["id"];
    newRemuneration["label"] = remuneration[0]["label"];
    newRemuneration["base"] = remuneration[0]["base"];
    newRemuneration["amount"] = remuneration[0]["amount"];

    return newRemuneration;
  };

  const checkRemunerations = () => {
    let rem = props.formik.values.missionRemunerationItems;
    rem.map((r, i) => {
      if (
        rem[i].base === null ||
        rem[i].amount === null ||
        rem[i].label === null ||
        rem[i].missionRemunerationID === null
      ) {
        return rem.splice(i + 1, 1);
      } else {
        return (rem[i].amount = parseFloat(rem[i].amount));
      }
    });

    props.formik.setFieldValue("missionRemunerationItems", rem);
  };
  let formattedPropsRemuneration = remunerations => {
    let newRemunerations = [];

    remunerations.map((item, i) => {
      let newRemuneration = {};
      newRemuneration["missionRemunerationID"] = item.missionRemunerationID;
      newRemuneration["label"] = item["label"];
      newRemuneration["base"] = "1";
      newRemuneration["amount"] = parseFloat(item["amount"]);
      if (!isTemplate) {
        newRemuneration["id"] = item["id"];
      }
      if (!isDuplicate) {
        newRemuneration["id"] = item["id"];
      }
      if (isDuplicate || isTemplate) {
        delete newRemuneration["id"];
      }

      newRemunerations.push(newRemuneration);
    });
    setRemunerationElements(newRemunerations.length);
    setRemunerations(newRemunerations);
    props.formik.setFieldValue("missionRemunerationItems", newRemunerations);

    return newRemunerations;
  };
  const filterRem = i => {
    let rem = remunerations;
    rem.splice(i, 1);
    setRemunerations(rem);
    props.formik.setFieldValue("missionRemunerationItems", rem);
    setRemunerationElements(remunerationElements - 1);
  };

  const renderRemunerationElements = () => {
    let el = [];
    let index = 0;
    for (let i = 0; i < remunerationElements; i++) {
      el.push(
        <div className="col-lg-8 p-0 d-flex flex-row justify-content-between">
          <label className="col-lg-5  ">
            <FormattedMessage id="MODEL.DESIGNATION" />
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-list text-primary"></i>
                </span>
              </div>
              <select
                name="missionRemunerationItems"
                className="col-lg-12 form-control"
                type="text"
                placeholder={intl.formatMessage({ id: "MODEL.DESIGNATION" })}
                value={
                  !isNull(remunerations) && !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].missionRemunerationID
                    : null
                }
                onChange={e => {
                  handleChangeRemuneration(e, i);
                }}
              >
                <option disabled selected value>
                  -- {intl.formatMessage({ id: "MODEL.ANOTHER_REMUNERATION" })}{" "}
                  --
                </option>
                {missionRemuneration &&
                  missionRemuneration.map(job => (
                    <option key={job.id} label={job.label} value={job.id}>
                      {job.label}
                    </option>
                  ))}
                ;
              </select>
            </div>
          </label>
          {/*<label className="col-lg-3  ">
            <FormattedMessage id="MODEL.BASE" />
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-edit text-primary"></i>
                </span>
              </div>
              <input
                className="col-lg-12 form-control"
                type="text"
                placeholder={intl.formatMessage({ id: "MODEL.BASE" })}
                disabled={
                  !isNull(remunerations) &&
                  !isNullOrEmpty(remunerations[i]) &&
                  !remunerations[i]
                }
                value={
                  !isNull(remunerations) && !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].base
                    : null
                }
                onChange={e => handleChangeBase(e, i)}
              ></input>
            </div>
          </label>*/}
          <label className="col-lg-4  ">
            <FormattedMessage id="MODEL.AMOUNT" />
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-euro-sign text-primary"></i>
                </span>
              </div>
              <input
                className="col-lg-12 form-control"
                type="text"
                disabled={
                  !isNull(remunerations) &&
                  !isNullOrEmpty(remunerations[i]) &&
                  !remunerations[i]
                }
                placeholder={intl.formatMessage({ id: "MODEL.AMOUNT" })}
                value={
                  !isNull(remunerations) && !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].amount
                    : null
                }
                onChange={e => handleChangeAmount(e, i)}
              ></input>
            </div>
          </label>
          <div
            className="d-flex justify-content-center align-items-center"
            onClick={() => filterRem(i)}
          >
            <i className="flaticon2-delete mr-3 mt-5"></i>
          </div>
        </div>
      );
      index = index++;
    }

    return el;
  };

  const handleCheckMatchs = rate => {
    let data = props.formik.values;
    props.formik &&
      props.formik.values.missionHasVehicle === null &&
      delete data["missionHasVehicle"];
    dispatch(
      countMatching.request({
        ...data
      })
    );
  };
  const renderVictoryBar = () => {
    const data = missionSalaries.list ? missionSalaries.list : [];
    if (data !== null && data.length > 0) {
      return (
        <VictoryBar
          data={data}
          height={200}
          labels={() => ""}
          labelComponent={
            <VictoryTooltip
              flyoutWidth={100}
              flyoutComponent={<FlyOut />}
              flyoutHeight={35}
              cornerRadius={5}
              pointerLength={40}
              flyoutStyle={{
                stroke: "#868C97",
                strokeWidth: 2,
                fill: "#FFFFFF"
              }}
              style={{
                fill: "#FFFFFF",
                fontSize: 10,
                fontWeight: 500,
                textAnchor: "middle"
              }}
            />
          }
          style={{
            data: { fill: "white" }
          }}
          x="date"
          y="value"
        />
      );
    } else {
      return "";
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceRate = useCallback(
    debounce(rate => {
      handleCheckMatchs(rate);
    }, 1000),
    []
  );
  const handleChangeRate = e => {
    let value = e.target.value.replace(",", ".");
    setHourlyRate(value);
    let float = parseFloat(value);
    props.formik.setFieldValue("vacancyContractualProposedHourlySalary", float);
    debounceRate(value);
  };

  const { errors, touched } = useFormikContext();

  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <MissionWizzardHeader />
          <div className="wizard-body py-8 px-8">
            <div className="row mx-10">
              <div className="pb-5 width-full">
                <div className="d-flex align-items-center flex-row">
                  <div className="mission-form mt-10 mb-10 p-0">
                    <h3 className="group-title">
                      <FormattedMessage id="TEXT.REMUNERATION_INFORMATION" />
                    </h3>
                    <p className="required-desc">
                      <FormattedMessage id="TEXT.REQUIRED_DESC_PART1" />
                      <span className="asterisk">*</span>
                      <FormattedMessage id="TEXT.REQUIRED_DESC_PART2" />
                    </p>
                    <br />
                    <p>
                      <FormattedMessage id="TEXT.REMUNERATION_DESC" />
                    </p>
                    <div>
                      <div className="mt-10 form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.REMUNERATION" />
                          <span className="asterisk">*</span>
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl fas fa-euro-sign text-primary"></i>
                            </span>
                          </div>
                          <input
                            name="vacancyContractualProposedHourlySalary"
                            className="col-lg-12 form-control"
                            type="text"
                            onBlur={props.formik.handleBlur}
                            placeholder="00,00"
                            value={hourlyRate}
                            onChange={e => {
                              handleChangeRate(e);
                            }}
                          ></input>
                        </div>
                        {touched.vacancyContractualProposedHourlySalary &&
                        errors.vacancyContractualProposedHourlySalary ? (
                          <div className="asterisk">
                            {errors["vacancyContractualProposedHourlySalary"]}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-10 form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.SALARY_COMPLEMENT" />
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl far fa-edit text-primary"></i>
                            </span>
                          </div>
                          <input
                            name="missionSalarySupplement"
                            className="col-lg-12 form-control"
                            type="text"
                            onBlur={props.formik.handleBlur}
                            value={salaryComplement}
                            placeholder={intl.formatMessage({
                              id: "MODEL.VACANCY.SALARY_COMPLEMENT"
                            })}
                            onChange={e => {
                              setSalaryComplement(e.target.value);
                              props.formik.setFieldValue(
                                "missionSalarySupplement",
                                e.target.value
                              );
                            }}
                          ></input>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-10 form-group salary-graph col-xl-6 blue-gradiant-background">
                    <div className="h-150">
                      <p className="similar-salary-title">
                        <FormattedMessage id="MODEL.VACANCY.SALARY_SIMILAR" />
                      </p>
                      {renderVictoryBar()}
                    </div>

                    <div className="col-xl-12 d-flex grey-background flex-row justify-content-around align-items-left">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <span className="mt-2">
                          <FormattedMessage id="MODEL.VACANCY.SALARY_AVERAGE" />
                        </span>
                        <p className="salary-value">
                          {missionSalaries.average
                            ? Math.round(missionSalaries.average * 100) / 100 +
                              "€"
                            : 0}
                        </p>
                      </div>
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <span className="mt-2">
                          <FormattedMessage id="MODEL.VACANCY.SALARY_RECURENT" />
                        </span>
                        <p className="salary-value">
                          {missionSalaries.average
                            ? Math.round(missionSalaries.recurring * 100) /
                                100 +
                              "€"
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mission-form mt-5 mb-10 p-0">
                  <h3 className="group-title">
                    <FormattedMessage id="TEXT.REMUNERATION_ANOTHER" />
                  </h3>
                </div>

                {renderRemunerationElements()}

                <div className="mission-form mt-10 p-0 d-flex flex-row align-items-center">
                  <i className="ki ki-plus icon-md extra-remuneration"></i>
                  <p
                    className="extra-remuneration"
                    onClick={() =>
                      addRemunerationElement(remunerationElements + 1)
                    }
                  >
                    <FormattedMessage id="TEXT.REMUNERATION_ADD" />
                  </p>
                </div>

                <div className="d-flex justify-content-between border-top mt-5 pt-10">
                  <div className="mr-2">
                    <button
                      type="button"
                      id="kt_login_forgot_cancel"
                      className="btn res btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                      onClick={goToFirstStep}
                    >
                      <FormattedMessage id="BUTTON.BACK" />
                    </button>
                  </div>
                  <div>
                    <button
                      id="kt_login_forgot_submit"
                      type="submit"
                      className="btn res btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      onClick={() => {
                        checkRemunerations();
                        if (errors.vacancyContractualProposedHourlySalary) {
                          toastr.error(
                            intl.formatMessage({
                              id: "VALIDATION.REQUIRED_FIELDS.TITLE"
                            }),
                            intl.formatMessage({
                              id: "VALIDATION.REQUIRED_FIELDS.DESC"
                            })
                          );
                          return props.formik.setFieldTouched(
                            "vacancyContractualProposedHourlySalary",
                            true
                          );
                        }
                        goToThirdStep();
                      }}
                    >
                      <FormattedMessage id="BUTTON.NEXT" />
                    </button>
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

export default injectIntl(FormStepTwo);
