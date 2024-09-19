import React, { useEffect } from "react";

import { getDashboardDatas } from "actions/interimaire/dashboardActions";
import { injectIntl } from "react-intl";
import { connect, shallowEqual, useDispatch, useSelector } from "react-redux";
import { Route } from "react-router-dom";

import { getInterimaire } from "actions/interimaire/interimairesActions";

import { InterimaireMatchingUIProvider } from "../missions/matching/InterimaireMatchingUIContext";
import { getMission } from "../../../../business/actions/client/missionsActions";
import { MissionDisplayDialog } from "../missions/modals/MissionDisplayDialog";
import { MissionApproveDialog } from "../missions/modals/MissionApproveDialog";
import { MatchingDeclineDialog } from "../missions/modals/MatchingDeclineDialog";
import { MissionDeclineDialog } from "../missions/modals/MissionDeclineDialog";
import { Home } from "../home";

function DashboardInterimairePage({ history }) {
  const dispatch = useDispatch();
  const tenantID = +process.env.REACT_APP_TENANT_ID;
  const { interimaire, hasCancelled } = useSelector(
    state => ({
      dashboard: state.dashboardReducerData.dashboard,
      missions: state.dashboardReducerData.dashboard.matchings,
      applications: state.dashboardReducerData.dashboard.applications,
      interimaire: state.interimairesReducerData.interimaire,
      hasCancelled: state.interimairesReducerData.hasCancelledEdit
    }),
    shallowEqual
  );
  useEffect(() => {
    dispatch(getInterimaire.request());
    dispatch(getDashboardDatas.request({ tenantID: tenantID }));
  }, [dispatch, tenantID, hasCancelled, history]);

  useEffect(() => {
    /*if (
      !isNullOrEmpty(hasCancelled) &&
      !hasCancelled &&
      interimaire &&
      interimaire.completedPercent < 100
    ) {
      history.push("/int-profile-edit");
    }*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interimaire, hasCancelled]);

  const missionsUIEvents = {
    openDisplayDialog: id => {
      dispatch(getMission.request(id));
      history.push(`/int-dashboard/mission/${id}`, id);
    },
    openApproveDialog: id => {
      dispatch(getMission.request(id));
      history.push(`/int-dashboard/approve`, id);
    },
    openDeclineMatchingDialog: (id, row) => {
      dispatch(getMission.request(id));
      history.push(`/int-dashboard/decline`, (id, row));
    }
  };

  return (
    <InterimaireMatchingUIProvider
      missionsUIEvents={missionsUIEvents}
      history={history}
    >
      {" "}
      <Route path={`/int-dashboard/mission/:id`}>
        {({ history, match }) => {
          return (
            <MissionDisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/int-dashboard");
              }}
            />
          );
        }}
      </Route>
      <Route path="/int-dashboard/approve/:id">
        {({ history, match }) => (
          <MissionApproveDialog
            show={match != null}
            history={history}
            onHide={() => {
              history.push("/int-dashboard");
              dispatch(getDashboardDatas.request({ tenantID: tenantID }));
            }}
          />
        )}
      </Route>
      {/*<Route path="/int-dashboard/decline/:id">
        {({ history, match }) => (
          <MatchingDeclineDialog
            show={match != null}
            history={history}
            onHide={() => {
              history.push("/int-dashboard");
              dispatch(getDashboardDatas.request({ tenantID: tenantID }));
            }}
          />
        )}
      </Route>*/}
      <Route path="/int-dashboard/decline/:id">
        {({ history, match }) => (
          <MissionDeclineDialog
            show={match != null}
            history={history}
            onHide={() => {
              history.push("/int-dashboard");
              dispatch(getDashboardDatas.request({ tenantID: tenantID }));
            }}
          />
        )}
      </Route>
      <Route path="/int-dashboard/remove/:id">
        {({ history, match }) => (
          <MatchingDeclineDialog
            show={match != null}
            history={history}
            onHide={() => {
              history.push("/int-dashboard");
              dispatch(getDashboardDatas.request({ tenantID: tenantID }));
            }}
          />
        )}
      </Route>
      <Home />
      {/*<div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px">
          <div className="card card-custom card-stretch">
            <div className="card-body pt-4">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                  {!isNullOrEmpty(interimaire) &&
                  !isNullOrEmpty(interimaire.applicantPicture) ? (
                    <Avatar
                      className="symbol-label"
                      color="#3699FF"
                      src={
                        "data:image/" +
                        interimaire.applicantPicture.filename.split(".")[1] +
                        ";base64," +
                        interimaire.applicantPicture.base64
                      }
                    />
                  ) : (
                    <Avatar
                      className="symbol-label"
                      color="#3699FF"
                      name={
                        interimaire &&
                        interimaire.firstname &&
                        interimaire.firstname.concat(" ", interimaire.lastname)
                      }
                    />
                  )}
                  <i className="symbol-badge bg-success"></i>
                </div>
                <div>
                  {interimaire && (
                    <span className="font-weight-bolder font-size-h5 text-dark-75 text-hover-primary">
                      {interimaire &&
                        interimaire.firstname &&
                        interimaire.firstname.concat(" ", interimaire.lastname)}
                    </span>
                  )}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted text-hover-primary">
                      {interimaire && interimaire.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-8 pb-6">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="font-weight-bold mr-2">
                    <FormattedMessage id="MODEL.PHONE" /> :
                  </span>
                  <span className="text-muted">
                    {interimaire &&
                      interimaire.mobilePhoneNumber &&
                      interimaire.mobilePhoneNumber.replace(
                        /(.{2})(?!$)/g,
                        "$1 "
                      )}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="font-weight-bold mr-2">
                    <FormattedMessage id="TEXT.LOCATION" /> :
                  </span>
                  <span className="text-muted">
                    {interimaire && interimaire.city}
                  </span>
                </div>
              </div>
              <div className="separator separator-solid-primary my-10 mx-30"></div>
              <MixedWidgetProfile className="card-stretch gutter-b" />
            </div>
          </div>
        </div>
        <div className="flex-row-fluid ml-lg-8">
          <div className="row">
            <Link className="col-lg-3 mw-300" to="/applications">
              <div className="card card-custom card-stretch gutter-b box-shadow-int">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-int svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/General/Search.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-int">
                        {dashboard ? dashboard.nbrApplications : 0}
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.APPLICATIONS" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.APPLICATIONS_DESC" />
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
            <Link className="col-lg-3 mw-300" to="/contracts">
              <div className="card card-custom card-stretch gutter-b box-shadow-primary">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-primary svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Home/Book-open.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="text-primary ml-5">
                        Bientôt disponible
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.CONTRACTS" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.CONTRACTS_DESC" />
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
            <Link className="col-lg-3 mw-300" to="/rhs">
              <div className="card card-custom card-stretch gutter-b box-shadow-primary">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-primary svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Home/Timer.svg")}
                        ></SVG>
                      </span>
                      <span className="text-primary ml-5">
                        Bientôt disponible
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.RHS" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.RHS_DESC" />
                    </span>
                  </div>

                  <div className="gif-wrapper">
                    <img
                      src="/media/elements/rh.gif"
                      alt=""
                      className="align-self-end h-100px static-gif"
                    />
                    <img
                      src="/media/elements/rh-loop.gif"
                      alt=""
                      className="align-self-end h-100px"
                    />
                  </div>
                </div>
              </div>
            </Link>
            <Link className="col-lg-3 mw-300" to="/#">
              <div className="card card-custom card-stretch gutter-b box-shadow-primary">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-primary svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Design/Union.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="text-primary ml-5">
                        Bientôt disponible
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.EXTEND" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.INTERIMAIRE.ITEM.EXTEND_DESC" />
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
          </div>
          <div className="row">
            <MissionsTable dashboard={dashboard} missions={missions} />
          </div>
          <div className="row">
            <ApplicationsTable
              dashboard={dashboard}
              applications={applications}
            />
          </div>
        </div>
      </div>*/}
    </InterimaireMatchingUIProvider>
  );
}

export default injectIntl(connect()(DashboardInterimairePage));
