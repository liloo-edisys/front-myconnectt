import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Route, useHistory } from "react-router-dom";

import { CompanyDeleteDialog } from "./companiesModals/CompanyDeleteDialog";
import CompanyEditModal from "./companiesModals/CompanyEditModal";
import WorksiteCreateModal from "./companiesModals/WorksiteCreateModal";
import WorksiteEditModal from "./companiesModals/WorksiteEditModal";
import WorksitePreviewModal from "./companiesModals/WorkSitePreviewModal";
import { CompaniesUIProvider } from "./CompaniesUIContext";
import CompanyCard from "./CompanyCard";

const CompanyPage = ({
  companies,
  createCompany,
  invoiceTypes,
  accountGroups,
  paymentChoices,
  updateCompany,
  getCompanies,
  getInvoiceTypes,
  getAccountGroups,
  getPaymentChoices,
}) => {
  const history = useHistory();

  useEffect(() => {
    getCompanies();
    getInvoiceTypes();
    getAccountGroups();
    getPaymentChoices();
  }, [getCompanies, getInvoiceTypes, getAccountGroups, getPaymentChoices]);

  const companiesUIEvents = {
    newWorksiteButtonClick: (data) => {
      history.push("/companies/create-worksite", data);
    },
    openEditCompanyDialog: (id, data) => {
      history.push(`/companies/${id}/edit`, data);
    },
    openEditWorksiteDialog: (id, data) => {
      history.push(`/companies/${id}/edit-worksite`, data);
    },
    openPreviewWorksiteDialog: (id, data) => {
      history.push(`/companies/${id}/preview`, data);
    },
    openDeleteCompanyDialog: (data) => {
      history.push(`/companies/deletecompany`, data);
    },
  };

  const handleHideModal = () => {
    history.push("/companies");
  };

  return (
    <CompaniesUIProvider companiesUIEvents={companiesUIEvents}>
      <Route path="/companies/create-worksite">
        {({ history: routeHistory, match }) => (
          <WorksiteCreateModal
            show={match != null}
            history={routeHistory}
            onHide={handleHideModal}
          />
        )}
      </Route>

      <Route path="/companies/:id/edit">
        {({ history: routeHistory, match }) => (
          <CompanyEditModal
            show={match != null}
            id={match && match.params.id}
            history={routeHistory}
            updateCompany={updateCompany}
            onHide={handleHideModal}
          />
        )}
      </Route>

      <Route path="/companies/:id/edit-worksite">
        {({ history: routeHistory, match }) => (
          <WorksiteEditModal
            show={match != null}
            id={match && match.params.id}
            history={routeHistory}
            updateCompany={updateCompany}
            onHide={handleHideModal}
          />
        )}
      </Route>

      <Route path="/companies/:id/preview">
        {({ history: routeHistory, match }) => (
          <WorksitePreviewModal
            show={match != null}
            id={match && match.params.id}
            history={routeHistory}
            onHide={handleHideModal}
          />
        )}
      </Route>

      <Route path="/companies/deletecompany">
        {({ history: routeHistory, match }) => (
          <CompanyDeleteDialog
            show={match != null}
            history={routeHistory}
            onHide={handleHideModal}
          />
        )}
      </Route>

      <CompanyCard
        createCompany={createCompany}
        companies={companies}
        invoiceTypes={invoiceTypes}
        accountGroups={accountGroups}
        paymentChoices={paymentChoices}
      />
    </CompaniesUIProvider>
  );
};

export default connect()(CompanyPage);
