import React from "react";

import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import MissionsDateColumnFormatter from "../../column-formatters/MissionsDateColumnFormatter";
import ApplicationsStatusColumnFormatter from "../../column-formatters/ApplicationsStatusColumnFormatter";
import { Link } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import SVG from "react-inlinesvg";

function ApplicationsTable({ intl, dashboard, applications }) {
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
      headerStyle: {}
    },
    {
      dataField: "applicationStatus",
      text: intl.formatMessage({ id: "TEXT.STATUS" }),
      sort: true,
      headerFormatter: headerFormatter,
      formatter: ApplicationsStatusColumnFormatter
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

  return (
    <>
      <div className="card card-custom card-stretch gutter-b min-h-300 col-lg-12 ribbon ribbon-top ribbon-ver">
        <div className="ribbon-target bg-primary ribbon-right">
          <i className="far fa-hand-point-down text-white"></i>
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
          <Link to="/applications">
            <h2 className="font-weight-bolder text-dark ml-5">
              <FormattedMessage id="DASHBOARD.INTERIMAIRE.LIST.APPLICATIONS.TITLE" />
            </h2>
          </Link>
        </div>
        {/* Body */}
        <div className="card-body pt-0 pb-3">
          {!dashboard && !applications ? (
            <span className="ml-3 spinner spinner-white"></span>
          ) : (
            <BootstrapTable
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-int table-head-bg table-borderless table-vertical-center"
              bootstrap4
              remote
              data={applications && applications.length ? applications : []}
              keyField="id"
              columns={columns}
              options={options}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default injectIntl(connect()(ApplicationsTable));
