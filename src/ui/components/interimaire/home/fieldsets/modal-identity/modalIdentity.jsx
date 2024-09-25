import React from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { goToNextStep } from "../../../../../../business/actions/interimaire/interimairesActions";
import "./styles.scss";

const jobTitles = [
  {
    id: 4,
    isDeleted: null,
    deleteDate: null,
    tenantID: 1,
    creationDate: "2020-09-07T00:00:00",
    lastModifiedDate: "2020-09-07T00:00:00",
    timestamp: "AAAAAAAC+JU=",
    name: "Bâtiments Travaux Publics"
  },
  {
    id: 5,
    isDeleted: null,
    deleteDate: null,
    tenantID: 1,
    creationDate: "2020-09-07T00:00:00",
    lastModifiedDate: "2020-09-07T00:00:00",
    timestamp: "AAAAAAAC+JQ=",
    name: "Commerce"
  }
];

function ModalIdentity(props) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const createOption = (label, value) => ({
    label,
    value
  });

  let formatedRole = jobTitles.map(equipment => {
    return equipment && createOption(equipment.name, equipment.id);
  });

  return (
    <div className="popover show bs-popover-left modal_identity">
      <Modal show={true}>
        <Modal.Header closeButton>
          <Modal.Title>Documents d'identité</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Select
            placeholder={intl.formatMessage({ id: "DOCUMENT.ID.CARD" })}
            isMulti
            options={formatedRole}
            className="col-lg-12"
          ></Select>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-right">
            <button
              onClick={() => goToNextStep(dispatch)}
              className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
            >
              <span>
                <FormattedMessage id="BUTTON.NEXT" />
              </span>
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ModalIdentity;
