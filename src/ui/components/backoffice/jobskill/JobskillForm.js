import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector, shallowEqual } from "react-redux";
import { toastr } from "react-redux-toastr";
import { FormattedMessage, useIntl } from "react-intl";
import { jobSkillType } from "./jobSkillType.js";
import Select from "react-select";
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
    arrayActivityDomainIDs: [],
  });

  const [activityDomains, setActivityDomains] = useState([]);
  const [domainsIsLoaded, setDomainsIsLoaded] = useState(false);
  const [role, setRole] = useState([]);
  const [errorName, setErrorName] = useState(false);
  const [errorActivityDomain, setErrorActivityDomain] = useState(false);

  useEffect(() => {
    let URL = `${api}api/ActivityDomain`;
    axios.get(URL).then((res) => {
      setActivityDomains(res.data);
      setDomainsIsLoaded(true);
    });
    if (id && domainsIsLoaded) {
      getCompetence();
    }
  }, [id, domainsIsLoaded]);

  const getCompetence = () => {
    const SEARCH_JOBSKILLS_API = api + "api/JobSkill/" + id;
    axios
      .get(SEARCH_JOBSKILLS_API)
      .then((res) => {
        const { arrayActivityDomainIDs } = res.data;
        let newRoleArray = [];
        for (let i = 0; i < arrayActivityDomainIDs.length; i++) {
          const filteredRole = activityDomains.filter(
            (item) => item.id === arrayActivityDomainIDs[i]
          )[0];
          newRoleArray.push({
            value: filteredRole?.id,
            label: filteredRole?.name,
          });
        }
        setRole(newRoleArray);
        setCompetence({
          ...res.data,
          arrayActivityDomainIDs: res.data.arrayActivityDomainIDs
            ? res.data.arrayActivityDomainIDs
            : [],
        });
      })
      .catch((err) => console.log(err));
  };

  const onChangeCompetenceName = (e) => {
    setErrorName(false);
    setCompetence({
      ...competence,
      name: e.target.value,
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

  const createOption = (label, value) => ({
    label,
    value,
  });

  let formatedRole = activityDomains.map((domain) => {
    return domain && createOption(domain.name, domain.id);
  });

  const handleChangeRole = (newValue) => {
    setErrorActivityDomain(false);
    let formikDomains = [];
    let newArray = !isNullOrEmpty(role) ? [...role] : [];
    let difference =
      newValue !== null &&
      role !== null &&
      role.filter((x) => !newValue.includes(x));

    if (newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = role.filter((x) => newValue.includes(x));
      newArray = [];
      filteredArray.map((tag) =>
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
      newValue.map((value) => {
        return (
          competence.arrayActivityDomainIDs !== null &&
          !competence.arrayActivityDomainIDs.includes(value) &&
          formikDomains.push(value.value)
        );
      });

    setRole(newArray);
    setCompetence({
      ...competence,
      arrayActivityDomainIDs: formikDomains,
    });
  };

  const onUpdateJobskill = () => {
    if (competence.arrayActivityDomainIDs.length === 0 || !competence.name) {
      if (competence.arrayActivityDomainIDs.length === 0) {
        setErrorActivityDomain(true);
      }
      if (!competence.name) {
        setErrorName(true);
      }
      return;
    }

    const UPDATE_JOBSKILLS_API = api + "api/JobSkill";
    const body = {
      ...competence,
      arrayActivityDomainIDs: competence.arrayActivityDomainIDs,
    };
    axios
      .put(UPDATE_JOBSKILLS_API, body)
      .then((res) => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "La compétence a été mise à jour avec succès."
        );
      })
      .catch((err) => console.log(err));
  };

  const onCreateJobskill = () => {
    if (competence.arrayActivityDomainIDs.length === 0 || !competence.name) {
      if (competence.arrayActivityDomainIDs.length === 0) {
        setErrorActivityDomain(true);
      }
      if (!competence.name) {
        setErrorName(true);
      }
      return;
    }

    const CREATE_JOBSKILLS_API = api + "api/JobSkill";
    const body = {
      ...competence,
      tenantID: user.tenantID,
      arrayActivityDomainIDs: competence.arrayActivityDomainIDs,
    };

    axios
      .post(CREATE_JOBSKILLS_API, body)
      .then((res) => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "La nouvelle compétence a été ajoutée avec succès."
        );
      })
      .catch((err) => console.log(err));
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
          <label>
            <FormattedMessage id="MATCHING.ACTIVITY.DOMAINS" />
          </label>
          <Select
            isMulti
            onChange={(e) => handleChangeRole(e)}
            options={formatedRole}
            styles={customStyles}
            value={role}
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
                skillType: e.target.value ? Number(e.target.value) : null,
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
