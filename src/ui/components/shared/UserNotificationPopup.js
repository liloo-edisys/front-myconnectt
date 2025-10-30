import React from "react";
import {
  deleteNotification,
  setNotifRead
} from "../../../business/actions/shared/NotificationsActions";
import "./styles.scss";

export function UserNotificationPopup({
  notif,
  userDetails,
  dispatch,
  closePopup
}) {
  if (!notif.readed) setNotifRead(notif.id, userDetails.tenantID, dispatch);

  return (
    <div className="notifications_popup">
      <div className="notification-container">
        <div className="notification-header">
          <div className="notification-title">
            <div className="notification-icon">
              <i className="fas fa-bell"></i>
            </div>
            <span
              dangerouslySetInnerHTML={{
                __html: notif?.subject || notif?.title
              }}
            />
          </div>
          <button
            type="button"
            className="close-button"
            onClick={closePopup}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="notification-body">
          <span
            dangerouslySetInnerHTML={{
              __html: notif?.body || notif?.message
            }}
          />
        </div>
        <div className="notification-progress"></div>
      </div>
    </div>
  );
}
