import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

// import { CustomerEditDialog } from "./customer-edit-dialog/CustomerEditDialog";
// import { CustomerDeleteDialog } from "./customer-delete-dialog/CustomerDeleteDialog";
// import { CustomersDeleteDialog } from "./customers-delete-dialog/CustomersDeleteDialog";
// import { CustomersUpdateStateDialog } from "./customers-update-status-dialog/CustomersUpdateStateDialog";
import { CompanyDeleteDialog } from "./companiesModals/companyDeleteDialog.jsx";
import CompanyEditModal from "./companiesModals/CompanyEditModal.js";
import WorksiteCreateModal from "./companiesModals/WorksiteCreateModal.js";
import WorksiteEditModal from "./companiesModals/WorksiteEditModal.js";
import WorksitePreviewModal from "./companiesModals/WorkSitePreviewModal.js";
import { CompaniesUIProvider } from "./companiesUIContext.jsx";
import CompanyCard from "./companyCard.jsx";

class CompanyPage extends React.Component {
  componentDidMount() {
    this.props.getCompanies();
    this.props.getInvoiceTypes();
    this.props.getAccountGroups();
    this.props.getPaymentChoices();
  }
  render() {
    const { history, invoiceTypes, accountGroups, paymentChoices } = this.props;
    const companiesUIEvents = {
      newWorksiteButtonClick: data => {
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
      openDeleteCompanyDialog: data => {
        history.push(`/companies/deletecompany`, data);
      }
    };

    const { createCompany, updateCompany } = this.props;

    return (
      <CompaniesUIProvider companiesUIEvents={companiesUIEvents}>
        <Route path="/companies/create-worksite">
          {({ history, match }) => (
            <WorksiteCreateModal
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/companies");
              }}
            />
          )}
        </Route>
        <Route path="/companies/:id/edit">
          {({ history, match }) => (
            <CompanyEditModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              updateCompany={updateCompany}
              onHide={() => {
                history.push("/companies");
              }}
            />
          )}
        </Route>
        <Route path="/companies/:id/edit-worksite">
          {({ history, match }) => (
            <WorksiteEditModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              updateCompany={updateCompany}
              onHide={() => {
                history.push("/companies");
              }}
            />
          )}
        </Route>
        <Route path="/companies/:id/preview">
          {({ history, match }) => (
            <WorksitePreviewModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              onHide={() => {
                history.push("/companies");
              }}
            />
          )}
        </Route>
        <Route path="/companies/deletecompany">
          {({ history, match }) => (
            <CompanyDeleteDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/companies");
              }}
            />
          )}
        </Route>
        <CompanyCard
          createCompany={createCompany}
          companies={this.props.companies}
          invoiceTypes={invoiceTypes}
          accountGroups={accountGroups}
          paymentChoices={paymentChoices}
        />
      </CompaniesUIProvider>
    );
  }
}

export default connect()(CompanyPage);
