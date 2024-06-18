import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getCompanies } from "actions/client/CompaniesActions";
import { searchMission } from "../../../../../../business/actions/client/MissionsActions";
import axios from "axios";
import { FormattedMessage } from "react-intl";

function CompanySelector(props) {
  const dispatch = useDispatch();
  const { selectedAccount, setSelectedAccount, setVacancyTemplates } = props;
  const [tempSelectedAccount, setTempSelectedAccount] = useState(null);
  let { companies } = useSelector(
    state => ({
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
  }, []);

  const saveCompany = () => {
    setSelectedAccount(tempSelectedAccount);
    getVancancyTemplates(tempSelectedAccount.parentId);
    getMissions(tempSelectedAccount.value);
  };

  const getVancancyTemplates = accountID => {
    const VACANCY_TEMPLATE_URL = `${process.env.REACT_APP_WEBAPI_URL}api/VacancyTemplate/SearchTemplates`;
    let body = {
      tenantID: 1,
      accountID: accountID,
      userID: 0
    };
    axios
      .post(VACANCY_TEMPLATE_URL, body)
      .then(res => {
        setVacancyTemplates(res.data.list);
      })
      .catch(err => console.log(err));
  };

  const getMissions = accountID => {
    dispatch(
      searchMission.request({
        tenantID: 1,
        accountID: accountID
      })
    );
  };

  const renderEntrepriseFilter = () => {
    return (
      <div>
        <small className="form-text text-muted">Entreprise</small>
        <Select
          name="accountID"
          options={filteredCompanies}
          value={tempSelectedAccount}
          placeholder="--Entreprise--"
          onChange={e => {
            setTempSelectedAccount(e);
          }}
        ></Select>
      </div>
    );
  };
  return (
    <div style={{ backgroundColor: "white", padding: 50, borderRadius: 5 }}>
      <div style={{ width: "50%", margin: "0 auto" }}>
        {renderEntrepriseFilter()}
        <button className="btn btn-light-primary mt-20" onClick={saveCompany}>
          <FormattedMessage id="BUTTON.NEXT" />
        </button>
      </div>
    </div>
  );
}

export default CompanySelector;
