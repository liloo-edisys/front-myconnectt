import React from "react";

import "moment/locale/fr";
import SVG from "react-inlinesvg";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import Moment from "moment";


import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";

function ContractsTable({ intl, dashboard, contracts }) {
  function headerFormatter(column, colIndex) {
    return (
      <span style={{ color: "#ff6aa6", fontWeight: 600 }}>{column.text} </span>
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

  let columns = [
    {
      dataField: "contractNumber",
      text: intl.formatMessage({ id: "COLUMN.CONTRACT.ID" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {}
    },
    {
      dataField: "entrepriseName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {}
    },
    {
      dataField: "qualification",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" }),
      sort: true,
      headerFormatter: headerFormatter,
      headerStyle: {}
    },
    {
      dataField: "applicantName",
      text: intl.formatMessage({ id: "TEXT.APPLICANT" }),
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
      dataField: "signedByClient",
      text: "Signé",
      headerFormatter: headerFormatter,
      formatter: value => (
        <div>
          {value ? (
            <i className="far fa-check-circle mr-5 text-success" />
          ) : (
            <i className="far fa-window-close mr-5 text-danger" />
          )}
        </div>
      )
    }
  ];
  const options = {
    noDataText: intl.formatMessage({ id: "DASHBOARD.ITEM.CONTRACTS" })
  };

  return (
    <>
      <div className="card card-custom card-stretch gutter-b min-h-300 col-lg-12 ribbon ribbon-top ribbon-ver">
        <div className="ribbon-target bg-primary ribbon-right">
          <i className="fa fa-star text-white"></i>
        </div>
        {/* Head */}
        <div className="d-flex border-0 py-5 px-5">
          <div className="alert-icon">
            <span className="svg-icon svg-icon-rose svg-icon-xl">
              <SVG
                src={toAbsoluteUrl("/media/svg/icons/General/Clipboard.svg")}
              ></SVG>
            </span>
          </div>
          <Link className="col-lg-3 mw-300" to="/contrats">
            <h2 className="font-weight-bolder text-dark ml-5">
              <FormattedMessage id="DASHBOARD.ITEM.CONTRACTS" />
            </h2>
          </Link>
        </div>
        {/* Body */}
        <div className="card-body pt-0 pb-3">
          {!dashboard & !contracts ? (
            <span className="ml-3 spinner spinner-white"></span>
          ) : (
            <BootstrapTable
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-head-bg table-borderless table-vertical-center table-head-bg-contracts"
              bootstrap4
              remote
              data={!contracts ? [] : contracts}
              keyField="applicantID"
              columns={columns}
              options={options}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default injectIntl(connect()(ContractsTable));
