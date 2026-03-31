import React, { Component } from "react";

import { Modal } from "react-bootstrap";
import { useIntl } from "react-intl";

import InviteContactForm from "../Forms/inviteContactForm.jsx";

export function ContactInviteHeader() {
  const intl = useIntl(); // intl extracted from useIntl hook

  const title = intl.formatMessage({ id: "CONTACTS.INVITE.TITLE" });

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">{title}</Modal.Title>
      </Modal.Header>
    </>
  );
}

class ContactInviteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { show, onHide } = this.props;
    return (
      <Modal
        size="md"
        show={show === "new"}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-md"
      >
        <ContactInviteHeader />
        <InviteContactForm onHide={onHide} />
      </Modal>
    );
  }
}

export default ContactInviteModal;
