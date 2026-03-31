import React, { useEffect, useState } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import axios from "axios";

function ClientModal(props) {
  const { onHide, activeClient } = props;
  const [activeWorksite, setActiveWorksite] = useState(null);
  useEffect(() => {
    if (activeClient) {
      /*const worksiteId = activeClient.chantierID
        ? activeClient.chantierID
        : activeClient.entrepriseID;*/
      axios
        .get(
          `${process.env.REACT_APP_WEBAPI_URL}api/Account/${activeClient.entrepriseID}`
        )
        .then(res => {
          setActiveWorksite(res.data);
        });
    }
  }, [activeClient]);
  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-80w"
    >
      {activeWorksite && (
        <>
          <Modal.Header closeButton className="pb-0">
            <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between">
              <h1>{activeWorksite.name}</h1>
            </Modal.Title>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Fermer"
              onClick={onHide}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px"
              }}
            >
              <i aria-hidden="true" className="ki ki-close"></i>
            </button>
          </Modal.Header>
          <Modal.Body className="pt-10 py-0 background-gray">
            <div className="mb-5">
              <div>{activeWorksite.companyStatus}</div>
              <div>
                <FormattedMessage id="MODEL.ACCOUNT.SIRET" />:{" "}
                {activeWorksite.siret}
              </div>
            </div>
            <div className="mb-5">
              <div>{activeWorksite.address}</div>
              <div>
                {activeWorksite.postalCode} {activeWorksite.city}
              </div>
            </div>
            <div className="mb-10">
              <div>
                <FormattedMessage id="MODEL.VACANCY.MEETING_PHONE" />:{" "}
                {activeWorksite.phoneNumber &&
                  activeWorksite.phoneNumber.match(/.{1,2}/g).join(" ")}
              </div>
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}

export default ClientModal;
