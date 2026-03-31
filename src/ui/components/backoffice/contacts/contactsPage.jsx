import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

import ContactsCard from "./contactsCard.jsx";
import { ContactsUIProvider } from "./contactsUIContext.jsx";
import { ContactDeleteDialog } from "./Modals/deleteContactDialog.jsx";
import EditContactModal from "./Modals/editContactModal.jsx";
class ContactsPage extends React.Component {
  /*componentDidMount() {
    this.props.getContacts();
  }*/
  render() {
    const { history, contacts } = this.props;
    const contactsUIEvents = {
      newWorksiteButtonClick: data => {
        history.push("/companies/create-worksite", data);
      },
      openEditContactModal: (id, data) => {
        history.push(`/contacts/${id}/edit`, data);
      },
      openDeleteContactDialog: data => {
        history.push(`/contacts/deletecontact`, data);
      }
    };

    return (
      <ContactsUIProvider contactsUIEvents={contactsUIEvents}>
        <Route path="/contacts/:id/edit">
          {({ history, match }) => (
            <EditContactModal
              show={match != null}
              id={match && match.params.id}
              history={history}
              onHide={() => {
                history.push("/contacts");
              }}
            />
          )}
        </Route>
        <Route path="/contacts/deletecontact">
          {({ history, match }) => (
            <ContactDeleteDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/contacts");
              }}
            />
          )}
        </Route>
        <ContactsCard contacts={contacts} />
      </ContactsUIProvider>
    );
  }
}

export default connect()(ContactsPage);
