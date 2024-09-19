import React from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { deleteCommercialAgreement } from "../../../../../business/actions/backoffice/commercialAgreementsActions";

export function CommercialAgreementDeleteDialog({
  show,
  onHide,
  history,
  getData
}) {
  const dispatch = useDispatch();
  const { commercialAgreement } = useSelector(
    state => ({
      commercialAgreement:
        state.commercialAgreementsdReducerData.commercialAgreement
    }),
    shallowEqual
  );
  const handleDeleteCommercialAgreement = () => {
    dispatch(
      deleteCommercialAgreement.request(commercialAgreement.id),
      onHide()
    );
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage
            id="TEXT.DELETE.TITLE"
            values={{ name: "accord commercial" }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id="TEXT.DELETE.DESCRIPTION"
            values={{ name: "accord commercial" }}
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
            onClick={handleDeleteCommercialAgreement}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.DELETE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
