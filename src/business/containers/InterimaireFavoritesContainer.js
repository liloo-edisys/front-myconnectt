import { getMission as getMissionAction } from "actions/client/missionsActions";

import InterimaireFavoritesPage from "components/interimaire/missions/favorites/interimaireFavoritesPage.jsx";
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
)(InterimaireFavoritesPage);
