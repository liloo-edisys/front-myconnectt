/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Field } from "formik";
import _, { debounce, isNull } from "lodash";
import { Input } from "metronic/_partials/controls";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { countMatching } from "actions/client/applicantsActions";
import { useFormikContext } from "formik";
import { DatePickerField } from "metronic/_partials/controls";
import MissionWizzardHeader from "./missionWizzardHeader.jsx";
import isNullOrEmpty from "../../../../../../../utils/isNullOrEmpty";
import moment from "moment";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import {
  createJobSkills,
  createJobTags,
  getEducationLevels,
  getJobTitles,
  getLanguages,
  getJobTags,
  getJobSkills,
  getMissionExperiences
} from "../../../../../../../business/actions/shared/listsActions";
import {
  getJobSkills as getJobSkillsApi,
  getJobTags as getJobTagsApi
} from "api/shared/listsApi";
import { toastr } from "react-redux-toastr";
import {
  getMission as getMissionAction,
  resetMissionIndicator,
  resetMission,
  getHabilitationsList
} from "../../../../../../../business/actions/client/missionsActions";
import { deleteFromStorage } from "../../../../../shared/DeleteFromStorage";
import axios from "axios";
import { useHistory, useParams } from "react-router-dom";
import InputRange from "react-input-range";
registerLocale("fr", fr);

function FormStepOne(props, formik) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const { intl, goToSecondStep, accountID } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  let {
    saveMissionSuccess,
    updateMissionSuccess,
    isTemplate,
    isDuplicate,
    isTmpOrDup,
    habilitations,
    mission
  } = useSelector(
    state => ({
      saveMissionSuccess: state.missionsReducerData.saveMissionSuccess,
      updateMissionSuccess: state.missionsReducerData.updateMissionSuccess,
      isTemplate: state.missionsReducerData.currentTemplate ? true : false,
      isDuplicate: state.missionsReducerData.currentDuplicate ? true : false,
      isTmpOrDup: isNullOrEmpty(state.missionsReducerData.mission)
        ? false
        : true,
      habilitations: state.missionsReducerData.habilitations,
      mission: state.missionsReducerData.mission
    }),
    shallowEqual
  );
  const getCurrentMission = (field, city) => {
    let currentCompany = _.filter(
      companies,
      person => person.id === parseInt(city)
    );
    return currentCompany.length && currentCompany[0][field];
  };
  const {
    jobTitleList,
    jobExperiences,
    jobTags,
    companies,
    jobSkills,
    educationLevels,
    languages,
    currentWorksite,
    template,
    currentCompanyID
  } = useSelector(
    state => ({
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
      template: state.missionsReducerData.mission
    }),
    shallowEqual
  );

  let worksites = companies.length
    ? companies.filter(company => company.parentID === accountID)
    : [];

  const editor = useRef(null);
  const [selectedCity, setselectedCity] = useState(null);

  const [missionToUpdate, setMissionToUpdate] = useState([]);

  const [address, setAddress] = useState(null);
  const [city, setCity] = useState(null);
  const [postalCode, setPostalCode] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);

  const [extraJobTitle, setExtraJobTitle] = useState(null);
  const [selectedTags, setSelectedTags] = useState(null);
  const [selectedHabilitations, setSelectedHabilitations] = useState(null);

  const [selectedSkills, setSelectedSkills] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const [description, setDescription] = useState(null);
  const [selectedEducation, setSelectedEducation] = useState(null);

  const [missionOrderReference, setMissionOrderReference] = useState(null);
  const [vacancyNumberOfJobs, setVacancyNumberOfJobs] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [experience, setExperience] = useState(null);
  const [distance, setDistance] = useState(
    props?.templateSelection?.matchingPostalCodeDistance
      ? props.templateSelection.matchingPostalCodeDistance
      : 10
  );

  const [recurrenceType, setRecurrenceType] = useState(0);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(null);

  useEffect(() => {
    props.formik.setFieldValue("vacancyBusinessAddressCity", city);
    props.formik.setFieldValue("address", address);
    props.formik.setFieldValue("vacancyBusinessAddressPostalCode", postalCode);

    if (props.formik.values.vacancyApplicationCriteriaArrayComputerSkills) {
      getDataProfile(
        props.formik.values.vacancyApplicationCriteriaArrayComputerSkills,
        jobSkills,
        setSelectedSkills
      );
    }
    if (props.formik.values.missionArrayHabilitations) {
      getDataProfile(
        props.formik.values.missionArrayHabilitations,
        habilitations,
        setSelectedHabilitations
      );
    }

    if (!city || !address || !postalCode) {
      setCity(worksites[0].city);
      props.formik.setFieldValue(
        "vacancyBusinessAddressCity",
        worksites[0].city
      );
      setAddress(worksites[0].address);
      props.formik.setFieldValue("address", worksites[0].address);
      setPostalCode(worksites[0].postalCode);
      props.formik.setFieldValue(
        "vacancyBusinessAddressPostalCode",
        worksites[0].postalCode
      );
    }
  }, [city, address, postalCode, habilitations, jobSkills]);

  const getDataProfile = (newValue, list, exec) => {
    let newArray = [];
    for (let i = 0; i < newValue.length; i++) {
      const index = list.findIndex(item => item.id === newValue[i]);
      if (index > -1) {
        newArray.push(createOption(list[index].name, list[index].id));
      }
    }
    exec(newArray);
  };

  const createOption = (label, value) => ({
    label,
    value
  });
  const formatLanguage = useCallback(data => {
    if (languages.length) {
      let newArray = [];
      data &&
        data.map(lang => {
          let value = languages.filter(l => l.id === lang);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].frenchName,
                value[value.length - 1].id
              )
            );
          }
        });
      return setSelectedLanguage(newArray);
    }
  });
  const formatEducation = useCallback(data => {
    if (educationLevels.length) {
      let newArray = [];
      data &&
        data.map(level => {
          let value = educationLevels.filter(l => l.id === level);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].id
              )
            );
          }
        });
      if (isNull(selectedEducation)) {
        setSelectedEducation(newArray);
      }
      setSelectedEducation(newArray);

      return newArray;
    }
  });

  const formatSkills = useCallback(data => {
    if (jobSkills.length) {
      let newArray = [];
      data &&
        data.map(skill => {
          let value = jobSkills.filter(l => l.id === skill);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].id
              )
            );
          }
        });
      if (isNull(selectedSkills)) {
        return setSelectedSkills(newArray);
      }

      setSelectedSkills(newArray);
      return newArray;
    }
  });

  const formatTags = useCallback(data => {
    if (jobTags.length) {
      let newArray = [];
      data &&
        data.map(tag => {
          let value = jobTags.filter(l => l.id === tag);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].id
              )
            );
          }
        });
      if (isNull(selectedTags)) {
        return setSelectedTags(newArray);
      }
      return newArray;
    }
  });

  const getFieldCSSClasses = (touched, errors) => {
    const classes = ["form-control, col-lg-12"];
    if (touched && errors) {
      classes.push("is-invalid");
    }

    if (touched && !errors) {
      classes.push("is-valid");
    }

    return classes.join(" ");
  };
  const handleChangeAddress = e => {
    /*setAddress(getCurrentMission("address", e));*/
    props.formik.setFieldValue("address", e);
    setAddress(e);
    return e;
  };
  const handleForceChangeAddress = e => {
    props.formik.setFieldValue("address", getCurrentMission("address", e));
    setAddress(getCurrentMission("address", e));
    return e;
  };

  const handleChangeCity = e => {
    //setCity(getCurrentMission("city", e));
    props.formik.setFieldValue("city", e);
    setCity(e);
    return e;
  };

  const handleForceChangeCity = e => {
    props.formik.setFieldValue(
      "vacancyBusinessAddressCity",
      getCurrentMission("city", e)
    );
    setCity(getCurrentMission("city", e));
    //setCity(getCurrentMission("city", e));
    return e;
  };

  const handleChangePostalCode = e => {
    setPostalCode(e);
    props.formik.setFieldValue("vacancyBusinessAddressPostalCode", e);

    return e;
  };

  const handleForceChangePostalCode = e => {
    props.formik.setFieldValue(
      "vacancyBusinessAddressPostalCode",
      getCurrentMission("postalCode", e)
    );
    setPostalCode(getCurrentMission("postalCode", e));
    return e;
  };

  const handleChangeJobTitle = e => {
    setSelectedJobTitle(e.target.value);
    props.formik.setFieldValue("jobTitleID", parseInt(e.target.value));
  };

  useEffect(() => {
    getHabilitationsList(dispatch);
    if (!isNullOrEmpty(selectedJobTitle)) {
      props.formik.setFieldValue("jobTitleID", parseInt(selectedJobTitle));
      !isNullOrEmpty(props.formik.values.jobTitleID) &&
        props.formik.setFieldTouched("jobTitleID", true);
    }

    if (!isNullOrEmpty(vacancyNumberOfJobs)) {
      props.formik.setFieldValue(
        "vacancyNumberOfJobs",
        parseInt(vacancyNumberOfJobs)
      );
      !isNullOrEmpty(props.formik.values.vacancyNumberOfJobs) &&
        props.formik.setFieldTouched("vacancyNumberOfJobs", true);
    }

    if (!isNullOrEmpty(template.missionArrayHabilitations)) {
      let newArray = [];
      template.missionArrayHabilitations.map(skill => {
        let label = habilitations.filter(jobSkill => jobSkill.id === skill);
        const newObject = {
          label: label[0].name,
          value: skill
        };
        newArray.push(newObject);
      });

      props.formik.setFieldValue(
        "missionArrayHabilitations",
        formatFormik(newArray)
      );
      !isNullOrEmpty(props.formik.values.missionArrayHabilitations) &&
        props.formik.setFieldTouched("missionArrayHabilitations", true);
      return setSelectedHabilitations(newArray);
    }

    if (!isNullOrEmpty(description)) {
      props.formik.setFieldValue("vacancyMissionDescription", description);
      !isNullOrEmpty(props.formik.values.vacancyMissionDescription) &&
        props.formik.setFieldTouched("vacancyMissionDescription", true);
    }
  }, [selectedJobTitle, vacancyNumberOfJobs, description]);

  const handleForceChangeExtaJobTitle = e => {
    let extraTitle = jobTitleList.filter(
      job => job.id === parseInt(e.target.value)
    );
    props.formik.setFieldValue("vacancyTitle", extraTitle[0].name);
    setExtraJobTitle(extraTitle[0].name);
    return e.target.label;
  };

  const handleChangeExtraJobtitle = e => {
    setExtraJobTitle(e);

    setExtraJobTitle(e);
  };

  const handleChangeLanguage = newValue => {
    let newArray = selectedLanguage !== null ? [...selectedLanguage] : [];
    let difference =
      newValue !== null &&
      selectedLanguage !== null &&
      selectedLanguage.filter(x => !newValue.includes(x)); // calculates diff
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
    props.formik.setFieldValue(
      "vacancyApplicationCriteriaArrayLanguagesWithLevel",
      formatFormik(newArray)
    );
  };

  const handleChangeTags = newValue => {
    let newArray = selectedTags !== null ? [...selectedTags] : [];
    let difference =
      newValue !== null &&
      selectedTags !== null &&
      selectedTags.filter(x => !newValue.includes(x)); // calculates diff
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
    props.formik.setFieldValue(
      "vacancyApplicationCriteriaArrayJobTags",
      formatFormik(newArray)
    );
  };

  const handleChangeHabilitations = newValue => {
    let newArray =
      selectedHabilitations !== null ? [...selectedHabilitations] : [];
    let difference =
      newValue !== null &&
      selectedHabilitations !== null &&
      selectedHabilitations.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedHabilitations.filter(x =>
        newValue.includes(x)
      );
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

    setSelectedHabilitations(newArray);
    props.formik.setFieldValue(
      "missionArrayHabilitations",
      formatFormik(newArray)
    );
  };

  const handleChangeSkill = newValue => {
    let difference =
      newValue !== null &&
      selectedSkills !== null &&
      selectedSkills.filter(x => !newValue.includes(x)); // calculates diff
    let newArray = selectedSkills !== null ? [...selectedSkills] : [];
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
    props.formik.setFieldValue(
      "vacancyApplicationCriteriaArrayComputerSkills",
      formatFormik(newArray)
    );
  };
  const handleChangeEducation = newValue => {
    let difference =
      newValue !== null &&
      selectedEducation !== null &&
      selectedEducation.filter(x => !newValue.includes(x)); // calculates diff
    let newArray = selectedEducation !== null ? [...selectedEducation] : [];
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
    props.formik.setFieldValue(
      "vacancyApplicationCriteriaArrayRequiredEducationLevels",
      formatFormik(newArray)
    );
  };

  const handleCreateTag = value => {
    setLoading(true);
    dispatch(createJobTags.request({ name: value }));
    setTimeout(() => {
      getJobTagsApi().then(data => {
        let newTag = data.data.slice(-1)[0];
        let newArray = !isNullOrEmpty(selectedTags) ? [...selectedTags] : [];
        newArray.push(createOption(newTag.name, newTag.id));
        setSelectedTags(newArray);
        props.formik.setFieldValue(
          "vacancyApplicationCriteriaArrayJobTags",
          formatFormik(newArray)
        );
      });
      setLoading(false);
    }, 2000);
  };

  const handleCreateSkill = value => {
    setIsSkillsLoading(true);
    dispatch(createJobSkills.request({ name: value }));
    setTimeout(() => {
      getJobSkillsApi().then(data => {
        let newSkill = data.data.slice(-1)[0];
        let newArray = !isNullOrEmpty(selectedSkills)
          ? [...selectedSkills]
          : [];

        newArray.push(createOption(newSkill.name, newSkill.id));
        setSelectedSkills(newArray);
        props.formik.setFieldValue(
          "vacancyApplicationCriteriaArrayComputerSkills",
          formatFormik(newArray)
        );
      });
      setIsSkillsLoading(false);
    }, 2000);
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

  let formattedLanguagues = languages.map(lang => {
    lang["value"] = lang["id"];
    lang["label"] = lang["frenchName"];
    return lang;
  });

  let formattedTags = jobTags.map(tag => {
    return tag && createOption(tag.name, tag.id);
  });

  let formattedHabilitations = habilitations.map(habilitation => {
    return habilitation && createOption(habilitation.name, habilitation.id);
  });

  let formattedSkills = jobSkills.map(skill => {
    return skill && createOption(skill.name, skill.id);
  });

  let formattedEducation = educationLevels.map(education => {
    return education && createOption(education.name, education.id);
  });

  const formatFormik = values => {
    let formatedValues = [];
    values !== null &&
      values.map(value => {
        return formatedValues.push(value.value);
      });
    return formatedValues;
  };

  const setFormikValues = () => {
    props.formik.setFieldTouched("vacancyNumberOfJobs", true);
    props.formik.setFieldTouched("vacancyMissionDescription", true);
    props.formik.setFieldTouched("vacancyBusinessAddressPostalCode", true);
    props.formik.setFieldTouched(
      "vacancyContractualVacancyEmploymentContractTypeStartDate",
      true
    );
    props.formik.setFieldTouched(
      "vacancyContractualVacancyEmploymentContractTypeEndDate",
      true
    );
    props.formik.setFieldTouched("jobTitleID", true);

    props.formik.setFieldValue("jobTitleID", parseInt(selectedJobTitle));
    props.formik.setFieldValue("vacancyTitle", extraJobTitle);
    props.formik.setFieldValue("Address", address);
    props.formik.setFieldValue("vacancyBusinessAddressCity", city);
    props.formik.setFieldValue("vacancyBusinessAddressPostalCode", postalCode);
    if (!template) {
      props.formik.setFieldValue(
        "vacancyApplicationCriteriaArrayJobTags",
        formatFormik(selectedTags)
      );
      props.formik.setFieldValue(
        "vacancyApplicationCriteriaArrayRequiredEducationLevels",
        formatFormik(selectedEducation)
      );
    }
  };
  useEffect(() => {
    if (!_.isEmpty(localStorage.getItem("id"))) {
      let id = parseInt(localStorage.getItem("id"));
      dispatch(getMissionAction.request(id));
      localStorage.removeItem("id");
    } else if (isNullOrEmpty(template) && selectedCity) {
      isNull(address) && setAddress(getCurrentMission("address", selectedCity));
      !city && setCity(getCurrentMission("city", selectedCity));
      !postalCode &&
        setPostalCode(getCurrentMission("postalCode", selectedCity));
      props.formik.setFieldValue(
        "vacancyBusinessAddressPostalCode",
        getCurrentMission("postalCode", selectedCity)
      );
    }
  }, [dispatch, props.currentWorkiste, template]);
  const useMountEffect = fun => useEffect(fun, []);
  let deleteItems = () => {
    var result = {};
    for (var type in window.localStorage)
      if (!type.includes("persist")) result[type] = window.localStorage[type];
    for (var item in result) deleteFromStorage(item);
  };
  useMountEffect(() => {
    dispatch(resetMissionIndicator.request());
    dispatch(getJobTitles.request());
    dispatch(getEducationLevels.request());
    dispatch(getLanguages.request());
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    dispatch(getJobTags.request());
    dispatch(getMissionExperiences.request());
  }, []);
  const { errors, touched } = useFormikContext();

  useEffect(() => {
    !isNullOrEmpty(
      props.formik.values.vacancyContractualVacancyEmploymentContractTypeEndDate
    ) &&
      touched.vacancyContractualVacancyEmploymentContractTypeEndDate !== true &&
      props.formik.setFieldTouched(
        "vacancyContractualVacancyEmploymentContractTypeEndDate",
        true
      );
    !isNullOrEmpty(
      props.formik.values
        .vacancyContractualVacancyEmploymentContractTypeStartDate
    ) &&
      touched.vacancyContractualVacancyEmploymentContractTypeStartDate !==
        true &&
      props.formik.setFieldTouched(
        "vacancyContractualVacancyEmploymentContractTypeStartDate",
        true
      );
  });
  useEffect(() => {
    !isNullOrEmpty(template) &&
      isNotTemplateOrDuplicate() &&
      isNullOrEmpty(
        props.formik.values
          .vacancyContractualVacancyEmploymentContractTypeStartDate
      ) &&
      props.formik.values
        .vacancyContractualVacancyEmploymentContractTypeStartDate._isValid &&
      props.formik.setFieldValue(
        "vacancyContractualVacancyEmploymentContractTypeStartDate",
        moment(
          template.vacancyContractualVacancyEmploymentContractTypeStartDate
        )
      );
    !isNullOrEmpty(template) &&
      isNotTemplateOrDuplicate() &&
      isNullOrEmpty(
        props.formik.values
          .vacancyContractualVacancyEmploymentContractTypeEndDate
      ) &&
      props.formik.values.vacancyContractualVacancyEmploymentContractTypeEndDate
        ._isValid &&
      props.formik.setFieldValue(
        "vacancyContractualVacancyEmploymentContractTypeEndDate",
        moment(template.vacancyContractualVacancyEmploymentContractTypeEndDate)
      );
  });

  const isNotTemplateOrDuplicate = () => {
    return isTemplate || isDuplicate ? false : true;
  };

  useEffect(() => {
    let template = props.formik.values;

    isNullOrEmpty(vacancyNumberOfJobs) &&
      setVacancyNumberOfJobs(template.vacancyNumberOfJobs);
    if (!isNullOrEmpty(template)) {
      isNull(experience) && setExperience(template.missionExperienceID);
      !isNullOrEmpty(
        template.vacancyApplicationCriteriaArrayRequiredEducationLevels
      ) &&
        isNull(selectedEducation) &&
        formatEducation(
          template.vacancyApplicationCriteriaArrayRequiredEducationLevels
        );

      !isNullOrEmpty(
        template.vacancyApplicationCriteriaArrayLanguagesWithLevel
      ) &&
        isNull(selectedLanguage) &&
        formatLanguage(
          template.vacancyApplicationCriteriaArrayLanguagesWithLevel
        );

      !isNullOrEmpty(template.vacancyApplicationCriteriaArrayComputerSkills) &&
        isNull(selectedSkills) &&
        formatSkills(template.vacancyApplicationCriteriaArrayComputerSkills);

      !isNullOrEmpty(template.missionOrderReference) &&
        isNull(missionOrderReference) &&
        setMissionOrderReference(template.missionOrderReference);

      !isNullOrEmpty(template.vacancyApplicationCriteriaArrayJobTags) &&
        isNull(selectedTags) &&
        formatTags(template.vacancyApplicationCriteriaArrayJobTags);

      isNullOrEmpty(experience) &&
        props.formik.setFieldValue(
          "missionExperienceID",
          template.missionExperienceID
        );
    }
  }, [
    selectedTags,
    selectedSkills,
    selectedLanguage,
    selectedEducation,
    missionOrderReference
  ]);
  useEffect(() => {
    let template = props.formik.values;
    isNullOrEmpty(selectedJobTitle) && setSelectedJobTitle(template.jobTitleID);
    isNullOrEmpty(props.formik.values.jobTitleID) &&
      props.formik.setFieldValue("jobTitleID", template.jobTitleID);

    isNullOrEmpty(selectedCity) && setselectedCity(template.workSiteID);
    isNullOrEmpty(props.formik.values.workSiteID) &&
      props.formik.setFieldValue("workSiteID", template.workSiteID);

    isNullOrEmpty(extraJobTitle) && setExtraJobTitle(template.vacancyTitle);
    isNullOrEmpty(extraJobTitle) &&
      props.formik.setFieldValue("vacancyTitle", template.vacancyTitle);

    isNullOrEmpty(experience) && setExperience(template.missionExperienceID);
    isNullOrEmpty(experience) &&
      props.formik.setFieldValue(
        "missionExperienceID",
        template.missionExperienceID
      );

    isNullOrEmpty(description) &&
      setDescription(template.vacancyMissionDescription);
    isNullOrEmpty(props.formik.values.vacancyMissionDescription) &&
      props.formik.setFieldValue(
        "vacancyMissionDescription",
        template.vacancyMissionDescription
      );
    !isNullOrEmpty(props.formik.values.vacancyMissionDescription) &&
      props.formik.setFieldTouched("vacancyMissionDescription", true);
    if (isNullOrEmpty(address)) {
      !isNullOrEmpty(template.address)
        ? setAddress(template.address)
        : setAddress(worksites[0].address);
    }
    isNullOrEmpty(address) && !isNullOrEmpty(template.address)
      ? props.formik.setFieldValue("address", template.address)
      : props.formik.setFieldValue("address", worksites[0].address);
    if (isNull(city)) {
      !isNullOrEmpty(template.vacancyBusinessAddressCity)
        ? setCity(template.vacancyBusinessAddressCity)
        : setCity(worksites[0].city);
    }
    isNullOrEmpty(city) && !isNullOrEmpty(template.city)
      ? props.formik.setFieldValue(
          "vacancyBusinessAddressCity",
          template.vacancyBusinessAddressCity
        )
      : props.formik.setFieldValue(
          "vacancyBusinessAddressCity",
          getCurrentMission("city", worksites[0].city)
        );

    if (isNullOrEmpty(postalCode)) {
      !isNullOrEmpty(template.vacancyBusinessAddressPostalCode)
        ? setPostalCode(template.vacancyBusinessAddressPostalCode)
        : setPostalCode(worksites[0].postalCode);
    }
    isNullOrEmpty(postalCode) && !isNullOrEmpty(template.city)
      ? props.formik.setFieldValue(
          "vacancyBusinessAddressPostalCode",
          template.vacancyBusinessAddressPostalCode
        )
      : props.formik.setFieldValue(
          "vacancyBusinessAddressPostalCode",
          worksites[0].postalCode
        );
    isNullOrEmpty(startDate) &&
      isTmpOrDup === false &&
      setStartDate(
        moment(
          template.vacancyContractualVacancyEmploymentContractTypeStartDate
        )
      );
    isNullOrEmpty(
      props.formik.values
        .vacancyContractualVacancyEmploymentContractTypeStartDate
    ) &&
      isTmpOrDup === false &&
      props.formik.values
        .vacancyContractualVacancyEmploymentContractTypeStartDate._isValid &&
      props.formik.setFieldValue(
        "vacancyContractualVacancyEmploymentContractTypeStartDate",
        moment(
          template.vacancyContractualVacancyEmploymentContractTypeStartDate
        )
      );

    isNull(missionOrderReference) &&
      isTmpOrDup === false &&
      setMissionOrderReference(template.missionOrderReference);

    !isNull(missionOrderReference) &&
      isTmpOrDup === false &&
      props.formik.setFieldValue(
        "missionOrderReference",
        template.missionOrderReference
      );

    isTmpOrDup === false &&
      props.formik.values.vacancyContractualVacancyEmploymentContractTypeEndDate
        ._isValid &&
      props.formik.setFieldValue(
        "vacancyContractualVacancyEmploymentContractTypeEndDate",
        moment(template.vacancyContractualVacancyEmploymentContractTypeEndDate)
      );
    isNullOrEmpty(endDate) &&
      isTmpOrDup === false &&
      setEndDate(
        moment(template.vacancyContractualVacancyEmploymentContractTypeEndDate)
      );

    // isNullOrEmpty(vacancyNumberOfJobs) &&
    //   setVacancyNumberOfJobs(template.vacancyNumberOfJobs);
    // isNullOrEmpty(props.formik.values.vacancyNumberOfJobs) &&
    //   props.formik.setFieldValue(
    //     "vacancyNumberOfJobs",
    //     template.vacancyNumberOfJobs
    //   );
    !isNullOrEmpty(props.formik.values.vacancyNumberOfJobs) &&
      props.formik.setFieldTouched("vacancyNumberOfJobs", true);
    !isNullOrEmpty(props.formik.values.vacancyMissionDescription) &&
      props.formik.setFieldTouched("vacancyMissionDescription", true);
    !isNullOrEmpty(props.formik.values.jobTitleID) &&
      props.formik.setFieldTouched("jobTitleID", true);

    // educationLevels.length &&
    //   isNullOrEmpty(selectedEducation) &&
    //   !isNullOrEmpty(
    //     template.vacancyApplicationCriteriaArrayRequiredEducationLevels
    //   ) &&
    //   formatEducation(
    //     template.vacancyApplicationCriteriaArrayRequiredEducationLevels
    //   );

    isNullOrEmpty(
      props.formik.values.vacancyApplicationCriteriaArrayRequiredEducationLevels
    ) &&
      props.formik.setFieldValue(
        "vacancyApplicationCriteriaArrayRequiredEducationLevels",
        template.vacancyApplicationCriteriaArrayRequiredEducationLevels
      );

    // languages.length &&
    //   isNullOrEmpty(selectedLanguage) &&
    //   !isNullOrEmpty(
    //     template.vacancyApplicationCriteriaArrayLanguagesWithLevel
    //   ) &&
    //   formatLanguage(
    //     template.vacancyApplicationCriteriaArrayLanguagesWithLevel
    //   );

    isNull(
      props.formik.values.vacancyApplicationCriteriaArrayLanguagesWithLevel
    ) &&
      !isNull(template.vacancyApplicationCriteriaArrayLanguagesWithLevel) &&
      props.formik.setFieldValue(
        "vacancyApplicationCriteriaArrayLanguagesWithLevel",
        template.vacancyApplicationCriteriaArrayLanguagesWithLevel
      );

    // jobSkills.length &&
    //   isNullOrEmpty(selectedSkills) &&
    //   !isNullOrEmpty(
    //     template.vacancyApplicationCriteriaArrayComputerSkills
    //   ) &&
    //   formatSkills(template.vacancyApplicationCriteriaArrayComputerSkills);

    isNull(props.formik.values.vacancyApplicationCriteriaArrayComputerSkills) &&
      !isNullOrEmpty(template.vacancyApplicationCriteriaArrayComputerSkills) &&
      props.formik.setFieldValue(
        "vacancyApplicationCriteriaArrayComputerSkills",
        template.vacancyApplicationCriteriaArrayComputerSkills
      );
    // jobTags.length &&
    //   isNullOrEmpty(selectedTags) &&
    //   !isNullOrEmpty(template.vacancyApplicationCriteriaArrayJobTags) &&
    //   formatTags(template.vacancyApplicationCriteriaArrayJobTags);

    isNullOrEmpty(props.formik.values.vacancyApplicationCriteriaArrayJobTags) &&
      props.formik.setFieldValue(
        "vacancyApplicationCriteriaArrayJobTags",
        template.vacancyApplicationCriteriaArrayJobTags
      );
  }, []);

  const handleValidate = values => {
    setFormikValues();
    const {
      vacancyNumberOfJobs,
      vacancyMissionDescription,
      vacancyContractualVacancyEmploymentContractTypeStartDate,
      vacancyContractualVacancyEmploymentContractTypeEndDate,
      jobTitleID,
      vacancyBusinessAddressPostalCode
    } = values;
    let errors = false;
    let now = new Date();
    if (
      !vacancyContractualVacancyEmploymentContractTypeStartDate ||
      !vacancyContractualVacancyEmploymentContractTypeEndDate
    ) {
      return toastr.error("Veuillez saisir les dates de début et de fin");
    }
    if (
      vacancyNumberOfJobs < 1 ||
      !vacancyMissionDescription ||
      !vacancyContractualVacancyEmploymentContractTypeStartDate ||
      !vacancyContractualVacancyEmploymentContractTypeEndDate ||
      !jobTitleID ||
      !vacancyBusinessAddressPostalCode
    ) {
      errors = true;
    }
    if (
      vacancyContractualVacancyEmploymentContractTypeStartDate < now ||
      vacancyContractualVacancyEmploymentContractTypeEndDate < now
    ) {
      return toastr.error("Les dates sélectionnées sont déjà passées");
    }
    if (errors) {
      return toastr.error(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELDS.TITLE" }),
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELDS.DESC" })
      );
    } else {
      goToSecondStep();
    }
  };
  const handleCheckMatchs = () => {
    dispatch(
      countMatching.request({
        tenantID: TENANTID,
        address: address ? address : "_",
        vacancyTitle: extraJobTitle,
        jobTitleID: parseInt(selectedJobTitle),
        vacancyApplicationCriteriaArrayComputerSkills: formatFormik(
          selectedSkills
        ),
        vacancyApplicationCriteriaArrayJobTags: formatFormik(selectedTags),
        vacancyApplicationCriteriaArrayRequiredEducationLevels: formatFormik(
          selectedEducation
        ),
        vacancyApplicationCriteriaArrayLanguagesWithLevel: formatFormik(
          selectedLanguage
        ),
        vacancyBusinessAddressPostalCode: postalCode
      })
    );
  };

  const handleChangeDistance = value => {
    props.formik.setFieldValue("matchingPostalCodeDistance", value.value);
    setDistance(value.value);
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
                    <FormattedMessage id="TEXT.GENRAL_INFORMATION" />
                  </h3>
                  <p className="required-desc">
                    <FormattedMessage id="TEXT.REQUIRED_DESC_PART1" />
                    <span className="asterisk">*</span>
                    <FormattedMessage id="TEXT.REQUIRED_DESC_PART2" />
                  </p>
                </div>
                <div className="row">
                  <div className="col-xl-6">
                    <div className="form-group">
                      <label className=" col-form-label">
                        <FormattedMessage id="MODEL.JOBTITLE" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-laptop-code text-primary"></i>
                          </span>
                        </div>
                        <Field
                          name="jobTitleID"
                          validate={props.formik.values.jobTitleID}
                          render={({ field, form }) => (
                            <select
                              className={`${getFieldCSSClasses(
                                touched[field.name],
                                errors[field.name]
                              )} form-control form-control-lg `}
                              name="jobTitleID"
                              value={selectedJobTitle}
                              onChange={e => {
                                handleChangeJobTitle(e);
                                handleForceChangeExtaJobTitle(e);
                              }}
                            >
                              <option disabled selected value="0">
                                --{" "}
                                {intl.formatMessage({ id: "MODEL.JOBTITLE" })}{" "}
                                --
                              </option>
                              {jobTitleList.map((job, i) => (
                                <option
                                  key={i}
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
                              ;
                              {errors[field.name] && touched[field.name] && (
                                <div className="invalid-datepicker-feedback">
                                  {errors[field.name].toString()}
                                </div>
                              )}
                            </select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-6">
                    <div className="form-group">
                      <label className=" col-form-label">
                        <FormattedMessage id="MODEL.VACANCY.TITLE" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-laptop-code text-primary"></i>
                          </span>
                        </div>
                        <Field
                          value={extraJobTitle}
                          className="form-control form-control-lg"
                          name="vacancyTitle"
                          placeholder={intl.formatMessage({
                            id: "MODEL.VACANCY.TITLE"
                          })}
                          maxLength="25"
                          component={Input}
                          defaultValue={extraJobTitle}
                          onChange={e =>
                            handleChangeExtraJobtitle(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label className="col-form-label">
                        <FormattedMessage id="MODEL.VACANCY.LOCATION" />
                        <span className="asterisk">*</span>
                      </label>
                      {worksites && (
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl fas fa-map-marked-alt text-primary"></i>
                            </span>
                          </div>
                          <select
                            className="col-lg-12 form-control"
                            name="workSiteID"
                            value={selectedCity}
                            onChange={e => {
                              let data = props.formik.values;
                              props.formik &&
                                props.formik.values.missionHasVehicle ===
                                  null &&
                                delete data["missionHasVehicle"];
                              dispatch(
                                countMatching.request({
                                  ...data,
                                  workSiteID: parseInt(e.target.value)
                                })
                              );
                              setselectedCity(e.target.value);
                              handleForceChangeAddress(e.target.value);
                              handleForceChangeCity(e.target.value);
                              handleForceChangePostalCode(e.target.value);
                            }}
                          >
                            {worksites.map((worksite, i) => (
                              <option key={i} value={worksite.id}>
                                {worksite.name}
                              </option>
                            ))}
                            ;
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label className=" col-form-label">
                        <FormattedMessage id="MODEL.ACCOUNT.ADDRESS" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-map text-primary"></i>
                          </span>
                        </div>
                        <Field
                          as="input"
                          name="address"
                          className="col-lg-12 form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.ADDRESS"
                          })}
                          onChange={e => {
                            let data = props.formik.values;
                            props.formik &&
                              props.formik.values.missionHasVehicle === null &&
                              delete data["missionHasVehicle"];
                            dispatch(
                              countMatching.request({
                                ...data,
                                address: e.target.value
                              })
                            );
                            handleChangeAddress(e.target.value);
                          }}
                          value={address}
                        ></Field>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label className=" col-form-label">
                        <FormattedMessage id="MODEL.ACCOUNT.CITY" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-city text-primary"></i>
                          </span>
                        </div>
                        <input
                          name="vacancyBusinessAddressCity"
                          className="col-lg-12 form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.CITY"
                          })}
                          onChange={e => {
                            handleChangeCity(e.target.value);
                          }}
                          value={city}
                          //defaultValue={selectedMission && selectedMission.city}
                        ></input>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label className=" col-form-label">
                        <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-map-marker-alt text-primary"></i>
                          </span>
                        </div>
                        <input
                          name="vacancyBusinessAddressPostalCode"
                          className="col-lg-12 form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.POSTALCODE"
                          })}
                          onChange={e => {
                            handleChangePostalCode(e.target.value);
                          }}
                          value={postalCode}
                        ></input>
                      </div>
                      {touched.vacancyBusinessAddressPostalCode &&
                      errors.vacancyBusinessAddressPostalCode ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.vacancyBusinessAddressPostalCode}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.STARTDATE" />
                        <span className="asterisk">*</span>
                      </label>
                      <DatePickerField
                        component={DatePickerField}
                        className="col-lg-12 form-control radius-left-0"
                        iconHeight="36px"
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="vacancyContractualVacancyEmploymentContractTypeStartDate"
                        onChange={date => {
                          setStartDate(date);
                          if (date === "Invalid date") {
                            props.formik.setFieldValue(
                              "vacancyContractualVacancyEmploymentContractTypeStartDate",
                              ""
                            );
                          } else {
                            props.formik.setFieldValue(
                              "vacancyContractualVacancyEmploymentContractTypeStartDate",
                              moment(date)
                            );
                          }
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
                        minDate={new Date()}
                        yearItemNumber={9}
                        locale="fr"
                      ></DatePickerField>
                      {touched.vacancyContractualVacancyEmploymentContractTypeStartDate &&
                      errors.vacancyContractualVacancyEmploymentContractTypeStartDate ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {
                              errors.vacancyContractualVacancyEmploymentContractTypeStartDate
                            }
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.ENDDATE" />
                        <span className="asterisk">*</span>
                      </label>
                      <DatePickerField
                        component={DatePickerField}
                        className="col-lg-12 form-control radius-left-0"
                        iconHeight="36px"
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="vacancyContractualVacancyEmploymentContractTypeEndDate"
                        onChange={date => {
                          setEndDate(date);
                          if (date === "Invalid date") {
                            props.formik.setFieldValue(
                              "vacancyContractualVacancyEmploymentContractTypeEndDate",
                              ""
                            );
                          } else {
                            props.formik.setFieldValue(
                              "vacancyContractualVacancyEmploymentContractTypeEndDate",
                              moment(date)
                            );
                          }
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
                        minDate={startDate && moment(startDate).toDate()}
                        yearItemNumber={9}
                        locale="fr"
                      ></DatePickerField>
                      {touched.vacancyContractualVacancyEmploymentContractTypeEndDate &&
                      errors.vacancyContractualVacancyEmploymentContractTypeEndDate ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {
                              errors.vacancyContractualVacancyEmploymentContractTypeEndDate
                            }
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.JOBS_COUNT" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-hashtag text-primary"></i>
                          </span>
                        </div>
                        <Field
                          component={Input}
                          name="vacancyNumberOfJobs"
                          className="col-lg-12 form-control"
                          type="text"
                          maxLength="3"
                          value={vacancyNumberOfJobs}
                          placeholder={intl.formatMessage({
                            id: "MODEL.VACANCY.JOBS_COUNT"
                          })}
                          onChange={e => {
                            setVacancyNumberOfJobs(e.target.value);
                            props.formik.setFieldValue(
                              "vacancyNumberOfJobs",
                              parseInt(e.target.value)
                            );
                          }}
                          defaultValue={
                            template && template.length
                              ? template.vacancyNumberOfJobs
                              : ""
                          }
                        ></Field>
                      </div>
                      {touched.vacancyNumberOfJobs &&
                      errors.vacancyNumberOfJobs ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.vacancyNumberOfJobs}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.REF_COMMAND" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-edit text-primary"></i>
                          </span>
                        </div>
                        <input
                          name="missionOrderReference"
                          className="col-lg-12 form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "MODEL.VACANCY.REF_COMMAND"
                          })}
                          value={missionOrderReference}
                          onChange={e => {
                            setMissionOrderReference(e.target.value);
                            props.formik.setFieldValue(
                              "missionOrderReference",
                              e.target.value
                            );
                          }}
                        ></input>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-12">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MODEL.VACANCY.DESCRIPTION" />
                        <span className="asterisk">*</span>
                      </label>
                      <textarea
                        className="col-lg-12 form-control"
                        onBlur={props.formik.handleBlur}
                        onChange={e => {
                          setDescription(e.target.value);
                          props.formik.setFieldValue(
                            "vacancyMissionDescription",
                            e.target.value
                          );
                        }}
                        value={description}
                        maxLength="140"
                        name="vacancyMissionDescription"
                      />
                      {touched.vacancyMissionDescription &&
                      errors.vacancyMissionDescription ? (
                        <div className="asterisk">
                          {errors["vacancyMissionDescription"]}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mission-form mt-10 mb-10 p-0">
                  <h3 className="group-title">
                    <FormattedMessage id="TEXT.RECURRENCE" />
                  </h3>
                </div>
                <div className="row">
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="TEXT.RECURRENCE.TYPE" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <select
                          name="recurrenceType"
                          className="col-lg-12 form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "TEXT.RECURRENCE.TYPE"
                          })}
                          value={recurrenceType}
                          onChange={e => {
                            setRecurrenceType(parseInt(e.target.value));
                            props.formik.setFieldValue(
                              "recurrenceType",
                              parseInt(e.target.value)
                            );
                          }}
                        >
                          <option
                            label="Veuillez choisir une valeur"
                            value={0}
                          ></option>
                          <option
                            label={intl.formatMessage({
                              id: "TEXT.RECURRENCE.ANNUAL"
                            })}
                            value={1}
                          ></option>
                          <option
                            label={intl.formatMessage({
                              id: "TEXT.RECURRENCE.MONTHLY"
                            })}
                            value={2}
                          ></option>
                          <option
                            label={intl.formatMessage({
                              id: "TEXT.RECURRENCE.WEEKLY"
                            })}
                            value={3}
                          ></option>
                          <option
                            label={intl.formatMessage({
                              id: "TEXT.RECURRENCE.END"
                            })}
                            value={4}
                          ></option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="TEXT.RECURRENCE.END_DATE" />
                      </label>
                      <div className="input-group">
                        <DatePickerField
                          component={DatePickerField}
                          className="col-lg-12 form-control radius-left-0"
                          iconHeight="36px"
                          type="text"
                          placeholder="JJ/MM/AAAA"
                          name="recurrenceEndDate"
                          onChange={date => {
                            setRecurrenceEndDate(date);
                            if (date === "Invalid date") {
                              props.formik.setFieldValue(
                                "recurrenceEndDate",
                                ""
                              );
                            } else {
                              props.formik.setFieldValue(
                                "recurrenceEndDate",
                                moment(date)
                              );
                            }
                          }}
                          showMonthDropdown
                          showYearDropdown
                          minDate={new Date()}
                          yearItemNumber={9}
                          locale="fr"
                        ></DatePickerField>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mission-form mt-10 mb-10 p-0">
                  <h3 className="group-title">
                    <FormattedMessage id="TEXT.PROFILE_LOOKING_FOR" />
                  </h3>
                </div>

                <div className="row">
                  <div className="col-xl-4">
                    <div className="form-group">
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
                            setExperience(parseInt(e.target.value));
                            props.formik.setFieldValue(
                              "missionExperienceID",
                              parseInt(e.target.value)
                            );
                          }}
                        >
                          <option disabled selected value="0">
                            -- {intl.formatMessage({ id: "MODEL.EXPERIENCE" })}{" "}
                            --
                          </option>
                          {jobExperiences.map((xp, i) => (
                            <option key={i} value={xp.id}>
                              {xp.name}
                            </option>
                          ))}
                          ;
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4">
                    <div className="form-group">
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
                            handleChangeEducation(e);
                          }}
                          options={formattedEducation}
                          styles={customStyles}
                          value={selectedEducation}
                          className="col-lg-12 form-control"
                        ></Select>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4">
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
                            handleChangeLanguage(e);
                          }}
                          options={formattedLanguagues}
                          styles={customStyles}
                          value={selectedLanguage}
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
                          onChange={handleChangeSkill}
                          options={formattedSkills}
                          styles={customStyles}
                          className="col-lg-12 form-control"
                          onCreateOption={handleCreateSkill}
                          isLoading={isSkillsLoading}
                          value={selectedSkills}
                        ></CreatableSelect>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="TEXT.HABILITATIONS" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <CreatableSelect
                          isMulti
                          onChange={handleChangeHabilitations}
                          options={formattedHabilitations}
                          name="habilitations"
                          styles={customStyles}
                          className="col-lg-12 form-control"
                          isLoading={isLoading}
                          value={selectedHabilitations}
                        ></CreatableSelect>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4">
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
                          onChange={handleChangeTags}
                          options={formattedTags}
                          name="tags"
                          styles={customStyles}
                          className="col-lg-12 form-control"
                          onCreateOption={handleCreateTag}
                          isLoading={isLoading}
                          value={selectedTags}
                        ></CreatableSelect>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-4">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MATCHING.TABLE.AREA" />
                      </label>
                      <div className="input-group">
                        <div className="input-group mt-5">
                          <InputRange
                            formatLabel={value => `${value} km`}
                            step={10}
                            maxValue={1000}
                            minValue={0}
                            value={distance}
                            onChange={value => handleChangeDistance({ value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between border-top mt-5 pt-10">
                  <div className="mr-2">
                    <div
                      onClick={() => {
                        id ? history.goBack() : props.goBackToSelector();
                      }}
                      className="next col-lg p-0"
                    >
                      {" "}
                      <button
                        type="button"
                        className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.BACK" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      onClick={() => handleValidate(props.formik.values)}
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

export default injectIntl(FormStepOne);
