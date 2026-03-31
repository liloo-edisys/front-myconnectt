import React, { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import Avatar from "react-avatar";
import axios from "axios";
import { getMission } from "api/client/missionsApi";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

function Missions(props) {
  const { id } = useParams();
  const { history } = props;
  const intl = useIntl();
  const [missions, setMissions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [expanded, setExpanded] = useState([]);

  const missionStatus = [
    {
      name: intl.formatMessage({ id: "STATUS.DRAFT" }),
      id: 0,
      color: "label label-lg font-weight-bold label-light-gray label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.NON.PROVIDED" }),
      id: 1,
      color: "label label-lg font-weight-bold label-light-primary label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.PARTIALLY.PROVIDED" }),
      id: 2,
      color: "label label-lg font-weight-bold label-light-info label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.PROVIDED" }),
      id: 3,
      color: "label label-lg font-weight-bold label-light-success label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.PROPOSITION.CANCELED" }),
      id: 4,
      color: "label label-lg font-weight-bold label-light-danger label-inline"
    },
    {
      name: intl.formatMessage({ id: "STATUS.VALIDATED.MYCONNECTT" }),
      id: 5,
      color: "label label-lg font-weight-bold label-light-success label-inline"
    }
  ];

  useEffect(() => {
    getData();
  }, [pageNumber]);

  const getData = () => {
    const VACANCY_URL =
      process.env.REACT_APP_WEBAPI_URL + "api/Vacancy/SearchMissions";
    let body = {
      tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
      accountID: parseInt(id),
      userID: 0,
      pageSize: pageSize,
      pageNumber: pageNumber
    };
    axios
      .post(VACANCY_URL, body)
      .then(res => {
        setTotalCount(res.data.totalcount);
        setMissions(res.data.list);
      })
      .catch(err => console.log(err));
  };

  let columns = [
    {
      dataField: "vacancyNumberOfOccupiedJobs",
      text: intl.formatMessage({ id: "COLUMN.JOBS.NBR" }),
      attrs: (cell, row) => ({ id: `rowid_${row.id}` })
    },
    {
      dataField: "vacancyTitle",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" })
    },
    {
      dataField: "vacancyBusinessAddressPostalCode",
      formatter: value => value.substring(0, 2),
      text: intl.formatMessage({ id: "MODEL.LOCATION" })
    },
    {
      dataField: "status",
      text: intl.formatMessage({ id: "TEXT.STATUS" }),
      sort: true,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        return a - b;
      },
      formatter: value => (
        <span className={missionStatus[value].color}>
          {missionStatus[value].name}
        </span>
      )
    },

    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeStartDate",
      text: intl.formatMessage({ id: "COLUMN.START.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeEndDate",
      text: intl.formatMessage({ id: "COLUMN.END.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) =>
        row.status === 0 ? (
          <Link
            to={`/mission/update/${row.id}`}
            className="btn  btn-light-primary mr-2"
          >
            <FormattedMessage id="BUTTON.EDIT" />
          </Link>
        ) : null
    }
  ];

  let applicationColumns = [
    {
      headerAttrs: {
        hidden: true
      },
      dataField: "name",
      sort: true,
      formatter: (value, row) => (
        <span>
          {!isNullOrEmpty(row) && !isNullOrEmpty(row.applicantPicture) ? (
            <Avatar
              size="35"
              className="symbol-label mr-2"
              color="#3699FF"
              src={
                "data:image/" +
                row.applicantPicture.filename.split(".")[1] +
                ";base64," +
                row.applicantPicture.base64
              }
            />
          ) : (
            <Avatar
              className="symbol-label mr-2"
              color="#3699FF"
              size="35"
              maxInitials={2}
              name={
                row && row.firstname && row.firstname.concat(" ", row.lastname)
              }
            />
          )}
          {value.split(" ")[0]}
        </span>
      )
    },
    {
      dataField: "applicationID"
    },
    {
      headerAttrs: {
        hidden: true
      },
      dataField: "action",
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatter: (value, row) => {
        return row.accountDocumentUrl ? (
          <span className="text-dark-75 d-block font-size-lg">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`/document/display/${row.accountDocumentUrl}`}
              className="btn btn-light-primary"
            >
              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
            </a>
          </span>
        ) : (
          <div style={{ fontSize: 8 }}>
            <FormattedMessage id="MESSAGE.PROCESSING" />
          </div>
        );
      }
    }
  ];

  const expandRow = {
    renderer: (row, rowKey) => (
      <div className="subtable">
        <BootstrapTable
          bordered={false}
          classes={`table table-head-custom table-vertical-center overflow-hidden `}
          bootstrap4
          remote
          wrapperClasses="table-responsive test"
          keyField="applicationID"
          data={row && row.missionApplications ? row.missionApplications : []}
          columns={applicationColumns}
          noDataIndication={() => <NoApplicantsIndication />}
        ></BootstrapTable>
      </div>
    ),
    expandHeaderColumnRenderer: () => {
      return null;
    },
    headerClasses: "hidden",
    className: (isExpanded, row, rowIndex) => {
      if (row.status === 3 || row.status === 5) {
        return "fulfilled-row";
      } else if (rowIndex % 2 === 0) {
        return "odd-row";
      } else return "even-row";
    },
    onExpand: (row, isExpand, rowIndex, e) => {
      if (isExpand) {
        let exp = [...expanded, row.id];
        setExpanded(exp);
      } else {
        let exp = expanded.filter(x => x !== row.id);
        setExpanded(exp);
      }

      getMission(row.id)
        .then(res => res.data)
        .then(data =>
          localStorage.setItem("candidateMission", JSON.stringify(data))
        )
        .then(localStorage.setItem("candidate", JSON.stringify(row)));
    },
    showExpandColumn: true,
    expanded: expanded,
    expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
      let mission =
        missions && missions.filter(mission => mission.id === rowKey)[0];
      return (
        <div>
          <span
            onClick={() => filterExpanded()}
            data-tip={
              mission && mission.userName
                ? mission.userName
                : intl.formatMessage({ id: "CREATED.FOR.YOU.MYCONNECTT" })
            }
            className="symbol symbol-35 symbol-light-success mr-2"
          >
            {mission && (
              <Avatar
                className="symbol-label"
                color="#C9F7F5"
                size="35"
                fgColor="#1BC5BD"
                maxInitials={2}
                name={mission && mission.userName && mission.userName}
              />
            )}
          </span>

          {expanded ? (
            <i className="fas fa-angle-double-down text-primary"></i>
          ) : (
            <i className="fas fa-angle-double-right text-primary"></i>
          )}
        </div>
      );
    }
  };

  const filterExpanded = () => {
    let filtered = [];
    let rows = !isNullOrEmpty(missions)
      ? missions.filter(
          mission =>
            mission.status === 1 && !isNullOrEmpty(mission.missionApplications)
        )
      : [];
    !isNullOrEmpty(rows) && rows.map(row => filtered.push(row.id));
    setExpanded(filtered);
    return;
  };

  const NoApplicantsIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-info fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">
          <FormattedMessage id="MESSAGE.NO.APPLICANT.VACANCY" />
        </div>
      </div>
    </div>
  );
  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">
          <FormattedMessage id="MESSAGE.NO.MISSION.MATCH" />
        </div>
      </div>
    </div>
  );

  const RemotePagination = ({
    data,
    page,
    sizePerPage,
    onTableChange,
    totalSize,
    from,
    to
  }) => (
    <div>
      <PaginationProvider
        pagination={paginationFactory({
          custom: true,
          page,
          sizePerPage,
          totalSize,
          from,
          to,
          showTotal: true,
          firstPageText: intl.formatMessage({ id: "BEGINNING" }),
          prePageText: "<",
          nextPageText: ">",
          lastPageText: intl.formatMessage({ id: "END" }),
          nextPageTitle: ">",
          prePageTitle: "<"
        })}
      >
        {({ paginationProps, paginationTableProps }) => (
          <div>
            <div style={{ display: "none" }}>
              <BootstrapTable
                remote
                wrapperClasses="table-responsive"
                bordered={false}
                classes="table table-head-custom table-vertical-center overflow-hidden"
                bootstrap4
                keyField="id"
                data={[]}
                columns={columns}
                onTableChange={onTableChange}
                {...paginationTableProps}
                noDataIndication={() => <NoDataIndication />}
              />
            </div>
            <div className="d-flex flex-row justify-content-between">
              <PaginationListStandalone {...paginationProps} />
              <div className="d-flex flex-row align-items-center">
                <p className="ml-5" style={{ margin: 0 }}>
                  Total de {totalCount} offre(s)
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );

  const handleChangePage = (size, page) => {
    setPageNumber(page.page);
  };
  return (
    <div className="p-10">
      <h2 className="font-weight-boldest mb-5">Offres</h2>
      <BootstrapTable
        bordered={false}
        bootstrap4
        keyField="id"
        data={missions}
        columns={columns}
        //expandRow={expandRow}
      />
      <div style={{ marginTop: 30 }}>
        <RemotePagination
          data={missions}
          page={pageNumber}
          sizePerPage={pageSize}
          totalSize={totalCount}
          onTableChange={handleChangePage}
        />
      </div>
    </div>
  );
}

export default Missions;
