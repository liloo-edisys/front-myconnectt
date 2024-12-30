import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector, shallowEqual } from "react-redux";
import { toastr } from "react-redux-toastr";
import { FormattedMessage, useIntl } from "react-intl";
import { jobSkillType } from "./jobSkillType.js";
import Select from "react-select";
import JobTitleSelect from "../jobtitle/jobTitleSelect.js";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";

function JobskillForm(props) {
  const { onHide, getData } = props;
  const { id } = useParams();
  const intl = useIntl();
  const api = process.env.REACT_APP_WEBAPI_URL;

  const { user } = useSelector(
    (state) => ({
      user: state.user.user,
    }),
    shallowEqual
  );

  const [competence, setCompetence] = useState({
    name: "",
    skillType: null,
    activityDomains: [],
  });

  const [activityDomains, setActivityDomains] = useState([]);
  const [domainsIsLoaded, setDomainsIsLoaded] = useState(false);
  const [role, setRole] = useState([]);
  const [errorName, setErrorName] = useState(false);
  const [errorActivityDomain, setErrorActivityDomain] = useState(false);

  useEffect(() => {
    const fetchActivityDomains = async () => {
      try {
        const URL = `${api}api/ActivityDomain`;
        const response = await axios.get(URL);
        setActivityDomains(response.data);
        setDomainsIsLoaded(true);
      } catch (err) {
        console.error("Erreur lors du chargement des domaines:", err);
        toastr.error("Erreur", "Impossible de charger les domaines d'activité");
      }
    };

    fetchActivityDomains();
  }, [api]);

  useEffect(() => {
    const fetchCompetenceData = async () => {
      if (id && domainsIsLoaded) {
        try {
          const SEARCH_JOBSKILLS_API = `${api}api/JobSkill/${id}`;
          const response = await axios.get(SEARCH_JOBSKILLS_API);

          // Formatage des domaines d'activité pour le Select
          const newRoleArray = [];
          const domains = response.data.activityDomains || [];

          // Création du tableau pour le Select à partir des activityDomains
          domains.forEach((domain) => {
            if (domain) {
              newRoleArray.push({
                value: domain.id,
                label: domain.name,
              });
            }
          });

          setRole(newRoleArray);

          // Extraction des IDs des domaines pour le state
          const domainIds = domains.map((domain) => domain.id);

          setCompetence({
            name: response.data.name,
            skillType: response.data.skillTypeID,
            activityDomains: domainIds,
          });
        } catch (err) {
          console.error("Erreur lors du chargement de la compétence:", err);
          toastr.error(
            "Erreur",
            "Impossible de charger les données de la compétence"
          );
        }
      }
    };

    fetchCompetenceData();
  }, [id, domainsIsLoaded, api, activityDomains]);

  const onChangeCompetenceName = (e) => {
    setErrorName(false);
    setCompetence({
      ...competence,
      name: e.target.value,
    });
  };

  const handleChangeRole = (newValue) => {
    setErrorActivityDomain(false);
    const selectedDomains = newValue ? newValue.map((item) => item.value) : [];

    setRole(newValue || []);
    setCompetence({
      ...competence,
      activityDomains: selectedDomains,
    });
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
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
  };

  const onUpdateJobskill = async () => {
    if (competence.activityDomains.length === 0 || !competence.name) {
      if (competence.activityDomains.length === 0) {
        setErrorActivityDomain(true);
      }
      if (!competence.name) {
        setErrorName(true);
      }
      return;
    }

    try {
      const UPDATE_JOBSKILLS_API = `${api}api/JobSkill`;
      const body = {
        id: parseInt(id),
        name: competence.name,
        tenantID: user.tenantID,
        activityDomains: competence.activityDomains, // change to jobTitle
        skillType: competence.skillType ? parseInt(competence.skillType) : null,
      };

      await axios.put(UPDATE_JOBSKILLS_API, body);
      getData();
      onHide();
      toastr.success("Succès", "La compétence a été mise à jour avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      toastr.error(
        "Erreur",
        "Une erreur est survenue lors de la mise à jour de la compétence"
      );
    }
  };

  const onCreateJobskill = async () => {
    if (competence.activityDomains.length === 0 || !competence.name) {
      if (competence.activityDomains.length === 0) {
        setErrorActivityDomain(true);
      }
      if (!competence.name) {
        setErrorName(true);
      }
      return;
    }

    try {
      const CREATE_JOBSKILLS_API = `${api}api/JobSkill`;
      const body = {
        name: competence.name,
        tenantID: user.tenantID,
        activityDomains: competence.activityDomains,
        skillType: competence.skillType ? parseInt(competence.skillType) : null,
      };
      // await axios.post(CREATE_JOBSKILLS_API, body);
      console.log("body ----------> " + JSON.stringify(body));

      getData();
      onHide();
      toastr.success(
        "Succès",
        "La nouvelle compétence a été ajoutée avec succès."
      );
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      toastr.error(
        "Erreur",
        "Une erreur est survenue lors de la création de la compétence"
      );
    }
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.JOBSKILL" : "ADD.NEW.JOBSKILL"}
            />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.JOBSKILL" : "ADD.NEW.JOBSKILL"}
            />
          </p>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={onHide}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body>
        <div>
          <label>
            <FormattedMessage id="TEXT.JOBSKILL.NAME" />
          </label>
          <input
            name="name"
            className="form-control"
            type="text"
            value={competence.name}
            onChange={onChangeCompetenceName}
          />
        </div>
        {errorName && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              Veuillez renseigner le nom de la compétence
            </div>
          </div>
        )}
        <div className="mt-10">
          <JobTitleSelect
            value={role}
            onChange={handleChangeRole}
            styles={customStyles}
            className="col-lg-12 form-control"
          />
          {errorActivityDomain && (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                Veuillez renseigner au moins un domaine d'activité
              </div>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Type de compétence</label>
          <select
            name="skillType"
            className="form-control"
            value={competence.skillType || ""}
            onChange={(e) =>
              setCompetence({
                ...competence,
                skillType: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          >
            <option value="">
              {intl.formatMessage({
                id: "TEXT.TYPE",
              })}
            </option>
            {jobSkillType.map((type) => (
              <option key={type.id} value={type.id}>
                {type.value}
              </option>
            ))}
          </select>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold mr-2"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          {id ? (
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold"
              onClick={onUpdateJobskill}
            >
              <FormattedMessage id="BUTTON.EDIT" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold"
              onClick={onCreateJobskill}
            >
              <FormattedMessage id="TEXT.CREATE" />
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default JobskillForm;
