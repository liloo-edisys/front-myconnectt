import React, { useEffect } from "react";

import { declineMatching } from "actions/client/ApplicantsActions";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMission } from "../../../../../business/actions/client/MissionsActions";

export function MatchingDeclineDialog({ show, onHide, history, row }) {
  const dispatch = useDispatch();
  let { mission, interimaire } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      interimaire: state.interimairesReducerData.interimaire
    }),
    shallowEqual
  );
  const { id } = useParams();

  useEffect(() => {
    dispatch(getMission.request(id));
  }, [id]);
  const handleDecline = () => {
    dispatch(
      declineMatching.request({ id1: mission.id, id2: interimaire.id }),
      onHide()
    );
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
            id="MATCHING.DECLINE.TITLE"
            values={{ name: mission && mission.vacancyTitle }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage id="MATCHING.DECLINE.DESCRIPTION" />
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
            onClick={() => handleDecline()}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="TEXT.DECLINE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
