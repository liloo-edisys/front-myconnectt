import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import SVG from "react-inlinesvg";
import PerfectScrollbar from "react-perfect-scrollbar";
import { FormattedMessage } from "react-intl";
import objectPath from "object-path";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import { toAbsoluteUrl } from "../../../_metronic/_helpers";
import { DropdownTopbarItemToggler } from "../../../_metronic/_partials/dropdowns";
import { useHtmlClassService } from "../../../_metronic/layout/_core/MetronicLayout";
import { UserNotificationPopup } from "./UserNotificationPopup";
import { getNotifications } from "../../../business/actions/shared/NotificationsActions";
import { setSignalRInterimaire } from "../../../business/actions/interimaire/InterimairesActions";
import { setSignalRClient } from "../../../business/actions/client/UserActions";
import { setSignalRBackoffice } from "../../../business/actions/backoffice/UserActions";

export function UserNotificationsDropdownMobile() {
  const dispatch = useDispatch();
  const uiService = useHtmlClassService();
  const [selectedNotif, setSelectedNotif] = useState(null);

  const layoutProps = useMemo(() => {
    return {
      offcanvas:
        objectPath.get(uiService.config, "extras.notifications.layout") ===
        "offcanvas"
    };
  }, [uiService]);

  const { notifs, unread, userDetails, authToken, userType } = useSelector(
    state => ({
      notifs: state.lists.notifs,
      unread: state.lists.unread,
      userDetails: state.auth.user,
      authToken: state.auth.authToken,
      userType: state.auth.user.userType
    }),
    shallowEqual
  );

  useEffect(() => {
    if (userType === 0) {
      setSignalRInterimaire(authToken, dispatch, setSelectedNotif);
      getNotifications(dispatch);
    } else if (userType === 1) {
      setSignalRClient(authToken, dispatch, setSelectedNotif);
      getNotifications(dispatch);
    } else if (userType === 2) {
      setSignalRBackoffice(authToken, dispatch, setSelectedNotif);
      getNotifications(dispatch);
    }
  }, [dispatch, authToken, userType]);

  const closePopup = () => {
    setSelectedNotif(null);
  };

  // console.log(" --- notifs --- ", notifs);

  return (
    <>
      {selectedNotif && (
        <UserNotificationPopup
          notif={selectedNotif}
          userDetails={userDetails}
          dispatch={dispatch}
          closePopup={closePopup}
        />
      )}

      {layoutProps.offcanvas && (
        <div className="topbar-item">
          <div
            className="btn btn-icon btn-lg pulse pulse-primary"
            id="kt_quick_notifications_toggle"
          >
            <span className="svg-icon svg-icon-xl svg-icon-primary">
              <SVG
                src={toAbsoluteUrl(
                  "/media/svg/icons/Communication/Urgent-mail.svg"
                )}
              />
            </span>
            {/* {unread > 0 && (
              <span className="notification-count">
                {unread > 9 ? "9+" : unread}
              </span>
            )} */}
            <span className="pulse-ring"></span>
          </div>
        </div>
      )}

      {userType === 0 && (
        <div
          className="btn btn-icon btn-lg pulse pulse-primary"
          id="kt_quick_notifications_toggle"
        >
          <Link
            to="/favorites"
            className="svg-icon svg-icon-xl svg-icon-primary"
          >
            <SVG src={toAbsoluteUrl("media/svg/icons/General/Star.svg")} />
          </Link>
        </div>
      )}

      <div className="topbar-item">
        <div
          className="btn btn-icon btn-lg pulse pulse-primary"
          id="kt_quick_notifications_toggle"
        >
          <Link to="/contact" className="svg-icon svg-icon-xl svg-icon-primary">
            <SVG
              src={toAbsoluteUrl(
                "/media/svg/icons/Communication/Sending mail.svg"
              )}
            />
          </Link>
        </div>
      </div>

      {!layoutProps.offcanvas && (
        <Dropdown drop="down" alignRight>
          <Dropdown.Toggle
            as={DropdownTopbarItemToggler}
            id="kt_quick_notifications_toggle"
          >
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="user-notification-tooltip">
                  <FormattedMessage id="USER.MENU.NOTIFICATIONS" />
                </Tooltip>
              }
            >
              <div
                className="btn btn-icon btn-lg pulse pulse-primary mr-15"
                id="kt_quick_notifications_toggle"
                style={{ position: "relative" }}
              >
                <span className="svg-icon svg-icon-xl svg-icon-primary">
                  <SVG
                    src={toAbsoluteUrl(
                      "/media/svg/icons/Communication/Urgent-mail.svg"
                    )}
                  />
                </span>
                {unread > 0 && (
                  <span
                    className="notification-count"
                    style={{
                      fontSize: 8,
                      padding: 4,
                      marginLeft: 15,
                      minWidth: "auto"
                    }}
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
                <span className="pulse-ring"></span>
              </div>
            </OverlayTrigger>
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg">
            <form>
              <div
                className="d-flex flex-column pt-12 bgi-size-cover bgi-no-repeat rounded-top"
                style={{ backgroundColor: "#3061A3" }}
              >
                <h4 className="d-flex flex-center rounded-top">
                  <span className="text">
                    <FormattedMessage id="USER.MENU.NOTIFICATIONS" />
                  </span>
                </h4>
              </div>

              <div className="nav nav-bold nav-tabs nav-tabs-line nav-tabs-line-3x nav-tabs-line-transparent nav-tabs-line-active-border-success">
                <PerfectScrollbar
                  options={{ wheelSpeed: 2, wheelPropagation: false }}
                  className="scroll mr-n7"
                  style={{
                    maxHeight: "300px",
                    position: "relative",
                    width: "100%",
                    paddingTop: "20px"
                  }}
                >
                  {notifs.length === 0 && (
                    <div
                      className="d-flex align-items-center mb-6"
                      style={{ marginTop: "5px" }}
                    >
                      <div className="d-flex flex-column font-weight-bold">
                        <span
                          className="text-muted"
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            width: "19em",
                            textAlign: "center"
                          }}
                        >
                          <FormattedMessage id="NOTIF.EMPTY" />
                        </span>
                      </div>
                    </div>
                  )}

                  {notifs.map((notif, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center mb-6"
                      style={{ marginTop: "5px" }}
                    >
                      <div className="d-flex flex-column font-weight-bold">
                        {/* Pour les notifications standards */}
                        {notif.title && (
                          <>
                            <a
                              onClick={() => setSelectedNotif(notif)}
                              className="text-dark text-hover-primary mb-1 font-size-lg"
                              style={{
                                fontWeight: !notif.readed ? "bold" : "inherit"
                              }}
                              dangerouslySetInnerHTML={{ __html: notif.title }}
                            ></a>
                            <span
                              className="text-muted"
                              style={{
                                display: "block",
                                whiteSpace: "nowrap",
                                width: "19em",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                              dangerouslySetInnerHTML={{
                                __html: notif.message
                              }}
                            ></span>
                          </>
                        )}

                        {/* Pour les notifications avec subject/body */}
                        {notif.subject && (
                          <>
                            <a
                              onClick={() => setSelectedNotif(notif)}
                              className="text-dark text-hover-primary mb-1 font-size-lg"
                            >
                              {notif.subject}
                            </a>
                            {notif.body && (
                              <div
                                className="text-muted"
                                style={{
                                  display: "block",
                                  whiteSpace: "normal",
                                  width: "19em",
                                  overflow: "hidden"
                                }}
                                dangerouslySetInnerHTML={{ __html: notif.body }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </PerfectScrollbar>
              </div>
            </form>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
}
