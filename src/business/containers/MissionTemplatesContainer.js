import RootPage from "components/client/templates/list/RootPage";
import { connect } from "react-redux";
import { getTemplate as getTemplateAction } from "actions/client/MissionsActions";

const mapDispatchToProps = dispatch => ({
  getTemplate: id => {
    dispatch(getTemplateAction.request(id));
  }
});

export default connect(mapDispatchToProps)(RootPage);
