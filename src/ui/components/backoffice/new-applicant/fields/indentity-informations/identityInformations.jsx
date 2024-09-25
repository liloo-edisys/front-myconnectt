import React, { useEffect, useState } from "react";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import _ from "lodash";
import { FormattedMessage, useIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import moment from "moment";
import { getTitlesTypes } from "../../../../../../business/actions/shared/listsActions";
import Avatar from "react-avatar";
import { DatePickerField } from "metronic/_partials/controls";
import { toastr } from "react-redux-toastr";
import { useParams, useHistory } from "react-router-dom";
import { getSelectedApplicantById } from "../../../../../../business/actions/backoffice/applicantActions";
import { getNationalitiesList } from "../../../../../../business/actions/interimaire/interimairesActions";
import axios from "axios";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  geocodeByPlaceId
} from "react-places-autocomplete";
import { ApplicantDeleteModal } from "./ApplicantDeleteModal";

function IdentityInformations(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { interimaireId } = useParams();
  const intl = useIntl(); // intl extracted from useIntl hook
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const {
    user,
    titleTypes,
    activeInterimaire,
    nationalitiesList
  } = useSelector(
    state => ({
      user: state.user.user,
      titleTypes: state.lists.titleTypes,
      activeInterimaire: state.accountsReducerData.activeInterimaire,
      nationalitiesList: state.interimairesReducerData.nationalitiesList
    }),
    shallowEqual
  );

  const [experience, setExperience] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    "https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true"
  );
  const [imageToSave, setImageToSave] = useState(null);
  const [selectedGender, setSelectedGender] = useState(0);
  const [anaelID, setAnaelID] = useState("");
  const [firstName, setFirstName] = useState("");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false);

  const [lastName, setLastName] = useState("");
  const [hasSms, setHasSms] = useState(false);

  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [additionalAddress, setAdditionalAddress] = useState("");
  const [mobilePhoneNumber, setMobilePhoneNumber] = useState("");
  const [filteredMobilePhoneNumber, setFilteredMobilePhoneNumner] = useState(
    ""
  );
  const [email, setEmail] = useState("");
  const [maidenName, setMaidenName] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [sendPrefectureLoading, setSendPrefectureLoading] = useState(false);
  const [relanceLoading, setRelanceLoading] = useState(false);
  const [toggleApplicantDeleteModal, setToggleApplicantDeleteModal] = useState(
    false
  );
  const [documentToRelaunch, setDocumentToRelaunch] = useState(false);

  const initialValues = {
    tenantID: 1,

    anaelID:
      activeInterimaire && activeInterimaire.anaelId
        ? activeInterimaire.anaelId
        : "",
    titleTypeID:
      activeInterimaire && activeInterimaire.titleTypeID
        ? activeInterimaire.titleTypeID
        : 0,
    anaelID:
      activeInterimaire && activeInterimaire.anaelID
        ? activeInterimaire.anaelID
        : "",
    firstname:
      activeInterimaire && activeInterimaire.firstname
        ? activeInterimaire.firstname
        : "",
    lastname:
      activeInterimaire && activeInterimaire.lastname
        ? activeInterimaire.lastname
        : "",
    maidenName:
      activeInterimaire && activeInterimaire.maidenName
        ? activeInterimaire.maidenName
        : "",
    email:
      activeInterimaire && activeInterimaire.email
        ? activeInterimaire.email
        : "",
    mobilePhoneNumber:
      activeInterimaire && activeInterimaire.mobilePhoneNumber
        ? activeInterimaire.mobilePhoneNumber
        : "",
    address:
      activeInterimaire && activeInterimaire.address
        ? activeInterimaire.address
        : "",
    additionalAddress:
      activeInterimaire && activeInterimaire.additionalAddress
        ? activeInterimaire.additionalAddress
        : "",
    postalCode:
      activeInterimaire && activeInterimaire.postalCode
        ? activeInterimaire.postalCode
        : "",
    city:
      activeInterimaire && activeInterimaire.city ? activeInterimaire.city : "",

    birthDate:
      activeInterimaire && activeInterimaire.birthDate
        ? moment(activeInterimaire.birthDate)
        : "",
    birthPlace:
      activeInterimaire && activeInterimaire.birthPlace
        ? activeInterimaire.birthPlace
        : "",
    hasSms: false,
    applicantPictureID: null,
    applicantPicture: null
  };

  useEffect(() => {
    if (activeInterimaire) {
      if (activeInterimaire.address) {
        setAddress(activeInterimaire.address);
      } else {
        setAddress("");
      }
      if (activeInterimaire.postalCode) {
        setPostalCode(activeInterimaire.postalCode);
      } else {
        setPostalCode("");
      }
      if (activeInterimaire.city) {
        setCity(activeInterimaire.city);
      } else {
        setCity("");
      }
      !isNullOrEmpty(activeInterimaire.mobilePhoneNumber) &&
        handleChangePhone(null, null, activeInterimaire.mobilePhoneNumber);
      !isNullOrEmpty(activeInterimaire) &&
        !isNullOrEmpty(activeInterimaire.applicantPicture) &&
        setPreviewUrl(
          "data:image/" +
            activeInterimaire.applicantPicture.filename.split(".")[1] +
            ";base64," +
            activeInterimaire.applicantPicture.base64
        );

      const now = moment(new Date()).format("YYYY-MM-DD");
      const habilitationsList = activeInterimaire.applicantDocuments.filter(
        hab => hab.documentType === 13 && hab.expirationDate
      );
      const datesArray = [
        moment(activeInterimaire.idCardExpirationDate).format("YYYY-MM-DD")
      ];
      for (let i = 0; i < habilitationsList.length; i++) {
        datesArray.push(habilitationsList[i].expirationDate);
      }
      for (let i = 0; i < datesArray.length; i++) {
        const expiration = moment(
          new Date(datesArray[i]).setDate(
            new Date(datesArray[i]).getDate() - 15
          )
        ).format("YYYY-MM-DD");
        if (now > expiration) {
          setDocumentToRelaunch(true);
          break;
        }
      }
    }
    if (nationalitiesList.length === 0) {
      getNationalitiesList(dispatch);
    }
  }, [activeInterimaire]);
  const ApplicantSchema = Yup.object().shape({
    //anaelID: "",
    //titleTypeID: 0,
    anaelID: Yup.string()
      .min(9, intl.formatMessage({ id: "WARNING.ANAEL.LENGTH" }))
      .max(9, intl.formatMessage({ id: "WARNING.ANAEL.LENGTH" })),
    titleTypeID: Yup.number().min(
      1,
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    mobilePhoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    postalCode: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    birthDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    birthPlace: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    dispatch(getTitlesTypes.request());
  }, [dispatch]);

  const onChangeGender = (e, setFieldValue) => {
    setFieldValue("titleTypeID", parseInt(e));
  };

  const handleChange = address => {
    setAddress(address);
  };

  const handleSelect = async (address, placeId, setFieldValue) => {
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
    setFieldValue("address", addressArray[0]);
    setFieldValue("postalCode", postalCode);
    setFieldValue("city", city);
  };

  const onChangeBirthDate = (date, setFieldValue) => {
    if (date === "Invalid date") {
      setFieldValue("birthDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("birthDate", newDate);
    }
  };

  const handleChangeNationality = (e, setFieldValue) => {
    setFieldValue("nationalityID", parseInt(e));
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
      setImageToSave(appPicture);
      //props.formik.setFieldValue("applicantPicture", appPicture);
    };

    reader.readAsDataURL(file);
  };

  const onValidateApplicant = () => {
    let body = {
      id1: activeInterimaire.tenantID,
      id2: activeInterimaire.id
    };
    setValidationLoading(true);

    axios
      .post(
        process.env.REACT_APP_WEBAPI_URL + "api/applicant/SendToAnael",
        body
      )
      .then(res => {
        toastr.success(
          intl.formatMessage({ id: "TITLE.EDIT.INTERIMAIRE" }),
          intl.formatMessage({ id: "MESSAGE.INTERIMAIRE.VALIDATION" })
        );
        setValidationLoading(false);
        getSelectedApplicantById(interimaireId, dispatch);
        /*if (!interimaireId) {
          history.push(`edit/${res.data.id}`);
        }*/
      })
      .catch(err => {
        setValidationLoading(false);
        toastr.error(
          intl.formatMessage({ id: "TITLE.EDIT.INTERIMAIRE" }),
          intl.formatMessage({ id: err.response.data })
        );
      });
  };

  const onDocumentRelance = () => {
    let body = {
      id1: activeInterimaire.tenantID,
      id2: activeInterimaire.id
    };
    setRelanceLoading(true);
    axios
      .post(
        process.env.REACT_APP_WEBAPI_URL + "api/Email/ApplicantDocumentRelance",
        body
      )
      .then(res => {
        toastr.success(
          intl.formatMessage({ id: "BUTTON.DOCUMENT.RELANCE" }),
          intl.formatMessage({ id: "MESSAGE.INTERIMAIRE.NOTIFIED" })
        );
        setRelanceLoading(false);
      })
      .catch(err => {
        setRelanceLoading(false);
        toastr.error(
          intl.formatMessage({ id: "BUTTON.DOCUMENT.RELANCE" }),
          intl.formatMessage({ id: "MESSAGE.INTERIMAIRE.NOTIFICATION.ERROR" })
        );
      });
  };

  const handleChangePhone = (setFieldValue, setFieldTouched, e) => {
    setMobilePhoneNumber(e && e.replace(/\s/g, ""));

    if (setFieldTouched) {
      setFieldTouched("mobilePhoneNumber", true);
    }
    if (setFieldValue) {
      setFieldValue("mobilePhoneNumber", e && e.replace(/\s/g, ""));
    }
  };

  const sendToPrefecture = id => {
    setSendPrefectureLoading(true);
    const body = {
      id1: user.tenantID,
      id2: id
    };

    axios
      .post(
        process.env.REACT_APP_WEBAPI_URL +
          "api/applicant/SendDocumentsToPrefecture",
        body
      )
      .then(res => {
        toastr.success(
          intl.formatMessage({ id: "Succès" }),
          intl.formatMessage({
            id: "L'envoi a été réalisé avec succès"
          })
        );
        setSendPrefectureLoading(false);
        getSelectedApplicantById(interimaireId, dispatch);
        /*if (!interimaireId) {
            history.push(`edit/${res.data.id}`);
          }*/
      })
      .catch(err => {
        setSendPrefectureLoading(false);
        toastr.error(
          intl.formatMessage({
            id: "Une erreur s'est produite lors de l'envoi à la préfecture"
          }),
          intl.formatMessage({ id: err.response.data })
        );
      });
  };

  return (
    <>
      {toggleApplicantDeleteModal && (
        <ApplicantDeleteModal
          onHide={() => {
            setToggleApplicantDeleteModal(false);
          }}
          applicant={activeInterimaire}
          show={true}
          goBack={() => history.goBack()}
        />
      )}
      <div className="wizard-body py-8 px-8">
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={ApplicantSchema}
          setFieldValue
          setFieldTouched
          onSubmit={values => {
            let body = values;
            if (interimaireId) {
              body = {
                ...activeInterimaire,
                ...values
              };
              if (imageToSave) {
                body = {
                  ...body,
                  applicantPicture: imageToSave
                };
              } else {
                body = {
                  ...body,
                  applicantPicture: activeInterimaire.applicantPicture
                };
              }
            }
            setLoading(true);
            axios
              .put(process.env.REACT_APP_WEBAPI_URL + "api/Applicant", body)
              .then(res => {
                let message = interimaireId
                  ? intl.formatMessage({
                      id: "MESSAGE.INTERIMAIRE.UPDATE.SUCCESS"
                    })
                  : intl.formatMessage({
                      id: "MESSAGE.INTERIMAIRE.CREATION.SUCCESS"
                    });
                let errorMessage = interimaireId
                  ? intl.formatMessage({
                      id: "MESSAGE.INTERIMAIRE.UPDATE.ERROR"
                    })
                  : intl.formatMessage({
                      id: "MESSAGE.INTERIMAIRE.CREATION.ERROR"
                    });
                toastr.success(
                  intl.formatMessage({ id: "TITLE.INTERIMAIRE.CREATION" }),
                  message
                );
                setLoading(false);
                getSelectedApplicantById(res.data.id, dispatch);
                if (!interimaireId) {
                  history.push(`edit/${res.data.id}`);
                }
              })
              .catch(err => {
                setLoading(false);
                let message =
                  err.response.data.message && err.response.data.message;
                toastr.error(intl.formatMessage({ id: "ERROR" }), message);
              });
          }}
        >
          {({
            values,
            touched,
            errors,
            status,
            handleSubmit,
            setFieldValue,
            setFieldTouched
          }) => (
            <Form
              id="kt_login_signin_form"
              className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
              onSubmit={handleSubmit}
            >
              <div className="border-bottom mb-5 pb-3 align-right">
                <div className="col-lg-12 col-xl-12 align-left">
                  {activeInterimaire &&
                    (activeInterimaire.applicantStatusID === 2 ||
                      activeInterimaire.applicantStatusID === 1) &&
                    documentToRelaunch && (
                      <div
                        className="btn btn-light-warning btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={onDocumentRelance}
                      >
                        <span>
                          <FormattedMessage id="BUTTON.DOCUMENT.RELANCE" />
                        </span>
                        {relanceLoading && (
                          <span className="ml-3 spinner spinner-white"></span>
                        )}
                      </div>
                    )}
                  {activeInterimaire &&
                    activeInterimaire.applicantStatusID === 2 && (
                      <div
                        className="btn btn-light-success btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={onValidateApplicant}
                      >
                        <span>
                          <FormattedMessage id="SEND.TO.ANAEL" />
                        </span>
                        {validationLoading && (
                          <span className="ml-3 spinner spinner-white"></span>
                        )}
                      </div>
                    )}
                  {activeInterimaire &&
                    activeInterimaire.applicantStatusID === 2 && (
                      <div
                        className="btn btn-light-info btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() => sendToPrefecture(activeInterimaire.id)}
                      >
                        <span>Envoyer à la préfecture</span>
                        {sendPrefectureLoading && (
                          <span className="ml-3 spinner spinner-white"></span>
                        )}
                      </div>
                    )}
                  {/* id1: tenantId, id2:: applicantId*/}
                  {activeInterimaire &&
                    activeInterimaire.applicantStatusID !== 5 && (
                      <div
                        className="btn btn-light-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={() => setToggleApplicantDeleteModal(true)}
                      >
                        <span>
                          <FormattedMessage id="BUTTON.DELETE" />
                        </span>
                      </div>
                    )}
                  <div
                    className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                    onClick={() => history.goBack()}
                  >
                    <span>
                      <FormattedMessage id="BUTTON.BACK" />
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
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
                              {
                                <Field
                                  name="titleTypeID"
                                  render={({ field, form }) => (
                                    <select
                                      className="form-control h-auto py-5 px-6"
                                      name="titleTypeID"
                                      onChange={e => {
                                        onChangeGender(
                                          e.target.value,
                                          setFieldValue
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
                                            values.titleTypeID === gender.id
                                          }
                                        >
                                          {gender.name}
                                        </option>
                                      ))}
                                      ;
                                    </select>
                                  )}
                                />
                              }
                            </div>
                            {touched.titleTypeID && errors.titleTypeID ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.titleTypeID}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="col-xl-4 col-sm-12">
                          <div className="form-group">
                            <label className="col-form-label">
                              <FormattedMessage id="TEXT.ANAEL.ID" />
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-l far fa-address-card text-primary"></i>
                                </span>
                              </div>
                              <Field
                                placeholder={intl.formatMessage({
                                  id: "TEXT.ANAEL.ID"
                                })}
                                type="text"
                                className={`form-control h-auto py-5 px-6`}
                                name="anaelID"
                              />
                            </div>
                            {touched.anaelID && errors.anaelID && (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.anaelID}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xl-4">
                          <label htmlFor="jobTitle">
                            <FormattedMessage id="MODEL.FIRSTNAME" />
                            <span className="required_asterix">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-l far fa-address-card text-primary"></i>
                              </span>
                            </div>
                            <Field
                              placeholder={intl.formatMessage({
                                id: "MODEL.FIRSTNAME"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="firstname"
                            />
                          </div>
                          {touched.firstname && errors.firstname && (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.firstname}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="col-xl-4">
                          <label htmlFor="jobTitle">
                            <FormattedMessage id="MODEL.LASTNAME" />
                            <span className="required_asterix">*</span>
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-l far fa-address-card text-primary"></i>
                              </span>
                            </div>
                            <Field
                              placeholder={intl.formatMessage({
                                id: "MODEL.LASTNAME"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="lastname"
                            />
                          </div>
                          {touched.lastname && errors.lastname && (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.lastname}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="col-xl-4">
                          <label htmlFor="jobTitle">
                            <FormattedMessage id="MODEL.BIRTHNAME" />
                          </label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="icon-l far fa-address-card text-primary"></i>
                              </span>
                            </div>
                            <Field
                              placeholder={intl.formatMessage({
                                id: "MODEL.BIRTHNAME"
                              })}
                              type="text"
                              className={`form-control h-auto py-5 px-6`}
                              name="maidenName"
                            />
                          </div>
                          {touched.maidenName && errors.maidenName && (
                            <div className="fv-plugins-message-container">
                              <div className="fv-help-block">
                                {errors.maidenName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-10">
                    <div className="form-group col-sm-12 col-xl-6">
                      <label htmlFor="jobTitle">
                        <FormattedMessage id="MODEL.EMAIL" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-envelope text-primary"></i>
                          </span>
                        </div>
                        <Field
                          placeholder={intl.formatMessage({
                            id: "MODEL.EMAIL"
                          })}
                          type="text"
                          className={`form-control h-auto py-5 px-6`}
                          name="email"
                        />
                      </div>
                      {touched.email && errors.email && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">{errors.email}</div>
                        </div>
                      )}
                    </div>
                    <div className="form-group col-sm-12 col-xl-6">
                      <label htmlFor="jobTitle">
                        <FormattedMessage id="MODEL.PHONE" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-phone text-primary"></i>
                          </span>
                        </div>
                        <Field
                          placeholder={intl.formatMessage({
                            id: "MODEL.PHONE"
                          })}
                          type="text"
                          onChange={e =>
                            handleChangePhone(
                              setFieldValue,
                              setFieldTouched,
                              e.target.value
                            )
                          }
                          value={
                            mobilePhoneNumber &&
                            mobilePhoneNumber.match(/.{1,2}/g).join(" ")
                          }
                          className={`form-control h-auto py-5 px-6`}
                          name="mobilePhoneNumber"
                        />
                      </div>
                      {touched.mobilePhoneNumber && errors.mobilePhoneNumber && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.mobilePhoneNumber}
                          </div>
                        </div>
                      )}
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
                          country={["fr"]}
                          value={address}
                          onChange={handleChange}
                          onSelect={(address, placeId) =>
                            handleSelect(address, placeId, setFieldValue)
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
                                      {...getSuggestionItemProps(suggestion, {
                                        className,
                                        style
                                      })}
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
                      {touched.address && errors.address && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">{errors.address}</div>
                        </div>
                      )}
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
                          value={postalCode}
                        />
                      </div>
                      {touched.postalCode && errors.postalCode && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.postalCode}
                          </div>
                        </div>
                      )}
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
                          value={city}
                        />
                      </div>
                      {touched.city && errors.city && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">{errors.city}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    {/*<div className="form-group col-sm-12 col-xl-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="BUTTON.SMS.RECEPTION" />
                    </label>
                    <div className="col-1">
                      <span className="switch switch switch-sm">
                        <label>
                          <input type="checkbox" checked={hasSms} name="" />
                          <span></span>
                        </label>
                      </span>
                    </div>
                  </div>*/}
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
                            handleChangeNationality(
                              e.target.value,
                              setFieldValue
                            );
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
                                activeInterimaire &&
                                activeInterimaire.nationalityID ===
                                  nationality.id
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
                      <DatePickerField
                        component={DatePickerField}
                        iconHeight="55px"
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="birthDate"
                        maxDate={moment().subtract(18, "years")._d}
                        onChange={date =>
                          onChangeBirthDate(date, setFieldValue)
                        }
                        showMonthDropdown
                        showYearDropdown
                        yearItemNumber={9}
                        locale="fr"
                      />
                      {touched.birthDate && errors.birthDate && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.birthDate}
                          </div>
                        </div>
                      )}
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
                        <Field
                          placeholder={intl.formatMessage({
                            id: "TEXT.BIRTH.LOCATION"
                          })}
                          type="text"
                          className={`form-control h-auto py-5 px-6`}
                          name="birthPlace"
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
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default IdentityInformations;
