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
import RemunerationElementForm from "./RemunerationElementForm";
import { RemunerationElementDeleteModal } from "./RemunerationElementDeleteModal";
import { NavLink, useHistory } from "react-router-dom";

function RemunerationElementsTable(props) {
  const api = process.env.REACT_APP_WEBAPI_URL;
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  const [selectedName, setSelectedName] = useState("");
  const [missionRemunerationList, setMissionRemunerationList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const { user, jobskills } = useSelector(
    state => ({
      user: state.user.user,
      jobskills: state.lists.jobSkills
    }),
    shallowEqual
  );

  const columns = [
    {
      dataField: "label",
      text: intl.formatMessage({ id: "TEXT.REMUNERATION.ELEMENT.NAME" })
    },
    {
      dataField: "code",
      text: intl.formatMessage({ id: "TEXT.JOBTITLE.CODE" })
    },
    {
      dataField: "isVisible",
      text: intl.formatMessage({ id: "VISIBLE.BY.CLIENT.TEXT" }),
      formatter: value => {
        if (value) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <div
                className="bg-light-success px-5 py-2"
                style={{ borderRadius: 5 }}
              >
                <span className="text-success">Oui</span>
              </div>
            </div>
          );
        } else {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <div
                className="bg-light-danger px-5 py-2"
                style={{ borderRadius: 5 }}
              >
                <span className="text-danger">Non</span>
              </div>
            </div>
          );
        }
      }
    },
    {
      dataField: "id",
      text: intl.formatMessage({ id: "MATCHING.TABLE.ACTIONS" }),
      formatter: value => (
        <div>
          <NavLink
            className="btn btn-light-primary btn-sm mr-2"
            to={`/remuneration-elements/edit-remuneration-element/${value}`}
          >
            Modifier
          </NavLink>
          <NavLink
            className="btn btn-light-danger btn-sm"
            to={`/remuneration-elements/delete-remuneration-element/${value}`}
          >
            Supprimer
          </NavLink>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (user) {
      getData();
    }
  }, [user, selectedPageNumber]);

  const getData = () => {
    //dispatch(getJobSkills.request());
    const SEARCH_MISSION_REMUNERATION_API =
      api + "api/MissionRemuneration/search";
    const body = {
      tenantID: user.tenantID,
      pageNumber: selectedPageNumber,
      pageSize: selectedPageSize,
      name: selectedName
    };
    axios
      .post(SEARCH_MISSION_REMUNERATION_API, body)
      .then(res => {
        setMissionRemunerationList(res.data.list);
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

  const onSearchFilteredContracts = () => {
    setSelectedPageNumber(1);
    const SEARCH_ACCOUNTS_GROUP_API = api + "api/MissionRemuneration/search";
    const body = {
      tenantID: user.tenantID,
      pageNumber: 1,
      pageSize: selectedPageSize,
      name: selectedName
    };
    axios
      .post(SEARCH_ACCOUNTS_GROUP_API, body)
      .then(res => {
        setMissionRemunerationList(res.data.list);
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
                data={missionRemunerationList}
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
                    id="MESSAGE.REMUNERATION.ELEMENT.TOTALCOUNT"
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
      <BootstrapTable
        remote
        rowClasses={"dashed"}
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        keyField="id"
        data={missionRemunerationList}
        columns={columns}
      />
      <div style={{ marginTop: 30 }}>
        <RemotePagination
          data={missionRemunerationList}
          page={selectedPageNumber}
          sizePerPage={selectedPageSize}
          totalSize={totalCount}
          onTableChange={handleTableChange}
        />
      </div>
      <ContentRoute path="/remuneration-elements/new-remuneration-element">
        <RemunerationElementForm
          onHide={() => history.push("/remuneration-elements")}
          getData={getData}
        />
      </ContentRoute>
      <ContentRoute path="/remuneration-elements/edit-remuneration-element/:id">
        <RemunerationElementForm
          onHide={() => history.push("/remuneration-elements")}
          getData={getData}
        />
      </ContentRoute>
      <ContentRoute path="/remuneration-elements/delete-remuneration-element/:id">
        <RemunerationElementDeleteModal
          onHide={() => history.push("/remuneration-elements")}
          getData={getData}
        />
      </ContentRoute>
    </div>
  );
}

export default RemunerationElementsTable;
