import React, { useState, useEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { getJobSkills } from "actions/shared/ListsActions";
import { FormattedMessage, useIntl } from "react-intl";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import { ContentRoute } from "../../../../_metronic/layout";
import JobskillForm from "./JobskillForm";
import { JobskillDeleteModal } from "./JobskillDeleteModal";
import { NavLink, useHistory } from "react-router-dom";

function JobskillsTable(props) {
  const api = process.env.REACT_APP_WEBAPI_URL;
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  const [selectedName, setSelectedName] = useState("");
  const [jobskillsList, setJobskillsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const { user } = useSelector(
    (state) => ({
      user: state.user.user,
    }),
    shallowEqual
  );

  const columns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "TEXT.JOBSKILL.NAME" }),
    },
    {
      dataField: "skillType",
      text: intl.formatMessage({ id: "TEXT.JOBSKILL.TYPE" }),
      formatter: (value) => value || "-",
    },
    {
      dataField: "activityDomains",
      text: intl.formatMessage({ id: "TEXT.JOB.TITLE" }),
      formatter: (value, row) => {
        if (!value || value.length === 0) return "-";
        return value.map((domain) => domain.name).join(", ");
      },
    },
    {
      dataField: "id",
      text: intl.formatMessage({ id: "MATCHING.TABLE.ACTIONS" }),
      formatter: (value) => (
        <div>
          <NavLink
            className="btn btn-light-primary btn-sm mr-2"
            to={`/jobskills/edit-jobskill/${value}`}
          >
            Modifier
          </NavLink>
          <NavLink
            className="btn btn-light-danger btn-sm"
            to={`/jobskills/delete-jobskill/${value}`}
          >
            Supprimer
          </NavLink>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user, selectedPageNumber, selectedPageSize]);

  const getData = () => {
    const SEARCH_JOBSKILLS_API = `${api}api/JobSkill/search`;
    const body = {
      tenantID: user.tenantID,
      pageNumber: selectedPageNumber,
      pageSize: selectedPageSize,
      name: selectedName,
    };

    axios
      .post(SEARCH_JOBSKILLS_API, body)
      .then((res) => {
        setJobskillsList(res.data.list);
        setTotalCount(res.data.totalcount);
        console.log("res.data.list ---------> ", res.data.list);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des données:", err);
      });
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
          <FormattedMessage id="MESSAGE.NO.INTERIMAIRE" />
        </div>
      </div>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setSelectedPageNumber(page);
    setSelectedPageSize(sizePerPage);
  };

  const renderName = () => {
    return (
      <div className="col-lg-2 width-100">
        <input
          name="name"
          className="form-control"
          type="text"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          placeholder={intl.formatMessage({ id: "MODEL.LASTNAME" })}
        />
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.LASTNAME" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    setSelectedPageNumber(1);
    getData();
  };

  const paginationOptions = {
    custom: true,
    totalSize: totalCount,
    page: selectedPageNumber,
    sizePerPage: selectedPageSize,
    showTotal: true,
    firstPageText: intl.formatMessage({ id: "BEGINNING" }),
    prePageText: "<",
    nextPageText: ">",
    lastPageText: intl.formatMessage({ id: "END" }),
    nextPageTitle: ">",
    prePageTitle: "<",
  };

  return (
    <div>
      <div className="row mb-5 mx-5">
        {renderName()}
        <div className="col-lg-2">
          <button
            onClick={onSearchFilteredContracts}
            className="btn btn-success font-weight-bold ml-10 mb-10 px-10"
          >
            <i className="fa fa-search mr-5"></i>
            <span>
              <FormattedMessage id="BUTTON.SEARCH" />
            </span>
          </button>
        </div>
      </div>

      <PaginationProvider pagination={paginationFactory(paginationOptions)}>
        {({ paginationProps, paginationTableProps }) => (
          <div>
            <BootstrapTable
              remote
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              keyField="id"
              data={jobskillsList}
              columns={columns}
              onTableChange={handleTableChange}
              noDataIndication={() => <NoDataIndication />}
              {...paginationTableProps}
            />
            <div className="d-flex flex-row justify-content-between align-items-center mt-3">
              <PaginationListStandalone {...paginationProps} />
              <div className="d-flex flex-row align-items-center">
                <p className="ml-5 mb-0">
                  <FormattedMessage
                    id="MESSAGE.JOBSKILL.TOTALCOUNT"
                    values={{ totalCount }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>

      <ContentRoute path="/jobskills/new-jobskill">
        <JobskillForm
          onHide={() => history.push("/jobskills")}
          getData={getData}
        />
      </ContentRoute>
      <ContentRoute path="/jobskills/edit-jobskill/:id">
        <JobskillForm
          onHide={() => history.push("/jobskills")}
          getData={getData}
        />
      </ContentRoute>
      <ContentRoute path="/jobskills/delete-jobskill/:id">
        <JobskillDeleteModal
          onHide={() => history.push("/jobskills")}
          getData={getData}
        />
      </ContentRoute>
    </div>
  );
}

export default JobskillsTable;
