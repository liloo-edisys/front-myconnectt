import { getContactsList as getContactsListActions } from "actions/client/ContactsActions";
import ContactsPage from "components/client/contacts/ContactsPage";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  contacts: state.contacts.contacts
});

const mapDispatchToProps = dispatch => ({
  getContacts: () => {
    dispatch(getContactsListActions.request());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ContactsPage);
