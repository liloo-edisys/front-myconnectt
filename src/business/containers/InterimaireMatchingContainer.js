import { getMission as getMissionAction } from "actions/client/missionsActions";

import InterimaireMatchingPage from "components/interimaire/missions/matching/InterimaireMatchingPage";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  user: state.contacts.user
});

const mapDispatchToProps = dispatch => ({
  getMission: id => {
    dispatch(getMissionAction.request(id));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InterimaireMatchingPage);
