import React, { useEffect, useState } from "react";

import { declineByApplicant } from "actions/client/ApplicantsActions";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import axios from "axios";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMission } from "../../../../../business/actions/client/MissionsActions";

export function MissionDeclineDialog({ show, onHide, history, row }) {
  const dispatch = useDispatch();
  let { mission, interimaire, userDetails } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      interimaire: state.interimairesReducerData.interimaire,
      userDetails: state.auth.user
    }),
    shallowEqual
  );
  const { id } = useParams();
  const [applicationStep, setApplicationStep] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getMission.request(id));
      if (interimaire) {
        const body = {
          id1: parseInt(id),
          id2: interimaire.id
        };

        const APPLICATION_STATUS_URL =
          process.env.REACT_APP_WEBAPI_URL +
          "api/missionapplication/applicationstatus";
        axios
          .post(APPLICATION_STATUS_URL, body)
          .then(res => setApplicationStep(res.data))
          .catch(err => console.log(err));
      }
    }
  }, [id, interimaire, dispatch]);

  const handleDecline = () => {
    let searchOptions = null;
    if (interimaire.actionZoneStep === 0) {
      searchOptions = {
        isMatchingOnly: false,
        isPropositionsOnly: false,
        isApplicationsOnly: false
      };
    } else if (interimaire.actionZoneStep === 1) {
      searchOptions = {
        isMatchingOnly: true,
        isPropositionsOnly: false,
        isApplicationsOnly: false
      };
    } else if (interimaire.actionZoneStep === 2) {
      searchOptions = {
        isMatchingOnly: false,
        isPropositionsOnly: true,
        isApplicationsOnly: false,
        applicationStatus: [1]
      };
    } else if (interimaire.actionZoneStep === 3) {
      searchOptions = {
        isMatchingOnly: false,
        isPropositionsOnly: false,
        isApplicationsOnly: true,
        ApprovedByApplicant: [2]
      };
    }
    dispatch(
      declineByApplicant.request({ id1: mission.id, id2: interimaire.id }),
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
            id={
              applicationStep === 2
                ? "TEXT.CANCEL.THIS.APPLICATION"
                : "CANDIDATE.DECLINE.TITLE"
            }
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id={
              applicationStep
                ? "CANDIDATE.CANCEL.DESCRIPTION"
                : "CANDIDATE.DECLINE.DESCRIPTION"
            }
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
            onClick={() => handleDecline()}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage
              id={
                applicationStep === 2
                  ? "TEXT.CANCEL.APPLICATION"
                  : "DECLINE.BUTTON"
              }
            />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
