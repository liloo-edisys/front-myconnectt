import React from "react";
import { setNotifRead } from "../../../business/actions/shared/notificationsActions";
import "./styles.scss";

import { Modal } from "react-bootstrap";

export function UserNotificationPopup(props) {
  const { notif, userDetails, dispatch, closePopup } = props;
  if (!notif.readed) setNotifRead(notif.id, userDetails.tenantID, dispatch);

  return (
    <Modal show={true} onHide={closePopup} className="notifications_modal">
      <div style={{ border: "1px solid #2e63a7", borderRadius: 5 }}>
        <Modal.Header closeButton>
          <Modal.Title>
            <span dangerouslySetInnerHTML={{ __html: notif.title }}></span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span dangerouslySetInnerHTML={{ __html: notif.message }}></span>
        </Modal.Body>
      </div>
    </Modal>
  );
}
