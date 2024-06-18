import React from "react";

import { deleteContact } from "actions/client/ContactsActions";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";

export function ContactDeleteDialog({ show, onHide, history }) {
  const dispatch = useDispatch();
  const { state } = history.location;
  const handleDeleteCompany = () => {
    dispatch(deleteContact.request(state.id), onHide());
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage
            id="TEXT.DELETE.TITLE"
            values={{
              name:
                state && state.firstname && state.lastname
                  ? state.firstname.concat(" ", state.lastname)
                  : state && state.email
            }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id="TEXT.DELETE.DESCRIPTION"
            values={{
              name:
                state && state.firstname && state.lastname
                  ? state.firstname.concat(" ", state.lastname)
                  : state && state.email
            }}
          />
        </span>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <> </>
          <button
            type="button"
            onClick={handleDeleteCompany}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.DELETE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
