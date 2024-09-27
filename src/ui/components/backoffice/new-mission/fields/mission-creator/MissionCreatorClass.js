import React, { Component } from "react";

import { Formik, Form } from "formik";
import { connect } from "react-redux";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";

import FormStepFour from "./missionForms/formStepFour.jsx";
import FormStepOne from "./missionForms/formStepOne.jsx";
import FormStepThree from "./missionForms/formStepThree.jsx";
import FormStepTwo from "./missionForms/formStepTwo.jsx";
import "../../../../../../_metronic/_assets/sass/pages/wizard/wizard-2.scss";
import * as Yup from "yup";

class MissionCreatorClass extends Component {
  state = {
    submitted: false,
    step: 1,
    loading: false
  };
  handleSubmit = () => {
    this.setState({
      submitted: true,
      loading: false
    });
  };

  activeLoading = () => {
    this.setState({ loading: true });
  };

  goToFirstStep = () => {
    this.setState({ step: 1 });
  };

  goToSecondStep = () => {
    this.setState({ step: 2 });
  };

  goToThirdStep = () => {
    this.setState({ step: 3 });
  };

  goToFourthStep = () => {
    this.setState({ step: 4 });
  };

  goToFinalStep = () => {
    this.setState({ step: 5 });
  };
  render() {
    const { intl } = this.props;
    let Step1Schema = Yup.object().shape({
      jobTitleID: Yup.number()
        .required(intl.formatMessage({ id: "MESSAGE.JOBNAME.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      missionContactName: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      ),
      vacancyMissionDescription: Yup.string()
        .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      vacancyNumberOfJobs: Yup.number()
        .min(1, "Ce champ doit être supérieur ou égal à 1.")
        .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),

      vacancyContractualProposedHourlySalary: Yup.number()
        .min(10.85, intl.formatMessage({ id: "MESSAGE.HOURLY.SALARY.MIN" }))
        .max(99.99, intl.formatMessage({ id: "MESSAGE.HOURLY.SALARY.MAX" }))
        .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      missionStartHour: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      ),
      missionEndHour: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      ),
      missionWeeklyWorkHours: Yup.number()
        .min(1, intl.formatMessage({ id: "MESSAGE.FIELD.MIN.0" }))
        .max(99.99, intl.formatMessage({ id: "MESSAGE.FIELD.MAX.99" }))
        .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      VacancyContractualVacancyEmploymentContractTypeStartDate: Yup.mixed()
        .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      VacancyContractualVacancyEmploymentContractTypeEndDate: Yup.mixed()
        .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      missionReasonID: Yup.number().min(
        1,
        intl.formatMessage({ id: "MESSAGE.SELECT.REASON" })
      ),
      missionHasVehicle: Yup.bool()
        .required(intl.formatMessage({ id: "MESSAGE.FILL.FIELD" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      vacancyBusinessAddressPostalCode: Yup.string()
        .required()
        .matches(
          /^[0-9]+$/,
          intl.formatMessage({ id: "MESSAGE.FIELD.NUMBERS.ONLY" })
        )
        .min(5, intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" }))
        .max(5, intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" })),
      missionReasonJustification: Yup.string()
        .required(intl.formatMessage({ id: "MESSAGE.FILL.FIELD" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      vacancyContractualVacancyEmploymentContractTypeStartDate: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })
      ),
      vacancyContractualVacancyEmploymentContractTypeEndDate: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })
      )
    });
    let currentMission = this.props.companies.length
      ? this.props.companies.filter(
          company => company.id === this.props.user.currentWorkSiteID
        )
      : [];

    let currentWorkiste = currentMission && currentMission[0];

    const TENANTID = +process.env.REACT_APP_TENANT_ID;
    let defaultValues = {
      tenantID: TENANTID,
      userID: null,
      accountID: this.props.selectedAccount.parentId,
      jobTitleID: null,
      vacancyTitle: "",
      workSiteID: this.props.selectedAccount.value,
      address: "",
      additionalAddress: "",
      vacancyBusinessAddressPostalCode: null,
      vacancyBusinessAddressCity: "",
      vacancyNumberOfJobs: null,
      missionExperienceID: null,
      vacancyApplicationCriteriaArrayRequiredEducationLevels: null,
      vacancyApplicationCriteriaArrayLanguagesWithLevel: null,
      vacancyApplicationCriteriaArrayComputerSkills: null,
      //vacancyApplicationCriteriaArrayJobTags: null,
      vacancyContractualProposedHourlySalary: null,
      vacancyContractualVacancyEmploymentContractTypeStartDate: "",
      vacancyContractualVacancyEmploymentContractTypeEndDate: "",
      missionStartHour: null,
      missionEndHour: null,
      missionWeeklyWorkHours: null,
      missionContactName: "",
      missionReasonID: 0,
      missionReasonJustification: null,
      vacancyMissionDescription: null,
      missionSalarySupplement: null,
      mission35HInformation: "",
      missionArrayDriverLicenses: [],
      missionHasVehicle: null,
      missionOrderReference: null,
      missionArrayEquipments: [],
      missionRemunerationItems: [],
      missionFirstDayContactName: "",
      missionFirstDayContactPhone: "",
      missionFirstDayMeetingTime: null,
      missionFirstDayAddress: "",
      missionFirstDayAdditionalAddress: "",
      missionFirstDayPostalCode: "",
      missionFirstDayCity: "",
      missionHourlySupplement: null,
      idCardNumber: null,
      idCardIssueDate: null,
      idCardExpirationDate: null,
      bankName: null,
      iban: null,
      bic: null,
      vacancyApplicationCriteriaArrayJobTags: null
    };
    const initialValues = this.props.templateSelection
      ? { ...defaultValues, ...this.props.templateSelection }
      : defaultValues;

    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.handleSubmit}
        validationSchema={Step1Schema}
        isInitialValid={({ initialValues: values }) =>
          Step1Schema.isValidSync(values)
        }
        render={props => (
          <Form>
            {this.state.step === 1 ? (
              <FormStepOne
                accountID={this.props.selectedAccount.parentId}
                currentWorkiste={currentWorkiste}
                goToSecondStep={this.goToSecondStep}
                goBackToSelector={this.props.goBackToSelector}
                formik={props}
                {...this.props}
              />
            ) : this.state.step === 2 ? (
              <FormStepTwo
                formik={props}
                {...this.props}
                goToFirstStep={this.goToFirstStep}
                goToThirdStep={this.goToThirdStep}
              />
            ) : this.state.step === 3 ? (
              <FormStepThree
                formik={props}
                {...this.props}
                goToSecondStep={this.goToSecondStep}
                goToFourthStep={this.goToFourthStep}
              />
            ) : (
              this.state.step === 4 && (
                <FormStepFour
                  formik={props}
                  {...this.props}
                  goToThirdStep={this.goToThirdStep}
                  goToFinalStep={this.goToFinalStep}
                  activeLoading={this.activeLoading}
                  setTemplateSelection={this.props.setTemplateSelection}
                  loading={this.state.loading}
                />
              )
            )}
            {/*<Route
                path="/mission-create/step-two"
                render={() => <FormStepTwo formik={props} {...this.props} />}
              />
              <Route
                path="/mission-create/step-three"
                render={() => <FormStepThree formik={props} {...this.props} />}
              />
              <Route
                path="/mission-create/step-four"
                render={() => <FormStepFour formik={props} {...this.props} />}
              />
              <Route
                path="/mission-create/final-step"
                render={() => <FinalStep formik={props} {...this.props} />}
              />*/}
          </Form>
        )}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    companies: state.companies.companies,
    currentTemplate: state.missionsReducerData.currentTemplate
  };
};

export default connect(mapStateToProps, {})(MissionCreatorClass);
