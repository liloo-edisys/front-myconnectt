import { getMission as getMissionAction } from "actions/client/missionsActions";

import InterimaireMissionsPage from "components/interimaire/missions/search/InterimaireMissionsPage";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  user: state.contacts.user,
  interimaire: state.interimairesReducerData.interimaire
});

const mapDispatchToProps = dispatch => ({
  getMission: id => {
    dispatch(getMissionAction.request(id));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InterimaireMissionsPage);
