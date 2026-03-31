import React, { Component } from "react";

import { Modal } from "react-bootstrap";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import CreateForm from "./CreateForm";

class CreateDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { show, onHide, history } = this.props;
    const model = history.location.state;
    return (
      <Modal
        size="xl"
        show={show}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {model ? (
              <FormattedMessage
                id="TEXT.EDIT.TITLE"
                values={{
                  name:
                    model && model.vacancyTemplateName
                      ? model.vacancyTemplateName
                      : ""
                }}
              />
            ) : (
              <FormattedMessage
                id="TEXT.CREATE.TITLE"
                values={{
                  name:
                    model && model.vacancyTemplateName
                      ? model.vacancyTemplateName
                      : ""
                }}
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <CreateForm onHide={onHide} history={history} />
      </Modal>
    );
  }
}

export default injectIntl(connect()(CreateDialog));
