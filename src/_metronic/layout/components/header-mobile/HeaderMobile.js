import React, { useMemo } from "react";

import objectPath from "object-path";
import SVG from "react-inlinesvg";
import { Link, NavLink } from "react-router-dom";

import { toAbsoluteUrl } from "../../../_helpers";
import { useHtmlClassService } from "../../_core/MetronicLayout";
import { FormattedMessage } from "react-intl";

import SmallLogo from '../../../../ui/images/logo-myconnectt-color-154x40.png';
import "./HeaderMobileInterimaire.scss";
import { UserNotificationsDropdownMobile } from '../../../../ui/components/shared/userNotificationsDropdownMobile.jsx';

export function HeaderMobile() {
  const uiService = useHtmlClassService();

  const layoutProps = useMemo(() => {
    return {
      headerLogo: uiService.getStickyLogo(),
      asideDisplay: objectPath.get(uiService.config, "aside.self.display"),
      headerMobileCssClasses: uiService.getClasses("header_mobile", true),
      headerMobileAttributes: uiService.getAttributes("header_mobile")
    };
  }, [uiService]);

  return (
    <>
      {/*begin::Header Mobile*/}
      <div
        id="kt_header_mobile"
        className={`header-mobile ${layoutProps.headerMobileCssClasses} header-background`}
        {...layoutProps.headerMobileAttributes}
      >
        {/*begin::Logo*/}
        <Link to="/">
          <img className="header-logo-mobile" alt="logo" src={SmallLogo} />
        </Link>
        {/*end::Logo*/}

        {/*begin::Toolbar*/}
        <div className="d-flex align-items-center">
          {/*layoutProps.asideDisplay && (
            <NavLink className='btn btn-primary font-weight-bold px-9 py-4 my-3' to='/int-profile-edit'>
              <span className="navi-icon mr-2">
                <i className="flaticon-add-label-button"></i>
              </span>
              <span className='menu-text'>
                <FormattedMessage id="BUTTON.INTERIMAIRE.COMPLETE" />
              </span>
            </NavLink>
          )*/}
          {/*layoutProps.asideDisplay && (
            <>
                <button className="btn p-0 burger-icon ml-4" id="kt_aside_mobile_toggle">
                  <span />
                </button>
            </>
          )*/}

          {/*begin::Topbar Mobile Toggle*/}
          <div className="btn btn-icon btn-lg mr-1 pulse pulse-white">
          <div className="btn btn-icon btn-lg mr-1 pulse">
            <UserNotificationsDropdownMobile/>
          </div>
            <span className="pulse-ring"></span>
          </div>
          <button
            className="btn btn-hover-text-primary p-0 ml-2"
            id="kt_header_mobile_topbar_toggle"
          >
            <span className="svg-icon svg-icon-xl">
              <SVG src={toAbsoluteUrl("/media/svg/icons/General/User.svg")} />
            </span>
          </button>
          {/*end::Topbar Mobile Toggle*/}
        </div>
        {/*end::Toolbar*/}
      </div>
      {/*end::Header Mobile*/}
    </>
  );

  /*return (
    <>
      <div
        id="kt_header_mobile"
        className={`header-mobile align-items-center ${layoutProps.headerMobileCssClasses}`}
        {...layoutProps.headerMobileAttributes}
      >
      
        <Link to="/">
          <img className="header-logo-mobile" alt="logo" src={SmallLogo} />
        </Link>
        
        <div className="d-flex align-items-center">
          {layoutProps.asideDisplay && (
            <NavLink className='btn btn-primary font-weight-bold px-9 py-4 my-3' to='/mission'>
              <span className="navi-icon mr-2">
                <i className="flaticon-add-label-button"></i>
              </span>
              <span className='menu-text'>
                <FormattedMessage id="MISSION.CREATE.BUTTON" />
              </span>
            </NavLink>
          )}
          {layoutProps.asideDisplay && (
            <>
              <button className="btn p-0 burger-icon ml-4" id="kt_aside_mobile_toggle">
                <span />
              </button>
            </>
          )}
          
          <button
            className="btn btn-hover-text-primary p-0 ml-2"
            id="kt_header_mobile_topbar_toggle"
          >
            <span className="svg-icon svg-icon-xl">
              <SVG src={toAbsoluteUrl("/media/svg/icons/General/User.svg")} />
            </span>
          </button>
        </div>
      </div>
    </>
  );*/
}
