import {
  getCompanies as getCompaniesActions,
  createCompany as createCompanyActions,
  updateCompany as updateCompanyActions
} from "actions/client/companiesActions";
import {
  getInvoicesTypes as getInvoicesTypesActions,
  getAccountGroups as getAccountGroupsActions,
  getPaymentChoices as getPaymentChoicesActions
} from "actions/shared/listsActions";
import CompanyPage from "components/client/companies/companyPage.jsx";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  companies: state.companies.companies,
  invoiceTypes: state.lists.invoiceTypes,
  accountGroups: state.lists.accountGroups,
  paymentChoices: state.lists.paymentChoices,
  isLoading: state.companies.loading
});

const mapDispatchToProps = dispatch => ({
  getCompanies: () => {
    dispatch(getCompaniesActions.request());
  },
  getInvoiceTypes: () => {
    dispatch(getInvoicesTypesActions.request());
  },
  getAccountGroups: () => {
    dispatch(getAccountGroupsActions.request());
  },
  getPaymentChoices: () => {
    dispatch(getPaymentChoicesActions.request());
  },
  createCompany: data => {
    dispatch(createCompanyActions.request(data));
  },
  updateCompany: data => {
    dispatch(updateCompanyActions.request(data));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CompanyPage);
