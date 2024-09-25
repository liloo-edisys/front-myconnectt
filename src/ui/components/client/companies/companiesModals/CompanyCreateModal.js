import React, { Component, useEffect, useState } from "react";

import { ModalProgressBar } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { useIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";

import CompanyCreateForm from "../companiesForms/companyCreateForm.jsx";

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
    let _title = intl.formatMessage({ id: "COMPANIES.ADD.ACCOUNT" });

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

class CompanyCreateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { id, show, onHide, createCompany } = this.props;
    return (
      <Modal
        size="lg"
        show={show === "new"}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <CompanyCreateHeader id={id} />
        <CompanyCreateForm createCompany={createCompany} onHide={onHide} />
      </Modal>
    );
  }
}

export default CompanyCreateModal;
