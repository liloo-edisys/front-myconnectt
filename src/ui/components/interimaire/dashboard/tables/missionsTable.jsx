import React, { useMemo } from "react";

import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import MissionsDateColumnFormatter from "../../column-formatters/missionsDateColumnFormatter.jsx";
import MissionsCityColumnFormatter from "../../column-formatters/MissionsCityColumnFormatter.js";
import MissionsMatchingColumnFormatter from "../../column-formatters/missionsMatchingColumnFormatter.jsx";
import { Link } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../../_metronic/_helpers/index.js";
import SVG from "react-inlinesvg";
import { useMissionsUIContext } from "../../missions/matching/interimaireMatchingUIContext.jsx";
import ActionsColumnFormatter from "./actionsColumnFormatter.jsx";

function MissionsTable({ intl, dashboard, missions }) {
  function headerFormatter(column) {
    return (
      <span style={{ color: "#3165A7", fontWeight: 600 }}>{column.text} </span>
    );
  }
  const missionsUIContext = useMissionsUIContext();
  const missionsUIProps = useMemo(() => {
    return {
      openDisplayDialog: missionsUIContext.openDisplayDialog,
      openApproveDialog: missionsUIContext.openApproveDialog,
      openDeclineMatchingDialog: missionsUIContext.openDeclineMatchingDialog
    };
  }, [missionsUIContext]);
  let columns = [
    {
      dataField: "vacancyTitle",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {}
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeStartDate",
      text: intl.formatMessage({ id: "TEXT.STARTDATE" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {},
      formatter: MissionsDateColumnFormatter
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeEndDate",
      text: intl.formatMessage({ id: "TEXT.ENDDATE" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {},
      formatter: MissionsDateColumnFormatter
    },
    {
      dataField: "vacancyBusinessAddressCity",
      text: intl.formatMessage({ id: "TEXT.LOCATION" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {},
      formatter: MissionsCityColumnFormatter
    },
    {
      dataField: "matchingScore",
      text: intl.formatMessage({ id: "TEXT.MATCHING" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {},
      formatter: MissionsMatchingColumnFormatter
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatExtraData: {
        openDisplayDialog: missionsUIProps.openDisplayDialog,
        openApproveDialog: missionsUIProps.openApproveDialog,
        openDeclineMatchingDialog: missionsUIProps.openDeclineMatchingDialog
      }
    }
  ];

  return (
    <>
      <div className="card card-custom card-stretch gutter-b min-h-300 col-lg-12 ribbon ribbon-top ribbon-ver">
        <div className="ribbon-target bg-primary ribbon-right">
          <i className="fa fa-star text-white"></i>
        </div>
        {/* Head */}
        <div className="d-flex border-0 py-5 px-5">
          <div className="alert-icon">
            <span className="svg-icon svg-icon-int svg-icon-xl">
              <SVG
                src={toAbsoluteUrl("/media/svg/icons/General/Clipboard.svg")}
              ></SVG>
            </span>
          </div>
          <Link to="/matching">
            <h2 className="font-weight-bolder text-dark ml-5">
              <FormattedMessage id="DASHBOARD.INTERIMAIRE.LIST.MISSIONS.TITLE" />
            </h2>
          </Link>
        </div>
        {/* Body */}
        <div className="card-body pt-0 pb-3">
          {!dashboard & !missions ? (
            <span className="ml-3 spinner spinner-white"></span>
          ) : (
            <BootstrapTable
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-int table-head-bg table-borderless table-vertical-center table-no-padding"
              bootstrap4
              remote
              data={!missions ? [] : missions}
              keyField="id"
              columns={columns}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default injectIntl(connect()(MissionsTable));
