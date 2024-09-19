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
import { getTitlesTypes } from "../../../../../business/actions/shared/listsActions";
import { updateApplicant } from "actions/client/applicantsActions";
import Avatar from "react-avatar";
import ReactDatePicker from "react-datepicker";
import { DeleteProfileDialog } from "../profileModals/DeleteProfileDialog";
import fr from "date-fns/locale/fr";
import { toastr } from "react-redux-toastr";
import { getNationalitiesList } from "../../../../../business/actions/interimaire/interimairesActions";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  geocodeByPlaceId
} from "react-places-autocomplete";

function FormStepTwo(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const {
    user,
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

  const [experience, setExperience] = useLocalStorage("experience", null);
  const [photo, setPhoto] = useLocalStorage("photo", null);
  const [previewUrl, setPreviewUrl] = useLocalStorage(
    "previewUrl",
    "https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true"
  );
  const [selectedGender, setSelectedGender] = useLocalStorage(
    "selectedGender",
    0
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
    e !== null ? setBirthDate(e) : setBirthDate(null);
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

  const handleChangeAddress = e => {
    setAddress(e);
    props.formik.setFieldValue("address", e);
  };

  const handleSelectAddress = async (address, placeId, setFieldValue) => {
    const results = await geocodeByAddress(address);
    const latLng = await getLatLng(results[0]);
    const [place] = await geocodeByPlaceId(placeId);
    const { long_name: postalCode = "" } =
      place.address_components.find(c => c.types.includes("postal_code")) || {};
    const { long_name: city = "" } =
      place.address_components.find(c => c.types.includes("locality")) || {};
    const addressArray = address.split(",");
    setAddress(addressArray[0]);
    setPostalCode(postalCode);
    setCity(city);
    props.formik.setFieldValue("address", addressArray[0]);
    props.formik.setFieldValue("postalCode", postalCode);
    props.formik.setFieldValue("city", city);
  };

  const handleChangeAdditionalAddress = e => {
    setAdditionalAddress(e);
    props.formik.setFieldValue("additionalAddress", e);
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
    setSelectedGender(parseInt(e));
    props.formik.setFieldValue("titleTypeID", parseInt(e));
  };
  const handleChangeNationality = e => {
    setNationality(parseInt(e));
    props.formik.setFieldValue("nationalityID", parseInt(e));
  };

  const createOption = (label, value) => ({
    label,
    value
  });

  const { errors, touched } = useFormikContext();
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

  const handleSave = () => {
    if (
      !errors.firstname &&
      !errors.lastname &&
      !errors.postalCode &&
      !errors.city &&
      !errors.address &&
      !errors.nationality &&
      !errors.mobilePhoneNumber
    ) {
      const body = { ...props.formik.values, anaelID: parsed.anaelID };
      dispatch(updateApplicant.request(body));
    } else {
      toastr.error(
        "Veuillez remplir correctement tous les champs obligatoires."
      );
    }
  };

  const handleChangePhoneNumber = () => {
    dispatch(updateApplicant.request(props.formik.values));
    props.history.push("/int-profile-edit/step-three");
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
                                    render={({ field, form }) => (
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
                          <div className="input-group">
                            <PlacesAutocomplete
                              value={address}
                              onChange={handleChangeAddress}
                              onSelect={(address, placeId) =>
                                handleSelectAddress(address, placeId)
                              }
                            >
                              {({
                                getInputProps,
                                suggestions,
                                getSuggestionItemProps,
                                loading
                              }) => (
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
                                    className={`form-control h-auto py-5 px-6 google-map-input-content`}
                                    {...getInputProps({
                                      placeholder: "Entrez votre adresse"
                                    })}
                                  />
                                  <div
                                    className="autocomplete-dropdown-container google-map-input"
                                    style={{
                                      position: "absolute",
                                      top: 55,
                                      left: 55,
                                      zIndex: 1
                                    }}
                                  >
                                    {loading && (
                                      <div>
                                        <FormattedMessage id="MESSAGE.SEARCH.ONGOING" />
                                      </div>
                                    )}
                                    {suggestions.map(suggestion => {
                                      const className = suggestion.active
                                        ? "suggestion-item--active"
                                        : "suggestion-item";
                                      const style = suggestion.active
                                        ? {
                                            backgroundColor: "#fafafa",
                                            cursor: "pointer",
                                            padding: 5
                                          }
                                        : {
                                            backgroundColor: "#ffffff",
                                            cursor: "pointer",
                                            padding: 5
                                          };
                                      return (
                                        <div
                                          {...getSuggestionItemProps(
                                            suggestion,
                                            {
                                              className,
                                              style
                                            }
                                          )}
                                        >
                                          <span>{suggestion.description}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </PlacesAutocomplete>
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
