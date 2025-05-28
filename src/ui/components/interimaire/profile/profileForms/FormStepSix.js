import React, { useEffect, useState } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import MissionWizzardHeader from "./MissionWizzardHeader";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getJobSkills } from "actions/shared/ListsActions";
import { updateApplicant } from "actions/client/ApplicantsActions";
import { toastr } from "react-redux-toastr";
import JobTitleSelect from "../../jobTitle/jobTitleSelect";
import axios from "axios";

function FormStepSix(props) {
  const api = process.env.REACT_APP_WEBAPI_URL;
  const dispatch = useDispatch();
  const { intl } = props;
  const [loading, setLoading] = useState(false);

  const { parsed, jobSkills, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      jobSkills: state.lists.jobSkills,
      parsed: state.interimairesReducerData.interimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );

  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [role, setRole] = useState([]);
  const [distance, setDistance] = useState(50);

  // ✅ useEffect pour initialiser distance avec parsed.postalCodeSearchZone
  useEffect(() => {
    if (parsed?.postalCodeSearchZone !== undefined) {
      setDistance(parsed.postalCodeSearchZone);
    }
  }, [parsed?.postalCodeSearchZone]);

  const handleChangeDistance = event => {
    const value = parseInt(event.target.value, 10);
    setDistance(value);
    props.formik.setFieldValue("PostalCodeSearchZone", value);
  };

  console.log("FormStepSix - parsed --------> ", parsed);

  const initializeData = async () => {
    try {
      if (isNullOrEmpty(jobSkills)) {
        dispatch(getJobSkills.request());
      }

      // Initialiser les compétences directement depuis parsed et jobSkills
      if (parsed?.applicantArraySkills?.length > 0) {
        const skillPromises = parsed.applicantArraySkills.map(async skillId => {
          try {
            const skillResponse = await axios.get(
              `${api}api/JobSkill/${skillId}`
            );
            return {
              value: skillId,
              label: skillResponse.data.name
            };
          } catch (error) {
            console.error(`Error fetching skill ${skillId}:`, error);
            return null;
          }
        });

        const resolvedSkills = (await Promise.all(skillPromises)).filter(
          Boolean
        );
        setSelectedSkills(resolvedSkills);
      }

      // Initialiser les rôles depuis missionArrayDesiredJobTitles
      if (parsed?.missionArrayDesiredJobTitles?.length > 0) {
        const rolePromises = parsed.missionArrayDesiredJobTitles.map(
          async titleId => {
            try {
              const titleResponse = await axios.get(
                `${api}api/JobTitle/${titleId}`
              );
              return {
                value: titleId,
                label: titleResponse.data.name
              };
            } catch (error) {
              console.error(`Error fetching job title ${titleId}:`, error);
              return null;
            }
          }
        );

        const resolvedRoles = (await Promise.all(rolePromises)).filter(Boolean);
        console.log("Initializing roles with:", resolvedRoles);
        setRole(resolvedRoles);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      toastr.error("Error", "Failed to initialize data");
    }
  };

  // Initialize roles and skills
  useEffect(() => {
    initializeData();
  }, [parsed, jobSkills, api]);

  const handleSkillChange = React.useCallback(
    newValue => {
      setSelectedSkills(newValue || []);
      if (props.formik.values) {
        props.formik.setFieldValue(
          "applicantArraySkills",
          (newValue || []).map(skill => skill.value)
        );
      }
    },
    [props.formik]
  );

  useEffect(() => {
    const fetchSkillsByJobTitle = async () => {
      if (!role?.length) {
        console.log("No roles selected, clearing skills list");
        setSkillsList([]);
        return;
      }

      try {
        const jobTitleIds = role.map(item => item.value);
        console.log("Fetching skills for job titles:", jobTitleIds);

        const params = new URLSearchParams();
        jobTitleIds.forEach(id => params.append("JobTitles", id));

        console.log(
          "API call URL:",
          `${api}api/JobSkill/GetByJobTitle?${params.toString()}`
        );
        const response = await axios.get(
          `${api}api/JobSkill/GetByJobTitle?${params.toString()}`
        );

        console.log("Skills API response:", response.data);

        if (response.data) {
          const formattedSkills = response.data
            .filter(skill => {
              if (!skill?.name || !skill?.id) {
                console.warn("Found invalid skill:", skill);
                return false;
              }
              return true;
            })
            .map(skill => ({
              label: skill.name,
              value: skill.id
            }));

          console.log("Formatted skills:", formattedSkills);
          setSkillsList(formattedSkills);
        } else {
          console.warn("No data received from skills API");
          setSkillsList([]);
        }
      } catch (err) {
        console.error("Error loading skills:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        toastr.error("Error", "Unable to load skills");
        setSkillsList([]);
      }
    };

    fetchSkillsByJobTitle();
  }, [api, role]);

  useEffect(() => {
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
  }, [jobSkills]);

  const handleChangeRole = React.useCallback(
    newValue => {
      if (newValue && newValue.length > 8) {
        setRole(newValue.slice(0, 7));
        toastr.warning(
          intl.formatMessage({ id: "WARNING" }),
          "Maximum 7 job titles can be selected"
        );
      } else {
        setRole(newValue || []);
      }
    },
    [intl]
  );

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

  const handleChangePage = async () => {
    setLoading(true);
    try {
      const filteredSkills = selectedSkills.map(skill => skill.value);
      const filteredRole = role.map(r => r.value);

      const body = {
        ...parsed,
        applicantArraySkills: filteredSkills,
        missionArrayDesiredJobTitles: filteredRole,
        postalCodeSearchZone: distance
      };
      await dispatch(updateApplicant.request(body));
    } catch (err) {
      const message = err.response?.data?.message || "An error occurred";
      toastr.error(intl.formatMessage({ id: "ERROR" }), message);
    } finally {
      setLoading(false);
    }
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
                            disabled={loading}
                          >
                            <span>
                              <FormattedMessage id="BUTTON.SAVE" />
                            </span>
                            {loading && (
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
                      <div className="row">
                        <div className="col-xl-12">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MATCHING.TABLE.AREA" />
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl fas fa-route text-primary"></i>
                                </span>
                              </div>
                              <div className="form-control d-flex flex-column justify-content-center">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="font-weight-bold text-primary">
                                    {distance} km
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  className="form-range w-100"
                                  min="50"
                                  max="1000"
                                  step="50"
                                  value={distance || 50}
                                  onChange={handleChangeDistance}
                                  style={{
                                    background: `linear-gradient(to right, #007bff 0%, #007bff ${((distance ||
                                      0) /
                                      1000) *
                                      100}%, #e9ecef ${((distance || 0) /
                                      1000) *
                                      100}%, #e9ecef 100%)`
                                  }}
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
      </div>
      <div className="display_bottom_menu_profile">
        <MissionWizzardHeader props={props} />
      </div>
    </>
  );
}

export default injectIntl(FormStepSix);
