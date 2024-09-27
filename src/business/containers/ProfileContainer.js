import { deleteContact as deleteContactActions } from "actions/client/contactsActions";
import { connect } from "react-redux";

import ProfilePage from "../../ui/components/client/Profile/profilePage.jsx";

const mapStateToProps = state => ({
  contact: state.contacts.user
});

const mapDispatchToProps = dispatch => ({
  deleteContact: () => {
    dispatch(deleteContactActions.request());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
