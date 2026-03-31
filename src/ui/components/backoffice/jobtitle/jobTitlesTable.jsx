import React, { useState, useEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import { ContentRoute } from "../../../../_metronic/layout";
import JobtitleForm from "./jobTitleForm.jsx";
import { JobtitleDeleteModal } from "./jobTitleDeleteModal.jsx";
import { NavLink, useHistory } from "react-router-dom";

function JobtitlesTable(props) {
  const api = process.env.REACT_APP_WEBAPI_URL;
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  const [selectedName, setSelectedName] = useState("");
  const [jobtitlesList, setJobtitlesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activityDomainsList, setActivityDomainsList] = useState([]);
  const [
    activityDomainsListIsLoaded,
    setActivityDomainsListIsLoaded
  ] = useState(false);
  const [selectedActivityDomain, setSelectedActivityDomain] = useState(0);

  const { user, jobskills } = useSelector(
    state => ({
      user: state.user.user,
      jobskills: state.lists.jobSkills
    }),
    shallowEqual
  );

  const columns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "TEXT.JOBTITLE.NAME" })
    },
    {
      dataField: "code",
      text: intl.formatMessage({ id: "TEXT.JOBTITLE.CODE" })
    },
    {
      dataField: "arrayActivityDomainIDs",
      text: intl.formatMessage({ id: "ACTIVITY.DOMAINE.LIST" }),
      formatter: value =>
        value.map((activity, i) => (
          <span key={i}>
            {activityDomainsList.filter(item => item.id === activity)[0]?.name}{" "}
            {i !== value.length - 1 && ", "}
          </span>
        ))
    },
    {
      dataField: "id",
      text: intl.formatMessage({ id: "MATCHING.TABLE.ACTIONS" }),
      formatter: value => (
        <div>
          <NavLink
            className="btn btn-light-primary btn-sm mr-2"
            to={`/jobtitles/edit-jobtitle/${value}`}
          >
            Modifier
          </NavLink>
          <NavLink
            className="btn btn-light-danger btn-sm"
            to={`/jobtitles/delete-jobtitle/${value}`}
          >
            Supprimer
          </NavLink>
        </div>
      )
    }
  ];

  useEffect(() => {
    let URL = `${process.env.REACT_APP_WEBAPI_URL}api/ActivityDomain`;
    axios.get(URL).then(res => {
      setActivityDomainsList(res.data);
      setActivityDomainsListIsLoaded(true);
    });
    if (user && activityDomainsListIsLoaded) {
      getData();
    }
  }, [user, selectedPageNumber, activityDomainsListIsLoaded]);

  const getData = () => {
    const SEARCH_JOBTITLES_API = api + "api/JobTitle/search";
    const body = {
      tenantID: user.tenantID,
      pageNumber: selectedPageNumber,
      pageSize: selectedPageSize,
      name: selectedName
    };
    axios
      .post(SEARCH_JOBTITLES_API, body)
      .then(res => {
        setJobtitlesList(res.data.list);
        setTotalCount(res.data.totalcount);
      })
      .catch(err => console.log(err));
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
    setSelectedPageNumber(parseInt(page));
    setSelectedPageSize(sizePerPage);

    //handleChangePage(sizePerPage, page);
  };

  const renderName = () => {
    return (
      <div className="col-lg-2 width-100">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.LASTNAME" />
        </small>
      </div>
    );
  };

  const renderQualifications = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedActivityDomain}
          onChange={e => setSelectedActivityDomain(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "MATCHING.ACTIVITY.DOMAINS" })} --
          </option>
          {activityDomainsList.map(job => (
            <option key={job.id} label={job.name} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="MATCHING.ACTIVITY.DOMAINS" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    setSelectedPageNumber(1);
    const SEARCH_JOBTITLES_API = api + "api/JobTitle/search";
    const body = {
      tenantID: user.tenantID,
      pageNumber: 1,
      pageSize: selectedPageSize,
      name: selectedName,
      activityDomainID: parseInt(selectedActivityDomain)
    };
    axios
      .post(SEARCH_JOBTITLES_API, body)
      .then(res => {
        setJobtitlesList(res.data.list);
        setTotalCount(res.data.totalcount);
      })
      .catch(err => console.log(err));
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
                data={jobtitlesList}
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
                    id="MESSAGE.JOBTITLE.TOTALCOUNT"
                    values={{ totalCount }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );

  return (
    <div>
      <div className="row mb-5 mx-5">
        {renderName()}
        {renderQualifications()}
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
      {activityDomainsListIsLoaded && (
        <>
          <BootstrapTable
            remote
            rowClasses={"dashed"}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={jobtitlesList}
            columns={columns}
          />
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={jobtitlesList}
              page={selectedPageNumber}
              sizePerPage={selectedPageSize}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          </div>
        </>
      )}
      <ContentRoute path="/jobtitles/new-jobtitle">
        <JobtitleForm
          onHide={() => history.push("/jobtitles")}
          getData={getData}
        />
      </ContentRoute>
      <ContentRoute path="/jobtitles/edit-jobtitle/:id">
        <JobtitleForm
          onHide={() => history.push("/jobtitles")}
          getData={getData}
        />
      </ContentRoute>
      <ContentRoute path="/jobtitles/delete-jobtitle/:id">
        <JobtitleDeleteModal
          onHide={() => history.push("/jobtitles")}
          getData={getData}
        />
      </ContentRoute>
    </div>
  );
}

export default JobtitlesTable;
