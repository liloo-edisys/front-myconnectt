import React, { Component, useEffect, useState } from "react";

import { ModalProgressBar } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { shallowEqual, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";

import WorksiteEditForm from "../companiesForms/worksiteEditForm.jsx";

export function WorksiteCreateHeader({ id, companyName }) {
  const { actionsLoading } = useSelector(
    state => ({
      actionsLoading: state.companies.loading
    }),
    shallowEqual
  );
  const intl = useIntl();

  const [title, setTitle] = useState("");
  // Title couting
  useEffect(() => {
    let _title =
      intl.formatMessage({ id: "TITLE.MODIFICATION.OF" }) + companyName;

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

class WorksiteEditModal extends Component {
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
        <WorksiteEditForm
          updateCompany={updateCompany}
          onHide={onHide}
          history={history}
        />
      </Modal>
    );
  }
}

export default WorksiteEditModal;
