/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { getMissionEquipment } from "../../../../../../business/actions/shared/ListsActions";
import _ from "lodash";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import {
  getJobSkillsByActivityDomain,
  getJobSkillsGetByJobTitle,
} from "actions/shared/ListsActions";
import InputRange from "react-input-range";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import JobTitleSelect from "../../../jobtitle/jobTitleSelect.js";

import { getSelectedApplicantById } from "../../../../../../business/actions/backoffice/ApplicantActions";

function Matching(props) {
  const dispatch = useDispatch();
  const { intl } = props;

  const { parsed, jobSkills } = useSelector(
    (state) => ({
      jobSkills: state.lists.jobSkills,
      parsed: state.accountsReducerData.activeInterimaire,
    }),
    shallowEqual
  );

  const [experience, setExperience] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [role, setRole] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [location, setLocation] = useState([]);
  const [distance, setDistance] = useState(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [skills, setSkills] = useState(null);

  const api = process.env.REACT_APP_WEBAPI_URL;

  // Memoize formatedRole calculation
  const formatedRole = React.useMemo(
    () =>
      jobTitles.map((equipment) => ({
        label: equipment.name,
        value: equipment.id,
      })),
    [jobTitles]
  );

  const formatRole = React.useCallback(
    (data) => {
      if (!jobTitles.length) return;

      const newArray = [];
      const formikRoles = props.formik?.values?.arrayJobTitles
        ? [...props.formik.values.arrayJobTitles]
        : [];

      if (!isNullOrEmpty(data)) {
        data.forEach((eq) => {
          const value = jobTitles.find((l) => l.id === eq);
          if (value) {
            newArray.push({
              label: value.name,
              value: value.value || value.id,
            });
          }
        });
      }

      if (newArray.length) {
        newArray.forEach((value) => {
          if (
            props.formik?.values?.arrayJobTitles &&
            !props.formik.values.arrayJobTitles.includes(value.value)
          ) {
            formikRoles.push(value.value);
          }
        });
      }

      if (
        props.formik?.values?.arrayJobTitles &&
        formikRoles !== props.formik.values.arrayJobTitles
      ) {
        props.formik.setFieldValue("arrayJobTitles", formikRoles);
      }

      setRole(newArray);
    },
    [jobTitles, props.formik]
  );

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (isNullOrEmpty(jobSkills)) {
          dispatch(getJobSkillsGetByJobTitle.request());
        }

        dispatch(getMissionEquipment.request());

        if (parsed?.postalCodeSearchZone) {
          setDistance(parsed.postalCodeSearchZone);
        }

        // Load job titles
        try {
          const res = await axios.get(`${api}api/JobTitle`);
          console.log('Job titles response:', res.data);
          
          if (res.data && Array.isArray(res.data)) {
            setJobTitles(res.data);

            // Handle existing selected job titles from missionArrayDesiredJobTitles
            if (parsed?.missionArrayDesiredJobTitles && parsed.missionArrayDesiredJobTitles.length > 0) {
              console.log('Parsed desired job titles:', parsed.missionArrayDesiredJobTitles);
              
              const rolePromises = parsed.missionArrayDesiredJobTitles.map(async (titleId) => {
                try {
                  const titleResponse = await axios.get(
                    `${api}api/JobTitle/${titleId}`
                  );
                  return {
                    value: titleId,
                    label: titleResponse.data.name,
                  };
                } catch (error) {
                  console.error(`Error fetching job title ${titleId}:`, error);
                  return null;
                }
              });

              const resolvedRoles = (await Promise.all(rolePromises)).filter(Boolean);
              console.log('Resolved roles:', resolvedRoles);
              setRole(resolvedRoles);
            }
          } else {
            console.error('Invalid job titles data format:', res.data);
            toastr.error("Error", "Invalid job titles data format");
          }
        } catch (error) {
          console.error('Error loading job titles:', error);
          toastr.error("Error", "Failed to load job titles");
        }

        // Handle skills
        if (parsed?.applicantArraySkills && parsed.applicantArraySkills.length > 0) {
          const skillPromises = parsed.applicantArraySkills.map(async (skillId) => {
            try {
              const skillResponse = await axios.get(
                `${api}api/JobSkill/${skillId}`
              );
              return {
                value: skillId,
                label: skillResponse.data.name,
              };
            } catch (error) {
              console.error(`Error fetching skill ${skillId}:`, error);
              return null;
            }
          });

          const resolvedSkills = (await Promise.all(skillPromises)).filter(Boolean);
          setSelectedSkills(resolvedSkills);
        }

      } catch (err) {
        console.error("Error initializing data:", err);
        toastr.error("Error", "Failed to initialize data");
      }
    };

    initializeData();
  }, [jobSkills, api, dispatch, parsed]);

  // Load skills by job title
  useEffect(() => {
    const fetchSkillsByJobTitle = async () => {
      setIsSkillsLoading(true);
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
      } finally {
        setIsSkillsLoading(false);
      }
    };

    fetchSkillsByJobTitle();
  }, [api, role, setSkillsList]);

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

  const handleSkillChange = React.useCallback((newValue) => {
    setSelectedSkills(newValue || []);
  }, []);

  const handleChangeDistance = React.useCallback((value) => {
    setDistance(value.value);
  }, []);

  const onSaveApplicant = async () => {
    setLoading(true);
    try {
      const filteredSkills = selectedSkills.map((skill) => skill.value);
      const filteredRole = role.map((r) => r.value);

      const body = {
        ...parsed,
        applicantArraySkills: filteredSkills,
        postalCodeSearchZone: distance,
        missionArrayDesiredJobTitles: filteredRole,
      };

      await axios.put(`${api}api/Applicant`, body);

      toastr.success(
        intl.formatMessage({ id: "TITLE.INTERIMAIRE.CREATION" }),
        intl.formatMessage({ id: "MESSAGE.INTERIMAIRE.EDIT.SUCCESS" })
      );

      if (parsed.id) {
        getSelectedApplicantById(parsed.id, dispatch);
      }
    } catch (err) {
      const message = err.response?.data?.message || "An error occurred";
      toastr.error(intl.formatMessage({ id: "ERROR" }), message);
    } finally {
      setLoading(false);
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "transparent",
      margin: "-9px",
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      borderColor: state.isFocused ? "#0d6efd" : "transparent",
      boxShadow: state.isFocused ? "0 0 0 1px #0d6efd" : null,
      "&:hover": {
        borderColor: state.isFocused ? "#0d6efd" : "transparent",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 0,
      marginTop: 0,
      zIndex: 1000, // Assure que le menu est au-dessus des autres éléments
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: "200px", // Limite la hauteur du menu déroulant
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#e9ecef"
        : null,
      color: state.isSelected ? "white" : "black",
      padding: "8px 12px",
    }),
  };

  return (
    <div className="container py-8 px-8">
      <div className="row">
        <div className="col-12 mb-5">
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4"
              onClick={onSaveApplicant}
              disabled={loading}
            >
              <span>
                <FormattedMessage id="BUTTON.SAVE" />
              </span>
              {loading && <span className="ml-3 spinner spinner-white" />}
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

        <div className="col-12 mb-4">
          <div className="form-group">
            <label>
              <FormattedMessage id="MODEL.COMPETENCES" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-list-alt text-primary" />
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
                noOptionsMessage={() => "Aucune compétence disponible"}
                isSearchable={true}
              />
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="form-group">
            <label>
              <FormattedMessage id="MATCHING.TABLE.AREA" />
            </label>
            <div className="input-group">
              <InputRange
                formatLabel={(value) => `${value}km`}
                step={10}
                maxValue={1000}
                minValue={0}
                value={distance}
                onChange={(value) => handleChangeDistance({ value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(Matching);
