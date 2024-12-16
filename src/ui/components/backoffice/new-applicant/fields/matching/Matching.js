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
import { getJobSkillsByActivityDomain } from "actions/shared/ListsActions";
import InputRange from "react-input-range";
import axios from "axios";
import { toastr } from "react-redux-toastr";
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
  const [activityDomains, setActivityDomains] = useState();
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
      const formikRoles = props.formik?.values?.arrayActivityDomains
        ? [...props.formik.values.arrayActivityDomains]
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
            props.formik?.values?.arrayActivityDomains &&
            !props.formik.values.arrayActivityDomains.includes(value.value)
          ) {
            formikRoles.push(value.value);
          }
        });
      }

      if (
        props.formik?.values?.arrayActivityDomains &&
        formikRoles !== props.formik.values.arrayActivityDomains
      ) {
        props.formik.setFieldValue("arrayActivityDomains", formikRoles);
      }

      setRole(newArray);
    },
    [jobTitles, props.formik]
  );

  const formatSkills = React.useCallback(
    (data) => {
      if (!jobSkills.length) return null;

      const newArray = [];
      if (!isNullOrEmpty(data)) {
        data.forEach((eq) => {
          const value = jobSkills.find((l) => l.id === eq);
          if (value) {
            newArray.push({
              label: value.name,
              value: value.value || value.id,
            });
          }
        });
      }

      if (skills === null) {
        setSkills(newArray);
      }
      return newArray;
    },
    [jobSkills, skills]
  );

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (isNullOrEmpty(jobSkills)) {
          dispatch(getJobSkillsByActivityDomain.request());
        }

        dispatch(getMissionEquipment.request());

        if (parsed?.postalCodeSearchZone) {
          setDistance(parsed.postalCodeSearchZone);
        }

        if (jobTitles.length && role === null && parsed?.arrayActivityDomains) {
          formatRole(parsed.arrayActivityDomains);
        }

        if (
          jobSkills.length &&
          skills === null &&
          parsed?.applicantArraySkills
        ) {
          formatSkills(parsed.applicantArraySkills);
        }

        if (isNullOrEmpty(jobTitles)) {
          const res = await axios.get(`${api}api/ActivityDomain`);
          const activityDomainsList = res.data;

          if (parsed.arrayActivityDomains) {
            const selectedActivitiesArray = parsed.arrayActivityDomains
              .map((activityId) => {
                const domain = activityDomainsList.find(
                  (d) => d.id === activityId
                );
                return domain
                  ? {
                      value: domain.id,
                      label: domain.name,
                    }
                  : null;
              })
              .filter(Boolean);

            setRole(selectedActivitiesArray);
          }

          if (parsed.missionArrayEquipments) {
            setSelectedEquipment(parsed.missionArrayEquipments);
          }

          setJobTitles(activityDomainsList);

          if (parsed.applicantArraySkills) {
            setSelectedSkills(parsed.applicantArraySkills);
          }
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        toastr.error("Error", "Failed to initialize data");
      }
    };

    initializeData();
  }, [jobSkills, api, dispatch, parsed, formatRole, formatSkills]);

  // Load applicant skills
  useEffect(() => {
    const fetchApplicantSkills = async () => {
      if (!parsed.applicantArraySkills?.length) return;

      try {
        setIsSkillsLoading(true);
        // Récupérer les compétences une par une
        const promises = parsed.applicantArraySkills.map((skillId) =>
          axios.get(`${api}api/JobSkill/${skillId}`)
        );

        const responses = await Promise.all(promises);

        // S'assurer que nous avons les bonnes données
        const formattedSkills = responses
          .filter((response) => response.data) // Filtrer les réponses nulles
          .map((response) => ({
            value: response.data.id,
            label: response.data.name || response.data.title, // Essayer d'abord name, puis title
          }));

        // Ne mettre à jour que si nous avons des compétences valides
        if (formattedSkills.length > 0) {
          setSelectedSkills(formattedSkills);
        }
      } catch (err) {
        console.error("Error loading skills:", err);
        toastr.error("Error", "Unable to load skills");
      } finally {
        setIsSkillsLoading(false);
      }
    };

    fetchApplicantSkills();
  }, [api, parsed.applicantArraySkills]);

  // Load skills by activity domain
  useEffect(() => {
    const fetchSkillsByActivityDomain = async () => {
      if (!role.length) {
        setSkillsList([]); // Réinitialiser la liste si aucun rôle n'est sélectionné
        return;
      }

      try {
        const domainIds = role.map((item) => item.value);
        const params = new URLSearchParams();
        domainIds.forEach((id) => params.append("ActivityDomain", id));

        const response = await axios.get(
          `${api}api/JobSkill/GetByActivityDomain?${params.toString()}`
        );

        // S'assurer que chaque compétence a un name et un id valide
        const formattedSkills = response.data
          .filter((skill) => skill && skill.name && skill.id) // Filtrer les données invalides
          .map((skill) => ({
            label: skill.name,
            value: skill.id,
          }));

        setSkillsList(formattedSkills);
      } catch (err) {
        console.error("Error loading activity domains:", err);
        toastr.error("Error", "Unable to load activity domains");
      }
    };

    fetchSkillsByActivityDomain();
  }, [api, role]);

  const handleChangeRole = React.useCallback((newValue, actionMeta) => {
    if (newValue && newValue.length > 8) {
      // Limiter à 7 items en gardant seulement les 7 premiers
      setRole(newValue.slice(0, 7));
      // Optionnellement, afficher un message à l'utilisateur
      toastr.warning(
        intl.formatMessage({ id: "WARNING" }),
        "Maximum 7 domains can be selected"
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
        arrayActivityDomains: filteredRole,
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
    <div className="wizard-body py-8 px-8">
      <div className="row mx-10-responsive">
        <div className="pb-5 width-full">
          <div className="border-bottom mb-5 pb-3 align-right">
            <div className="col-sm-12 col-xl-12">
              <button
                type="button"
                className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
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
                      <i className="icon-xl far fa-list-alt text-primary" />
                    </span>
                  </div>
                  <Select
                    isMulti
                    value={role}
                    onChange={handleChangeRole}
                    options={formatedRole}
                    styles={customStyles}
                    className="col-lg-12 form-control"
                    isOptionDisabled={() => role.length >= 7} // Désactive les options quand la limite est atteinte
                  />
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
                      <i className="icon-xl far fa-list-alt text-primary" />
                    </span>
                  </div>
                  <Select
                    isMulti
                    value={selectedSkills}
                    onChange={handleSkillChange}
                    options={skillsList}
                    styles={customStyles}
                    className="col-lg-12 form-control"
                    placeholder="Sélectionnez des compétences"
                    noOptionsMessage={() => "Aucune compétence disponible"}
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
      </div>
    </div>
  );
}

export default injectIntl(Matching);
