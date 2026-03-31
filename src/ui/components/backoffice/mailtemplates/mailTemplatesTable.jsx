import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import * as actionTypes from "constants/constants";
import {
  getMailTemplates,
  getMailTemplateCategories
} from "../../../../business/actions/backoffice/mailTemplatesActions.js";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import { MailTemplateDialog } from "./mailTemplatesModals/mailTemplateDialog.jsx";

function MailTemplatesTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [toogleMailTemplateModal, setToogleMailTemplateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const { mailTemplatesList, user, totalCount, categories } = useSelector(
    state => ({
      user: state.user.user,
      mailTemplatesList: state.mailTemplatesdReducerData.mailTemplates.list,
      totalCount: state.mailTemplatesdReducerData.mailTemplates.totalcount,
      categories: state.mailTemplatesdReducerData.categories
    })
  );

  const getData = body => {
    dispatch(getMailTemplates.request(body));
  };

  useEffect(() => {
    getData({
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      categoryID: parseInt(selectedCategory)
    });
    dispatch(getMailTemplateCategories.request());
  }, [pageNumber, refresh]);

  const columns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "COLUMN.NAME" })
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          <a
            onClick={e => {
              e.stopPropagation();
              onShowMailTemplateModal(row);
            }}
            className="btn btn-light-info mr-2"
          >
            <i className="far fa-edit"></i>
          </a>
        </div>
      )
    }
  ];

  const renderCategorySelect = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedCategory}
          onChange={e => {
            setSelectedCategory(e.target.value);
            getData({
              tenantID: user.tenantID,
              pageSize: pageSize,
              pageNumber: pageNumber,
              categoryID: parseInt(e.target.value)
            });
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- Catégorie --
          </option>
          {categories.map(category => (
            <option
              key={category.emailingGlobalTemplateCategoryID}
              label={category.name}
              value={category.emailingGlobalTemplateCategoryID}
            >
              {category.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.CATEGORY" />
        </small>
      </div>
    );
  };

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
          <FormattedMessage id="MESSAGE.NO.MAIL.TEMPLATE" />
        </div>
      </div>
    </div>
  );

  const handleChangePage = (size, page) => {
    localStorage.setItem("pageNumber", page);
    getData({
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      categoryID: parseInt(selectedCategory)
    });
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
                  <FormattedMessage
                    id="MESSAGE.MAIL.TEMPLATE.TOTALCOUNT"
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

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
  };

  const onShowMailTemplateModal = row => {
    setToogleMailTemplateModal(true);
    dispatch({
      type: actionTypes.SET_MAIL_TEMPLATE,
      payload: row
    });
  };

  const onHideMailTemplateModal = row => {
    setToogleMailTemplateModal(false);
    dispatch({
      type: actionTypes.SET_MAIL_TEMPLATE,
      payload: null
    });
    getData({
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      categoryID: parseInt(selectedCategory)
    });
  };

  return (
    <>
      <div className="row mb-5 mx-15">{renderCategorySelect()}</div>
      <div>
        {toogleMailTemplateModal && (
          <MailTemplateDialog
            onHide={onHideMailTemplateModal}
            getData={getData}
          />
        )}
        {mailTemplatesList && mailTemplatesList && (
          <BootstrapTable
            remote
            rowClasses={["dashed"]}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={mailTemplatesList}
            columns={columns}
          />
        )}
        <div style={{ marginTop: 30 }}>
          <RemotePagination
            data={mailTemplatesList}
            page={pageNumber}
            sizePerPage={pageSize}
            totalSize={totalCount}
            onTableChange={handleTableChange}
          />
        </div>
      </div>
    </>
  );
}

export default MailTemplatesTable;
