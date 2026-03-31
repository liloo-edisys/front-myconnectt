import React, { useMemo } from "react";

import Moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers/index.js";
import { Link } from "react-router-dom";
import ActionsColumnFormatter from "./actionsColumnFormatter.jsx";
import { useMissionsUIContext } from "./missionsUIContext.jsx";

function SearchsTable({ intl, dashboard, searchs }) {
  const missionsUIContext = useMissionsUIContext();
  const missionsUIProps = useMemo(() => {
    return {
      openDisplayDialog: missionsUIContext.openDisplayDialog
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
      dataField: "vacancyBusinessAddressCity",
      text: intl.formatMessage({ id: "TEXT.LOCATION" }),
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
      formatter: dateFormatter
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeEndDate",
      text: intl.formatMessage({ id: "TEXT.ENDDATE" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {},
      formatter: dateFormatter
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px",
        paddinBottom: "10px"
      },
      formatExtraData: {
        openDisplayDialog: missionsUIProps.openDisplayDialog
      }
    }
  ];
  const options = {
    noDataText: intl.formatMessage({ id: "DASHBOARD.ITEM.CONTRACTS" })
  };
  function headerFormatter(column, colIndex) {
    return (
      <span style={{ color: "#3165A7", fontWeight: 600 }}>{column.text} </span>
    );
  }

  function dateFormatter(cell, row) {
    return cell !== null ? (
      <span>
        {Moment(cell)
          .locale("fr")
          .format("DD/MM/YYYY")}
      </span>
    ) : null;
  }

  const tableRowEvents = {
    onClick: (e, row, rowIndex) => {
      missionsUIProps.openDisplayDialog(row.id);
    }
  };

  return (
    <div className="card card-custom card-stretch gutter-b min-h-300 col-lg-12 ribbon ribbon-top ribbon-ver">
      <div className="ribbon-target bg-primary ribbon-right">
        <i className="far fa-hand-point-down text-white"></i>
      </div>
      {/* Head */}
      <div className="d-flex border-0 py-5 px-5">
        <div className="alert-icon">
          <span className="svg-icon svg-icon-info svg-icon-xl">
            <SVG
              src={toAbsoluteUrl("/media/svg/icons/Layout/Layout-grid.svg")}
            ></SVG>
          </span>
        </div>
        <Link className="col-lg-3 mw-300" to="/missions">
          <h2 className="font-weight-bolder text-dark ml-5">
            {intl.formatMessage({ id: "DASHBOARD.ITEM.SEARCH" })}
          </h2>
        </Link>
      </div>
      {/* Body */}
      <div className="card-body pt-0 pb-3">
        {!dashboard && !searchs ? (
          <span className="ml-3 spinner spinner-white">
            {intl.formatMessage({ id: "DASHBOARD.ITEM.CONTRACTS" })}
          </span>
        ) : (
          <BootstrapTable
            wrapperClasses="table-responsive table-clickable"
            bordered={false}
            classes="table table-head-custom table-head-bg table-borderless table-vertical-center"
            bootstrap4
            remote
            data={searchs && searchs.length ? searchs : []}
            keyField="id"
            columns={columns}
            options={options}
            rowEvents={tableRowEvents}
          />
        )}
      </div>
    </div>
  );
}

export default injectIntl(connect()(SearchsTable));
