import React, { useEffect, useState } from "react";

import { getBackOfficeDashboardDatas } from "actions/backoffice/dashboardActions";
import { Pagination } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "react-avatar";
import { Route } from "react-router-dom";

import { NavLink } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

function BackOfficeDashboardPage({ intl, history }) {
  const dispatch = useDispatch();

  const { dashboard, user, userDetails } = useSelector(
    state => ({
      dashboard: state.backOfficeDashboardReducerData.dashboard,
      user: state.user.user,
      userDetails: state.auth.user
    }),
    shallowEqual
  );
  const [windowWidth, setWindowWidth] = useState(null);
  useEffect(() => {
    dispatch(
      getBackOfficeDashboardDatas.request({
        tenantID: userDetails.tenantID
      })
    );
    setWindowWidth(window.innerWidth);
  }, [dispatch, userDetails]);

  const renderStatus = () => {
    return (
      user &&
      (user.backofficeRole === 1
        ? "Super Administrateur"
        : user.backofficeRole === 2
        ? "Administrateur"
        : "Utilisateur")
    );
  };

  return (
    <div className="d-flex flex-row">
      <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px">
        <div className="card card-custom ">
          <div className="card-body pt-4">
            <div className="d-flex align-items-center">
              <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                {user && (
                  <Avatar
                    className="symbol-label"
                    color="#3699FF"
                    maxInitials={2}
                    name={
                      user &&
                      user.firstname &&
                      user.firstname.concat(" ", user.lastname)
                    }
                  />
                )}
                <i className="symbol-badge bg-success"></i>
              </div>
              <div>
                {user && (
                  <span className="font-weight-bolder font-size-h5 text-dark-75 text-hover-primary">
                    {user &&
                      user.firstname &&
                      user.firstname.concat(" ", user.lastname)}
                  </span>
                )}
                <div className="text-muted">{user && renderStatus()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-row-fluid ml-lg-8">
        <div
          className="row"
          style={{
            position: "relative"
          }}
        >
          <Link className="col-lg-3 mw-300" to="/contracts">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-rose svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl(
                          "/media/svg/icons/Home/Book-open.svg"
                        )}
                      ></SVG>
                    </span>
                    <span
                      className="custom-counter "
                      style={{ color: "#fc69a6" }}
                    >
                      -
                    </span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.CONTRACTS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.CUSTOMERS.CONTRACTS" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/contract.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/contract-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-3 mw-300" to="/prolongations">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-jaune svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                      ></SVG>
                    </span>
                    <span className="custom-counter text-jaune">-</span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.EXTENSIONS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.EXTENSIONS.REQUESTS" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/extend.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/extend-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-3 mw-300" to="/interimaires">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-danger svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                      ></SVG>
                    </span>
                    <span className="custom-counter text-danger">-</span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.APPLICANTS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.INTERIMAIRES.LIST" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/applicants.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/applicants-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-3 mw-300" to="/missions">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-info svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                      ></SVG>
                    </span>
                    <span className="custom-counter text-info">-</span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.VACANCIES" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.VACANCIES.LIST" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/search.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/search-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-3 mw-300" to="/customers">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-primary svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                      ></SVG>
                    </span>
                    <span className="custom-counter text-primary">-</span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.CUSTOMERS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.CUSTOMERS.LIST" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/customers.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/customers-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-3 mw-300" to="/commercialagreements">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-info svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                      ></SVG>
                    </span>
                    <span className="custom-counter text-info">-</span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.COMMERCIAL.AGREEMENTS.LIST" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/search.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/search-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-3 mw-300" to="/cra">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div className="d-flex mb-5">
                    <span className="svg-icon svg-icon-success svg-icon-3x ml-n1">
                      <SVG
                        src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                      ></SVG>
                    </span>
                    <span className="custom-counter text-success">-</span>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="MODEL.CONTACT.SHIFTS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="MODEL.CONTACT.SHIFTS.DESCRIPTION" />
                  </span>
                </div>
                <div className="gif-wrapper">
                  <img
                    src="/media/elements/search.gif"
                    alt=""
                    className="align-self-end h-100px static-gif"
                  />
                  <img
                    src="/media/elements/search-loop.gif"
                    alt=""
                    className="align-self-end h-100px"
                  />
                </div>
              </div>
            </div>
          </Link>
          {/* <ContractsTable dashboard={dashboard} contracts={contracts} /> */}
        </div>
      </div>
    </div>
  );
}

export default injectIntl(connect()(BackOfficeDashboardPage));
