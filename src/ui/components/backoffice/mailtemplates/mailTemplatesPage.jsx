import React from "react";

import { connect } from "react-redux";

import { MailTemplatesUIProvider } from "./mailTemplatesUIContext.jsx";
import MailTemplatesCard from "./mailTemplatesCard.jsx";

class MailTemplatesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentApplicant: null
    };
  }

  render() {
    const { history } = this.props;

    const extensionsUIEvents = {
      // openProcessDialog: data => {
      //   history.push(`/extensions/process`, data);
      // },
      openExtensionProfileDialog: data => {
        history.push(`/extensions/applicant/${data.applicantID}`, data);
        this.setState({ currentApplicant: data.applicantID });
      }
    };
    return (
      <MailTemplatesUIProvider
        extensionsUIEvents={extensionsUIEvents}
        history={history}
      >
        {/* <Route path={`/extensions/applicant/:id`}>
          {({ history, match }) => (
            <MailTemplateDialog
              show={match != null}
              history={history}
              currentApplicant={this.state.currentApplicant}
              onHide={() => {
                history.push("/extensions");
              }}
            />
          )}
        </Route> */}
        {/* <Route path="/extensions/process">
          {({ history, match }) => (
            <ExtensionValidateDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/extensions");
              }}
            />
          )}
        </Route> */}
        <MailTemplatesCard />
      </MailTemplatesUIProvider>
    );
  }
}

export default connect()(MailTemplatesPage);
