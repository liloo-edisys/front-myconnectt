/* eslint-disable no-unused-vars */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useState, useMemo, useEffect } from "react";

import { switchAccount } from "actions/client/CompaniesActions";
import { DropdownTopbarItemToggler } from "metronic/_partials/dropdowns";
import objectPath from "object-path";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { injectIntl } from "react-intl";
import PerfectScrollbar from "react-perfect-scrollbar";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useHtmlClassService } from "../../../_metronic/layout";
import { Link } from "react-router-dom";

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
};

function MissionHeaderDropdown() {
  const tenantID = +process.env.REACT_APP_TENANT_ID;
  const dispatch = useDispatch();
  const { user, companies } = useSelector(
    state => ({
      user: state.auth.user,
      companies: state.companies.companies
    }),
    shallowEqual
  );

  let filteredCompanies = companies.length
    ? companies.filter(company => company.parentID === null)
    : [];
  const [companiesList, setCompaniesList] = useState(
    filteredCompanies ? filteredCompanies : []
  );
  const uiService = useHtmlClassService();
  const layoutProps = useMemo(() => {
    return {
      offcanvas:
        objectPath.get(uiService.config, "extras.notifications.layout") ===
        "offcanvas"
    };
  }, [uiService]);
  useEffect(() => {
    if (!companiesList.length && companies.length) {
      setCompaniesList(filteredCompanies);
    }
  }, [companiesList, filteredCompanies, companies]);
  const closeMenu = () => {
    const toggle = document.getElementById("kt_quick_notifications_toggle");
    if (toggle) {
      toggle.click();
    }
  };
  const createOption = (label, value) => ({
    label,
    value
  });

  const handleSwitchCompany = data => {
    closeMenu();
    dispatch(switchAccount.request(data));
  };

  const renderCompanies = () => {
    return (
      companiesList &&
      companiesList.map(company => (
        <div
          key={company.id}
          onClick={() =>
            handleSwitchCompany({ id1: tenantID, id2: company.id })
          }
          className="col-6"
        >
          <Link
            to="/dashboard"
            href="#"
            id="kt_quick_notifications_close"
            className="d-block py-10 px-5 text-center bg-hover-light border-right border-bottom"
          >
            <span className="svg-icon svg-icon-3x svg-icon-success"></span>
            <span className="d-block text-dark-75 font-weight-bold font-size-h6 mt-2 mb-1">
              {company.name}
            </span>
          </Link>
        </div>
      ))
    );
  };

  const filterCompanies = value => {
    if (!value.length) {
      setCompaniesList(filteredCompanies);
    } else {
      return setCompaniesList(
        _.filter(filteredCompanies, o => {
          return o.name.toLowerCase().includes(value.toLowerCase());
        })
      );
    }
  };

  return (
    <>
      {layoutProps.offcanvas && (
        <div className="topbar-item">
          <div
            className="btn btn-icon w-auto  bg-default d-flex align-items-center btn-lg px-2"
            id="kt_quick_notifications_toggle"
          >
            <div>
              <span className="text-muted font-weight-bold font-size-base d-none d-md-inline mr-1">
                {user && user.siteName}
              </span>
            </div>

            <span className="pulse-ring"></span>
          </div>
        </div>
      )}
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
                  Changer d'entreprise
                </Tooltip>
              }
            >
              <div
                className="btn btn-icon w-auto  btn-default d-flex align-items-center btn-lg px-2"
                id="kt_quick_notifications_toggle"
              >
                <span className="symbol-label">{user && user.siteName}</span>
              </div>
            </OverlayTrigger>
          </Dropdown.Toggle>
          <Dropdown.Menu className="p-0 m-0 dropdown-menu-right dropdown-menu-limited dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xxl">
            <form>
              {/* begin: Head */}
              <div className="d-flex bg-blue flex-column align-items-center justify-content-center pt-10 pb-10 bgi-size-cover bgi-no-repeat rounded-top">
                <h3 className="text-white font-weight-bold font-size-5">
                  Changer d'entreprise
                </h3>
              </div>
              {/* end: Head */}
              <div className="column">
                <div className="d-flex  justify-content-center m-2">
                  <input
                    placeholder="Rechercher une entreprise."
                    onChange={e => {
                      filterCompanies(e.target.value);
                    }}
                    className="col-lg-12 form-control"
                  ></input>
                </div>
                <div className="row row-paddingless"> {renderCompanies()}</div>
              </div>
            </form>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
}

export default injectIntl(MissionHeaderDropdown);
