import React, { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import axios from "axios";
import { useParams } from "react-router-dom";

function VancancyTemplate(props) {
  const { history } = props;
  const { id } = useParams();
  const intl = useIntl();
  const [vacancyTemplates, setVacancyTemplates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  useEffect(() => {
    getData();
  }, [pageNumber]);
  const getData = () => {
    const VACANCY_TEMPLATE_URL = `${process.env.REACT_APP_WEBAPI_URL}api/VacancyTemplate/SearchTemplates`;
    let body = {
      tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
      accountID: parseInt(id),
      userID: 0,
      pageSize: pageSize,
      pageNumber: pageNumber
    };
    axios
      .post(VACANCY_TEMPLATE_URL, body)
      .then(res => {
        setVacancyTemplates(res.data.list);
        setTotalCount(res.data.totalcount);
      })
      .catch(err => console.log(err));
  };

  const columns = [
    {
      dataField: "vacancyTitle",
      text: "Titre"
    },
    {
      dataField: "vacancyContractualProposedHourlySalary",
      text: intl.formatMessage({ id: "MODEL.VACANCY.HOURLY_RATE" }),
      formatter: value => <span>{value}€</span>
    },
    {
      dataField: "missionWeeklyWorkHours",
      text: intl.formatMessage({ id: "MODEL.VACANCY.NBR_HOUR" })
    },
    {
      dataField: "vacancyMissionDescription",
      text: "Description"
    }
  ];

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
                  <FormattedMessage
                    id="MESSAGE.TEMPLATES.TOTALCOUNT"
                    values={{ totalCount: totalCount }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
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

  const handleChangePage = (size, page) => {
    setPageNumber(page.page);
  };
  return (
    <div className="p-10">
      <h2 className="font-weight-boldest mb-5">
        <FormattedMessage id="TITLE.VACANCY.TEMPLATES" />
      </h2>
      <BootstrapTable
        remote
        rowClasses={["dashed"]}
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        keyField="id"
        data={vacancyTemplates}
        columns={columns}
      />
      <div style={{ marginTop: 30 }}>
        <RemotePagination
          data={vacancyTemplates}
          page={pageNumber}
          sizePerPage={pageSize}
          totalSize={totalCount}
          onTableChange={handleChangePage}
        />
      </div>
    </div>
  );
}

export default VancancyTemplate;
