import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { DeleteProfileDialog } from "./Modals/deleteProfileDialog.jsx";
import ProfileCard from "./profileCard.jsx";
import { ProfileUIProvider } from "./profileUIContext.jsx";
class ProfilePage extends React.Component {
  render() {
    const { history, contact } = this.props;
    const profileUIEvents = {
      openDeleteProfileDialog: data => {
        history.push(`/profile/deleteprofile`, data);
      }
    };

    return (
      <ProfileUIProvider profileUIEvents={profileUIEvents}>
        <Route path="/profile/deleteprofile">
          {({ history, match }) => (
            <DeleteProfileDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/profile");
              }}
            />
          )}
        </Route>
        <ProfileCard
          contact={contact}
          openDeleteProfileDialog={profileUIEvents.openDeleteProfileDialog}
        />
      </ProfileUIProvider>
    );
  }
}

export default connect()(ProfilePage);
