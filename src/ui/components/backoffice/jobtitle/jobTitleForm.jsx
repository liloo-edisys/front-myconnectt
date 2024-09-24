import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector, shallowEqual } from "react-redux";
import { toastr } from "react-redux-toastr";
import Select from "react-select";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";

function JobskillForm(props) {
  const { onHide, getData } = props;
  const { id } = useParams();
  const intl = useIntl();
  const api = process.env.REACT_APP_WEBAPI_URL;

  const { user } = useSelector(
    state => ({
      user: state.user.user
    }),
    shallowEqual
  );

  const [jobTitle, setJobTitle] = useState({
    name: "",
    arrayActivityDomainIDs: []
  });
  const [jobTitles, setJobTitles] = useState([]);
  const [jobtitlesIsLoaded, setJobTitlesIsLoaded] = useState(false);
  const [role, setRole] = useState([]);
  const [errorName, setErrorName] = useState(false);
  const [errorActivityDomain, setErrorActivityDomain] = useState(false);
  const [errorAnaelId, setErrorAnaelId] = useState(false);

  useEffect(() => {
    let URL = `${process.env.REACT_APP_WEBAPI_URL}api/ActivityDomain`;
    axios.get(URL).then(res => {
      setJobTitles(res.data);
      setJobTitlesIsLoaded(true);
    });
    if (id && jobtitlesIsLoaded) {
      getJobTitle();
    }
  }, [id, jobtitlesIsLoaded]);

  const getJobTitle = jobTitlesList => {
    const SEARCH_JOBTITLES_API = api + "api/JobTitle/" + id;
    axios
      .get(SEARCH_JOBTITLES_API)
      .then(res => {
        const { arrayActivityDomainIDs } = res.data;
        let newRoleArray = [];
        for (let i = 0; i < arrayActivityDomainIDs.length; i++) {
          const filteredRole = jobTitles.filter(
            item => item.id === arrayActivityDomainIDs[i]
          )[0];
          newRoleArray.push({
            value: filteredRole?.id,
            label: filteredRole?.name
          });
        }
        setRole(newRoleArray);
        setJobTitle({
          ...res.data,
          arrayActivityDomainIDs: res.data.arrayActivityDomainIDs
            ? res.data.arrayActivityDomainIDs
            : 0
        });
      })
      .catch(err => console.log(err));
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

  const onChangeJobTitleName = e => {
    setErrorName(false);
    setJobTitle({
      ...jobTitle,
      name: e.target.value
    });
  };

  const onChangeJobTitleCode = e => {
    setErrorAnaelId(false);
    setJobTitle({
      ...jobTitle,
      code: e.target.value
    });
  };

  const createOption = (label, value) => ({
    label,
    value
  });

  let formatedRole = jobTitles.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });

  const handleChangeRole = newValue => {
    setErrorActivityDomain(false);
    let formikEquipment = [];
    let newArray = !isNullOrEmpty(role) ? [...role] : [];
    let difference =
      newValue !== null &&
      role !== null &&
      role.filter(x => !newValue.includes(x));
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
          jobTitle.arrayActivityDomainIDs !== null &&
          !jobTitle.arrayActivityDomainIDs.includes(value) &&
          formikEquipment.push(value.value)
        );
      });

    setRole(newArray);
    setJobTitle({
      ...jobTitle,
      arrayActivityDomainIDs: formikEquipment
    });
  };

  const onUpdateJobskill = () => {
    if (jobTitle.arrayActivityDomainIDs.length === 0 || !jobTitle.name) {
      if (jobTitle.arrayActivityDomainIDs.length === 0) {
        setErrorActivityDomain(true);
      }
      if (!jobTitle.name) {
        setErrorName(true);
      }
      return;
    }
    const UPDATE_JOBTITLES_API = api + "api/JobTitle";
    const body = jobTitle;
    axios
      .put(UPDATE_JOBTITLES_API, body)
      .then(res => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "La compétence a été mise à jour avec succèes."
        );
      })
      .catch(err => console.log(err));
  };

  const onCreateJobskill = () => {
    if (
      jobTitle.arrayActivityDomainIDs.length === 0 ||
      !jobTitle.name ||
      !jobTitle.code
    ) {
      if (jobTitle.arrayActivityDomainIDs.length === 0) {
        setErrorActivityDomain(true);
      }
      if (!jobTitle.name) {
        setErrorName(true);
      }
      if (!jobTitle.code) {
        setErrorAnaelId(true);
      }
      return;
    }
    const jobTitleWithoutSpace = jobTitle.code.replaceAll(" ", "");
    if (jobTitleWithoutSpace === "") {
      setErrorAnaelId(true);
      setJobTitle({
        ...jobTitle,
        code: ""
      });
      return;
    }
    const UPDATE_JOBTITLES_API = api + "api/JobTitle";
    const body = {
      ...jobTitle,
      tenantID: user.tenantID,
      arrayActivityDomainIDs: jobTitle.arrayActivityDomainIDs
    };
    axios
      .post(UPDATE_JOBTITLES_API, body)
      .then(res => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "La nouvelle compétence a été ajoutée avec succèes."
        );
      })
      .catch(err => console.log(err));
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
              id={id ? "EDIT.NEW.JOBTITLE" : "ADD.NEW.JOBTITLE"}
            />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.JOBTITLE" : "ADD.NEW.JOBTITLE"}
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
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body>
        <div>
          <label>
            <FormattedMessage id="TEXT.JOBTITLE.NAME" />
          </label>
          <input
            name="city"
            className="form-control"
            type="text"
            value={jobTitle ? jobTitle.name : ""}
            onChange={onChangeJobTitleName}
          />
        </div>
        {errorName && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              Veuillez renseigner le nom de la qualification
            </div>
          </div>
        )}
        <div className="mt-10">
          <label>
            <FormattedMessage id="MATCHING.ACTIVITY.DOMAINS" />
          </label>
          <Select
            isMulti
            onChange={e => handleChangeRole(e)}
            options={formatedRole}
            styles={customStyles}
            value={role}
            className="col-lg-12 form-control"
          ></Select>
          {errorActivityDomain && (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                Veuillez renseigner au moins un domaine d'activité
              </div>
            </div>
          )}
        </div>
        <div className="mt-10">
          <label>
            <FormattedMessage id="TEXT.ANAEL.ID" />
          </label>
          <input
            name="city"
            className="form-control"
            type="text"
            value={jobTitle ? jobTitle.code : ""}
            disabled={id}
            onChange={onChangeJobTitleCode}
          />
          {errorAnaelId && (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                Veuillez renseigner le matricule Anael
              </div>
            </div>
          )}
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
