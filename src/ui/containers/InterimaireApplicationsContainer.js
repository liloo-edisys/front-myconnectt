import { getInterimaire } from "actions/interimaire/InterimairesActions";
import { getMission as getMissionAction } from "actions/client/MissionsActions";

import InterimaireApplicationsPage from "components/interimaire/missions/applications/InterimaireApplicationsPage";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  user: state.contacts.user,
  interimaire: state.interimairesReducerData.interimaire
});

const mapDispatchToProps = dispatch => ({
  getInterimaire: () => {
    dispatch(getInterimaire.request());
  },
  getMission: id => {
    dispatch(getMissionAction.request(id));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InterimaireApplicationsPage);
