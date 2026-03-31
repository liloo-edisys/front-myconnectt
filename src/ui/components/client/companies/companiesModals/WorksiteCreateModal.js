import React, { Component, useEffect, useState } from "react";

import { ModalProgressBar } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { useIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";

import WorksiteCreateForm from "../companiesForms/worksiteCreateForm.jsx";

export function WorksiteCreateHeader({ id }) {
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
    let _title = intl.formatMessage({ id: "COMPANIES.ADD.SITE" });

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

class WorksiteCreateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { id, show, onHide, createCompany, history } = this.props;
    return (
      <Modal
        size="lg"
        show={show}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <WorksiteCreateHeader id={id} />
        <WorksiteCreateForm
          createCompany={createCompany}
          history={history}
          onHide={onHide}
        />
      </Modal>
    );
  }
}

export default WorksiteCreateModal;
