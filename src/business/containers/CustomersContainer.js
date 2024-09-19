import { getCompanies as getCustomersActions } from "actions/client/companiesActions";
import {
  getInvoicesTypes as getInvoicesTypesActions,
  getAccountGroups as getAccountGroupsActions
} from "actions/shared/listsActions";
import CustomerPage from "components/backoffice/customers/CustomerPage";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  customers: state.companies.companies,
  invoiceTypes: state.lists.invoiceTypes,
  accountGroups: state.lists.accountGroups,
  paymentChoices: state.lists.paymentChoices,
  isLoading: state.companies.loading
});

const mapDispatchToProps = dispatch => ({
  getCustomers: () => {
    dispatch(getCustomersActions.request());
  },
  getInvoiceTypes: () => {
    dispatch(getInvoicesTypesActions.request());
  },
  getAccountGroups: () => {
    dispatch(getAccountGroupsActions.request());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomerPage);
