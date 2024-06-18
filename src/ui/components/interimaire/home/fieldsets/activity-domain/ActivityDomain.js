import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { Formik, Form } from "formik";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import InputRange from "react-input-range";
import Select from "react-select";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { Zoom } from "react-reveal";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import "./styles.scss";
import useLocalStorage from "../../../../shared/PersistState";
import { goToNextStep } from "../../../../../../business/actions/interimaire/InterimairesActions";
import axios from "axios";

function ActivityDomain(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { interimaire, step } = useSelector(
    state => state.interimairesReducerData
  );
  const [role, setRole] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [distance, setDistance] = useState(50);
  const initialValues = {
    postalCodeSearchZone: 0,
    arrayActivityDomains: []
  };
  const RegistrationSchema = Yup.object().shape({
    postalCodeSearchZone: Yup.number()
      .positive()
      .integer()
      .min(0, intl.formatMessage({ id: "TEXT.DISTANCE.INDICATION" })),
    arrayActivityDomains: Yup.array().min(
      1,
      intl.formatMessage({ id: "TEXT.POSTE.MINIMUM" })
    )
  });
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

  useEffect(() => {
    //api/JobTitle
    let URL = `${process.env.REACT_APP_WEBAPI_URL}api/ActivityDomain`;
    isNullOrEmpty(jobTitles) &&
      axios
        .get(URL)
        .then(res => {
          setJobTitles(res.data);
        })
        .catch(err => console.log(err));
  }, []);

  const handleChangeDistance = (setFieldValue, value) => {
    setDistance(value.value);
    setFieldValue("postalCodeSearchZone", value.value);
  };

  const createOption = (label, value) => ({
    label,
    value
  });

  let formatedRole = jobTitles.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });
  const handleChangeRole = (setFieldValue, values, newValue) => {
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
          values.arrayActivityDomains !== null &&
          !values.arrayActivityDomains.includes(value) &&
          formikEquipment.push(value.value)
        );
      });
    setRole(newArray);
    setFieldValue("arrayActivityDomains", formikEquipment);
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
      <Zoom duration={1000}>
        <div className="card card-custom card-stretch gutter-b mt-10 p-5">
          <div className="p-5 card card-custom bg-primary white font-weight-bolder">
            <div className=" flex-space-between">
              <div className="flex-space-between">
                <i className="flaticon-information icon-xxl mr-5 white" />
                <FormattedMessage id="TEXT.SEARCH.ACTIVITY" />
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
                  postalCodeSearchZone: values.postalCodeSearchZone,
                  arrayActivityDomains: values.arrayActivityDomains
                };
                goToNextStep(newInterimaire, step, dispatch);
                //goToNextStep(dispatch);
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
                  <div className="padding-activity-title">
                    <div className="form-group">
                      <label>
                        <FormattedMessage id="MATCHING.ACTIVITY.DOMAINS" />
                        <span className="asterisk">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-list-alt text-primary"></i>
                          </span>
                        </div>
                        <Select
                          isMulti
                          onChange={e =>
                            handleChangeRole(setFieldValue, values, e)
                          }
                          options={formatedRole}
                          styles={customStyles}
                          value={role}
                          className="col-lg-12 form-control"
                        ></Select>
                      </div>
                    </div>
                    {touched.arrayActivityDomains ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.arrayActivityDomains}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="padding-activity-distance mb-20">
                    <div className="col-xl-12">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MATCHING.TABLE.AREA" />
                        </label>
                        <div className="input-group mt-5">
                          <InputRange
                            formatLabel={value => `${value}km`}
                            step={10}
                            maxValue={1000}
                            minValue={0}
                            value={distance}
                            onChange={value =>
                              handleChangeDistance(setFieldValue, { value })
                            }
                          />
                        </div>
                      </div>
                      {touched.postalCodeSearchZone ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.postalCodeSearchZone}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="submit"
                      className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                      //onClick={() => goToNextStep(dispatch)}
                    >
                      <span>
                        <FormattedMessage id="BUTTON.NEXT" />
                      </span>
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

export default ActivityDomain;
