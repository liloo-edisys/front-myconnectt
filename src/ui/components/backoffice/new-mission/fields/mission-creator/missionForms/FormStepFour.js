/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";
import _, { isNull } from "lodash";

import { Field, useFormikContext } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
//import { Link } from "react-router-dom";
import Select from "react-select";
import {
  createMission,
  updateMission,
  getHabilitationsList
} from "actions/client/MissionsActions";
import { Input } from "metronic/_partials/controls";
import useLocalStorage from "../../../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import { Redirect } from "react-router";
import { countMatching } from "actions/client/ApplicantsActions";
import isNullOrEmpty from "../../../../../../../utils/isNullOrEmpty";
import moment from "moment";
import TimePicker from "rc-time-picker";
import {
  getDriverLicences,
  getMissionEquipment,
  getMissionReasons
} from "../../../../../../../business/actions/shared/ListsActions";
import { toastr } from "react-redux-toastr";
import { useParams, useHistory, useLocation } from "react-router-dom";

function FormStepFour(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    intl,
    goToThirdStep,
    loading,
    activeLoading,
    setTemplateSelection
  } = props;

  const {
    saveMissionSuccess,
    missionsReasons,
    driverLicenses,
    missionEquipment,
    template,
    newMission,
    isTemplate,
    isDuplicate
  } = useSelector(
    state => ({
      saveMissionSuccess: state.missionsReducerData.saveMissionSuccess,
      missionsReasons: state.lists.missionsReasons,
      driverLicenses: state.lists.driverLicenses,
      missionEquipment: state.lists.missionEquipment,
      template: state.missionsReducerData.mission,
      newMission: state.missionsReducerData.lastCreatedMission,
      isTemplate: !isNullOrEmpty(state.missionsReducerData.currentTemplate),
      isDuplicate: !isNullOrEmpty(state.missionsReducerData.currentDuplicate)
    }),
    shallowEqual
  );
  const [contactName, setContactName] = useState(null);
  const [selectedLicense, setSelectedLicences] = useState([]);
  const [selecteReasons, setSelectedReasons] = useState(null);
  const [selecteVehicules, setSelecteVehicules] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [reasonExtra, setReasonExtra] = useState(null);
  const [hoursInfo, setHoursInfos] = useState("");
  const [firstDay, setFirstDay] = useState(false);
  const [firstDayContact, setFirstDayContact] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [meetingExtra, setMeetingExtra] = useState("");
  const [meetingPostalCode, setMeetingPostalCode] = useState("");
  const [meetingCity, setMeetingCity] = useState("");
  const [endHour, onChangeEndHour] = useState("");
  /*const [contactName, setContactName] = useLocalStorage("contactName", null);

  const [selectedLicense, setSelectedLicences] = useLocalStorage(
    "selectedLicense",
    []
  );
  const [selecteReasons, setSelectedReasons] = useLocalStorage(
    "selecteReasons",
    null
  );
  const [selecteVehicules, setSelecteVehicules] = useLocalStorage(
    "selecteVehicules",
    null
  );
  const [selectedEquipment, setSelectedEquipment] = useLocalStorage(
    "selectedEquipment",
    []
  );
  const [reasonExtra, setReasonExtra] = useLocalStorage("reasonExtra", null);
  const [hoursInfo, setHoursInfos] = useLocalStorage("hoursInfo", "");
  const [firstDay, setFirstDay] = useLocalStorage("firstDay", false);
  const [firstDayContact, setFirstDayContact] = useLocalStorage(
    "firstDayContact",
    ""
  );
  const [contactNumber, setContactNumber] = useLocalStorage(
    "contactNumber",
    ""
  );
  const [meetingPoint, setMeetingPoint] = useLocalStorage("meetingPoint", "");
  const [meetingExtra, setMeetingExtra] = useLocalStorage("meetingExtra", "");
  const [meetingPostalCode, setMeetingPostalCode] = useLocalStorage(
    "meetingPostalCode",
    ""
  );
  const [meetingCity, setMeetingCity] = useLocalStorage("meetingCity", "");
  // const [meetingHour, setMeetingHour] = useLocalStorage("meetingHour", "");
  const [endHour, onChangeEndHour] = useLocalStorage("endHour", null);*/

  const [selectedTags] = useLocalStorage("selectedTags", []);
  const [selectedLanguage] = useLocalStorage("selectedLanguage", []);
  const isTemplateOrDuplicate = () => {
    return isTemplate || isDuplicate ? true : false;
  };
  let date = template && moment(template.missionFirstDayMeetingTime, "HH:mm");
  useEffect(() => {
    if (!missionEquipment) {
      dispatch(getMissionEquipment.request());
    }
    if (missionsReasons) {
      dispatch(getMissionReasons.request());
    }
    if (driverLicenses.length === 0) {
      dispatch(getDriverLicences.request());
    }
    if (props.formik.values.missionContactName) {
      setContactName(props.formik.values.missionContactName);
    }
    setHoursInfos(props.formik.values.mission35HInformation);
    setSelecteVehicules(props.formik.values.missionHasVehicle);
    if (props.formik.values.missionArrayEquipments) {
      let newValue = [...props.formik.values.missionArrayEquipments];
      let newArray = [];
      for (let i = 0; i < newValue.length; i++) {
        const equipmentIndex = missionEquipment.findIndex(
          equipment => equipment.id === newValue[i]
        );
        if (equipmentIndex > -1) {
          newArray.push(
            createOption(
              missionEquipment[equipmentIndex].name,
              missionEquipment[equipmentIndex].id
            )
          );
        }
      }
      setSelectedEquipment(newArray);
    }
    if (props.formik.values.missionReasonID) {
      setSelectedReasons(props.formik.values.missionReasonID);
    }
    if (props.formik.values.missionReasonJustification) {
      setReasonExtra(props.formik.values.missionReasonJustification);
    }
    if (props.formik.values.missionArrayDriverLicenses) {
      let newArray = [];
      props.formik.values.missionArrayDriverLicenses.map(license => {
        let value = driverLicenses.filter(l => l.id === license);
        if (!isNullOrEmpty(value)) {
          newArray.push(
            createOption(
              value[value.length - 1].name,
              value[value.length - 1].id
            )
          );
        }
      });
      setSelectedLicences(newArray);
    }
    if (props.formik.values.missionFirstDayContactName) {
      setFirstDayContact(props.formik.values.missionFirstDayContactName);
    }
    if (props.formik.values.missionFirstDayContactPhone) {
      setContactNumber(props.formik.values.missionFirstDayContactPhone);
    }
    if (props.formik.values.missionFirstDayMeetingTime) {
      onChangeEndHour(
        moment(props.formik.values.missionFirstDayMeetingTime, "HH:mm").toDate()
      );
    }

    if (props.formik.values.missionFirstDayAddress) {
      setMeetingPoint(props.formik.values.missionFirstDayAddress);
    }
    if (props.formik.values.missionFirstDayAdditionalAddress) {
      setMeetingExtra(props.formik.values.missionFirstDayAdditionalAddress);
    }
    if (props.formik.values.missionFirstDayPostalCode) {
      setMeetingPostalCode(props.formik.values.missionFirstDayPostalCode);
    }
    if (props.formik.values.missionFirstDayCity) {
      setMeetingCity(props.formik.values.missionFirstDayCity);
    }
  }, [driverLicenses, missionEquipment]);
  /*useEffect(() => {
    !isNull(reasonExtra) &&
      props.formik.setFieldValue("missionReasonJustification", reasonExtra);
    !isNullOrEmpty(props.formik.values.missionReasonJustification) &&
      !isNull(reasonExtra) &&
      props.formik.setFieldTouched("missionReasonJustification", true);
  }, [reasonExtra]);*/
  useEffect(() => {
    isNullOrEmpty(props.formik.values.missionReasonJustification) &&
      !isNull(reasonExtra) &&
      props.formik.setFieldValue("missionReasonJustification", reasonExtra);

    if (props.formik.values.missionFirstDayMeetingTime === null) {
      props.formik.setFieldValue(
        "missionFirstDayMeetingTime",
        isDuplicate
          ? moment(template.missionFirstDayMeetingTime, "HH:mm").toDate()
          : moment(endHour).format("HH:mm")
      );
      !isNullOrEmpty(props.formik.values.missionFirstDayMeetingTime) &&
        props.formik.setFieldTouched("missionFirstDayMeetingTime", true);
    }
  }, [props.formik.values.missionFirstDayMeetingTime]);
  useEffect(() => {
    if (!_.isEmpty(template)) {
      isNullOrEmpty(endHour) &&
        props.formik.values.missionFirstDayMeetingTime !== null &&
        onChangeEndHour(
          moment(date + " " + template.missionFirstDayMeetingTime)
        );

      isNullOrEmpty(props.formik.values.missionFirstDayMeetingTime) &&
        !isTemplate &&
        !isNullOrEmpty(endHour) &&
        props.formik.setFieldValue(
          "missionFirstDayMeetingTime",
          moment(endHour._d).format("HH:mm")
        );
      !isNullOrEmpty(endHour) &&
        !isTemplate &&
        props.formik.setFieldTouched("missionFirstDayMeetingTime", true);
      isNullOrEmpty(contactName) && setContactName(template.missionContactName);
      isNullOrEmpty(props.formik.values.missionContactName) &&
        props.formik.setFieldValue(
          "missionContactName",
          template.missionContactName
        );
      !isNullOrEmpty(contactName) &&
        props.formik.setFieldTouched("missionContactName", true);
      !isNullOrEmpty(missionsReasons) &&
        props.formik.setFieldTouched("missionReasonID", true);
      isNullOrEmpty(hoursInfo) && setHoursInfos(template.mission35HInformation);
      isNullOrEmpty(props.formik.values.mission35HInformation) &&
        props.formik.setFieldValue(
          "mission35HInformation",
          template.mission35HInformation
        );

      missionEquipment.length &&
        isNullOrEmpty(selectedEquipment) &&
        formatEquipment(template.missionArrayEquipments);
      isNullOrEmpty(props.formik.values.missionArrayEquipments) &&
        props.formik.setFieldValue(
          "missionArrayEquipments",
          template.missionArrayEquipments
        );

      isNullOrEmpty(selecteVehicules) &&
        setSelecteVehicules(template.missionHasVehicle);
      isNullOrEmpty(props.formik.values.missionHasVehicle) &&
        props.formik.setFieldValue(
          "missionHasVehicle",
          template.missionHasVehicle
        );

      !isNullOrEmpty(driverLicenses) &&
        isNullOrEmpty(selectedLicense) &&
        !isNullOrEmpty(template.missionArrayDriverLicenses) &&
        formatLicenses(template.missionArrayDriverLicenses);
      !isNullOrEmpty(template.missionArrayDriverLicenses) &&
        isNullOrEmpty(props.formik.values.missionArrayDriverLicenses) &&
        props.formik.setFieldValue(
          "missionArrayDriverLicenses",
          template.missionArrayDriverLicenses
        );

      selecteReasons === null &&
        template.missionReasonID !== 0 &&
        !isNullOrEmpty(template.missionReasonID) &&
        setSelectedReasons(template.missionReasonID);
      props.formik.values.missionReasonID &&
        template.missionReasonID &&
        props.formik.values.missionReasonID !== template.missionReasonID &&
        props.formik.setFieldValue(
          "missionReasonID",
          parseInt(template.missionReasonID)
        );

      isNull(reasonExtra) &&
        setReasonExtra(template.missionReasonJustification);
      isNullOrEmpty(props.formik.values.missionReasonJustification) &&
        props.formik.setFieldValue(
          "missionReasonJustification",
          template.missionReasonJustification
        );
      !isNullOrEmpty(reasonExtra) &&
        props.formik.setFieldTouched("missionReasonJustification", true);
    }
  }, []);

  useEffect(() => {
    isNullOrEmpty(selecteReasons) &&
      !isNullOrEmpty(template.missionReasonID) &&
      setSelectedReasons(template.missionReasonID);
    !isNullOrEmpty(contactName) &&
      props.formik.setFieldTouched("missionContactName", true);
    !isNullOrEmpty(selecteReasons) &&
      props.formik.setFieldValue("missionReasonID", selecteReasons);
    isNull(reasonExtra) &&
      selecteReasons === 2 &&
      setReasonExtra(intl.formatMessage({ id: "DISPLAY.REPLACEMENT.OF" }));
    selecteReasons === 1 && setReasonExtra(null);
  }, [contactName, selecteReasons]);

  useEffect(() => {
    if (!_.isEmpty(template)) {
      setFirstDayContact(template.missionContactName);
      !isNullOrEmpty(template.missionArrayEquipments) &&
        !isNullOrEmpty(missionEquipment) &&
        formatEquipment(template.missionArrayEquipments);
      !isNullOrEmpty(template.missionArrayDriverLicenses) &&
        !isNullOrEmpty(driverLicenses) &&
        formatLicenses(template.missionArrayDriverLicenses);
      setSelecteVehicules(template.missionHasVehicle);
    }
    dispatch(getMissionReasons.request());
    dispatch(getDriverLicences.request());
    dispatch(getMissionEquipment.request());
    getHabilitationsList(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, newMission]);

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

  const formatEquipment = data => {
    if (missionEquipment.length) {
      let newArray = [];
      !isNullOrEmpty(data) &&
        data.map(eq => {
          let value = missionEquipment.filter(l => l.id === eq);
          if (!isNullOrEmpty(value)) {
            newArray.push(
              createOption(
                value[value.length - 1].name,
                value[value.length - 1].value
              )
            );
          }
        });
      return setSelectedEquipment(newArray);
    }
  };

  const formatLicenses = data => {
    if (driverLicenses.length) {
      let newArray = [];
      data.map(license => {
        let value = driverLicenses.filter(l => l.id === license);
        if (!isNullOrEmpty(value)) {
          newArray.push(
            createOption(
              value[value.length - 1].name,
              value[value.length - 1].id
            )
          );
        }
      });
      setSelectedLicences(newArray);
    }
  };
  const handleChangeEquipment = newValue => {
    let formikEquipment = [];
    let newArray = [...selectedEquipment];
    let difference =
      newValue !== null && selectedEquipment.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedEquipment.filter(x => newValue.includes(x));
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
        return formikEquipment.push(value.value);
      });
    setSelectedEquipment(newArray);
    props.formik.setFieldValue("missionArrayEquipments", formikEquipment);
  };

  const formatFormik = values => {
    let formatedValues = [];
    values.map(value => {
      return formatedValues.push(value.value);
    });
    return formatedValues;
  };

  const handleChangeLicense = newValue => {
    let newArray = [...selectedLicense];
    let difference =
      newValue !== null && selectedLicense.filter(x => !newValue.includes(x));
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedLicense.filter(x => newValue.includes(x));
      newArray = [];
      filteredArray.map(tag => {
        return newArray.push(createOption(tag.label, tag.value));
      });
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value
        )
      );
    }
    setSelectedLicences(newArray);
    props.formik.setFieldValue(
      "missionArrayDriverLicenses",
      formatFormik(newArray)
    );
  };
  const { errors, touched } = useFormikContext();

  const renderReasons = () => {
    return missionsReasons.map((reason, i) => {
      return (
        <div className="d-flex align-items-center">
          <Field
            checked={selecteReasons === reason.id}
            onClick={e => {
              reason.id === 1 && setReasonExtra("");
              setSelectedReasons(reason.id);
              props.formik.setFieldValue(
                "missionReasonID",
                parseInt(reason.id)
              );
            }}
            value={reason.id}
            className="mr-3"
            type="radio"
          ></Field>
          <label className="m-0">{reason.name}</label>
        </div>
      );
    });
  };

  const createOption = (label, value) => ({
    label,
    value
  });
  let formatedLicenses = driverLicenses.map(license => {
    return license && createOption(license.name, license.id);
  });

  let formatedEquipment = missionEquipment.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });

  const handleChangeEndHour = value => {
    onChangeEndHour(value);
    props.formik.setFieldValue(
      "missionFirstDayMeetingTime",
      moment(value._d).format("HH:mm")
    );
  };
  const handleCheckMatchs = () => {
    let data = props.formik.values;
    props.formik &&
      props.formik.values.missionHasVehicle === null &&
      delete data["missionHasVehicle"];
    dispatch(
      countMatching.request({
        ...data
      })
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => handleCheckMatchs(), [
    selectedEquipment,
    selectedLicense,
    selectedTags,
    selectedLanguage
  ]);
  if (saveMissionSuccess === true) {
    return <div>{history.goBack()}</div>;
    //return <Redirect to="/missions" />;
  } else {
    return (
      <div className="card card-custom">
        <div className="card-body p-0">
          <div className="wizard wizard-2">
            <MissionWizzardHeader />
            <div className="wizard-body py-8 px-8">
              <div className="row mx-10">
                <div className="pb-5 width-full">
                  <div className="mission-form mt-10 mb-10 p-0">
                    <h3 className="group-title">
                      <FormattedMessage id="TEXT.MISSIONS_DETAILS" />
                    </h3>
                    <p className="required-desc">
                      <FormattedMessage id="TEXT.REQUIRED_DESC_PART1" />
                      <span className="asterisk">*</span>
                      <FormattedMessage id="TEXT.REQUIRED_DESC_PART2" />
                    </p>
                  </div>

                  <div className="row">
                    <div className="col-xl-4">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.CONTACT_NAME" />
                          <span className="asterisk">*</span>
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl fas fa-user-tie text-primary"></i>
                            </span>
                          </div>
                          <Field
                            component={Input}
                            name="missionContactName"
                            className="col-lg-12 form-control"
                            type="text"
                            placeholder={intl.formatMessage({
                              id: "MODEL.VACANCY.CONTACT_NAME"
                            })}
                            onChange={e => {
                              setContactName(e.target.value);
                              e.persist = () => {};
                              props.formik.setFieldValue(
                                "missionContactName",
                                e.target.value
                              );
                              props.formik.handleChange(e);
                            }}
                            value={contactName}
                          ></Field>
                        </div>
                        {touched.missionContactName &&
                        errors.missionContactName ? (
                          <div className="asterisk">
                            {errors["missionContactName"]}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-xl-8">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.35H" />
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl far fa-clock text-primary"></i>
                            </span>
                          </div>
                          <textarea
                            name="mission35HInformation"
                            className="col-lg-12 form-control lg"
                            type="text"
                            maxLength="210"
                            placeholder={intl.formatMessage({
                              id: "MODEL.VACANCY.35H"
                            })}
                            value={hoursInfo}
                            onChange={e => {
                              setHoursInfos(e.target.value);
                              props.formik.setFieldValue(
                                "mission35HInformation",
                                e.target.value
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-12">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.EQUIPMENT" />
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl far fa-list-alt text-primary"></i>
                            </span>
                          </div>
                          <Select
                            isMulti
                            onChange={e => handleChangeEquipment(e)}
                            options={formatedEquipment}
                            styles={customStyles}
                            value={selectedEquipment}
                            className="col-lg-12 form-control"
                          ></Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-4">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.MOTIF" />
                          <span className="asterisk">*</span>
                        </label>
                        <div className="d-flex flex-row justify-content-between">
                          {renderReasons()}
                        </div>
                        {touched.missionReasonID && errors.missionReasonID ? (
                          <div className="asterisk">
                            {errors["missionReasonID"]}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-xl-8">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.JUSTIFICATION" />
                          <span className="asterisk">*</span>
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl far fa-edit text-primary"></i>
                            </span>
                          </div>
                          <textarea
                            name="missionReasonJustification"
                            className="col-lg-12 form-control md"
                            type="text"
                            maxLength="140"
                            placeholder={intl.formatMessage({
                              id: "MODEL.VACANCY.JUSTIFICATION"
                            })}
                            onChange={e => {
                              setReasonExtra(e.target.value);

                              props.formik.setFieldValue(
                                "missionReasonJustification",
                                e.target.value
                              );
                            }}
                            value={reasonExtra}
                          ></textarea>
                        </div>
                        {touched.missionReasonJustification &&
                        errors.missionReasonJustification &&
                        isNull(reasonExtra) ? (
                          <div className="asterisk">
                            {errors["missionReasonJustification"]}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-xl-4">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.VEHICLE" />
                          <span className="asterisk">*</span>
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl fas fa-car-side text-primary"></i>
                            </span>
                          </div>
                          <select
                            name="missionRemunerationItems"
                            className="col-lg-12 form-control"
                            type="text"
                            placeholder={intl.formatMessage({
                              id: "MODEL.VACANCY.VEHICLE"
                            })}
                            value={selecteVehicules}
                            onChange={e => {
                              setSelecteVehicules(e.target.value);
                              props.formik.setFieldValue(
                                "missionHasVehicle",
                                e.target.value === "true" ? true : false
                              );
                            }}
                          >
                            <option
                              key="null"
                              label="Veuillez choisir une valeur"
                              value={null}
                            >
                              <FormattedMessage id="TEXT.YES" />
                            </option>
                            <option key="yes" label="oui" value={true}>
                              <FormattedMessage id="TEXT.YES" />
                            </option>
                            <option key="no" label="non" value={false}>
                              <FormattedMessage id="TEXT.NO" />
                            </option>
                            ;
                          </select>
                        </div>
                        {touched.missionHasVehicle &&
                        errors.missionHasVehicle ? (
                          <div className="asterisk">
                            {errors["missionHasVehicle"]}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-xl-8">
                      <div className="form-group">
                        <label>
                          <FormattedMessage id="MODEL.VACANCY.DRIVERLICENCE" />
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-xl far fa-id-card text-primary"></i>
                            </span>
                          </div>
                          <Select
                            isMulti
                            onChange={e => handleChangeLicense(e)}
                            options={formatedLicenses}
                            styles={customStyles}
                            value={selectedLicense}
                            className="col-lg-12 form-control"
                          ></Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mission-form mt-10 p-0 d-flex flex-row align-items-center mb-10">
                    {!firstDay ? (
                      <i className="ki ki-plus icon-md extra-remuneration"></i>
                    ) : (
                      <i className="ki ki-minus icon-md extra-remuneration"></i>
                    )}
                    <p
                      className="extra-remuneration"
                      onClick={() => setFirstDay(!firstDay)}
                    >
                      <FormattedMessage id="TEXT.FIRST_DAY_INFORMATION" />
                    </p>
                  </div>

                  {firstDay && (
                    <div>
                      <div className="row">
                        <div className="col-xl-4">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.VACANCY.MEETING_CONTACT" />
                              <span className="asterisk">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl fas fa-user-tie text-primary"></i>
                                </span>
                              </div>
                              <input
                                name="missionFirstDayContactName"
                                className="col-lg-12 form-control"
                                type="text"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.VACANCY.MEETING_CONTACT"
                                })}
                                onChange={e => {
                                  props.formik.setFieldValue(
                                    "missionFirstDayContactName",
                                    e.target.value
                                  );
                                  setFirstDayContact(e.target.value);
                                }}
                                value={firstDayContact}
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-4">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.VACANCY.MEETING_PHONE" />
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl fas fa-mobile-alt text-primary"></i>
                                </span>
                              </div>
                              <input
                                name="missionFirstDayContactPhone"
                                className="col-lg-12 form-control"
                                type="text"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.VACANCY.MEETING_PHONE"
                                })}
                                onChange={e => {
                                  props.formik.setFieldValue(
                                    "missionFirstDayContactPhone",
                                    e.target.value
                                  );
                                  setContactNumber(e.target.value);
                                }}
                                value={contactNumber}
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-4">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.VACANCY.MEETING_HOUR" />
                              <span className="asterisk">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl far fa-clock text-primary"></i>
                                </span>
                              </div>
                              <TimePicker
                                showSecond={false}
                                className="col-lg-12 form-control"
                                style={{ border: "none" }}
                                value={
                                  !isNullOrEmpty(endHour)
                                    ? moment(endHour)
                                    : null
                                }
                                onChange={e => {
                                  handleChangeEndHour(e);
                                  onChangeEndHour(e);
                                }}
                                minuteStep={5}
                                clearIcon={false}
                                onBlur={props.formik.handleBlur}
                                name="missionFirstDayMeetingTime"
                                addon={panel => (
                                  <button
                                    type="button"
                                    className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-5 py-1 my-3 mx-4"
                                    onClick={() => panel.close()}
                                  >
                                    <FormattedMessage id="BUTTON.VALIDATE" />
                                  </button>
                                )}
                              ></TimePicker>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xl-3">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.VACANCY.MEETING_PLACE" />
                              <span className="asterisk">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl far fa-map text-primary"></i>
                                </span>
                              </div>
                              <input
                                name="missionFirstDayAddress"
                                className="col-lg-12 form-control"
                                type="text"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.VACANCY.MEETING_PLACE"
                                })}
                                onChange={e => {
                                  props.formik.setFieldValue(
                                    "missionFirstDayAddress",
                                    e.target.value
                                  );
                                  setMeetingPoint(e.target.value);
                                }}
                                value={meetingPoint}
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.ACCOUNT.ADDITIONALADDRESS" />
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl far fa-map text-primary"></i>
                                </span>
                              </div>
                              <input
                                name="missionFirstDayAdditionalAddress"
                                className="col-lg-12 form-control"
                                type="text"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.ACCOUNT.ADDITIONALADDRESS"
                                })}
                                onChange={e => {
                                  props.formik.setFieldValue(
                                    "missionFirstDayAdditionalAddress",
                                    e.target.value
                                  );
                                  setMeetingExtra(e.target.value);
                                }}
                                value={meetingExtra}
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3">
                          <div className="form-group">
                            <label>
                              <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                              <span className="asterisk">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-xl fas fa-map-marker-alt text-primary"></i>
                                </span>
                              </div>
                              <input
                                name="missionFirstDayPostalCode"
                                className="col-lg-12 form-control"
                                type="text"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.ACCOUNT.POSTALCODE"
                                })}
                                onChange={e => {
                                  props.formik.setFieldValue(
                                    "missionFirstDayPostalCode",
                                    e.target.value
                                  );
                                  setMeetingPostalCode(e.target.value);
                                }}
                                value={meetingPostalCode}
                              ></input>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3">
                          <div className="form-group">
                            <label>
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
                                name="missionFirstDayCity"
                                className="col-lg-12 form-control"
                                type="text"
                                placeholder={intl.formatMessage({
                                  id: "MODEL.ACCOUNT.CITY"
                                })}
                                onChange={e => {
                                  props.formik.setFieldValue(
                                    "missionFirstDayCity",
                                    e.target.value
                                  );
                                  setMeetingCity(e.target.value);
                                }}
                                value={meetingCity}
                              ></input>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between border-top mt-5 pt-10">
                    <div className="mr-2">
                      <button
                        type="button"
                        className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={goToThirdStep}
                      >
                        <FormattedMessage id="BUTTON.BACK" />
                      </button>
                    </div>
                    <div>
                      {id ? (
                        <button
                          onClick={() => {
                            activeLoading();
                            if (
                              !errors.missionContactName &&
                              !errors.missionHasVehicle &&
                              !errors.missionReasonJustification &&
                              !errors.missionReasonID
                            ) {
                              props.formik.values.missionRemunerationItems.forEach(
                                item => {
                                  delete item["id"];
                                }
                              );
                              dispatch(
                                updateMission.request({
                                  ...props.formik.values,
                                  MissionIsValidated: false,
                                  IsCreateTemplate: true
                                })
                              );
                              setTemplateSelection(null);
                            } else {
                              toastr.error(
                                intl.formatMessage({
                                  id: "VALIDATION.REQUIRED_FIELDS.TITLE"
                                }),
                                intl.formatMessage({
                                  id: "VALIDATION.REQUIRED_FIELDS.DESC"
                                })
                              );
                            }
                            props.formik.setFieldTouched(
                              "missionContactName",
                              true
                            );
                            props.formik.setFieldTouched(
                              "missionReasonID",
                              true
                            );
                            props.formik.setFieldTouched(
                              "missionReasonJustification",
                              true
                            );
                          }}
                          type="submit"
                          className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        >
                          <FormattedMessage id="BUTTON.SAVE" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            activeLoading();
                            delete props.formik.values["id"];
                            if (
                              !errors.missionContactName &&
                              !errors.missionHasVehicle &&
                              !errors.missionReasonJustification &&
                              !errors.missionReasonID
                            ) {
                              props.formik.values.missionRemunerationItems.forEach(
                                item => {
                                  delete item["id"];
                                }
                              );
                              dispatch(
                                createMission.request({
                                  ...props.formik.values,
                                  saveMission: true
                                })
                              );
                              setTemplateSelection(null);
                            } else {
                              toastr.error(
                                intl.formatMessage({
                                  id: "VALIDATION.REQUIRED_FIELDS.TITLE"
                                }),
                                intl.formatMessage({
                                  id: "VALIDATION.REQUIRED_FIELDS.DESC"
                                })
                              );

                              props.formik.setFieldTouched(
                                "missionContactName",
                                true
                              );
                              props.formik.setFieldTouched(
                                "missionReasonID",
                                true
                              );
                              props.formik.setFieldTouched(
                                "missionHasVehicle",
                                true
                              );
                              props.formik.setFieldTouched(
                                "missionReasonJustification",
                                true
                              );
                            }
                          }}
                          type="submit"
                          className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        >
                          <FormattedMessage id="BUTTON.SAVE" />
                          {loading && (
                            <span className="ml-3 spinner spinner-white"></span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(FormStepFour);
