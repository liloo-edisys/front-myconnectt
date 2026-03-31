/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import _ from "lodash";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../shared/persistState.js";
import MissionWizzardHeader from "./missionWizzardHeader.jsx";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty.js";
import { getJobSkills, createJobSkills } from "actions/shared/listsActions";
import { updateApplicant } from "actions/client/applicantsActions";
import postalCode from "../../../../../utils/postalCodes.json";
import InputRange from "react-input-range";
import { getJobSkills as getJobSkillsApi } from "api/shared/listsApi";
import FormStepFour from "./formStepFour.jsx";
import axios from "axios";
// import "react-input-range/lib/css/index.css"
function FormStepSix(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const { parsed, jobSkills, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      jobSkills: state.lists.jobSkills,
      parsed: state.interimairesReducerData.interimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );

  const createOption = (label, value) => ({
    label,
    value
  });
  const [experience, setExperience] = useLocalStorage("experience", null);
  const [jobTitles, setJobTitles] = useState([]);
  const [role, setRole] = useLocalStorage([]);
  const [selectedEquipment, setSelectedEquipment] = useLocalStorage(
    "selectedEquipment",
    null
  );
  const [location, setLocation] = useLocalStorage(
    "applicantArrayJobMobilities",
    []
  );
  const [distance, setDistance] = useLocalStorage("PostalCodeSearchZone", null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);

  const [selectedCity, setselectedCity] = useState(null);
  const useMountEffect = fun => useEffect(fun, []);

  useEffect(() => {
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    //isNullOrEmpty(jobTitles) && dispatch(getJobTitles.request());
    isNullOrEmpty(distance) &&
      !isNullOrEmpty(
        props.formik.values && props.formik.values.postalCodeSearchZone
      ) &&
      setDistance(props.formik.values.postalCodeSearchZone);

    jobTitles.length &&
      role === null &&
      formatRole(parsed.arrayActivityDomains);

    jobSkills.length &&
      skills === null &&
      formatSkills(parsed && parsed.applicantArraySkills);

    let URL = `${process.env.REACT_APP_WEBAPI_URL}api/ActivityDomain`;
    isNullOrEmpty(jobTitles) &&
      axios
        .get(URL)
        .then(res => {
          const activityDomainsList = res.data;
          let selectedActivitiesArray = [];
          let selectedActivities = parsed.arrayActivityDomains
            ? parsed.arrayActivityDomains
            : [];
          for (let i = 0; i < selectedActivities.length; i++) {
            for (let j = 0; j < activityDomainsList.length; j++) {
              if (selectedActivities[i] === activityDomainsList[j].id) {
                selectedActivitiesArray.push({
                  value: activityDomainsList[j].id,
                  label: activityDomainsList[j].name
                });
              }
            }
          }
          for (let i = 0; i < selectedActivitiesArray.length; i++) {
            for (let j = 0; j < activityDomainsList.length; j++) {
              if (selectedActivitiesArray[i].id === activityDomainsList[j].id) {
                activityDomainsList.splice(j, 1);
              }
            }
          }
          setRole(selectedActivitiesArray);
          setJobTitles(activityDomainsList);
        })
        .catch(err => console.log(err));
  }, [jobSkills]);

  const handleChangeCity = newValue => {
    let formikEquipment = [];
    let newArray = [...role];
    let difference =
      newValue !== null && selectedCity.filter(x => !newValue.includes(x)); // calculates diff
    if (newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedCity.filter(x => newValue.includes(x));
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

    newValue !== null &&
      newValue.map(value => {
        return (
          props.formik.values.applicantArrayJobMobilities !== null &&
          !props.formik.values.applicantArrayJobMobilities.includes(value) &&
          formikEquipment.push(value.value)
        );
      });
    setselectedCity(newArray);
    props.formik.setFieldValue("applicantArrayJobMobilities", formikEquipment);
  };

  const loadOptions = (inputValue, callback) => {
    inputValue.length >= 3 &&
      setTimeout(() => {
        callback(
          _.filter(postalCode, function(city) {
            return (
              city.Nom_commune.toLowerCase().indexOf(
                inputValue.toLowerCase()
              ) >= 0 ||
              city.Code_postal.toString().indexOf(inputValue.toLowerCase()) >= 0
            );
          })
        );
      }, 1000);
  };

  const formatRole = data => {
    if (jobTitles.length) {
      let newArray = [];
      let formikRoles =
        props.formik.values.arrayActivityDomains !== null
          ? [...props.formik.values.arrayActivityDomains]
          : [];

      !isNullOrEmpty(data) &&
        data.map(eq => {
          let value = jobTitles.filter(l => l.id === eq);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].value
                  ? value[value.length - 1].value
                  : value[value.length - 1].id
              )
            );
          }
        });
      newArray !== null &&
        newArray.map(value => {
          !props.formik.values.arrayActivityDomains.includes(value.value) &&
            formikRoles.push(value.value);
        });
      formikRoles !== props.formik.values.arrayActivityDomains &&
        props.formik.setFieldValue("arrayActivityDomains", formikRoles);
      return setRole(newArray);
    }
  };
  const [skills, setSkills] = useLocalStorage("applicantArraySkills", null);

  const formatSkills = data => {
    if (jobSkills.length) {
      let newArray = [];
      let formikSkills =
        parsed && parsed.applicantArraySkills !== null
          ? [...parsed.applicantArraySkills]
          : [];
      !isNullOrEmpty(data) &&
        data.map(eq => {
          let value = jobSkills.filter(l => l.id === eq);

          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].value
                  ? value[value.length - 1].value
                  : value[value.length - 1].id
              )
            );
          }
        });
      newArray !== null &&
        newArray.map(value => {
          !props.formik.values.applicantArraySkills.includes(value.value) &&
            formikSkills.push(value.value ? value.value : value.value);
        });
      if (props.formik.values && props.formik.values.applicantArraySkills) {
        formikSkills !== props.formik.values.applicantArraySkills &&
          props.formik.setFieldValue("applicantArraySkills", formikSkills);
      }

      if (skills === null) {
        return setSkills(newArray);
      }
      return newArray;
    }
  };

  const handleChangeRole = newValue => {
    let formikEquipment = [];
    let newArray = !isNullOrEmpty(role) ? [...role] : [];
    let difference =
      newValue !== null &&
      role !== null &&
      role.filter(x => !newValue.includes(x)); // calculates diff
    if (newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = role.filter(x => newValue.includes(x));
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

    newValue !== null &&
      newValue.map(value => {
        return (
          props.formik.values.arrayActivityDomains !== null &&
          !props.formik.values.arrayActivityDomains.includes(value) &&
          formikEquipment.push(value.value)
        );
      });
    setRole(newArray);
    props.formik.setFieldValue("arrayActivityDomains", formikEquipment);
  };

  const handleChangeSkills = newValue => {
    let formikEquipment = [];
    let newArray = !isNullOrEmpty(skills) ? [...skills] : [];
    let difference =
      newValue !== null &&
      skills !== null &&
      skills.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = skills.filter(x => newValue.includes(x));
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

    newValue !== null &&
      newValue.map(value => {
        return (
          !formikEquipment.includes(value) && formikEquipment.push(value.value)
        );
      });
    setSkills(newArray);
    props.formik.setFieldValue("applicantArraySkills", formikEquipment);
  };

  const handleChangeLocations = newValue => {
    let formikEquipment = [];
    let newArray = [...skills];
    let difference =
      newValue !== null && skills.filter(x => !newValue.includes(x)); // calculates diff
    if (newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = skills.filter(x => newValue.includes(x));
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

    newValue !== null &&
      newValue.map(value => {
        return formikEquipment.push(value.value);
      });
    setLocation(newArray);
    props.formik.setFieldValue("applicantArraySkills", formikEquipment);
  };

  let formatedRole = jobTitles.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });

  let formatedCity = postalCode.map((equipment, ix) => {
    return equipment && createOption(equipment.Nom_commune, ix);
  });

  let formatedSkill = jobSkills.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });
  const { errors, touched } = useFormikContext();
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

  const asyncStyle = {
    control: (base, state) => ({
      ...base,
      background: "#F3F6F9",
      // match with the menu
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      // Overwrittes the different states of border
      borderColor: "transparent",
      // Removes weird border around container
      boxShadow: null,
      "&:hover": {
        // Overwrittes the different states of border
        borderColor: "transparent"
      }
    }),
    menu: base => ({
      ...base,
      // override border radius to match the box
      borderRadius: 0,
      // kill the gap
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      // kill the white space on first and last option
      padding: 0
    })
  };

  const handleChangePage = () => {
    const equipmentArray = [];
    for (let i = 0; i < selectedEquipment.length; i++) {
      equipmentArray.push(parseInt(selectedEquipment[i].value));
    }
    const newValue = {
      ...props.formik.values,
      missionArrayEquipments: equipmentArray
    };
    dispatch(updateApplicant.request(newValue));
    //props.history.push("/int-profile-edit/final-step");
  };

  const handleChangeDistance = value => {
    setDistance(value.value);
    props.formik.setFieldValue("PostalCodeSearchZone", value.value);
  };
  const formatFormik = values => {
    let formatedValues = [];
    values !== null &&
      values.map(value => {
        return formatedValues.push(value.value);
      });
    return formatedValues;
  };
  const handleCreateSkill = value => {
    setIsSkillsLoading(true);
    dispatch(createJobSkills.request({ name: value }));
    setTimeout(() => {
      getJobSkillsApi().then(data => {
        let newSkill = data.data.slice(-1)[0];
        let newArray = [...skills];
        let formikEquipment = [];
        newArray.push(createOption(newSkill.name, newSkill.id));
        setSkills(newArray);

        props.formik.setFieldValue(
          "vacancyApplicationCriteriaArrayComputerSkills",
          formatFormik(newArray)
        );
        newArray !== null &&
          newArray.map(value => {
            return (
              !formikEquipment.includes(value) &&
              formikEquipment.push(value.value)
            );
          });
        setSkills(newArray);
        props.formik.setFieldValue("applicantArraySkills", formikEquipment);
      });
      setIsSkillsLoading(false);
    }, 2000);
  };

  return (
    <>
      <div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px display_top_menu_profile">
          <MissionWizzardHeader props={props} />
        </div>
        <div className="flex-row-fluid ml-lg-8">
          <div className="card card-custom">
            <div className="card-body p-0">
              <div className="wizard wizard-2">
                <div className="wizard-body py-8 px-8">
                  <div className="row mx-10-responsive">
                    <div className="pb-5 width-full">
                      <div className="border-bottom mb-5 pb-3 align-right">
                        <div className="col-sm-12 col-xl-12">
                          <button
                            type="button"
                            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                            onClick={() => handleChangePage()}
                            disabled={updateInterimaireIdentityLoading}
                          >
                            <span>
                              <FormattedMessage id="BUTTON.SAVE" />
                            </span>
                            {updateInterimaireIdentityLoading && (
                              <span className="ml-3 spinner spinner-white"></span>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xl-12">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MATCHING.ACTIVITY.DOMAINS" />
                              <span className="asterisk">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl far fa-list-alt text-primary"></i>
                                </span>
                              </div>
                              <Select
                                isMulti
                                onChange={e => handleChangeRole(e)}
                                options={formatedRole}
                                styles={customStyles}
                                value={role}
                                className="col-lg-12 form-control"
                              ></Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xl-12">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.COMPETENCES" />
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl far fa-list-alt text-primary"></i>
                                </span>
                              </div>
                              <CreatableSelect
                                isMulti
                                name="skills"
                                onChange={handleChangeSkills}
                                options={formatedSkill}
                                styles={customStyles}
                                className="col-lg-12 form-control"
                                onCreateOption={handleCreateSkill}
                                isLoading={isSkillsLoading}
                                value={skills}
                              ></CreatableSelect>
                            </div>
                          </div>
                        </div>
                      </div>
                      <FormStepFour
                        selectedEquipment={selectedEquipment}
                        setSelectedEquipment={setSelectedEquipment}
                      />
                      <div className="row">
                        <div className="col-xl-12">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MATCHING.TABLE.AREA" />
                            </label>
                            <div className="input-group">
                              <InputRange
                                formatLabel={value => `${value}km`}
                                step={10}
                                maxValue={1000}
                                minValue={0}
                                value={distance}
                                onChange={value =>
                                  handleChangeDistance({ value })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="display_bottom_menu_profile">
        <MissionWizzardHeader props={props} />
      </div>
    </>
  );
}

export default injectIntl(FormStepSix);
