import React from "react";

import { connect } from "react-redux";

import { CommercialAgreementsUIProvider } from "./commercialAgreementsUIContext.jsx";
import CommercialAgreementsCard from "./commercialAgreementsCard.jsx";

class CommercialAgreementsPage extends React.Component {
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
      <CommercialAgreementsUIProvider
        extensionsUIEvents={extensionsUIEvents}
        history={history}
      >
        {/* <Route path={`/extensions/applicant/:id`}>
          {({ history, match }) => (
            <CommercialAgreementsDialog
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
        <CommercialAgreementsCard />
      </CommercialAgreementsUIProvider>
    );
  }
}

export default connect()(CommercialAgreementsPage);
