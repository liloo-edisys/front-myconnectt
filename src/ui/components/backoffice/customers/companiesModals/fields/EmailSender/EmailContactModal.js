import React, { Component, useEffect, useState } from "react";

import { ModalProgressBar } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { useIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";

import EmailContactForm from "./EmailContactForm";

export function CompanyCreateHeader({ id }) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const { actionsLoading } = useSelector(
    state => ({
      actionsLoading: state.companies.loading
    }),
    shallowEqual
  );

  const [title, setTitle] = useState("");
  // Title couting
  useEffect(() => {
    let _title = intl.formatMessage({ id: "CONTACT.MODAL.TITLE" });

    setTitle(_title);
    // eslint-disable-next-line
  }, [, actionsLoading]);

  return (
    <>
      {actionsLoading && <ModalProgressBar />}
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">{title}</Modal.Title>
      </Modal.Header>
    </>
  );
}

class EmailContactModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { id, show, onHide, history, handleGetApplicantEmails } = this.props;
    return (
      <Modal
        size="xl"
        show={true}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-lg"
        history={history}
      >
        <CompanyCreateHeader id={id} />
        <EmailContactForm
          onHide={onHide}
          history={history}
          id={id}
          handleGetApplicantEmails={handleGetApplicantEmails}
        />
      </Modal>
    );
  }
}

export default EmailContactModal;
