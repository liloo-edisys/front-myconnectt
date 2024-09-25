import React, { Component } from "react";

import { Formik, Form } from "formik";
import { connect } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";

import FinalStep from "./FinalStep";
import FormStepFour from "./FormStepFour";
//import FormStepOne from "./FormStepOne";
import FormStepThree from "./FormStepThree";
import FormStepTwo from "./FormStepTwo";
import FormStepFive from "./FormStepFive";
import FormStepSix from "./FormStepSix";

import "../../../../../_metronic/_assets/sass/pages/wizard/wizard-2.scss";
import * as Yup from "yup";
import { deleteFromStorage } from "../../../shared/deleteFromStorage";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import {
  getContractType,
  getJobTitles
} from "../../../../../business/actions/shared/listsActions";
//import { Home } from "../../home";

class ProfileWizzardClass extends Component {
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

  componentDidMount() {
    this.props.getJobTitles();
    this.props.getContractType();
  }

  componentWillUnmount() {
    var result = {};
    for (var type in window.localStorage)
      if (!type.includes("persist")) result[type] = window.localStorage[type];
    for (var item in result) deleteFromStorage(item);
  }
  render() {
    const intl = this.props.intl;
    const TENANTID = +process.env.REACT_APP_TENANT_ID;
    const initialValues = this.props.user && {
      resume: this.props.user.resume || [],
      tenantID: TENANTID,
      tenant: this.props.user.tenant || null,
      isDeleted: this.props.user.isDeleted || null,
      deleteDate: this.props.user.deleteDate || null,
      creationDate: this.props.user.creationDate || null,
      lastModifiedDate: this.props.user.lastModifiedDate || null,
      timestamp: this.props.user.timestamp || null,
      userID: this.props.user.userID || null,
      user: this.props.user.user || null,
      titleTypeID: this.props.user.titleTypeID || 0,
      titleType: this.props.user.titleType || null,
      lastname: !isNullOrEmpty(this.props.user.lastname)
        ? this.props.user.lastname
        : "",
      email: this.props.user.email || null,
      mobilePhoneNumber: this.props.user.mobilePhoneNumber || null,
      homePhoneNumber: this.props.user.homePhoneNumber || null,
      address: this.props.user.address || null,
      additionalAddress: this.props.user.additionalAddress || null,
      birthPlace: this.props.user.birthPlace || null,
      birthDepartment: this.props.user.birthDepartment || null,
      birthDate: this.props.user.birthDate || null,
      socialSecurityNumber: this.props.user.socialSecurityNumber || null,
      missionEncodedEquipments:
        this.props.user.missionEncodedEquipments || null,
      missionArrayEquipments: this.props.user.missionArrayEquipments || [],
      missionEncodedDesiredJobTitles:
        this.props.user.missionEncodedDesiredJobTitles || null,
      arrayActivityDomains: this.props.user.arrayActivityDomains || [],
      applicantEncodedJobMobilities:
        this.props.user.applicantEncodedJobMobilities || null,
      applicantArrayJobMobilities:
        this.props.user.applicantArrayJobMobilities || null,
      applicantEncodedSkills: this.props.user.applicantEncodedSkills || null,
      applicantArraySkills: this.props.user.applicantArraySkills || [],
      vacancyApplications: this.props.user.vacancyApplications || null,
      applicantReferences: this.props.user.applicantReferences || [],
      applicantDocuments: this.props.user.applicantDocuments || [],
      applicantExperiences: this.props.user.applicantExperiences || [],
      nationalityID: this.props.user.nationalityID || null,
      nationality: this.props.user.nationality || null,
      foreignSituation: this.props.user.foreignSituation || 0,
      id: this.props.user.id,
      firstname: !isNullOrEmpty(this.props.user.firstname)
        ? this.props.user.firstname
        : "",
      tenantNumberOfMissions: this.props.user.citenantNumberOfMissionsty || 0,
      accountNumberOfMissions: this.props.user.accountNumberOfMissions || 0,
      city: this.props.user.city || null,
      postalCode: this.props.user.postalCode || null,
      lastJobTitles: this.props.user.lastJobTitles || null,
      experience: this.props.user.experience || null,
      applicantPicture: this.props.user.applicantPicture || null,
      matchingScore: this.props.user.matchingScore || 0,
      matchingColor: this.props.user.matchingColor || 0,
      matchingTenant: this.props.user.matchingTenant || 0,
      maidenName: this.props.user.maidenName || "",
      primaryCurriculumVitaeFilename:
        this.props.user.primaryCurriculumVitaeFilename || null,
      primaryCurriculumVitaeBase64:
        this.props.user.primaryCurriculumVitaeBase64 || null,
      primaryCurriculumVitaeUrl:
        this.props.user.primaryCurriculumVitaeUrl || null,
      hasSms: this.props.user.hasSms ? this.props.user.hasSms : false,
      postalCodeSearchZone: this.props.user.postalCodeSearchZone || 50,
      idCardNumber: this.props.user.idCardNumber || null,
      idCardIssueDate: this.props.user.idCardIssueDate || null,
      idCardExpirationDate: this.props.user.idCardExpirationDate || null,
      bankName: this.props.user.bankName || null,
      iban: this.props.user.iban || null,
      bic: this.props.user.bic || null
    };
    let Schema = Yup.object().shape({
      mobilePhoneNumber: Yup.string().matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      ),
      firstname: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      ),
      lastname: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      ),
      postalCode: Yup.string()
        .required(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }))
        .matches(
          /^[0-9]+$/,
          intl.formatMessage({ id: "MESSAGE.FIELD.NUMBERS.ONLY" })
        )
        .min(5, intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" }))
        .max(5, intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" }))
        .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" })),
      city: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      ),
      address: Yup.string().required(
        intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" })
      )
    });
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.handleSubmit}
        enableReinitialize={true}
        validationSchema={Schema}
        isInitialValid={({ initialValues: values }) =>
          Schema.isValidSync(values)
        }
        render={props => (
          <Form>
            <Switch>
              <Redirect from="/int-profile-edit" exact to="/" />
              {/*<Route
                exact
                path="/"
                component={Home}
              //render={() => <FormStepOne formik={props} {...this.props} />}
              />*/}
              <Route
                path="/int-profile-edit/step-two"
                render={() => <FormStepTwo formik={props} {...this.props} />}
              />
              <Route
                path="/int-profile-edit/step-three"
                render={() => <FormStepThree formik={props} {...this.props} />}
              />
              <Route
                path="/int-profile-edit/step-four"
                render={() => <FormStepFour formik={props} {...this.props} />}
              />
              <Route
                path="/int-profile-edit/step-five"
                render={() => <FormStepFive formik={props} {...this.props} />}
              />
              <Route
                path="/int-profile-edit/step-six"
                render={() => <FormStepSix formik={props} {...this.props} />}
              />
              <Route
                path="/int-profile-edit/final-step"
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
    user: state.interimairesReducerData.interimaire,
    companies: state.companies.companies,
    currentTemplate: state.missionsReducerData.currentTemplate
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // implicitly forwarding arguments
    getJobTitles: () => dispatch(getJobTitles.request()),

    getContractType: () => dispatch(getContractType.request())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileWizzardClass);
