/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import _ from "lodash";
import { injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import MissionWizzardHeader from "./MissionWizzardHeader";
import { getTitlesTypes } from "../../../../business/actions/shared/listsActions";
import { DeleteProfileDialog } from "./profileModals/DeleteProfileDialog";
import { useParams } from "react-router-dom";
import IdentityInformations from "./fields/indentity-informations";
import Experiences from "./fields/experiences";
import Documents from "./fields/documents";
import Matching from "./fields/matching";
import ContractsCard from "./fields/contracts/ContractsCard";
import ApplicationsCard from "./fields/applications/ApplicationsCard";
import EmailsCard from "./fields/emails/EmailsCard";
import {
  getSelectedApplicantById,
  clearSelectedApplicant
} from "../../../../business/actions/backoffice/applicantActions";


function NewApplicant(props) {
  const dispatch = useDispatch();
  const { interimaireId } = useParams();
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const { user, titleTypes, parsed, activeInterimaireLoading } = useSelector(
    state => ({
      user: state.user.user,
      titleTypes: state.lists.titleTypes,
      parsed: state.interimairesReducerData.interimaire,
      activeInterimaireLoading:
        state.accountsReducerData.activeInterimaireLoading
    }),
    shallowEqual
  );
  const [step, setStep] = useState("identity");
  useEffect(() => {
    if (interimaireId) {
      getSelectedApplicantById(interimaireId, dispatch);
    } else {
      clearSelectedApplicant(dispatch);
    }
    dispatch(getTitlesTypes.request());
  }, [dispatch]);

  return (
    <>
      <div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px display_top_menu_profile">
          <MissionWizzardHeader props={props} step={step} setStep={setStep} />
          <DeleteProfileDialog
            show={false}
            id={parsed != null ? parsed.id : 0}
          />
        </div>
        <div className="flex-row-fluid ml-lg-8">
          <div className="card card-custom">
            <div className="card-body p-0">
              <div className="wizard wizard-2">
                {activeInterimaireLoading ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: 20,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%"
                    }}
                  >
                    <div className="spinner spinner-primary mr-10"></div>
                  </div>
                ) : step === "identity" ? (
                  <IdentityInformations />
                ) : step === "experiences" ? (
                  <Experiences />
                ) : step === "documents" ? (
                  <Documents />
                ) : step === "offers" ? (
                  <ApplicationsCard />
                ) : step === "contracts" ? (
                  <ContractsCard />
                ) : step === "emails" ? (
                  <EmailsCard />
                ) : (
                  step === "matching" && <Matching />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="display_bottom_menu_profile">
        <MissionWizzardHeader props={props} step={step} setStep={setStep} />
      </div>
    </>
  );
}

export default injectIntl(NewApplicant);
