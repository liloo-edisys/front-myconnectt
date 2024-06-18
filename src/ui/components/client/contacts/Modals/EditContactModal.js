import React, { Component } from "react";

import { Modal } from "react-bootstrap";
import { useIntl } from "react-intl";

import EditContactForm from "../Forms/EditContactForm";

export function EditContactHeader({ id }) {
  const intl = useIntl(); // intl extracted from useIntl hook

  let title = intl.formatMessage({ id: "MODEL.EDIT.CONTACT.TITLE" });

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">{title}</Modal.Title>
      </Modal.Header>
    </>
  );
}

class EditContactModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { id, show, onHide, history } = this.props;
    return (
      <Modal
        size="lg"
        show={show}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <EditContactHeader id={id} />
        <EditContactForm onHide={onHide} history={history} />
      </Modal>
    );
  }
}

export default EditContactModal;
