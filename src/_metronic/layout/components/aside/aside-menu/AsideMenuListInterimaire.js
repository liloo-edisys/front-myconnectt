/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

import { FormattedMessage, injectIntl } from 'react-intl'
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";

import { checkIsActive } from "../../../../_helpers";

function AsideMenuListInterimaire({ layoutProps }) {
  const location = useLocation();
  const getMenuItemActive = (url, hasSubmenu = false) => {
    return checkIsActive(location, url)
      ? ` ${!hasSubmenu && "menu-item-active"} menu-item-open `
      : "";
  };

  return (
    <>
      {/* begin::Menu Nav */}
      <ul className={`menu-nav ${layoutProps.ulClasses}`}>
        {/*begin::1 Level*/}
        <li
          className={`menu-item ${getMenuItemActive("/int-dashboard", false)}`}
          aria-haspopup="true"
        >
          <NavLink className="menu-link" to="/int-dashboard">
            <i className="fas fa-layer-group text-int mr-5 menu-icone-width"></i>
            <span className="menu-text">
              <FormattedMessage id='MENU.DASHBOARD' />
            </span>
          </NavLink>
        </li>
        {/*end::1 Level*/}
        {/* Components */}
        {/* begin::section */}
        <li className="menu-section ">
          <h4 className="menu-text"><FormattedMessage id='MENU.MISSIONS' /></h4>
          <i className="menu-icon flaticon-more-v2"></i>
        </li>
        {/* end:: section */}

        {/* Material-UI */}
        {/*begin::1 Level*/}
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/search", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/search">
            <i className="fas fa-list-ul text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MY_SEARCHS' /></span>
          </NavLink>

        </li>
        {/*end::1 Level*/}

        {/* Bootstrap */}
        {/*begin::1 Level*/}
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/applications", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/applications">
            <i className="fas fa-hourglass-half text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MY_APPLICATIONS' /></span>
          </NavLink>
        </li>
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/matching", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/matching">
            <i className="fas fa-search text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MATCHING' /></span>
          </NavLink>
        </li>
        {/*end::1 Level*/}

        {/* Applications */}
        {/* begin::section */}
        <li className="menu-section ">
          <h4 className="menu-text"><FormattedMessage id='MENU.DOCUMENTS' /></h4>
          <i className="menu-icon flaticon-more-v2"></i>
        </li>
        {/* end:: section */}

        {/* eCommerce */}
        {/*begin::1 Level*/}
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/contracts", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/contracts">
            <i className="fas fa-handshake text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MY_CONTRACTS' /></span>
          </NavLink>

        </li>
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/rhs", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/rhs">
            <i className="fas fa-calendar-alt text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MY_RHS' /></span>
          </NavLink>

        </li>
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/bulletins", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/bulletins">
            <i className="fas fa-file-invoice text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MY_BULLETINS' /></span>
          </NavLink>

        </li>
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/certificates", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/certificates">
            <i className="fas fa-file-alt text-int mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MY_CERTIFICATS' /></span>
          </NavLink>

        </li>
        {/*end::1 Level*/}
      </ul>

      {/* end::Menu Nav */}
    </>
  );
}

export default injectIntl(AsideMenuListInterimaire)
