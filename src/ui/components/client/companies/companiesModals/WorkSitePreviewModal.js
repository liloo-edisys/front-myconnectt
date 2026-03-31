import React, { Component } from "react";

import { ModalProgressBar } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { shallowEqual, useSelector } from "react-redux";

import WorkSitePreviewForm from "../companiesForms/workSitePreviewForm.jsx";

export function WorksiteCreateHeader({ id, companyName }) {
  const { actionsLoading } = useSelector(
    state => ({
      actionsLoading: state.companies.loading
    }),
    shallowEqual
  );

  return (
    <>
      {actionsLoading && <ModalProgressBar />}
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {companyName}
        </Modal.Title>
      </Modal.Header>
    </>
  );
}

class WorksitePreviewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { id, show, onHide, updateCompany, history } = this.props;
    const companyName = history.location.state
      ? history.location.state.name
      : "";
    return (
      <Modal
        size="lg"
        show={show}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <WorksiteCreateHeader id={id} companyName={companyName} />
        <WorkSitePreviewForm
          updateCompany={updateCompany}
          onHide={onHide}
          history={history}
        />
      </Modal>
    );
  }
}

export default WorksitePreviewModal;
