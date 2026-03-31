/* eslint-disable no-restricted-imports */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from '../../../_helpers'
import { FormattedMessage } from 'react-intl';
import { useSelector,shallowEqual } from "react-redux";
import { useHistory,useLocation, Link } from 'react-router-dom'

import { persistor } from '../../../../business/store';
import './QuiclUserToggler.scss';
import { UserNotificationsDropdown } from "../../../../ui/components/shared/userNotificationsDropdown.jsx";
import { Row, Col } from "react-bootstrap";

export function QuickUserToggler() {
  const { interimaire } = useSelector(state => state.interimairesReducerData);
  const { user } = useSelector(state => state.user);
    const { isInterimaire, isBackOffice,isClient } = useSelector(
        ({ auth }) => ({
            isInterimaire: auth.user != null ? auth.user.userType === 0 : false,
            isClient: auth.user != null ? auth.user.userType === 1 : false,
            isBackOffice: auth.user != null ? auth.user.userType === 2 : false,
        }),
        shallowEqual
    );
  const history = useHistory();
  const location = useLocation();

  const logoutClick = () => {
    const toggle = document.getElementById('kt_quick_user_toggle')
    if (toggle) {
      toggle.click()
    }
    persistor.purge();
    window.location.replace(`${process.env.REACT_APP_URL}auth/int-login`);
    //history.push('/int-logout');
  }

  const renderGoHome = () => {
    return (
      <Link to="/">
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="quick-user-tooltip"><FormattedMessage id="TEXT.HOME" /></Tooltip>}
        >
          <div className="btn btn-icon btn-lg mr-1 p-2" style={{width: 100, border:'1px solid #3699FF'}}>
            <span className="svg-icon svg-icon-xl svg-icon-primary mr-2">
              <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Home.svg")} />
            </span>
            <span className="text-primary">
              <FormattedMessage id="TEXT.HOME" />
            </span>
          </div>
        </OverlayTrigger>
        </Link>
    )
  }

  return (
    <>
      <div className="desktop-menu">
      {(location.pathname !== "/int-dashboard" && location.pathname !== "/dashboard" && location.pathname !== "/backoffice-dashboard") && renderGoHome()}
      {!isBackOffice && (<UserNotificationsDropdown/>)}
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="quick-user-tooltip"><FormattedMessage id="USER.MENU.TITLE" /></Tooltip>}
        >
          <div className="topbar-item ml-10">
            <div className="btn btn-icon w-auto btn-clean d-flex align-items-center btn-lg px-2"
              id="kt_quick_user_toggle">
              <>
                {interimaire &&
                  (<div className='d-flex flex-row align-items-center'><span className=" font-weight-bold font-size-base d-none d-md-inline mr-1"><FormattedMessage id="TEXT.WELCOME" />, </span>
                    <span className="font-weight-bolder font-size-base d-none d-md-inline mr-3">
                      {interimaire.firstname + " " + interimaire.lastname}
                    </span>
                    {/*<span className="symbol symbol-35 symbol-light-success">
                        {interimaire && !isNullOrEmpty(interimaire.applicantPicture) ? <img alt="avatar" src={"data:image/" + interimaire.applicantPicture.filename.split(".")[1] + ";base64," + interimaire.applicantPicture.base64} /> : <span className="symbol-label font-size-h5 font-weight-bold">{interimaire.firstname && interimaire.firstname[0]}</span>}
                      </span>*/}
                  </div>)}
                {!interimaire && user &&
                  (<div>
                    <span className="font-weight-bold font-size-base d-none d-md-inline mr-1"><FormattedMessage id="TEXT.WELCOME" />, </span>
                    <span className="text-dark-50 font-weight-bolder font-size-base d-none d-md-inline mr-3">
                      {user.firstname + " " + user.lastname}
                    </span>
                    {/*<span className="symbol symbol-35 symbol-light-success">
                      <span className="symbol-label font-size-h5 font-weight-bold">{user.firstname && user.firstname[0]}</span>
                    </span>*/}
                  </div>)
                }
              </>
            </div>
          </div>
        </OverlayTrigger>
      </div>
      <div className="mobile-menu">
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="quick-user-tooltip"><FormattedMessage id="USER.MENU.TITLE" /></Tooltip>}
        >
          <Row className='header-mobile-row'>
            {/*<Col sm={12}>
              <div className="user-image-mobile">
                {interimaire &&
                  (<div className='d-flex flex-row align-items-center'><span className=" font-weight-bold font-size-base d-none d-md-inline mr-1"><FormattedMessage id="TEXT.WELCOME" />, </span>
                    <span className="font-weight-bolder font-size-base d-none d-md-inline mr-3">
                      {interimaire.firstname + " " + interimaire.lastname}
                    </span>
                    <span className="symbol symbol-35 symbol-light-info">
                      {interimaire && !isNullOrEmpty(interimaire.applicantPicture) ? <img alt="avatar" src={"data:image/" + interimaire.applicantPicture.filename.split(".")[1] + ";base64," + interimaire.applicantPicture.base64} /> : <span className="symbol-label font-size-h5 font-weight-bold">{interimaire.firstname && interimaire.firstname[0]}</span>}
                    </span>
                  </div>)
                }
                {!interimaire && user &&
                  (<div>
                    <span className=" font-weight-bold font-size-base d-none d-md-inline mr-1"><FormattedMessage id="TEXT.WELCOME" />, </span>
                    <span className=" white font-weight-bolder font-size-base d-none d-md-inline mr-3">
                      {user.firstname + " " + user.lastname + "999"}
                    </span>
                    <span className="symbol symbol-35 symbol-light-info">
                      <span className="symbol-label font-size-h5 font-weight-bold">{user.firstname && user.firstname[0]}</span>
                    </span>
                  </div>)
                }
              </div>
            </Col>*/}
            {isClient && (
              <Col sm={12}>
              <div className="disconnect-button-mobile">
                <div className="user-phone-mobile">
                  {user.firstname + " " + user.lastname}
                </div>
                <button onClick = {()=> {history.push("/profile")}}
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                >
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_ACCOUNT' />
                </button>
                <button onClick = {()=> {history.push("/companies")}}
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                >
                  <FormattedMessage id='USER.MENU.NAV.SITES' />
                </button>
                <button onClick = {()=> {history.push("/contacts")}}
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                >
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_USERS' />
                </button>
                <button onClick = {()=> {history.push("/remunerations")}}
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                >
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_PAYMENTS' />
                </button>
                </div>
              </Col>
            )}
            {isInterimaire &&
              <Col sm={12}>
                <div className="user-phone-mobile">
                  {interimaire &&interimaire.mobilePhoneNumber && interimaire.mobilePhoneNumber.replace(/(.{2})(?!$)/g, "$1 ")}
                </div>
              </Col>
            }
            {isBackOffice && (
              <Col sm={12}>
              <div className="disconnect-button-mobile">
                <div className="user-phone-mobile">
                  {user.firstname + " " + user.lastname}
                </div>
                </div>
              </Col>
            )}
            <Col sm={12}>
              <div className="disconnect-button-mobile">
                {/*interimaire && interimaire.hasIDCard && interimaire.hasMatching &&
                <button onClick = {()=> {history.push("/int-profile-edit/step-two")}}
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                >
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_ACCOUNT' />
                </button>
            */}
                {interimaire && interimaire.email && interimaire.postalCode && interimaire.city &&
                <button onClick = {()=> {history.push("/int-profile-edit/step-two")}}
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                >
                  <FormattedMessage id='USER.MENU.NAV.MANAGE_ACCOUNT' />
                </button>
                }
                <button
                  className="btn btn-light btn-shadow font-weight-bold px-9 py-4 my-3 mx-4 disconnect_button_text"
                  onClick={logoutClick}
                >
                  <FormattedMessage id='BUTTON.LOGOUT' />
                </button>
              </div>
            </Col>
          </Row>
        </OverlayTrigger>
      </div>
    </>
  );
}
