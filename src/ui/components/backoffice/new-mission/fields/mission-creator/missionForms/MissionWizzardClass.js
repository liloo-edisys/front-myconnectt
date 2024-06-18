import React, { Component } from "react";

import { Formik, Form } from "formik";
import { connect } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";

import FinalStep from "./FinalStep";
import FormStepFour from "./FormStepFour";
import FormStepOne from "./FormStepOne";
import FormStepThree from "./FormStepThree";
import FormStepTwo from "./FormStepTwo";
import "../../../../../_metronic/_assets/sass/pages/wizard/wizard-2.scss";
import * as Yup from "yup";

class MissionWizardFormClass extends Component {
  state = {
    submitted: false
  };
  handleSubmit = () => {
    this.setState(
      {
        submitted: true
      },
      () => this.props.history.push("/")
    );
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
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }))
    });
    let currentMission = this.props.companies.length
      ? this.props.companies.filter(
          company => company.id === this.props.user.currentWorkSiteID
        )
      : [];

    let currentWorkiste = currentMission && currentMission[0];

    const TENANTID = +process.env.REACT_APP_TENANT_ID;
    const initialValues = {
      tenantID: TENANTID,
      userID: this.props.userDetails.userID || null,
      accountID: this.props.userDetails.accountID || null,
      jobTitleID: this.props.mission.jobTitleID || null,
      vacancyTitle: "",
      workSiteID: this.props.userDetails.siteID || null,
      address: "",
      additionalAddress: "",
      vacancyBusinessAddressPostalCode:
        this.props.mission.vacancyBusinessAddressPostalCode || null,
      vacancyBusinessAddressCity: "",
      vacancyNumberOfJobs: this.props.mission.vacancyNumberOfJobs || null,
      missionExperienceID: this.props.mission.missionExperienceID || null,
      vacancyApplicationCriteriaArrayRequiredEducationLevels: null,
      vacancyApplicationCriteriaArrayLanguagesWithLevel: null,
      vacancyApplicationCriteriaArrayComputerSkills: null,
      //vacancyApplicationCriteriaArrayJobTags: null,
      vacancyContractualProposedHourlySalary: null,
      VacancyContractualVacancyEmploymentContractTypeStartDate: null,
      VacancyContractualVacancyEmploymentContractTypeEndDate: null,
      missionStartHour: this.props.mission
        ? this.props.mission.missionStartHour
        : null,
      missionEndHour: this.props.mission
        ? this.props.mission.missionEndHour
        : null,
      missionWeeklyWorkHours: null,
      missionContactName: this.props.mission.missionContactName || "",
      missionReasonID: 0,
      missionReasonJustification: null,
      vacancyMissionDescription:
        this.props.mission.vacancyMissionDescription || null,
      missionSalarySupplement:
        this.props.mission.missionSalarySupplement || null,
      mission35HInformation: "",
      missionArrayDriverLicenses: [],
      missionHasVehicle: this.props.mission.length
        ? this.props.mission.missionFirstDayMeetingTime
        : null,
      missionOrderReference: this.props.missionOrderReference || null,
      missionArrayEquipments: [],
      missionRemunerationItems:
        this.props.mission.missionRemunerationItems || [],
      missionFirstDayContactName: "",
      missionFirstDayContactPhone: "",
      missionFirstDayMeetingTime: this.props.mission.length
        ? this.props.mission.missionFirstDayMeetingTime
        : null,
      missionFirstDayAddress: "",
      missionFirstDayAdditionalAddress: "",
      missionFirstDayPostalCode: "",
      missionFirstDayCity: "",
      missionHourlySupplement:
        this.props.mission && this.props.mission.missionHourlySupplement
          ? this.props.mission.missionHourlySupplement
          : null,
      idCardNumber: this.props.mission.idCardNumber || null,
      idCardIssueDate: this.props.mission.idCardIssueDate || null,
      idCardExpirationDate: this.props.mission.idCardExpirationDate || null,
      bankName: this.props.mission.bankName || null,
      iban: this.props.mission.iban || null,
      bic: this.props.mission.bic || null,
      vacancyApplicationCriteriaArrayJobTags:
        this.props.mission.vacancyApplicationCriteriaArrayJobTags || null
    };

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
            <Switch>
              <Redirect
                from="/mission-create"
                exact
                to="/mission-create/step-one"
              />
              <Route
                path="/mission-create/step-one"
                render={() => (
                  <FormStepOne
                    currentWorkiste={currentWorkiste}
                    formik={props}
                    {...this.props}
                  />
                )}
              />
              <Route
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
                exact
                path="/mission/create/final-step"
                render={() => <FinalStep formik={props} {...this.props} />}
              />
            </Switch>
          </Form>
        )}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.contacts.user,
    companies: state.companies.companies,
    currentTemplate: state.missionsReducerData.currentTemplate
  };
};

export default connect(mapStateToProps, {})(MissionWizardFormClass);
