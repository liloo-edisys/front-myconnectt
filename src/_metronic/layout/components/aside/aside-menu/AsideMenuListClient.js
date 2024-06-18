/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

import { FormattedMessage, injectIntl } from 'react-intl'
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";

import { checkIsActive } from "../../../../_helpers";

function AsideMenuListClient({ layoutProps }) {
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
          className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
          aria-haspopup="true"
        >
          <NavLink className="menu-link" to="/dashboard">
            <i className="fas fa-layer-group text-info mr-5 menu-icone-width"></i>
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
            "/missions", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/missions">
            <i className="fas fa-list-ul text-info mr-5 menu-icone-width"></i>
            <span className="menu-text">Offres</span>
          </NavLink>

        </li>
        {/*end::1 Level*/}

        {/* Bootstrap */}
        {/*begin::1 Level*/}
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/missions/encours", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/missions/encours">
            <i className="fas fa-stream text-info mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.INPROGRESS' /></span>
          </NavLink>
        </li>
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/templates", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/templates">
            <i className="fas fa-copy text-info mr-5 menu-icone-width"></i>
            <span className="menu-text">
              <FormattedMessage id='USER.MENU.NAV.OFFERS_MODELS' />
            </span>
          </NavLink>
        </li>
        {/*end::1 Level*/}

        {/* Applications */}
        {/* begin::section */}
        <li className="menu-section ">
          <h4 className="menu-text"><FormattedMessage id='MENU.INTERIMAIRES' /></h4>
          <i className="menu-icon flaticon-more-v2"></i>
        </li>
        {/* end:: section */}

        {/* eCommerce */}
        {/*begin::1 Level*/}
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/profiles", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/profiles">
            <i className="fas fa-user-friends text-info mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.MYAPPLICANTS' /></span>
          </NavLink>
        </li>
        {/*end::1 Level*/}

        {/* Custom */}
        {/* begin::section */}
        <li className="menu-section ">
          <h4 className="menu-text"><FormattedMessage id='MENU.DOCUMENTS' /></h4>
          <i className="menu-icon flaticon-more-v2"></i>
        </li>
        {/* end:: section */}

        {/* Error Pages */}
        {/*begin::1 Level*/}
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/contrats", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/contrats">
            <i className="fas fa-handshake text-info mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.CONTRACTS' /></span>
          </NavLink>
        </li>

        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/cra", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/cra">
            <i className="fas fa-calendar-alt text-info mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.RH' /></span>
          </NavLink>
        </li>
        <li
          className={`menu-item menu-item-submenu ${getMenuItemActive(
            "/factures", true
          )}`}
          aria-haspopup="true"
          data-menu-toggle="hover"
        >
          <NavLink className="menu-link menu-toggle" to="/factures">
            <i className="fas fa-file-invoice text-info mr-5 menu-icone-width"></i>
            <span className="menu-text"><FormattedMessage id='MENU.INVOICES' /></span>
          </NavLink>
        </li>
        {/*end::1 Level*/}
      </ul>

      {/* end::Menu Nav */}
    </>
  );
}

export default injectIntl(AsideMenuListClient)
