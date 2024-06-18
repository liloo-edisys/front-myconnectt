import React, { useEffect } from "react";

import { approveByApplicant } from "actions/client/ApplicantsActions";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMission } from "../../../../../business/actions/client/MissionsActions";
//const TENANTID = process.env.REACT_APP_TENANT_ID;
export function MissionApproveDialog({ show, onHide, history }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  let { mission, interimaire } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      interimaire: state.interimairesReducerData.interimaire
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(getMission.request(id));
  }, [id, dispatch]);

  const handleApprove = () => {
    dispatch(
      approveByApplicant.request({ id1: mission.id, id2: interimaire.id }),
      onHide()
    );
  };

  return (interimaire && !interimaire.hasIDCard) ||
    (interimaire && !interimaire.hasMatching) ||
    (interimaire && !interimaire.hasVitalCard) ? (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="UNCOMPLETE.PROFILE.TITLE" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage id="UNCOMPLETE.PROFILE.DESC" />
          <br />
          <FormattedMessage id="UNCOMPLETE.PROFILE.DESC_1" />
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
            onClick={() => history.push("/int-profile-edit/step-five")}
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="COMPLETE.PROFILE.BUTTON" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  ) : (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage
            id="INTERIMAIRE.APPLY.TITLE"
            values={{ name: mission && mission.vacancyTitle }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id="INTERIMAIRE.APPLY.DESCRIPTION"
            values={{ name: mission && mission.vacancyTitle }}
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
            onClick={() => handleApprove()}
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="TEXT.APPLY" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
