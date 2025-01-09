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
import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getJobSkills } from "actions/shared/ListsActions";
import { updateApplicant } from "actions/client/ApplicantsActions";
import { toastr } from "react-redux-toastr";
import JobTitleSelect from "../../jobTitle/jobTitleSelect";
import axios from "axios";
// import "react-input-range/lib/css/index.css"
function FormStepSix(props, formik) {
  const api = process.env.REACT_APP_WEBAPI_URL;

  const dispatch = useDispatch();
  const { intl } = props;

  const { parsed, jobSkills, updateInterimaireIdentityLoading } = useSelector(
    (state) => ({
      jobSkills: state.lists.jobSkills,
      parsed: state.interimairesReducerData.interimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading,
    }),
    shallowEqual
  );

  const createOption = (label, value) => ({
    label,
    value,
  });
  const [jobTitles, setJobTitles] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [role, setRole] = useLocalStorage([]);
  const [distance, setDistance] = useLocalStorage("PostalCodeSearchZone", null);

  const handleSkillChange = React.useCallback((newValue) => {
    setSelectedSkills(newValue || []);
  }, []);

  // Load skills by job title
  useEffect(() => {
    const fetchSkillsByJobTitle = async () => {
      try {
        if (!role || !role.length) {
          setSkillsList([]);
          return;
        }

        const jobTitleIds = role.map((item) => item.value);
        const params = new URLSearchParams();
        jobTitleIds.forEach((id) => params.append("JobTitles", id));

        const response = await axios.get(
          `${api}api/JobSkill/GetByJobTitle?${params.toString()}`
        );

        if (response.data) {
          const formattedSkills = response.data
            .filter((skill) => skill && skill.name && skill.id)
            .map((skill) => ({
              label: skill.name,
              value: skill.id,
            }));

          setSkillsList(formattedSkills);
        }
      } catch (err) {
        console.error("Error loading skills:", err);
        toastr.error("Error", "Unable to load skills");
        setSkillsList([]);
      }
    };

    fetchSkillsByJobTitle();
  }, [api, role, setSkillsList]);

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
        .then((res) => {
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
                  label: activityDomainsList[j].name,
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
        .catch((err) => console.log(err));
  }, [jobSkills]);

  const formatRole = (data) => {
    if (jobTitles.length) {
      let newArray = [];
      let formikRoles =
        props.formik.values.arrayActivityDomains !== null
          ? [...props.formik.values.arrayActivityDomains]
          : [];

      !isNullOrEmpty(data) &&
        data.map((eq) => {
          let value = jobTitles.filter((l) => l.id === eq);
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
        newArray.map((value) => {
          !props.formik.values.arrayActivityDomains.includes(value.value) &&
            formikRoles.push(value.value);
        });
      formikRoles !== props.formik.values.arrayActivityDomains &&
        props.formik.setFieldValue("arrayActivityDomains", formikRoles);
      return setRole(newArray);
    }
  };
  const [skills, setSkills] = useLocalStorage("applicantArraySkills", null);

  const formatSkills = (data) => {
    if (jobSkills.length) {
      let newArray = [];
      let formikSkills =
        parsed && parsed.applicantArraySkills !== null
          ? [...parsed.applicantArraySkills]
          : [];
      !isNullOrEmpty(data) &&
        data.map((eq) => {
          let value = jobSkills.filter((l) => l.id === eq);

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
        newArray.map((value) => {
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

  const handleChangeRole = React.useCallback((newValue, actionMeta) => {
    if (newValue && newValue.length > 8) {
      // Limiter à 7 items en gardant seulement les 7 premiers
      setRole(newValue.slice(0, 7));
      // Optionnellement, afficher un message à l'utilisateur
      toastr.warning(
        intl.formatMessage({ id: "WARNING" }),
        "Maximum 7 job titles can be selected"
      );
    } else {
      setRole(newValue || []);
    }
  }, []);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "transparent",
      margin: "-9px",
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      borderColor: "transparent",
      boxShadow: null,
      "&:hover": {
        borderColor: "transparent",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 0,
      marginTop: 0,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
  };

  const handleChangePage = () => {
    const newValue = {
      ...props.formik.values,
    };
    dispatch(updateApplicant.request(newValue));
    //props.history.push("/int-profile-edit/final-step");
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
                      <div className="col-12 mb-4">
                        <JobTitleSelect
                          value={role}
                          onChange={handleChangeRole}
                          styles={customStyles}
                          className="form-control"
                        />
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
                              <Select
                                isMulti
                                value={selectedSkills}
                                onChange={handleSkillChange}
                                options={skillsList}
                                styles={customStyles}
                                className="form-control"
                                placeholder="Sélectionnez des compétences"
                                noOptionsMessage={() =>
                                  "Aucune compétence disponible"
                                }
                                isSearchable={true}
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
