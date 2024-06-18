import React from "react";
import {
  deleteNotification,
  setNotifRead
} from "../../../business/actions/shared/NotificationsActions";
import "./styles.scss";

import { Modal, Button } from "react-bootstrap";

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
