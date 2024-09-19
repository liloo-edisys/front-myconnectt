import RootPage from "components/client/interimaires/list/RootPage";
import { connect } from "react-redux";
import { getInterimaireById as getInterimaireAction } from "actions/interimaire/interimairesActions";
import { getApplicantById } from "../actions/client/applicantsActions";

const mapStateToProps = state => ({
  user: state.contacts.user,
  interimaire: state.interimairesReducerData.interimaire
});

const mapDispatchToProps = dispatch => ({
  getInterimaire: id => {
    dispatch(getInterimaireAction.request(id));
  },
  getApplicantById: id => {
    dispatch(getApplicantById.request(id));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RootPage);
