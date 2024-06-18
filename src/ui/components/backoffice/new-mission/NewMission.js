import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import { FormattedMessage } from "react-intl";
import { CompanySelector, TemplateSelector, MissionCreator } from "./fields";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getCompanies } from "actions/client/CompaniesActions";
import axios from "axios";
import moment from "moment";

function NewMission(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [vacancyTemplates, setVacancyTemplates] = useState([]);
  const [templateSelection, setTemplateSelection] = useState(null);
  const { missions, companies } = useSelector(
    state => ({
      missions: state.missionsReducerData.missions.list,
      companies: state.companies.companies
    }),
    shallowEqual
  );
  let filteredCompanies =
    companies != null
      ? companies.length
        ? companies
            .filter(company => company.parentID !== null)
            .map(function(c) {
              return {
                value: c.id,
                label: c.name,
                parentId: c.parentID
              };
            })
        : []
      : [];
  useEffect(() => {
    if (companies.length === 0) {
      dispatch(getCompanies.request());
    }
    if (id) {
      getMissionData();
    }
  }, [id, companies]);
  const getMissionData = () => {
    axios
      .get(process.env.REACT_APP_WEBAPI_URL + "api/Vacancy/" + id)
      .then(res => {
        const companyIndex = filteredCompanies.findIndex(
          company => company.parentId === parseInt(res.data.accountID)
        );
        let selectedTemplate = {
          ...res.data,
          vacancyContractualVacancyEmploymentContractTypeStartDate: moment(
            res.data.vacancyContractualVacancyEmploymentContractTypeStartDate
          ),
          vacancyContractualVacancyEmploymentContractTypeEndDate: moment(
            res.data.vacancyContractualVacancyEmploymentContractTypeEndDate
          )
        };
        setTemplateSelection(selectedTemplate);
        setSelectedTemplate("ok");
        setSelectedAccount(filteredCompanies[companyIndex]);
      })
      .catch(err => console.log(err));
  };

  const goBackToSelector = () => {
    setSelectedAccount(null);
    setSelectedTemplate(null);
    setTemplateSelection(null);
  };

  return (
    <div>
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
      {/*<TemplateSelector
        selectedAccount={selectedAccount}
        setSelectedTemplate={setSelectedTemplate}
      />*/}
      {selectedAccount && selectedTemplate ? (
        <MissionCreator
          selectedAccount={selectedAccount}
          templateSelection={templateSelection}
          goBackToSelector={goBackToSelector}
          setTemplateSelection={setTemplateSelection}
        />
      ) : selectedAccount ? (
        <TemplateSelector
          setSelectedAccount={setSelectedAccount}
          setSelectedTemplate={setSelectedTemplate}
          vacancyTemplates={vacancyTemplates}
          setTemplateSelection={setTemplateSelection}
          missions={missions}
        />
      ) : (
        <CompanySelector
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          setVacancyTemplates={setVacancyTemplates}
        />
      )}
    </div>
  );
}

export default NewMission;
