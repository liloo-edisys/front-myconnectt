import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormattedMessage, useIntl } from "react-intl";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import { useParams } from "react-router-dom";

function CommercialAgreements({ history }) {
  const { id } = useParams();
  const intl = useIntl();
  const [agreementList, setAgreementList] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
  }, [pageNumber]);

  const getData = () => {
    setLoading(true);
    const body = {
      tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
      accountID: parseInt(id),
      groupID: 0,
      qualificationID: 0,
      pageSize: pageSize,
      pageNumber: pageNumber
    };
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/Search`,
        body
      )
      .then(res => {
        setLoading(false);
        setAgreementList(res.data);
      });
  };

  const columns = [
    {
      dataField: "qualificationTitle",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" })
    },
    {
      dataField: "accountName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" })
    },
    {
      dataField: "groupName",
      text: intl.formatMessage({ id: "COLUMN.GROUP" })
    },
    {
      dataField: "coefficient",
      text: intl.formatMessage({ id: "TEXT.COEFFICIENT" })
    },
    {
      dataField: "validatedDate",
      text: intl.formatMessage({ id: "COLUMN.VALIDATION.DATE" }),
      formatter: value => (
        <span>{value ? new Date(value).toLocaleDateString("fr-FR") : ""}</span>
      )
    },
    {
      dataField: "validatedByName",
      text: intl.formatMessage({ id: "COLUMN.VALIDATED.BY" })
    }
  ];

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
          <FormattedMessage id="MESSAGE.NO.COMMERCIAL.AGREEMENT" />
        </div>
      </div>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
  };

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
                  Total de {agreementList && agreementList.totalcount} Accord(s)
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );
  return (
    <div className="card card-custom">
      <div className="card-body">
        <h2 className="font-weight-boldest mb-5">Accords commerciaux</h2>
        {loading ? (
          <div className="mt-10">
            <span className="colmx-auto spinner spinner-primary"></span>
          </div>
        ) : (
          <>
            <BootstrapTable
              remote
              rowClasses={["dashed"]}
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              keyField="id"
              data={agreementList ? agreementList.list : []}
              columns={columns}
            />
            <div style={{ marginTop: 30 }}>
              <RemotePagination
                data={agreementList && agreementList.list}
                page={pageNumber}
                sizePerPage={pageSize}
                totalSize={agreementList && agreementList.totalcount}
                onTableChange={handleTableChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CommercialAgreements;
