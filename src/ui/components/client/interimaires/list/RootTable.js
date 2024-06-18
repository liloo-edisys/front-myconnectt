/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { FormattedMessage, useIntl } from "react-intl";

import { useUIContext } from "./RootUIContext";
import ActionsColumnFormatter from "../formatters/ActionsColumnFormatter";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { searchInterimaires } from "../../../../../business/actions/interimaire/InterimairesActions";

const tenantID = +process.env.REACT_APP_TENANT_ID;

const baseDate = new Date();
baseDate.setMonth(baseDate.getMonth() - 1);
// eslint-disable-next-line no-extend-native

function RootTable({ refresh }) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const dispatch = useDispatch();
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);

  let { rootlist, loading, totalCount, companyID } = useSelector(
    state => ({
      rootlist:
        state.interimairesReducerData.interimaires &&
        state.interimairesReducerData.interimaires.list
          ? state.interimairesReducerData.interimaires.list
          : [],
      totalCount: state.interimairesReducerData.interimaires
        ? state.interimairesReducerData.interimaires.totalcount
        : 0,
      loading: state.interimairesReducerData.loading,
      companyID: state.auth.user.accountID
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    !loading &&
      dispatch(
        searchInterimaires.request({
          tenantID,
          accountID: companyID,
          pageSize: 5,
          pageNumber: pageNumber
        })
      );
  }, [rootlist]);

  useEffect(() => {
    if (refresh > 0) {
      dispatch(
        searchInterimaires.request({
          tenantID,
          accountID: companyID,
          pageSize: pageSize,
          pageNumber: pageNumber
        })
      );
    }
  }, [refresh, rootlist]);

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
          {intl.formatMessage({ id: "NO.MATCHING.INTERIMAIRE" })}
        </div>
      </div>
    </div>
  );

  const UIContext = useUIContext();
  const UIProps = useMemo(() => {
    return {
      ids: UIContext.ids,
      setIds: UIContext.setIds,
      queryParams: UIContext.queryParams,
      setQueryParams: UIContext.setQueryParams,
      openDisplayDialog: UIContext.openDisplayDialog
    };
  }, [UIContext]);

  let columns = [
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" })
    },
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "MODEL.LASTNAME" })
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" })
    },
    {
      dataField: "city",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.CITY" })
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
        openDisplayDialog: UIProps.openDisplayDialog
      }
    }
  ];

  const handleChangePage = (size, page) => {
    dispatch(
      searchInterimaires.request({
        tenantID,
        accountID: companyID,
        pageSize: size,
        pageNumber: page
      })
    );
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
          sizePerPageList: [
            {
              text: "5",
              value: 5
            },
            {
              text: "10",
              value: 10
            },
            {
              text: "25",
              value: 25
            },
            {
              text: "Toutes",
              value: rootlist && rootlist.length
            }
          ],
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
            <BootstrapTable
              remote
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              keyField="id"
              data={rootlist ? rootlist : []}
              columns={columns}
              onTableChange={onTableChange}
              {...paginationTableProps}
              noDataIndication={() => <NoDataIndication />}
            />
            <div className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-row align-items-center">
                <SizePerPageDropdownStandalone {...paginationProps} />
                <p className="ml-5" style={{ margin: 0 }}>
                  <FormattedMessage
                    id="MESSAGE.INTERIMAIRES.TOTALCOUNT"
                    values={{ totalCount: totalCount }}
                  />
                  <FormattedMessage
                    id="INTERIMAIRE.TOTAL.COUNT"
                    values={{ totalCount: totalCount }}
                  />
                </p>
              </div>
              <PaginationListStandalone {...paginationProps} />
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
    handleChangePage(sizePerPage, page);
  };

  return (
    <>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <span className="colmx-auto spinner spinner-primary"></span>
        </div>
      ) : (
        <div className="mx-auto">
          <RemotePagination
            data={rootlist}
            page={pageNumber}
            sizePerPage={pageSize}
            totalSize={totalCount}
            onTableChange={handleTableChange}
          />
        </div>
      )}
    </>
  );
}

export default RootTable;
