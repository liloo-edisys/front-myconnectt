/* eslint-disable no-unused-vars */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useMemo } from "react";

import objectPath from "object-path";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import SVG from "react-inlinesvg";
import PerfectScrollbar from "react-perfect-scrollbar";
import { FormattedMessage } from "react-intl";

import { toAbsoluteUrl } from "../../../_metronic/_helpers/index.js";
import { DropdownTopbarItemToggler } from "../../../_metronic/_partials/dropdowns/index.js";
import { useHtmlClassService } from "../../../_metronic/layout/_core/MetronicLayout.js";
import "./styles.scss";
import { getNotifications } from "../../../business/actions/shared/notificationsActions.js";
import { UserNotificationPopup } from "./userNotificationPopup.jsx";
import { setSignalRInterimaire } from "../../../business/actions/interimaire/interimairesActions.js";
import { setSignalRClient } from "../../../business/actions/client/userActions.js";
import { setSignalRBackoffice } from "../../../business/actions/backoffice/userActions.js";
import { Link } from "react-router-dom";

export function UserNotificationsDropdown() {
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

  const closePopup = () => {
    setSelectedNotif(null);
  };

  const { notifs, unread, userDetails, authToken, userType } = useSelector(
    state => ({
      notifs: state.lists.notifs,
      unread: state.lists.unread,
      userDetails: state.auth.user,
      currentNotif: state.lists.currentNotif,
      showNotifModal: state.lists.showNotifModal,
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
    }
  }, [dispatch]);

  const getRandomInt = max => {
    return Math.floor(Math.random() * max);
  };

  const iconsArray = [
    {
      containerStyle: "symbol symbol-40 symbol-light-primary mr-5",
      iconStyle: "svg-icon svg-icon-xl svg-icon-primary",
      iconUrl: "/media/svg/icons/Home/Library.svg"
    },
    {
      containerStyle: "symbol symbol-40 symbol-light-warning mr-5",
      iconStyle: "svg-icon svg-icon-lg svg-icon-warning",
      iconUrl: "/media/svg/icons/Communication/Write.svg"
    },
    {
      containerStyle: "symbol symbol-40 symbol-light-success mr-5",
      iconStyle: "svg-icon svg-icon-lg svg-icon-success",
      iconUrl: "/media/svg/icons/Communication/Group-chat.svg"
    },
    {
      containerStyle: "symbol symbol-40 symbol-light-danger mr-5",
      iconStyle: "svg-icon svg-icon-lg svg-icon-danger",
      iconUrl: "/media/svg/icons/General/Attachment2.svg"
    },
    {
      containerStyle: "symbol symbol-40 symbol-light-info mr-5",
      iconStyle: "svg-icon svg-icon-lg svg-icon-info",
      iconUrl: "/media/svg/icons/Communication/Shield-user.svg"
    }
  ];

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
            className="btn btn-icon btn-lg mr-1 pulse pulse-primary"
            id="kt_quick_notifications_toggle"
          >
            <span className="svg-icon svg-icon-xl svg-icon-primary">
              <SVG
                src={toAbsoluteUrl(
                  "/media/svg/icons/Communication/Urgent-mail.svg"
                )}
              />
            </span>
            {unread > 0 && (
              <span className="notification-count">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
            <span className="pulse-ring"></span>
          </div>
        </div>
      )}
      <div className="topbar-item">
        {userType === 0 && (
          <div
            className="btn btn-icon btn-lg mr-1 pulse pulse-primary"
            id="kt_quick_notifications_toggle"
          >
            <Link
              to="/favorites"
              className="svg-icon svg-icon-xl svg-icon-primary"
            >
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="user-notification-tooltip">
                    <FormattedMessage id="USER.MENU.FAVORITE" />
                  </Tooltip>
                }
              >
                <SVG src={toAbsoluteUrl("media/svg/icons/General/Star.svg")} />
              </OverlayTrigger>
            </Link>
          </div>
        )}
        <div
          className="btn btn-icon btn-lg mr-1 pulse pulse-primary"
          id="kt_quick_notifications_toggle"
        >
          <Link to="/contact" className="svg-icon svg-icon-xl svg-icon-primary">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="user-notification-tooltip">
                  <FormattedMessage id="USER.MENU.MESSAGE" />
                </Tooltip>
              }
            >
              <SVG
                src={toAbsoluteUrl(
                  "/media/svg/icons/Communication/Sending mail.svg"
                )}
              />
            </OverlayTrigger>
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
                className="btn btn-icon btn-lg mr-1 pulse pulse-primary"
                id="kt_quick_notifications_toggle"
              >
                <span className="svg-icon svg-icon-xl svg-icon-primary">
                  <SVG
                    src={toAbsoluteUrl(
                      "/media/svg/icons/Communication/Urgent-mail.svg"
                    )}
                  />
                </span>
                {unread > 0 && (
                  <span className="notification-count">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
                <span className="pulse-ring"></span>
                <span className="pulse-ring" />
              </div>
            </OverlayTrigger>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg"
            hidden={selectedNotif}
          >
            <form>
              {/** Head */}
              <div
                className="d-flex flex-column pt-12 bgi-size-cover bgi-no-repeat rounded-top"
                style={{ backgroundColor: "#3061A3" }}
              >
                <h4 className="d-flex flex-center rounded-top">
                  <span className="text-white">
                    <FormattedMessage id="USER.MENU.NOTIFICATIONS" />
                  </span>
                </h4>
              </div>
              <div className="nav nav-bold nav-tabs nav-tabs-line nav-tabs-line-3x nav-tabs-line-transparent-white nav-tabs-line-active-border-success">
                <PerfectScrollbar
                  options={{
                    wheelSpeed: 2,
                    wheelPropagation: false
                  }}
                  className="scroll mr-n7"
                  style={{
                    maxHeight: "300px",
                    position: "relative",
                    width: "100%",
                    paddingTop: "20px"
                  }}
                >
                  {notifs.length == 0 && (
                    <div
                      style={{ marginTop: "5px" }}
                      className="d-flex align-items-center mb-6"
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
                  {notifs &&
                    notifs.map(notif => {
                      const index = getRandomInt(5);
                      return (
                        <div
                          key={notif.id}
                          style={{
                            marginTop: "5px",
                            justifyContent: "space-between"
                          }}
                          className="d-flex mb-5 px-5"
                        >
                          <div className={iconsArray[index].containerStyle}>
                            <span className="symbol-label">
                              <span className={iconsArray[index].iconStyle}>
                                <SVG
                                  src={toAbsoluteUrl(iconsArray[index].iconUrl)}
                                />
                              </span>
                            </span>
                          </div>
                          <div className="d-flex flex-column font-weight-bold">
                            <a
                              onClick={() => {
                                setSelectedNotif(notif);
                              }}
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
                          </div>
                        </div>
                      );
                    })}
                </PerfectScrollbar>
              </div>
            </form>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
}
