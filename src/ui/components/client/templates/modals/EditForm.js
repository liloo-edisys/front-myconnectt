/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import React, { useEffect, useCallback, useState } from "react";

import {
  getHabilitationsList,
  updateTemplate
} from "actions/client/missionsActions";
import { Formik, Form, Field } from "formik";
import { Input } from "metronic/_partials/controls";
import Select from "react-select";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import * as Yup from "yup";
import {
  createJobTags,
  createJobSkills,
  getEducationLevels,
  getJobTitles,
  getLanguages,
  getJobTags,
  getJobSkills,
  getMissionExperiences,
  getMissionReasons,
  getMissionEquipment,
  getDriverLicences
} from "../../../../../business/actions/shared/listsActions";
import {
  getJobSkills as getJobSkillsApi,
  getJobTags as getJobTagsApi
} from "api/shared/listsApi";
import CreatableSelect from "react-select/creatable";
import { getMissionRemuneration } from "../../../../../business/actions/shared/listsActions";
import { isNull } from "lodash";

function EditForm({ onHide, intl, history, formik }) {
  const dispatch = useDispatch();

  const model = history.location.state;
  const useMountEffect = fun => useEffect(fun, []);
  const [selectedEducation, setSelectedEducation] = useState([]);

  useMountEffect(() => {
    dispatch(getJobTitles.request());
    dispatch(getEducationLevels.request());
    dispatch(getLanguages.request());
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    dispatch(getJobTags.request());
    dispatch(getMissionExperiences.request());
    dispatch(getMissionReasons.request());
    dispatch(getMissionRemuneration.request());
    dispatch(getMissionEquipment.request());
    dispatch(getDriverLicences.request());
    getHabilitationsList(dispatch);
    if (!isNullOrEmpty(template)) {
      // if (remunerations.length) setRemunerationElements(remunerations.length);
      isNull(remunerations) &&
        formattedPropsRemuneration(template.missionRemunerationItems);
    }
  });
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

    return newRemunerations;
  };
  const {
    jobTitleList,
    jobExperiences,
    educationLevels,
    template,
    jobSkills,
    languages,
    jobTags,
    missionRemuneration,
    missionEquipment,
    driverLicenses,
    isTemplate,
    isDuplicate
  } = useSelector(
    state => ({
      missionRemuneration: state.lists.missionRemuneration,
      jobTitleList: state.lists.jobTitles,
      jobExperiences: state.lists.missionExperiences,
      jobTags: state.lists.jobTags,
      jobSkills: state.lists.jobSkills,
      languages: state.lists.languages,
      educationLevels: state.lists.educationLevels,
      companies: state.companies.companies,
      user: state.contacts.user,
      currentWorksite: state.auth.user.siteID,
      currentCompanyID: state.auth.user.accountID,
      template: state.missionsReducerData.mission,
      missionEquipment: state.lists.missionEquipment,
      driverLicenses: state.lists.driverLicenses,
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

  const createOption = (label, value) => ({
    label,
    value
  });

  const [selectedJobTitle, setSelectedJobTitle] = useState(
    !isNullOrEmpty(model) ? model.jobTitleID : null
  );

  const [weeklyHours, onChangeWeeklyHours] = useState(
    !isNullOrEmpty(model) ? model.missionWeeklyWorkHours : null
  );

  const [hourlySupplement, setHourlySupplement] = useState(
    !isNullOrEmpty(model) ? model.missionHourlySupplement : ""
  );

  const [description, setDescription] = useState(
    !isNullOrEmpty(model) ? model.vacancyMissionDescription : null
  );

  const [experience, setExperience] = useState(
    !isNullOrEmpty(model) ? model.missionExperienceID : null
  );

  const [hourlyRate, setHourlyRate] = useState(
    !isNullOrEmpty(model) ? model.vacancyContractualProposedHourlySalary : null
  );

  const [selectedTags, setSelectedTags] = useState([]);

  const [remunerations, setRemunerations] = useState(
    !isNullOrEmpty(model) && !isNullOrEmpty(model.missionRemunerationItems)
      ? model.missionRemunerationItems
      : []
  );

  const [isSkillsLoading, setIsSkillsLoading] = useState(false);

  const [isLoading, setLoading] = useState(false);

  const handleChangeJobTitle = (e, setFieldValue) => {
    setSelectedJobTitle(e.target.value);
    setFieldValue("jobTitleID", parseInt(e.target.value));
  };

  const [selectedSkills, setSelectedSkills] = useState([]);

  const [selectedLanguage, setSelectedLanguage] = useState([]);

  const [remunerationElements, setRemunerationElements] = useState(
    !isNullOrEmpty(remunerations) ? remunerations.length : 1
  );

  const [selectedEquipment, setSelectedEquipment] = useState([]);

  const [selecteVehicules, setSelecteVehicules] = useState(
    !isNullOrEmpty(model) && !isNullOrEmpty(model.missionHasVehicle)
      ? model.missionHasVehicle
      : []
  );

  const [selectedLicense, setSelectedLicences] = useState([]);

  let formatedEquipment = missionEquipment.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });

  let formatedLicenses = driverLicenses.map(license => {
    return license && createOption(license.name, license.id);
  });

  let formattedLanguagues = languages.map(lang => {
    lang["value"] = lang["id"];
    lang["label"] = lang["frenchName"];
    return lang;
  });

  const handleForceChangeExtaJobTitle = (e, setFieldValue) => {
    let extraTitle = jobTitleList.filter(
      job => job.id === parseInt(e.target.value)
    );
    setFieldValue("vacancyTitle", extraTitle[0].name);
    return e.target.label;
  };

  const formatFormik = values => {
    let formatedValues = [];
    values !== null &&
      values.map(value => {
        return formatedValues.push(value.value);
      });
    return formatedValues;
  };

  let formattedEducation = educationLevels.map(education => {
    return education && createOption(education.name, education.id);
  });

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

  const addRemunerationElement = value => {
    setRemunerationElements(value);
    let newRemuneration = [...remunerations];
    newRemuneration.push({
      missionRemunerationID: null,
      label: "",
      base: "1",
      amount: null
    });
    setRemunerations(newRemuneration);
  };
  const initialValues = {
    id: model ? model.id : null,
    tenantID: model ? model.tenantID : null,
    userID: model ? model.userID : null,
    accountID: model ? model.accountID : null,
    workSiteID: model ? model.workSiteID : null,
    vacancyTemplateName: model ? model.vacancyTemplateName : "",
    vacancyTitle: model ? model.vacancyTitle : "",
    vacancyMissionDescription: model ? model.vacancyMissionDescription : "",
    vacancyProfileDescription: model ? model.vacancyProfileDescription : "",
    vacancyBusinessDescription: model ? model.vacancyBusinessDescription : "",
    vacancyBusinessAddressPostalCode: model
      ? model.vacancyBusinessAddressPostalCode
      : "",
    vacancyBusinessAddressCity: model ? model.vacancyBusinessAddressCity : "",
    vacancyContractualProposedHourlySalary: model
      ? model.vacancyContractualProposedHourlySalary
      : null,
    vacancyContractualVacancyEmploymentContractTypeStartDate: model
      ? model.vacancyContractualVacancyEmploymentContractTypeStartDate
      : null,
    vacancyContractualVacancyEmploymentContractTypeEndDate: model
      ? model.vacancyContractualVacancyEmploymentContractTypeEndDate
      : null,
    vacancyApplicationCriteriaOverallExperienceLength: model
      ? model.vacancyApplicationCriteriaOverallExperienceLength
      : null,
    jobTitleID: model ? model.jobTitleID : null,
    address: model ? model.address : "",
    vacancyNumberOfJobs: model ? model.vacancyNumberOfJobs : null,
    missionExperienceID: model ? model.missionExperienceID : null,
    missionReasonID: model ? model.missionReasonID : null,
    missionReasonJustification: model ? model.missionReasonJustification : "",
    missionStartHour: model ? model.missionStartHour : null,
    missionEndHour: model ? model.missionEndHour : null,
    missionWeeklyWorkHours: model ? model.missionWeeklyWorkHours : null,
    missionContactName: model ? model.missionContactName : "",
    missionEquipment: model ? model.missionEquipment : "",
    missionSalarySupplement: model ? model.missionSalarySupplement : "",
    mission35HInformation: model ? model.mission35HInformation : "",
    missionHasVehicle: model ? model.missionHasVehicle : null,
    missionOrderReference: model ? model.missionOrderReference : "",
    missionRemunerationItems: model ? model.missionRemunerationItems : [],
    missionArrayEquipments: model ? model.missionArrayEquipments : [],
    missionArrayDriverLicenses: model ? model.missionArrayDriverLicenses : [],
    vacancyApplicationCriteriaArrayRequiredEducationLevels: model
      ? model.vacancyApplicationCriteriaArrayRequiredEducationLevels
      : [],
    vacancyApplicationCriteriaArrayLanguagesWithLevel: model
      ? model.vacancyApplicationCriteriaArrayLanguagesWithLevel
      : [],
    vacancyApplicationCriteriaArrayComputerSkills: model
      ? model.vacancyApplicationCriteriaArrayComputerSkills
      : [],
    vacancyApplicationCriteriaArrayJobTags: model
      ? model.vacancyApplicationCriteriaArrayJobTags
      : [],
    missionHourlySupplement: model ? model.missionHourlySupplement : ""
  };

  // const handleChangeBase = (e, i, setFieldValue) => {
  //   let currentRemuneration =
  //   remunerations && remunerations.length ? [...remunerations] : [];
  //   let value = e.target.value.replace(",", ".");
  //   currentRemuneration[i].Base = value;
  //   setRemunerations(currentRemuneration);
  //   setFieldValue("missionRemunerationItems", currentRemuneration);
  // };

  // const handleChangeAmount = (e, i, setFieldValue) => {
  //   let currentRemuneration =
  //   remunerations && remunerations.length ? [...remunerations] : [];
  //   let value = e.target.value.replace(",", ".");
  //   currentRemuneration[i].Amount = parseFloat(value);

  //   setRemunerations(currentRemuneration);
  //   setFieldValue("missionRemunerationItems", currentRemuneration);
  // };

  const handleChangeEquipment = (newValue, setFieldValue) => {
    let formikEquipment = [];
    let newArray = [...selectedEquipment];
    let difference =
      newValue !== null && selectedEquipment.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedEquipment.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map(tag =>
        newArray.push(createOption(tag.label, tag.value))
      );
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }

    newValue.map(value => {
      return formikEquipment.push(value.value);
    });
    setSelectedEquipment(newArray);
    setFieldValue("missionArrayEquipments", formikEquipment);
  };

  const handleChangeBase = (e, i, setFieldValue) => {
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    let value = e.target.value.replace(",", ".");
    currentRemuneration[i].base = value;
    setRemunerations(currentRemuneration);
    setFieldValue("missionRemunerationItems", currentRemuneration);
  };

  const handleChangeAmount = (e, i, setFieldValue) => {
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    let value = e.target.value.replace(",", ".");
    currentRemuneration[i].amount = value;

    setRemunerations(currentRemuneration);
    setFieldValue("missionRemunerationItems", currentRemuneration);
  };

  const handleChangeRemuneration = (e, i, setFieldValue) => {
    let filteredValue = missionRemuneration.filter(
      mission => mission.id === parseInt(e.target.value)
    );
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    if (!currentRemuneration.includes(formattedRemuneration(filteredValue)))
      currentRemuneration[i] = formattedRemuneration(filteredValue);
    setRemunerations(currentRemuneration);
    setFieldValue("missionRemunerationItems", currentRemuneration);
  };

  let formattedRemuneration = remuneration => {
    let newRemuneration = {};
    newRemuneration["missionRemunerationID"] = remuneration[0]["id"];
    newRemuneration["label"] = remuneration[0]["label"];
    newRemuneration["base"] = "1";
    newRemuneration["amount"] = remuneration[0]["amount"];

    return newRemuneration;
  };

  const handleChangeLicense = (newValue, setFieldValue) => {
    let newArray = [...selectedLicense];
    let difference =
      newValue !== null && selectedLicense.filter(x => !newValue.includes(x));
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedLicense.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map(tag => {
        return newArray.push(createOption(tag.label, tag.value));
      });
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }
    setSelectedLicences(newArray);
    setFieldValue("missionArrayDriverLicenses", formatFormik(newArray));
  };
  const checkRemunerations = (values, setFieldValue) => {
    let rem = values.missionRemunerationItems;
    rem.map((r, i) => {
      if (
        rem[i].base === null ||
        rem[i].amount === null ||
        rem[i].label === null ||
        rem[i].missionRemunerationID === null
      ) {
        rem.splice(i + 1, 1);
      } else {
        rem[i].amount = parseFloat(rem[i].amount);
      }
    });

    setFieldValue("missionRemunerationItems", rem);
  };
  const formatEquipment = data => {
    if (missionEquipment.length) {
      let newArray = [];
      !isNullOrEmpty(data) &&
        data.map(eq => {
          let value = missionEquipment.filter(l => l.id === eq);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].value
              )
            );
          }
        });
      return setSelectedEquipment(newArray);
    }
  };

  const formatLicenses = data => {
    if (driverLicenses.length) {
      let newArray = [];
      data.map(license => {
        let value = driverLicenses.filter(l => l.id === license);
        if (!isNullOrEmpty(value)) {
          newArray.push(
            createOption(
              value[value.length - 1].name,
              value[value.length - 1].value
            )
          );
        }
      });
      setSelectedLicences(newArray);
    }
  };

  const filterRem = (i, setFieldValue) => {
    let rem = remunerations;
    rem.splice(i, 1);
    setRemunerations(rem);
    setFieldValue("missionRemunerationItems", rem);
    setRemunerationElements(remunerationElements - 1);
  };

  const renderRemunerationElements = setFieldValue => {
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
                  !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].missionRemunerationID
                    : null
                }
                onChange={e => {
                  handleChangeRemuneration(e, i, setFieldValue);
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
          <label className="col-lg-3  ">
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
                disabled={!remunerations[i]}
                value={
                  !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].base
                    : null
                }
                onChange={e => handleChangeBase(e, i, setFieldValue)}
              ></input>
            </div>
          </label>
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
                disabled={!remunerations[i]}
                placeholder={intl.formatMessage({ id: "MODEL.AMOUNT" })}
                value={
                  !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].amount
                    : null
                }
                onChange={e => handleChangeAmount(e, i, setFieldValue)}
              ></input>
            </div>
          </label>
          <div
            className="d-flex justify-content-center align-items-center"
            onClick={() => filterRem(i, setFieldValue)}
          >
            <i
              className="flaticon2-delete
 mr-3 mt-5"
            ></i>
          </div>
        </div>
      );
      index = index++;
    }

    return el;
  };

  const formatEducation = useCallback(
    data => {
      if (educationLevels.length) {
        let newArray = [];
        data.map(level => {
          let value = educationLevels.filter(l => l.id === level);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].value
              )
            );
          }
        });
        if (!selectedEducation.length) {
          setSelectedEducation(newArray);
        }
        return newArray;
      }
    },
    [educationLevels, selectedEducation.length, setSelectedEducation]
  );

  const handleChangeRate = (e, setFieldValue, setFieldTouched) => {
    let value = e.target.value.replace(",", ".");
    setHourlyRate(value);
    let float = parseFloat(value);
    setFieldValue("vacancyContractualProposedHourlySalary", float);
  };

  const formatLanguage = useCallback(data => {
    if (languages.length) {
      let newArray = [];
      data.map(lang => {
        let value = languages.filter(l => l.id === lang);
        if (!isNullOrEmpty(value)) {
          newArray.push(
            createOption(
              value[value.length - 1].frenchName,
              value[value.length - 1].value
            )
          );
        }
      });
      return setSelectedLanguage(newArray);
    }
  });
  const formatSkills = useCallback(data => {
    if (jobSkills.length) {
      let newArray = [];
      data.map(skill => {
        let value = jobSkills.filter(l => l.id === skill);
        if (!isNullOrEmpty(value)) {
          newArray.push(
            createOption(
              value[value.length - 1].name,
              value[value.length - 1].value
            )
          );
        }
      });
      if (!selectedSkills.length) {
        return setSelectedSkills(newArray);
      }
      return newArray;
    }
  });
  const formatTags = useCallback(data => {
    if (jobTags.length) {
      let newArray = [];
      data.map(tag => {
        let value = jobTags.filter(l => l.id === tag);
        if (!isNullOrEmpty(value)) {
          newArray.push(
            createOption(
              value[value.length - 1].name,
              value[value.length - 1].value
            )
          );
        }
      });
      if (!selectedTags.length) {
        return setSelectedTags(newArray);
      }
      return newArray;
    }
  });

  useEffect(() => {
    educationLevels.length &&
      isNullOrEmpty(selectedEducation) &&
      !isNullOrEmpty(model) &&
      !isNullOrEmpty(
        model.vacancyApplicationCriteriaArrayRequiredEducationLevels
      ) &&
      formatEducation(
        model.vacancyApplicationCriteriaArrayRequiredEducationLevels
      );
    languages.length &&
      isNullOrEmpty(selectedLanguage) &&
      !isNullOrEmpty(model) &&
      !isNullOrEmpty(model.vacancyApplicationCriteriaArrayLanguagesWithLevel) &&
      formatLanguage(model.vacancyApplicationCriteriaArrayLanguagesWithLevel);
    jobSkills.length &&
      isNullOrEmpty(selectedSkills) &&
      !isNullOrEmpty(model) &&
      !isNullOrEmpty(model.vacancyApplicationCriteriaArrayComputerSkills) &&
      formatSkills(model.vacancyApplicationCriteriaArrayComputerSkills);

    jobTags.length &&
      isNullOrEmpty(selectedTags) &&
      !isNullOrEmpty(model) &&
      !isNullOrEmpty(model.vacancyApplicationCriteriaArrayJobTags) &&
      formatTags(model.vacancyApplicationCriteriaArrayJobTags);

    missionEquipment.length &&
      isNullOrEmpty(selectedEquipment) &&
      !isNullOrEmpty(model) &&
      !isNullOrEmpty(model.missionArrayEquipments) &&
      formatEquipment(model.missionArrayEquipments);

    driverLicenses.length &&
      isNullOrEmpty(selectedEquipment) &&
      !isNullOrEmpty(model) &&
      !isNullOrEmpty(model.missionArrayDriverLicenses) &&
      formatLicenses(model.missionArrayDriverLicenses);
  });

  const validationSchema = Yup.object().shape({
    vacancyTitle: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
    jobTitleID: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
    missionContactName: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    missionHasVehicle: Yup.boolean()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
    vacancyMissionDescription: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
    vacancyContractualProposedHourlySalary: Yup.number()
      .min(10.85, intl.formatMessage({ id: "MESSAGE.HOURLY.SALARY.MIN" }))
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
    missionSalarySupplement: Yup.string().typeError(
      intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })
    ),
    missionWeeklyWorkHours: Yup.number()
      .min(0, "Ce champ ne peut être négatif.")
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });
  const handleChangeEducation = (newValue, setFieldValue) => {
    let difference =
      newValue !== null && selectedEducation.filter(x => !newValue.includes(x)); // calculates diff
    let newArray = [...selectedEducation];
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedEducation.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map((skill, index) => {
        return newArray.push(createOption(skill.label, skill.value));
      });
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }
    setSelectedEducation(newArray);
    setFieldValue(
      "vacancyApplicationCriteriaArrayRequiredEducationLevels",
      formatFormik(newArray)
    );
  };

  let formattedSkills = jobSkills.map(skill => {
    return skill && createOption(skill.name, skill.id);
  });

  const handleChangeSkill = (newValue, setFieldValue) => {
    let difference =
      newValue !== null && selectedSkills.filter(x => !newValue.includes(x)); // calculates diff
    let newArray = [...selectedSkills];
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedSkills.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map((skill, index) => {
        return newArray.push(createOption(skill.label, skill.value));
      });
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }
    setSelectedSkills(newArray);
    setFieldValue(
      "vacancyApplicationCriteriaArrayComputerSkills",
      formatFormik(newArray)
    );
  };

  const handleChangeLanguage = (newValue, setFieldValue) => {
    let newArray = [...selectedLanguage];
    let difference =
      newValue !== null && selectedLanguage.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedLanguage.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map(lang =>
        newArray.push(createOption(lang.label, lang.value))
      );
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].frenchName,
          newValue[newValue.length - 1].value
        )
      );
    }

    setSelectedLanguage(newArray);
    setFieldValue(
      "vacancyApplicationCriteriaArrayLanguagesWithLevel",
      formatFormik(newArray)
    );
  };

  let formattedTags = jobTags.map(tag => {
    return tag && createOption(tag.name, tag.id);
  });

  const handleCreateTag = (value, setFieldValue) => {
    setLoading(true);
    dispatch(createJobTags.request({ name: value }));
    setTimeout(() => {
      getJobTagsApi().then(data => {
        let newTag = data.data.slice(-1)[0];
        let newArray = [...selectedTags];
        newArray.push(createOption(newTag.name, newTag.id));
        setSelectedTags(newArray);
        setFieldValue(
          "vacancyApplicationCriteriaArrayJobTags",
          formatFormik(newArray)
        );
      });
      setLoading(false);
    }, 2000);
  };

  const handleChangeTags = (newValue, setFieldValue) => {
    let newArray = [...selectedTags];
    let difference =
      newValue !== null && selectedTags.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedTags.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map(tag =>
        newArray.push(createOption(tag.label, tag.value))
      );
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }

    setSelectedTags(newArray);
    setFieldValue(
      "vacancyApplicationCriteriaArrayJobTags",
      formatFormik(newArray)
    );
  };

  const handleCreateSkill = (value, setFieldValue) => {
    setIsSkillsLoading(true);
    dispatch(createJobSkills.request({ name: value }));
    setTimeout(() => {
      getJobSkillsApi().then(data => {
        let newSkill = data.data.slice(-1)[0];
        let newArray = [...selectedSkills];
        newArray.push(createOption(newSkill.name, newSkill.id));
        setSelectedSkills(newArray);
        setFieldValue(
          "vacancyApplicationCriteriaArrayComputerSkills",
          formatFormik(newArray)
        );
      });
      setIsSkillsLoading(false);
    }, 2000);
  };

  const handleChangeWeeklyHours = (e, setFieldValue) => {
    let value = e.replace(",", ".");
    onChangeWeeklyHours(value);
    setFieldValue("missionWeeklyWorkHours", parseInt(value));
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => {
          let data = {
            ...values
          };
          dispatch(updateTemplate.request(data), onHide());
        }}
      >
        {({
          handleSubmit,
          setFieldValue,
          values,
          handleChange,
          setFieldTouched,
          errors,
          touched
        }) => (
          <>
            <Modal.Body className="overlay overlay-block cursor-default">
              <Form className="form form-label-right">
                <div className="form-group row">
                  <div className="col-lg-3">
                    <label>
                      <FormattedMessage id="MODEL.JOBTITLE" />
                      <span className="asterisk">*</span>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>

                      <select
                        className="col-lg-12 form-control"
                        name="jobTitleID"
                        value={selectedJobTitle}
                        onChange={e => {
                          handleChangeJobTitle(e, setFieldValue);
                          handleForceChangeExtaJobTitle(e, setFieldValue);
                        }}
                      >
                        <option disabled selected value="0">
                          -- {intl.formatMessage({ id: "MODEL.JOBTITLE" })} --
                        </option>
                        {jobTitleList.map(job => (
                          <option
                            key={job.id}
                            selected={
                              template && template.length
                                ? template.jobTitleID === job.id
                                : null
                            }
                            label={job.name}
                            value={job.id}
                          >
                            {job.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {touched.jobTitleID && errors.jobTitleID ? (
                      <div className="asterisk">{errors["jobTitleID"]}</div>
                    ) : null}
                  </div>
                  <div className="col-lg-3">
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.TITLE" />
                      <span className="asterisk">*</span>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="vacancyTitle"
                        component={Input}
                        maxLength="25"
                        placeholder={intl.formatMessage({
                          id: "MODEL.VACANCY.TITLE"
                        })}
                      />
                    </div>
                    {touched.vacancyTitle && errors.vacancyTitle ? (
                      <div className="asterisk">{errors["vacancyTitle"]}</div>
                    ) : null}
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-lg-3">
                    <label>
                      <FormattedMessage id="MODEL.EXPERIENCE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <select
                        className="col-lg-12 form-control "
                        name="missionExperienceID"
                        placeholder={intl.formatMessage({
                          id: "MODEL.EXPERIENCE"
                        })}
                        value={experience}
                        onChange={e => {
                          setExperience(e.target.value);
                          setFieldValue(
                            "missionExperienceID",
                            parseInt(e.target.value)
                          );
                        }}
                      >
                        <option disabled selected value="0">
                          -- {intl.formatMessage({ id: "MODEL.EXPERIENCE" })} --
                        </option>
                        {jobExperiences.map(xp => (
                          <option key={xp.id} value={xp.id}>
                            {xp.name}
                          </option>
                        ))}
                        ;
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-lg-6">
                    <label>
                      <FormattedMessage id="MODEL.FORMATIONS" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <Select
                        isMulti
                        name="langs"
                        onChange={(e, action) => {
                          handleChangeEducation(e, setFieldValue);
                        }}
                        options={formattedEducation}
                        styles={customStyles}
                        value={selectedEducation}
                        className="col-lg-12 form-control"
                      ></Select>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.LANGUAGES" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <Select
                          isMulti
                          name="langs"
                          onChange={e => {
                            handleChangeLanguage(e, setFieldValue);
                          }}
                          options={formattedLanguagues}
                          styles={customStyles}
                          value={selectedLanguage}
                          className="col-lg-12 form-control"
                        ></Select>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 ">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.COMPETENCES" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <CreatableSelect
                          isMulti
                          name="skills"
                          onChange={value =>
                            handleChangeSkill(value, setFieldValue)
                          }
                          options={formattedSkills}
                          styles={customStyles}
                          className="col-lg-12 form-control"
                          onCreateOption={value =>
                            handleCreateSkill(value, setFieldValue)
                          }
                          isLoading={isSkillsLoading}
                          value={selectedSkills}
                        ></CreatableSelect>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.TAGS" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <CreatableSelect
                          isMulti
                          onChange={value =>
                            handleChangeTags(value, setFieldValue)
                          }
                          options={formattedTags}
                          name="tags"
                          styles={customStyles}
                          className="col-lg-12 form-control"
                          onCreateOption={value =>
                            handleCreateTag(value, setFieldValue)
                          }
                          isLoading={isLoading}
                          value={selectedTags}
                        ></CreatableSelect>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.DESCRIPTION" />
                        <span className="asterisk">*</span>
                      </label>
                      <textarea
                        className="col-lg-12 form-control"
                        onChange={e => {
                          setDescription(e.target.value);
                          setFieldValue(
                            "vacancyMissionDescription",
                            e.target.value
                          );
                        }}
                        value={description}
                        maxLength="140"
                        name="vacancyMissionDescription"
                      />
                    </div>
                    {touched.vacancyMissionDescription &&
                    errors.vacancyMissionDescription ? (
                      <div className="asterisk">
                        {errors["vacancyMissionDescription"]}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-lg-3">
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
                        placeholder="00,00"
                        value={hourlyRate}
                        onChange={e => {
                          handleChangeRate(e, setFieldValue, setFieldTouched);
                        }}
                      ></input>
                      {touched.vacancyContractualProposedHourlySalary &&
                      errors.vacancyContractualProposedHourlySalary ? (
                        <div className="asterisk">
                          {errors["vacancyContractualProposedHourlySalary"]}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.SALARY_COMPLEMENT" />
                      {/* <span className="asterisk">*</span> */}
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-edit text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="missionSalarySupplement"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.VACANCY.SALARY_COMPLEMENT"
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group row">
                  {renderRemunerationElements(setFieldValue)}
                </div>
                <div className="form-group row ml-5">
                  <div className="row mission-form mt-10 p-0 d-flex flex-row align-items-center">
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
                </div>
                <div className="form-group row">
                  <div className="col-lg-3">
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
                        onChange={e => {
                          handleChangeWeeklyHours(
                            e.target.value,
                            setFieldValue
                          );
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

                <div className="form-group row">
                  <div className="col-lg-12">
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.COMPLEMENT_HOUR" />
                    </label>
                    <div className="input-group">
                      <textarea
                        name="missionHourlySupplement"
                        className="col-lg-12 form-control"
                        maxLength="70"
                        onChange={e => {
                          setHourlySupplement(e.target.value);
                          setFieldValue(
                            "missionHourlySupplement",
                            e.target.value
                          );
                        }}
                        value={hourlySupplement}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-lg-3">
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.CONTACT_NAME" />
                      <span className="asterisk">*</span>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-user-tie text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="missionContactName"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.VACANCY.CONTACT_NAME"
                        })}
                      />
                    </div>
                    {touched.missionContactName && errors.missionContactName ? (
                      <div className="asterisk">
                        {errors["missionContactName"]}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-lg-3">
                    <label>
                      <FormattedMessage id="MODEL.VACANCY.35H" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-clock text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="mission35HInformation"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.VACANCY.35H"
                        })}
                      />
                    </div>
                    {/* {touched.mission35HInformation &&
                    errors.mission35HInformation ? (
                      <div className="asterisk">
                        {errors["mission35HInformation"]}
                      </div>
                    ) : null} */}
                  </div>
                </div>

                <div className="form-group row">
                  <div className="col-xl-12">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.EQUIPMENT" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-list-alt text-primary"></i>
                          </span>
                        </div>
                        <Select
                          isMulti
                          onChange={e =>
                            handleChangeEquipment(e, setFieldValue)
                          }
                          options={formatedEquipment}
                          styles={customStyles}
                          value={selectedEquipment}
                          className="col-lg-12 form-control"
                        ></Select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.VEHICLE" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-car-side text-primary"></i>
                          </span>
                        </div>
                        <select
                          name="missionRemunerationItems"
                          className="col-lg-12 form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "MODEL.VACANCY.VEHICLE"
                          })}
                          value={selecteVehicules}
                          onChange={e => {
                            setSelecteVehicules(e.target.value);
                            setFieldValue(
                              "missionHasVehicle",
                              e.target.value === "true" ? true : false
                            );
                          }}
                        >
                          <option
                            key="null"
                            label="Veuillez choisir une valeur"
                            value={null}
                          >
                            <FormattedMessage id="TEXT.YES" />
                          </option>
                          <option key="yes" label="oui" value={true}>
                            <FormattedMessage id="TEXT.YES" />
                          </option>
                          <option key="no" label="non" value={false}>
                            <FormattedMessage id="TEXT.NO" />
                          </option>
                          ;
                        </select>
                      </div>
                    </div>
                    {touched.missionHasVehicle && errors.missionHasVehicle ? (
                      <div className="asterisk">
                        {errors["missionHasVehicle"]}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-xl-8">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.DRIVERLICENCE" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-id-card text-primary"></i>
                          </span>
                        </div>
                        <Select
                          isMulti
                          onChange={e => handleChangeLicense(e, setFieldValue)}
                          options={formatedLicenses}
                          styles={customStyles}
                          value={selectedLicense}
                          className="col-lg-12 form-control"
                        ></Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                onClick={onHide}
                className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.CANCEL" />
              </button>
              <> </>
              <button
                type="submit"
                onClick={() => {
                  checkRemunerations(values, setFieldValue);
                  handleSubmit();
                }}
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.SAVE" />
              </button>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </>
  );
}

export default injectIntl(EditForm);
