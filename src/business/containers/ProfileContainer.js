import { deleteContact as deleteContactActions } from "actions/client/ContactsActions";
import { connect } from "react-redux";

import ProfilePage from "../../ui/components/client/Profile/ProfilePage";

const mapStateToProps = state => ({
  contact: state.contacts.user
});

const mapDispatchToProps = dispatch => ({
  deleteContact: () => {
    dispatch(deleteContactActions.request());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
