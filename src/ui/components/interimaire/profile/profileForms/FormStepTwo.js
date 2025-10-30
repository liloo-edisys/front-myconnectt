/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import { Field } from "formik";
import _ from "lodash";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import moment from "moment";
import { getTitlesTypes } from "../../../../../business/actions/shared/ListsActions";
import { updateApplicant } from "actions/client/ApplicantsActions";
import Avatar from "react-avatar";
import ReactDatePicker from "react-datepicker";
import { DeleteProfileDialog } from "../profileModals/DeleteProfileDialog";
import fr from "date-fns/locale/fr";
import { toastr } from "react-redux-toastr";
import { getNationalitiesList } from "../../../../../business/actions/interimaire/InterimairesActions";
import axios from "axios";
import { use } from "react";

const EnumSexe = {
  Men: 0,
  Women: 1
};

function FormStepTwo(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const [gender, setGender] = useLocalStorage("gender", null);
  const {
    titleTypes,
    parsed,
    nationalitiesList,
    updateInterimaireIdentityLoading
  } = useSelector(
    state => ({
      user: state.user.user,
      titleTypes: state.lists.titleTypes,
      parsed: state.interimairesReducerData.interimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading,
      nationalitiesList: state.interimairesReducerData.nationalitiesList
    }),
    shallowEqual
  );
  useEffect(() => {
    dispatch(getTitlesTypes.request());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTitlesTypes.request());
  }, [dispatch]);

  const saveArrayActivityDomains = newMissionArrayDesiredJobTitles => {
    localStorage.setItem(
      "missionArrayDesiredJobTitles",
      JSON.stringify(newMissionArrayDesiredJobTitles)
    );
  };

  saveArrayActivityDomains(parsed.missionArrayDesiredJobTitles || []);

  useEffect(() => {
    const saveArrayActivityDomains = newMissionArrayDesiredJobTitles => {
      localStorage.setItem(
        "missionArrayDesiredJobTitles",
        JSON.stringify(newMissionArrayDesiredJobTitles)
      );
    };
    saveArrayActivityDomains();
    console.log("parsed value ------->", parsed.missionArrayDesiredJobTitles);
  }, [parsed]);

  const [experience, setExperience] = useLocalStorage("experience", null);
  const [photo, setPhoto] = useLocalStorage("photo", null);
  const [previewUrl, setPreviewUrl] = useLocalStorage(
    "previewUrl",
    "https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true"
  );
  const [selectedGender, setSelectedGender] = useLocalStorage(
    "selectedGender",
    null // Initialisé à null au lieu de 0
  );
  const [firstName, setFirstName] = useLocalStorage("firstName", "");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false);

  const [lastName, setLastName] = useLocalStorage("lastName", "");
  const [hasSms, setHasSms] = useLocalStorage("hasSms", false);

  const [postalCode, setPostalCode] = useLocalStorage("postalCode", "");
  const [address, setAddress] = useLocalStorage("address", "");
  const [additionalAddress, setAdditionalAddress] = useLocalStorage(
    "additionalAddress",
    ""
  );
  const [nationality, setNationality] = useState(null);
  const [mobilePhoneNumber, setMobilePhoneNumber] = useLocalStorage(
    "mobilePhoneNumber",
    ""
  );
  const [filteredMobilePhoneNumber, setFilteredMobilePhoneNumner] = useState(
    ""
  );
  const [email, setEmail] = useLocalStorage("email", "");
  const [maidenName, setMaidenName] = useLocalStorage("maidenName", "");
  const [city, setCity] = useLocalStorage("city", "");
  const [birthDate, setBirthDate] = useState(null);
  const [birthPlace, setBirthPlace] = useState(null);

  // États pour la gestion des suggestions d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState("");
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);

  useEffect(() => {
    !isNullOrEmpty(mobilePhoneNumber) &&
      props.formik.setFieldTouched("mobilePhoneNumber", true);
    !isNullOrEmpty(parsed) &&
      props.formik &&
      !isNullOrEmpty(parsed.firstname) &&
      handleChangeFirstName(parsed.firstname);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.lastname) &&
      handleChangeLastName(parsed.lastname);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed) &&
      handleChangeBirthDate(parsed.birthDate);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.birthDate) &&
      handleChangeBirthDate(parsed.birthDate);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.birthPlace) &&
      handleChangeBirthPlace(parsed.birthPlace);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.maidenName) &&
      handleChangeBirthName(parsed.maidenName);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.postalCode) &&
      handleChangePostalCode(parsed.postalCode);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.address) &&
      handleChangeAddress(parsed.address);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.additionalAddress) &&
      handleChangeAdditionalAddress(parsed.additionalAddress);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.mobilePhoneNumber) &&
      handleChangeMobilePhone(parsed.mobilePhoneNumber);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.email) &&
      handleChangeEmail(parsed.email);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.city) &&
      handleChangeCity(parsed.city);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.hasSms) &&
      setHasSms(parsed.hasSms);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.titleTypeID) &&
      handleChangeSelectedGender(parsed.titleTypeID);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.sexe) &&
      handleChangeGender(parsed.sexe);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.applicantPicture) &&
      setPreviewUrl(
        "data:image/" +
          parsed.applicantPicture.filename.split(".")[1] +
          ";base64," +
          parsed.applicantPicture.base64
      );
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.nationalityID) &&
      handleChangeNationality(parsed.nationalityID);
    !isNullOrEmpty(parsed) &&
      !isNullOrEmpty(parsed.position) &&
      setPosition(parsed.position);
    if (nationalitiesList.length === 0) {
      getNationalitiesList(dispatch);
    }
  }, [parsed]);

  const handleChangeFirstName = e => {
    setFirstName(e);
    props.formik.setFieldTouched("firstname", true);
    props.formik.setFieldValue("firstname", e);
  };

  const handleChangeBirthDate = e => {
    setBirthDate(e);
    props.formik.setFieldTouched("birthDate", true);
    props.formik.setFieldValue("birthDate", e);
  };

  const handleChangeBirthPlace = e => {
    e !== null ? setBirthPlace(e) : setBirthPlace(null);
    props.formik.setFieldTouched("birthPlace", true);
    props.formik.setFieldValue("birthPlace", e);
  };

  const handleChangeLastName = e => {
    setLastName(e);
    props.formik.setFieldTouched("lastname", true);
    props.formik.setFieldValue("lastname", e);
  };

  const handleChangeBirthName = e => {
    setMaidenName(e);
    props.formik.setFieldValue("maidenName", e);
  };

  const handleChangeEmail = e => {
    setEmail(e);
    props.formik.setFieldValue("email", e);
  };

  const handleChangeMobilePhone = e => {
    setMobilePhoneNumber(e.replace(/\s/g, ""));
    props.formik.setFieldTouched("mobilePhoneNumber", true);
    props.formik.setFieldValue("mobilePhoneNumber", e.replace(/\s/g, ""));
  };

  // Fonction pour utiliser la géolocalisation de l'utilisateur
  const useMyLocation = async () => {
    setIsLoadingGeolocation(true);
    try {
      const response = await axios.post(
        "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Map/MyLocalization",
        "",
        {
          headers: {
            accept: "*/*"
          }
        }
      );

      const {
        freeformAddress,
        postalCode: locationPostalCode,
        localName,
        position
      } = response.data;

      // Mettre à jour les champs
      setAddress(freeformAddress);
      if (locationPostalCode) setPostalCode(locationPostalCode);
      if (localName) setCity(localName);
      setPosition(position);

      // Mettre à jour Formik
      props.formik.setFieldValue("address", freeformAddress);
      if (locationPostalCode)
        props.formik.setFieldValue("postalCode", locationPostalCode);
      if (localName) props.formik.setFieldValue("city", localName);
      props.formik.setFieldValue("position", position);

      toastr.success("Localisation récupérée avec succès");
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la localisation:",
        error
      );
      toastr.error("Erreur lors de la récupération de votre localisation");
    } finally {
      setIsLoadingGeolocation(false);
    }
  };

  // Fonction pour rechercher des adresses
  const searchAddresses = async query => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingAddresses(true);
    try {
      const response = await axios.get(
        `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Map/search?query=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            accept: "text/plain"
          }
        }
      );

      setAddressSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Fonction pour gérer le changement d'adresse
  const handleChangeAddress = e => {
    const value = typeof e === "string" ? e : e.target.value;
    setAddress(value);
    props.formik.setFieldValue("address", value);

    if (typeof e !== "string") {
      searchAddresses(value);
    }
  };

  // Fonction pour gérer le changement d'adresse additionnelle (simple champ texte)
  const handleChangeAdditionalAddress = e => {
    const value = typeof e === "string" ? e : e.target.value;
    setAdditionalAddress(value);
    props.formik.setFieldValue("additionalAddress", value);
  };

  // Fonction pour sélectionner une adresse dans les suggestions
  const handleAddressSuggestionSelect = suggestion => {
    // Extraire les informations pertinentes
    const {
      freeformAddress,
      postalCode: suggestionPostalCode,
      localName,
      position
    } = suggestion;

    // Mettre à jour les champs
    setAddress(freeformAddress);
    setPostalCode(suggestionPostalCode || "");
    setCity(localName || "");
    setPosition(position);

    // Mettre à jour Formik
    props.formik.setFieldValue("address", freeformAddress);
    if (suggestionPostalCode)
      props.formik.setFieldValue("postalCode", suggestionPostalCode);
    if (localName) props.formik.setFieldValue("city", localName);
    props.formik.setFieldValue("position", position);

    // Fermer les suggestions
    setShowSuggestions(false);
  };

  const handleChangeGender = e => {
    setGender(parseInt(e));
    props.formik.setFieldValue("sexe", parseInt(e));
    props.formik.setFieldTouched("sexe", true);
  };

  const handleChangePostalCode = e => {
    setPostalCode(e);
    props.formik.setFieldValue("postalCode", e);
    props.formik.setFieldTouched("postalCode");
  };

  useEffect(() => {
    props.formik.setFieldTouched("postalCode");
  }, [postalCode]);

  useEffect(() => {
    if (mobilePhoneNumber) {
      let joy = mobilePhoneNumber.match(/.{1,2}/g);
      setFilteredMobilePhoneNumner(joy.join(" "));
    } else {
      setFilteredMobilePhoneNumner(mobilePhoneNumber);
    }
  }, [mobilePhoneNumber]);

  const handleChangeCity = e => {
    setCity(e);
    props.formik.setFieldValue("city", e);
  };

  const handleChangeSelectedGender = e => {
    // Si la valeur est "0" ou une chaîne vide, définir comme null
    const value = e === "0" || e === "" ? null : parseInt(e);
    setSelectedGender(value);
    props.formik.setFieldValue("titleTypeID", value);
  };

  const handleChangeNationality = e => {
    setNationality(parseInt(e));
    props.formik.setFieldValue("nationalityID", parseInt(e));
  };

  const { errors, touched } = useFormikContext();

  const handleSave = () => {
    if (
      !errors.firstname &&
      !errors.lastname &&
      !errors.postalCode &&
      !errors.city &&
      !errors.address &&
      !errors.titleTypeID &&
      !errors.nationality &&
      !errors.mobilePhoneNumber
    ) {
      const formikValues = { ...props.formik.values };
      if (formikValues.titleTypeID === 0) {
        formikValues.titleTypeID = null;
      }
      const body = {
        ...props.formik.values,
        anaelID: parsed.anaelID,
        position: position,
        missionArrayDesiredJobTitles: parsed.missionArrayDesiredJobTitles
      };
      dispatch(updateApplicant.request(body));
    } else {
      toastr.error(
        "Veuillez remplir correctement tous les champs obligatoires."
      );
    }
  };

  const photoUpload = e => {
    e.preventDefault();
    let stringBase64;
    const reader = new FileReader();
    const file = e.target.files[0];
    const fileName = e.target.files[0].name;
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setPhoto(file);
      stringBase64 = reader.result.split(",")[1];
      let appPicture = {
        fileName: fileName,
        base64: stringBase64
      };
      props.formik.setFieldValue("applicantPicture", appPicture);
    };

    reader.readAsDataURL(file);
  };

  const ImgUpload = ({ onChange, src }) => (
    <label htmlFor="photo-upload" className="custom-file-upload fas">
      <div className="img-wrap img-upload">
        <Avatar className="symbol-label" color="#3699FF" src={src} />
      </div>
      <input
        accept="image/*"
        id="photo-upload"
        type="file"
        onChange={onChange}
      />
    </label>
  );

  const Edit = ({ onSubmit, children }) => (
    <div className="card">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  );

  const hideDeleteModal = () => {
    setToggleDeleteModal(false);
  };

  return (
    <>
      <div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px display_top_menu_profile">
          <MissionWizzardHeader props={props} />
          <DeleteProfileDialog
            show={toggleDeleteModal}
            onHide={hideDeleteModal}
            id={parsed != null ? parsed.id : 0}
          />
        </div>
        <div className="flex-row-fluid ml-lg-8">
          <div className="card card-custom">
            <div className="card-body p-0">
              <div className="wizard wizard-2">
                <div className="wizard-body py-8 px-8">
                  <div className="border-bottom mb-5 pb-3 align-right">
                    <div className="col-sm-12 col-xl-12">
                      <button
                        type="button"
                        className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() => setToggleDeleteModal(true)}
                      >
                        Demande de suppression de mon compte
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() => handleSave()}
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
                  <div className="row mx-10-responsive">
                    <div className="pb-5 width-full">
                      <div className="row">
                        <div className="col-xl-3 col-sm-12 d-flex justify-content-center">
                          <div className="avatar-container">
                            <Edit>
                              <ImgUpload
                                onChange={e => photoUpload(e)}
                                src={previewUrl}
                              />
                            </Edit>

                            <label
                              htmlFor="photo-upload"
                              className="file-input-button"
                            >
                              Ajouter une photo
                              <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={e => photoUpload(e)}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="col-xl-9 col-sm-12">
                          <div className="row">
                            <div className="col-xl-4 col-sm-12">
                              <div className="form-group">
                                <label className="col-form-label">
                                  <FormattedMessage id="MODEL.CIVILITY" />
                                  <span className="asterisk">*</span>
                                </label>
                                <div className="input-group">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text">
                                      <i className="icon-xl fas fa-laptop-code text-primary"></i>
                                    </span>
                                  </div>
                                  <Field
                                    name="titleTypeID"
                                    render={() => (
                                      <select
                                        className="form-control h-auto py-5 px-6"
                                        name="titleTypeID"
                                        onChange={e => {
                                          handleChangeSelectedGender(
                                            e.target.value
                                          );
                                        }}
                                      >
                                        <option disabled selected value="0">
                                          --{" "}
                                          {intl.formatMessage({
                                            id: "MODEL.CIVILITY"
                                          })}{" "}
                                          --
                                        </option>
                                        {titleTypes.map(gender => (
                                          <option
                                            key={gender.id}
                                            label={gender.name}
                                            value={gender.id}
                                            selected={
                                              selectedGender === gender.id
                                            }
                                          >
                                            {gender.name}
                                          </option>
                                        ))}
                                        ;
                                      </select>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-xl-4">
                              <div className="form-group">
                                <label className="col-form-label">
                                  <FormattedMessage id="MODEL.FIRSTNAME" />
                                  <span className="asterisk">*</span>
                                </label>
                                <div className="input-group">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text">
                                      <i className="icon-xl fas fas fa-user-tie text-primary"></i>
                                    </span>
                                  </div>
                                  <input
                                    placeholder={intl.formatMessage({
                                      id: "MODEL.FIRSTNAME"
                                    })}
                                    type="text"
                                    className={`form-control h-auto py-5 px-6`}
                                    name="firstname"
                                    onChange={e =>
                                      handleChangeFirstName(e.target.value)
                                    }
                                    value={firstName}
                                  />
                                </div>
                                {touched.firstname && errors.firstname ? (
                                  <div className="fv-plugins-message-container">
                                    <div className="fv-help-block">
                                      {errors.firstname}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="col-xl-4">
                              <label className=" col-form-label">
                                <FormattedMessage id="MODEL.LASTNAME" />
                                <span className="asterisk">*</span>
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-xl fas fa-user-tie text-primary"></i>
                                  </span>
                                </div>
                                <input
                                  placeholder={intl.formatMessage({
                                    id: "MODEL.LASTNAME"
                                  })}
                                  type="text"
                                  className={`form-control h-auto py-5 px-6`}
                                  name="lastname"
                                  onChange={e =>
                                    handleChangeLastName(e.target.value)
                                  }
                                  value={lastName}
                                />
                              </div>
                              {touched.lastname && errors.lastname ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.lastname}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="col-xl-4">
                              <label className=" col-form-label">
                                <FormattedMessage id="MODEL.BIRTHNAME" />
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-xl fas fas fa-user-tie text-primary"></i>
                                  </span>
                                </div>
                                <input
                                  placeholder={intl.formatMessage({
                                    id: "MODEL.BIRTHNAME"
                                  })}
                                  type="text"
                                  className={`form-control h-auto py-5 px-6`}
                                  name="maidenName"
                                  onChange={e =>
                                    handleChangeBirthName(e.target.value)
                                  }
                                  value={maidenName}
                                />
                              </div>
                            </div>

                            {/* Nouvelle rangée pour le champ sexe */}
                            <div className="">
                              <div className="form-group">
                                <label className="col-form-label">
                                  <FormattedMessage
                                    id="MODEL.GENDER"
                                    defaultMessage="Sexe"
                                  />
                                  <span className="asterisk">*</span>
                                </label>
                                <div className="input-group">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text">
                                      <i className="icon-xl fas fa-venus-mars text-primary"></i>
                                    </span>
                                  </div>
                                  <Field
                                    name="sexe"
                                    render={() => (
                                      <select
                                        className="form-control h-auto py-5 px-6"
                                        name="sexe"
                                        onChange={e => {
                                          handleChangeGender(e.target.value);
                                        }}
                                      >
                                        <option
                                          disabled
                                          selected={gender === null}
                                          value=""
                                        >
                                          --{" "}
                                          {intl.formatMessage({
                                            id: "MODEL.GENDER",
                                            defaultMessage: "Sexe"
                                          })}{" "}
                                          --
                                        </option>
                                        <option
                                          value={EnumSexe.Men}
                                          selected={gender === EnumSexe.Men}
                                        >
                                          {intl.formatMessage({
                                            id: "MODEL.GENDER.MEN"
                                          })}
                                        </option>
                                        <option
                                          value={EnumSexe.Women}
                                          selected={gender === EnumSexe.Women}
                                        >
                                          {intl.formatMessage({
                                            id: "MODEL.GENDER.WOMEN"
                                          })}
                                        </option>
                                      </select>
                                    )}
                                  />
                                </div>
                                {touched.sexe && errors.sexe ? (
                                  <div className="fv-plugins-message-container">
                                    <div className="fv-help-block">
                                      {errors.sexe}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="MODEL.EMAIL" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl far fa-envelope text-primary"></i>
                              </span>
                            </div>
                            <input
                              placeholder={intl.formatMessage({
                                id: "MODEL.EMAIL"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="email"
                              onChange={e => handleChangeEmail(e.target.value)}
                              value={email}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="form-group col-sm-12 col-xl-6">
                          {" "}
                          <label className=" col-form-label">
                            <FormattedMessage id="MODEL.PHONE" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-phone text-primary"></i>
                              </span>
                            </div>
                            <input
                              placeholder={intl.formatMessage({
                                id: "MODEL.PHONE"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="mobilePhoneNumber"
                              onChange={e =>
                                handleChangeMobilePhone(e.target.value)
                              }
                              value={
                                mobilePhoneNumber &&
                                mobilePhoneNumber.match(/.{1,2}/g).join(" ")
                              }
                            />
                          </div>
                          {touched.mobilePhoneNumber &&
                          errors.mobilePhoneNumber ? (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.mobilePhoneNumber}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="MODEL.ACCOUNT.ADDRESS" />
                            <span className="asterisk">*</span>
                          </label>

                          {/* Bouton Utiliser ma localisation */}
                          <button
                            type="button"
                            className="btn btn-sm btn-light-primary mb-2"
                            onClick={useMyLocation}
                            disabled={isLoadingGeolocation}
                          >
                            {isLoadingGeolocation ? (
                              <span
                                className="spinner-border spinner-border-sm mr-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            ) : (
                              <i className="fas fa-map-marker-alt mr-2"></i>
                            )}
                            Utiliser ma localisation
                          </button>

                          <div className="input-group">
                            <div
                              style={{
                                width: "100%",
                                display: "flex",
                                position: "relative"
                              }}
                            >
                              <div className="input-group-prepend">
                                <span
                                  className="input-group-text"
                                  style={{ borderRadius: "5px 0 0 5px" }}
                                >
                                  <i className="icon-xl fas fa-home text-primary"></i>
                                </span>
                              </div>
                              <input
                                className="form-control h-auto py-5 px-6"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.ACCOUNT.ADDRESS"
                                })}
                                value={address}
                                onChange={handleChangeAddress}
                                onFocus={() =>
                                  address.length >= 3 &&
                                  setShowSuggestions(true)
                                }
                                onBlur={() =>
                                  setTimeout(
                                    () => setShowSuggestions(false),
                                    200
                                  )
                                }
                              />

                              {showSuggestions &&
                                addressSuggestions.length > 0 && (
                                  <div
                                    className="autocomplete-dropdown-container"
                                    style={{
                                      position: "absolute",
                                      top: 55,
                                      left: 55,
                                      zIndex: 10,
                                      width: "calc(100% - 55px)",
                                      maxHeight: "200px",
                                      overflowY: "auto",
                                      backgroundColor: "#ffffff",
                                      border: "1px solid #e6e6e6",
                                      borderRadius: "0 0 5px 5px",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                  >
                                    {isLoadingAddresses && (
                                      <div
                                        style={{
                                          padding: "10px",
                                          textAlign: "center"
                                        }}
                                      >
                                        <FormattedMessage id="MESSAGE.SEARCH.ONGOING" />
                                      </div>
                                    )}

                                    {!isLoadingAddresses &&
                                      addressSuggestions.map(
                                        (suggestion, index) => (
                                          <div
                                            key={index}
                                            onMouseDown={() =>
                                              handleAddressSuggestionSelect(
                                                suggestion
                                              )
                                            }
                                            style={{
                                              padding: "10px",
                                              cursor: "pointer",
                                              borderBottom:
                                                index <
                                                addressSuggestions.length - 1
                                                  ? "1px solid #f0f0f0"
                                                  : "none",
                                              backgroundColor: "#ffffff",
                                              transition:
                                                "background-color 0.2s"
                                            }}
                                            onMouseOver={e =>
                                              (e.currentTarget.style.backgroundColor =
                                                "#f7f7f7")
                                            }
                                            onMouseOut={e =>
                                              (e.currentTarget.style.backgroundColor =
                                                "#ffffff")
                                            }
                                          >
                                            <div style={{ fontWeight: "500" }}>
                                              {suggestion.freeformAddress}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "12px",
                                                color: "#616061"
                                              }}
                                            >
                                              {suggestion.postalCode}{" "}
                                              {suggestion.localName},{" "}
                                              {suggestion.country}
                                            </div>
                                          </div>
                                        )
                                      )}
                                  </div>
                                )}
                            </div>
                          </div>
                          {touched.address && errors.address ? (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.address}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="MODEL.ACCOUNT.ADDITIONALADDRESS" />
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-home text-primary"></i>
                              </span>
                            </div>
                            <input
                              placeholder={intl.formatMessage({
                                id: "MODEL.ACCOUNT.ADDITIONALADDRESS"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="additionalAddress"
                              onChange={e =>
                                handleChangeAdditionalAddress(e.target.value)
                              }
                              value={additionalAddress}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-home text-primary"></i>
                              </span>
                            </div>
                            <input
                              disabled
                              placeholder={intl.formatMessage({
                                id: "MODEL.ACCOUNT.POSTALCODE"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="postalCode"
                              onChange={e =>
                                handleChangePostalCode(e.target.value)
                              }
                              value={postalCode}
                            />
                          </div>
                          {touched.postalCode && errors.postalCode ? (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.postalCode}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="MODEL.ACCOUNT.CITY" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-city text-primary"></i>
                              </span>
                            </div>
                            <input
                              disabled
                              placeholder={intl.formatMessage({
                                id: "MODEL.ACCOUNT.CITY"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="city"
                              onChange={e => handleChangeCity(e.target.value)}
                              value={city}
                            />
                          </div>
                          {touched.city && errors.city ? (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">{errors.city}</div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="COLUMN.NATIONALITY" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-birthday-cake text-primary"></i>
                              </span>
                            </div>
                            <select
                              className="form-control h-auto py-5 px-6"
                              name="nationalityID"
                              onChange={e => {
                                handleChangeNationality(e.target.value);
                              }}
                            >
                              <option disabled selected value="0">
                                --{" "}
                                {intl.formatMessage({
                                  id: "MESSAGE.SELECT.NATIONALITY"
                                })}{" "}
                                --
                              </option>
                              {nationalitiesList.map(nationality => (
                                <option
                                  key={nationality.id}
                                  label={nationality.frenchName}
                                  value={nationality.id}
                                  selected={
                                    parsed &&
                                    parsed.nationalityID === nationality.id
                                  }
                                >
                                  {nationality.name}
                                </option>
                              ))}
                              ;
                            </select>
                          </div>
                        </div>
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="TEXT.BIRTHDATE" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-birthday-cake text-primary"></i>
                              </span>
                            </div>
                            <ReactDatePicker
                              className={`form-control h-auto py-5 px-6 date-input-content`}
                              style={{ width: "100%" }}
                              onChange={val => {
                                handleChangeBirthDate(
                                  moment(val)
                                    .locale("fr")
                                    .format(
                                      moment.HTML5_FMT.DATETIME_LOCAL_SECONDS
                                    )
                                );
                              }}
                              dateFormat="dd/MM/yyyy"
                              selected={
                                (birthDate && new Date(birthDate)) || null
                              }
                              showMonthDropdown
                              maxDate={moment().subtract(18, "years")._d}
                              showYearDropdown
                              yearItemNumber={9}
                              locale={fr}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="BUTTON.SMS.RECEPTION" />
                          </label>
                          <div className="col-1">
                            <span className="switch switch switch-sm">
                              <label>
                                <input
                                  type="checkbox"
                                  onChange={() => {
                                    setHasSms(!hasSms);
                                    props.formik.setFieldValue(
                                      "hasSms",
                                      !props.formik.values.hasSms
                                    );
                                  }}
                                  checked={hasSms}
                                  name=""
                                />
                                <span></span>
                              </label>
                            </span>
                          </div>
                        </div>
                        <div className="form-group col-sm-12 col-xl-6">
                          <label className=" col-form-label">
                            <FormattedMessage id="TEXT.BIRTH.LOCATION" />
                            <span className="asterisk">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-xl fas fa-birthday-cake text-primary"></i>
                              </span>
                            </div>
                            <input
                              placeholder={intl.formatMessage({
                                id: "TEXT.BIRTH.LOCATION"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="birthPlace"
                              onChange={e =>
                                handleChangeBirthPlace(e.target.value)
                              }
                              value={birthPlace}
                            />
                          </div>
                          {touched.birthPlace && errors.birthPlace ? (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.birthPlace}
                              </div>
                            </div>
                          ) : null}
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

export default injectIntl(FormStepTwo);
