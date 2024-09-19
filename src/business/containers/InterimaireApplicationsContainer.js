import { getInterimaire } from "actions/interimaire/interimairesActions";
import { getMission as getMissionAction } from "actions/client/missionsActions";

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
