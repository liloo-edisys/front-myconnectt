import React, { useEffect } from "react";

import { checkFields } from "actions/client/companiesActions";

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Route } from "react-router-dom";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

import CompanyEditModal from "../../companies/companiesModals/companyEditModal.jsx";
import MissionFormType from "../MissionFormType";
import { FormattedMessage, useIntl } from "react-intl";
import { deleteFromStorage } from "../../../shared/deleteFromStorage";
import {
  getEducationLevels,
  getJobTitles,
  getLanguages,
  getJobTags,
  getJobSkills,
  getMissionExperiences,
  getDriverLicences,
  getMissionEquipment,
  getMissionReasons
} from "../../../../../business/actions/shared/listsActions";
import { getHabilitationsList } from "actions/client/missionsActions";
import { resetMatching } from "../../../../../business/actions/client/applicantsActions";
const MissionPage = ({ history }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const deleteItems = () => {
    var result = {};
    for (var type in window.localStorage)
      if (!type.includes("persist")) result[type] = window.localStorage[type];
    for (var item in result) deleteFromStorage(item);
  };
  const { isChecked, currentWorksite, jobSkills, companies } = useSelector(
    state => ({
      isChecked: state.companies.checked,
      currentWorksite: state.auth.user.accountID,
      jobSkills: state.lists.jobSkills,
      companies: state.companies.companies
    }),
    shallowEqual
  );
  useEffect(() => {
    dispatch(checkFields.request());
    deleteItems();
  }, [dispatch]);
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(getJobTitles.request());
    dispatch(getEducationLevels.request());
    dispatch(getLanguages.request());
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    dispatch(getJobTags.request());
    dispatch(getMissionExperiences.request());
    dispatch(getMissionReasons.request());
    dispatch(getDriverLicences.request());
    dispatch(getMissionEquipment.request());
    dispatch(resetMatching.request());
    getHabilitationsList(dispatch);
  }, []);
  let currentSite = companies.filter(
    worksite => worksite.id === currentWorksite
  );
  const openWorksiteEdit = (id, data) => {
    history.push(`/mission/${currentWorksite}/edit`, currentSite[0]);
    return toastr.warning(
      intl.formatMessage({ id: "MESSAGE.FILL.COMPANY.INFOS" })
    );
  };
  return (
    <>
      <div
        className="alert alert-custom alert-white alert-shadow fade show gutter-b ribbon ribbon-top ribbon-ver"
        role="alert"
      >
        <div className="ribbon-target bg-info ribbon-right">
          <i className="fa fa-star text-white"></i>
        </div>
        <div className="alert-icon">
          <span className="svg-icon svg-icon-info svg-icon-xl">
            <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}></SVG>
          </span>
        </div>
        <h2 className="font-weight-bolder text-dark">
          <FormattedMessage id="MISSION.CREATE.NEW.BUTTON" />
        </h2>
      </div>
      <Route path="/mission/:id/edit">
        {({ history, match }) => (
          <CompanyEditModal
            show={match != null}
            id={match && match.params.id}
            history={history}
            onHide={() => {
              history.goBack();
              dispatch(checkFields.request());
            }}
          />
        )}
      </Route>

      <MissionFormType
        isChecked={isChecked}
        CompanyEditModal={openWorksiteEdit}
        history={history}
      />
    </>
  );
};

export default MissionPage;
