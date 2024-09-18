import {
  getAccountMissions as getAccountMissionsAction,
  getUserMissions as getUserMissionsAction,
  getMission as getMissionAction,
  resetMission
} from "actions/client/MissionsActions";

import MissionsPage from "components/client/missions/missionlist/MissionsPage";
import { connect } from "react-redux";
import { clearFormattedCV } from "../../business/actions/client/ApplicantsActions";

const tenantID = +process.env.REACT_APP_TENANT_ID;

const mapStateToProps = state => ({
  missions: state.missionsReducerData.missions.list,
  user: state.contacts.user
});

const mapDispatchToProps = dispatch => ({
  getAccountMissions: () => {
    dispatch(getAccountMissionsAction.request({ tenantID: tenantID }));
  },
  getUserMissions: () => {
    dispatch(getUserMissionsAction.request({ tenantID: tenantID }));
  },
  getMission: id => {
    dispatch(getMissionAction.request(id));
  },
  resetMission: () => {
    dispatch(resetMission.request());
  },
  resetResume: () => {
    dispatch(clearFormattedCV.request());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MissionsPage);
