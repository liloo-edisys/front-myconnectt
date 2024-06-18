import React, { useState } from "react";
import SVG from "react-inlinesvg";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { Zoom } from "react-reveal";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import "./styles.scss";
import { useDispatch, useSelector } from "react-redux";
import { goToNextStep } from "../../../../../../business/actions/interimaire/InterimairesActions";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  geocodeByPlaceId
} from "react-places-autocomplete";

const searchOptions = {
  types: ["postal_code"]
};

function EmailEdit(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { interimaire, step } = useSelector(
    state => state.interimairesReducerData
  );
  const [address, setAddress] = useState("");
  const initialValues = {
    lastname: "",
    firstname: "",
    email: "",
    location: ""
  };
  const RegistrationSchema = Yup.object().shape({
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    location: Yup.object().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

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
    setAddress(`${postalCode}, ${city}`);
    setFieldValue("location", {
      postalCode: postalCode,
      city: city
    });
  };
  return (
    <div style={{ margin: 10 }}>
      <div className="card card-custom title_container_radius">
        <div className="card-home border-top-auth ribbon ribbon-top ribbon-ver">
          <h2>
            <span className="svg-icon svg-icon-3x svg-icon-danger document_icon">
              <SVG
                className="h-75 align-self-end"
                src={toAbsoluteUrl("/media/svg/icons/General/Shield-check.svg")}
              ></SVG>
            </span>
            <span>
              <FormattedMessage id="BUTTON.INTERIMAIRE.COMPLETE" />
            </span>
          </h2>
        </div>
      </div>
      <div></div>
      <Zoom duration={1000}>
        <div className="card card-custom card-stretch gutter-b mt-10 p-5">
          <div className="p-5 card card-custom bg-primary white font-weight-bolder">
            <div className=" flex-space-between">
              <div className="flex-space-between">
                <i className="flaticon-information icon-xxl mr-5 white" />
                <FormattedMessage id="TEXT.COMPLETE.PROFILE" />
              </div>
              <div>
                <i className="flaticon2-cross icon-l white" />
              </div>
            </div>
          </div>
          <div>
            <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={RegistrationSchema}
              setFieldValue
              onSubmit={(values, { setSubmitting }) => {
                const newInterimaire = {
                  ...interimaire,
                  //address: values.location.address,
                  postalCode: values.location.postalCode,
                  city: values.location.city,
                  email: values.email,
                  lastname: values.lastname,
                  firstname: values.firstname
                };
                goToNextStep(newInterimaire, step, dispatch);
                /*enableLoading();
                registerAccount(values)
                  .then(response => {
                    disableLoading();
                    response && history.push("/");
                  })
                  .catch(() => {
                    setSubmitting(true);
                    disableLoading();
                  });*/
              }}
            >
              {({
                values,
                touched,
                errors,
                status,
                handleSubmit,
                setFieldValue
              }) => (
                <Form
                  id="kt_login_signin_form"
                  className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
                  onSubmit={handleSubmit}
                >
                  <div className="padding-info-container">
                    <div>
                      <label htmlFor="lastname">
                        <FormattedMessage id="MODEL.LASTNAME" />
                        <span className="required_asterix">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-user text-primary"></i>
                          </span>
                        </div>
                        <Field
                          placeholder={intl.formatMessage({
                            id: "MODEL.LASTNAME"
                          })}
                          className={`form-control h-auto py-5 px-6`}
                          name="lastname"
                        />
                      </div>
                      <div className="h-30">
                        {touched.lastname && errors.lastname ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.lastname}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="firstname">
                        <FormattedMessage id="MODEL.FIRSTNAME" />
                        <span className="required_asterix">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-user text-primary"></i>
                          </span>
                        </div>
                        <Field
                          placeholder={intl.formatMessage({
                            id: "MODEL.FIRSTNAME"
                          })}
                          className={`form-control h-auto py-5 px-6`}
                          name="firstname"
                        />
                      </div>
                      <div className="h-30">
                        {touched.firstname && errors.firstname ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.firstname}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email">
                        <FormattedMessage id="MODEL.EMAIL" />
                        <span className="required_asterix">*</span>
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
                          type="email"
                          className={`form-control h-auto py-5 px-6`}
                          name="email"
                        />
                      </div>
                      <div className="h-30">
                        {touched.email && errors.email ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">{errors.email}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="address">
                        <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                        <span className="required_asterix">*</span>
                      </label>
                      <div>
                        <div className="input-group">
                          <PlacesAutocomplete
                            searchOptions={searchOptions}
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
                                    <i className="icon-xl far flaticon-home-2 text-primary"></i>
                                  </span>
                                </div>
                                <input
                                  className={`form-control h-auto py-5 px-6 google-map-input-content`}
                                  {...getInputProps({
                                    placeholder: "Entrez votre code postal"
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
                                    // inline style for demonstration purpose
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
                      </div>
                      <div className="h-30">
                        {touched.location ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.location}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-primary font-weight-bold px-9 mx-4 btn-shadow"
                    >
                      <span>
                        <FormattedMessage id="BUTTON.NEXT" />
                      </span>
                      {/*loading && (
                        <span className="ml-3 spinner spinner-white"></span>
                      )*/}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Zoom>
    </div>
  );
}

export default EmailEdit;
