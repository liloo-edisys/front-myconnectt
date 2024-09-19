import { getContactsList as getContactsListActions } from "actions/client/contactsActions";
import ContactsPage from "components/backoffice/contacts/ContactsPage";
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
