import React, { useState, useEffect } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { Formik, Form } from "formik";
import { useSelector, useDispatch } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { DatePickerField } from "metronic/_partials/controls";
import moment from "moment";
import * as Yup from "yup";
import { updateInterimaireIdentity } from "../../../../../../../../business/actions/interimaire/interimairesActions";
import { getHabilitationsList } from "actions/client/missionsActions";

function HabilitationInformations(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    hideModal,
    formStep,
    vitalCardData,
    setFormStep,
    rectoBase64
  } = props;
  const {
    interimaire,
    updateInterimaireIdentityLoading,
    habilitations
  } = useSelector(state => ({
    updateInterimaireIdentityLoading:
      state.interimairesReducerData.updateInterimaireIdentityLoading,
    interimaire: state.interimairesReducerData.interimaire,
    habilitations: state.missionsReducerData.habilitations
  }));
  const [selectedHabilitations, setSelectedHabilitations] = useState(null);
  const [isExpirationDateRequired, setIsExpirationDateRequired] = useState(
    false
  );

  const initialValuesIdentityData = vitalCardData;

  const IdentityDataSchema = Yup.object().shape({
    habilitationsList: Yup.array().min(
      1,
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  const IdentityDataSchemaWithDate = Yup.object().shape({
    habilitationsList: Yup.array().min(
      1,
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    habilitationStartDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    habilitationEndDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
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

  const formatFormik = values => {
    let formatedValues = [];
    values !== null &&
      values.map(value => {
        return formatedValues.push(value.value);
      });
    return formatedValues;
  };

  const createOption = (label, value, startDateRequired, endDateRequired) => {
    return {
      label,
      value,
      startDateRequired,
      endDateRequired
    };
  };

  let formattedHabilitations = habilitations.map(habilitation => {
    return (
      habilitation &&
      createOption(
        habilitation.name,
        habilitation.id,
        habilitation.startDateRequired,
        habilitation.endDateRequired
      )
    );
  });

  const closeVitalCardInformationsModal = () => {
    hideModal();
    setFormStep("selector");
  };

  const onApplicantStartDate = (date, setFieldValue) => {
    if (date === "Invalid date") {
      setFieldValue("habilitationStartDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("habilitationStartDate", newDate);
    }
  };

  const onApplicantEndDate = (date, setFieldValue) => {
    if (date === "Invalid date") {
      setFieldValue("habilitationEndDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("habilitationEndDate", newDate);
    }
  };

  useEffect(() => {
    if (habilitations.length <= 0) {
      getHabilitationsList(dispatch);
    }
  }, [habilitations, dispatch]);

  const handleChangeHabilitations = (newValue, setFieldValue) => {
    let newArray =
      selectedHabilitations !== null ? [...selectedHabilitations] : [];
    let difference =
      newValue !== null &&
      selectedHabilitations !== null &&
      selectedHabilitations.filter(x => !newValue.includes(x)); // calculates diff
    if (!difference.length && newValue === null) {
      newArray = [];
    } else if (difference.length) {
      let filteredArray = selectedHabilitations.filter(x =>
        newValue.includes(x)
      );
      newArray = [];

      filteredArray.map(tag =>
        newArray.push(
          createOption(
            tag.label,
            tag.value,
            tag.startDateRequired,
            tag.endDateRequired
          )
        )
      );
    } else {
      newArray.push(
        createOption(
          newValue[newValue.length - 1].label,
          newValue[newValue.length - 1].value,
          newValue[newValue.length - 1].startDateRequired,
          newValue[newValue.length - 1].endDateRequired
        )
      );
    }

    for (let i = 0; i < newArray.length; i++) {
      if (newArray[i].startDateRequired || newArray[i].endDateRequired) {
        setIsExpirationDateRequired(true);
        break;
      }
    }

    setSelectedHabilitations(newArray);
    setFieldValue("habilitationsList", newArray);
  };

  return (
    <Modal
      size="lg"
      show={formStep === "informations"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.CHECK.HABILITATIONS" />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesIdentityData}
        validationSchema={
          isExpirationDateRequired
            ? IdentityDataSchemaWithDate
            : IdentityDataSchema
        }
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          const newInterimaire = interimaire;
          const formattedHabilitationsList = values.habilitationsList.map(
            habilitation => ({
              name: habilitation.label,
              id: habilitation.value
            })
          );
          let imageArray = [];
          if (isExpirationDateRequired) {
            imageArray = [
              {
                documentType: 13,
                applicantID: interimaire.id,
                tenantID: +process.env.REACT_APP_TENANT_ID,
                document: rectoBase64,
                fileName: "HabilitationTest",
                expirationDate: values.habilitationEndDate,
                issueDate: values.habilitationStartDate,
                habilitations: formattedHabilitationsList
              }
            ];
          } else {
            imageArray = [
              {
                documentType: 13,
                applicantID: interimaire.id,
                tenantID: +process.env.REACT_APP_TENANT_ID,
                document: rectoBase64,
                fileName: "HabilitationTest",
                habilitations: formattedHabilitationsList
              }
            ];
          }
          updateInterimaireIdentity(newInterimaire, imageArray, dispatch).then(
            () => {
              setFormStep("selector");
              hideModal();
            }
          );
        }}
      >
        {({ values, touched, errors, status, handleSubmit, setFieldValue }) => (
          <Form
            id="kt_login_signin_form"
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            onSubmit={handleSubmit}
          >
            <Modal.Body>
              <div className="my-10">
                <div className="mb-10">
                  <div className="form-group">
                    <label>
                      <FormattedMessage id="TEXT.HABILITATIONS" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <CreatableSelect
                        isMulti
                        onChange={e =>
                          handleChangeHabilitations(e, setFieldValue)
                        }
                        options={formattedHabilitations}
                        name="habilitationsList"
                        styles={customStyles}
                        className="col-lg-12 form-control"
                        value={selectedHabilitations}
                      ></CreatableSelect>
                    </div>
                  </div>
                  <div>
                    {touched.habilitationsList && errors.habilitationsList ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.habilitationsList}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                {isExpirationDateRequired && (
                  <Row>
                    <Col span={6} className="py-2">
                      <label htmlFor="jobTitle">
                        <FormattedMessage id="MODEL.ID.STARTDATE" />
                        <span className="required_asterix">*</span>
                      </label>
                      <DatePickerField
                        component={DatePickerField}
                        iconHeight="36px"
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="habilitationStartDate"
                        maxDate={moment().toDate()}
                        onChange={date =>
                          onApplicantStartDate(date, setFieldValue)
                        }
                        showMonthDropdown
                        showYearDropdown
                        yearItemNumber={9}
                        locale="fr"
                      />
                      {touched.habilitationStartDate &&
                      errors.habilitationStartDate ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.habilitationStartDate}
                          </div>
                        </div>
                      ) : null}
                    </Col>
                    <Col span={6} className="py-2">
                      <label htmlFor="jobTitle">
                        <FormattedMessage id="MODEL.ID.ENDDATE" />
                        <span className="required_asterix">*</span>
                      </label>
                      <DatePickerField
                        component={DatePickerField}
                        iconHeight="36px"
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="habilitationEndDate"
                        minDate={moment().toDate()}
                        onChange={date =>
                          onApplicantEndDate(date, setFieldValue)
                        }
                        showMonthDropdown
                        showYearDropdown
                        yearItemNumber={9}
                        locale="fr"
                      />
                      {touched.habilitationEndDate &&
                      errors.habilitationEndDate ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.habilitationEndDate}
                          </div>
                        </div>
                      ) : null}
                    </Col>
                  </Row>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={closeVitalCardInformationsModal}
              >
                <span>
                  <FormattedMessage id="BUTTON.CANCEL" />
                </span>
              </div>
              <button
                id="kt_login_signin_submit"
                type="submit"
                className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
              >
                <span>
                  <FormattedMessage id="BUTTON.SAVE" />
                </span>
                {updateInterimaireIdentityLoading && (
                  <span className="ml-3 spinner spinner-white"></span>
                )}
              </button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default HabilitationInformations;
