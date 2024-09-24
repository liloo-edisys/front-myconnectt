import RootPage from "components/client/templates/list/rootPage.jsx";
import { connect } from "react-redux";
import { getTemplate as getTemplateAction } from "actions/client/missionsActions";

const mapDispatchToProps = dispatch => ({
  getTemplate: id => {
    dispatch(getTemplateAction.request(id));
  }
});

export default connect(mapDispatchToProps)(RootPage);
