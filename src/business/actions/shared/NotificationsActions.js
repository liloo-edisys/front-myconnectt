import axios from "axios";
import * as actionTypes from "constants/constants";

export const NOTIFICATIONS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/UserNotification";
export const READ_NOTIFICATIONS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/UserNotification/read";

export const getNotifications = dispatch => {
  axios.get(NOTIFICATIONS_URL).then(res => {
    if (res.data.length !== 0) {
      const notifs = res.data.sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );
      const unread = notifs.filter(notif => !notif.readed).length;
      dispatch({
        type: actionTypes.GET_NOTIFICATIONS,
        payload: {
          notifs: notifs,
          unread: unread
        }
      });
    }
  });
};

export const setNotifRead = (notifId, tenantId, dispatch) => {
  axios
    .post(READ_NOTIFICATIONS_URL, {
      id1: tenantId,
      id2: notifId
    })
    .then(res => {
      dispatch({
        type: actionTypes.SET_NOTIF_READ,
        payload: notifId
      });
    });
};
