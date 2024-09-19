import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import { useHistory, useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { ApplicantDeleteModal } from "./ApplicantDeleteModal.js";
import { SourcingScopTalentModal } from "./SourcingScopTalentModal.js";
import { getJobTitles } from "actions/shared/listsActions";
import moment from "moment";
import { getInterimairesList } from "actions/backoffice/accountsActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import DatePicker from "react-datepicker";

function InterimairesTable(props) {
  const history = useHistory();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const intl = useIntl();
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [iSExtensions, setIsExtension] = useState(false);
  const [isControl, setIsControl] = useState(
    pathname === "/interimaires-to-check" ? true : false
  );
  const [isAscending, setIsAscending] = useState(true);

  const [isDispo, setIsDispo] = useState(0);
  const [sortBy, setSortBy] = useState(0);
  const [selectedPostalCode, setSelectedPostalCode] = useState("");
  const [selectedQualification, setSelectedQualification] = useState();
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [selectedLastName, setSelectedLastName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [selectedCreationDate, setSelectedCreationDate] = useState("");
  const [toggleApplicantDeleteModal, setToggleApplicantDeleteModal] = useState(
    null
  );
  const [
    toggleSourcingScopTalentModal,
    setToggleSourcingScopTalentModal
  ] = useState(false);

  const {
    user,
    totalCount,
    interimairesList,
    interimairesLoading
  } = useSelector(state => ({
    totalCount: state.accountsReducerData.interimairesList.totalcount,
    user: state.recruiterReducerData.user,
    interimairesList: state.accountsReducerData.interimairesList,
    interimairesLoading: state.accountsReducerData.interimairesLoading
  }));

  const { userAuth, jobTitleList, companies } = useSelector(state => ({
    userAuth: state.auth.user,
    jobTitleList: state.lists.jobTitles,
    companies: state.companies.companies
  }));
  const statusArray = [
    { id: 1, value: 1, name: intl.formatMessage({ id: "STATUS.REGISTERED" }) },
    {
      id: 6,
      value: 6,
      name: intl.formatMessage({ id: "STATUS.CAN_MATCH" })
    },
    { id: 2, value: 2, name: intl.formatMessage({ id: "TEXT.COMPLETE" }) },
    {
      id: 3,
      value: 3,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.BACKOFFICE" })
    },
    {
      id: 4,
      value: 4,
      name: intl.formatMessage({ id: "STATUS.ANAEL.UPDATED" })
    },
    {
      id: 5,
      value: 5,
      name: intl.formatMessage({ id: "STATUS.DISABLED" })
    }
  ];

  const dispoArray = [
    { id: 1, name: "Disponible" },
    { id: 2, name: "Indisponible" }
  ];

  const sortByArray = [
    { id: 1, name: "Date de création" },
    { id: 2, name: "Date de modification" },
    { id: 3, name: "Nom" },
    { id: 4, name: "Prénom" },
    { id: 5, name: "Code postal" }
  ];

  const disableApplicant = applicant => {};

  const getData = () => {
    let body = {
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      firstName: selectedFirstName,
      lastName: selectedLastName,
      email: selectedEmail,
      phoneNumber: selectedPhone,
      cp: selectedPostalCode,
      qualificationID: selectedQualification ? +selectedQualification : 0,
      availability: selectedAvailability,
      isDispo: +isDispo,
      sortBy: +sortBy,
      isAscending: isAscending ? true : false
    };
    if (isControl) {
      body = {
        ...body,
        status: [1, 2, 6]
      };
    } else if (selectedStatus > 0) {
      body = {
        ...body,
        status: [parseInt(selectedStatus)]
      };
    }
    getInterimairesList(body, dispatch);
    setIsExtension(true);
  };

  useEffect(() => {
    getData();
    dispatch(getJobTitles.request());
  }, [pageNumber]);

  const columns = [
    {
      dataField: "anaelID",
      text: intl.formatMessage({ id: "COLUMN.ANAEL.ID" })
    },
    {
      dataField: "id",
      text: intl.formatMessage({ id: "COLUMN.MYCONNECTT.ID.INTERIMAIRE" })
    },
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "COLUMN.NAME" })
    },
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" })
    },
    {
      dataField: "postalCode",
      text: intl.formatMessage({ id: "COLUMN.POSTALCODE.INTERIMAIRE" })
    },
    {
      dataField: "mobilePhoneNumber",
      text: intl.formatMessage({ id: "COLUMN.PHONE.NUMBER" }),
      formatter: value => (
        <span>{value && value.match(/.{1,2}/g).join(" ")}</span>
      )
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" })
    },
    {
      dataField: "nationality.frenchName",
      text: intl.formatMessage({ id: "COLUMN.NATIONALITY" })
    },
    {
      dataField: "applicantStatusID",
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      formatter: value => (
        <span>
          {value === 1
            ? intl.formatMessage({ id: "STATUS.REGISTERED" })
            : value === 2
            ? intl.formatMessage({ id: "TEXT.COMPLETE" })
            : value === 3
            ? intl.formatMessage({ id: "STATUS.VALIDATED.BACKOFFICE" })
            : value === 4
            ? intl.formatMessage({ id: "STATUS.ANAEL.UPDATED" })
            : value === 5
            ? intl.formatMessage({ id: "STATUS.DISABLED" })
            : value === 6
            ? intl.formatMessage({ id: "STATUS.CAN_MATCH" })
            : intl.formatMessage({ id: "STATUS.REGISTERED" })}
        </span>
      )
    },
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "COLUMN.CREATION.INTERIMAIRE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "lastModifiedDate",
      text: intl.formatMessage({ id: "COLUMN.MODIFICATION.INTERIMAIRE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "lastConnexionDate",
      text: intl.formatMessage({ id: "COLUMN.CONNEXION.INTERIMAIRE" }),
      formatter: value => (
        <span>{value ? new Date(value).toLocaleDateString("fr-FR") : "-"}</span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          <Link
            to={`interimaire/edit/${row.id}`}
            className="btn btn-light-warning mr-2"
          >
            <FormattedMessage id="BUTTON.EDIT" />
          </Link>
          <a
            title={intl.formatMessage({ id: "BUTTON.DELETE" })}
            className="btn btn-icon btn-light-danger mr-2 button-width"
            onClick={() => setToggleApplicantDeleteModal(row)}
          >
            <div>
              <FormattedMessage id="BUTTON.DELETE" />
            </div>
          </a>
        </div>
      )
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
          <FormattedMessage id="MESSAGE.NO.INTERIMAIRE" />
        </div>
      </div>
    </div>
  );

  const handleChangePage = (size, page) => {
    localStorage.setItem("pageNumber", page);
    getData();
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
                    id="MESSAGE.INTERIMAIRES.TOTALCOUNT"
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
    //handleChangePage(sizePerPage, page);
  };

  const renderPostalCodeSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="CP"
          className="form-control"
          type="text"
          value={selectedPostalCode}
          onChange={e => setSelectedPostalCode(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.POSTALCODE" />
        </small>
      </div>
    );
  };
  const renderFirstNameSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedFirstName}
          onChange={e => setSelectedFirstName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.FIRSTNAME" />
        </small>
      </div>
    );
  };

  const renderLastNameSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedLastName}
          onChange={e => setSelectedLastName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.LASTNAME" />
        </small>
      </div>
    );
  };

  const renderEmailSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="email"
          className="form-control"
          type="text"
          value={selectedEmail}
          onChange={e => setSelectedEmail(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.EMAIL" />
        </small>
      </div>
    );
  };

  const renderQualificationSelector = () => {
    return (
      <div className="col-lg-2">
        <select
          className="col-lg-12 form-control"
          name="jobTitleID"
          value={selectedQualification}
          onChange={e => setSelectedQualification(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.QUALIFICATION" })} --
          </option>
          {jobTitleList.map((job, i) => (
            <option key={i} label={job.name} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.QUALIFICATION" />
        </small>
      </div>
    );
  };

  const renderPhoneInput = () => {
    return (
      <div className="col-lg-2">
        <input
          name="phone"
          className="form-control"
          type="text"
          value={selectedPhone}
          onChange={e => setSelectedPhone(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="COLUMN.PHONE.NUMBER" />
        </small>
      </div>
    );
  };

  const renderStatusSelector = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "COLUMN.STATUS" })} --
          </option>
          {statusArray.map(status => (
            <option key={status.id} label={status.name} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.STATUS" />
        </small>
      </div>
    );
  };

  const renderIsDispo = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p2"
          name="DispoId"
          value={isDispo}
          onChange={e => setIsDispo(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgray" }}>
            -- Disponibilité --
          </option>
          {dispoArray.map(job => (
            <option key={job.id} label={job.name} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">Disponibilité</small>
      </div>
    );
  };

  const renderCreationDateSelector = () => {
    return (
      <div className="col-lg-1 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          onChange={val => {
            setSelectedCreationDate(
              moment(val)
                .locale("fr")
                .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)
            );
          }}
          selected={
            (selectedCreationDate && new Date(selectedCreationDate)) || null
          }
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
          locale="fr"
        />
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.CREATION.DATE" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    setPageNumber(1);
    let body = {
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: 1,
      firstName: selectedFirstName,
      lastName: selectedLastName,
      cp: selectedPostalCode,
      qualificationID: selectedQualification ? +selectedQualification : 0,
      availability: selectedAvailability,
      email: selectedEmail,
      phoneNumber: selectedPhone,
      isDispo: +isDispo,
      sortBy: +sortBy,
      isAscending: isAscending ? true : false
    };
    if (selectedStatus > 0) {
      body = {
        ...body,
        status: [parseInt(selectedStatus)]
      };
    }
    if (isControl) {
      body = {
        ...body,
        status: [1, 2, 6]
      };
    }
    if (selectedCreationDate) {
      body = {
        ...body,
        creationDate: moment(selectedCreationDate).toDate()
      };
    }
    getInterimairesList(body, dispatch);
  };

  return interimairesLoading ? (
    <span className="colmx-auto spinner spinner-primary"></span>
  ) : (
    <>
      {toggleSourcingScopTalentModal && (
        <SourcingScopTalentModal
          onHide={() => {
            setToggleSourcingScopTalentModal(false);
          }}
          show={true}
          getData={onSearchFilteredContracts}
        />
      )}
      {toggleApplicantDeleteModal != null && (
        <ApplicantDeleteModal
          applicant={toggleApplicantDeleteModal}
          onHide={() => {
            setToggleApplicantDeleteModal(null);
          }}
          show={true}
          getData={onSearchFilteredContracts}
        />
      )}
      <div className="row mb-5 mx-15">
        {renderPostalCodeSelector()}
        {renderFirstNameSelector()}
        {renderLastNameSelector()}
        {renderEmailSelector()}
        {renderQualificationSelector()}
        {renderPhoneInput()}
        {renderStatusSelector()}
        {renderCreationDateSelector()}
        {renderIsDispo()}
        <div className="col-lg-2 width-100">
          <div className="row">
            <label className="col-lg-8 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.INTERIMAIRE.CONTROL" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    checked={isControl}
                    onChange={e => setIsControl(!isControl)}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
        </div>

        <div
          style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}
        >
          <div className="col-lg-2">
            <select
              className="form-control form-control-lg p2"
              name="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option selected value={0} style={{ color: "lightgray" }}>
                -- Trier par --
              </option>
              {sortByArray.map(s => (
                <option key={s.id} label={s.name} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <small className="form-text text-muted">Trier par</small>
          </div>
          <div
            className="row"
            style={{ display: "flex", width: "220px", marginTop: "-20px" }}
          >
            <label
              className="col-lg-8 width-100 d-flex col-form-label"
              style={{ paddingTop: "34px" }}
            >
              {isAscending ? "Triage Croissant" : "Triage Décroissant"}
            </label>
            <span className="switch switch switch-sm">
              <label>
                <input
                  type="checkbox"
                  checked={isAscending}
                  onChange={e => setIsAscending(!isAscending)}
                />
                <span></span>
              </label>
            </span>
          </div>
          <button
            onClick={onSearchFilteredContracts}
            className="btn btn-success font-weight-bold ml-10 mb-10 px-10"
          >
            <i className="fa fa-search mr-5"></i>
            <span>
              <FormattedMessage id="BUTTON.SEARCH" />
            </span>
          </button>
          <a
            title={intl.formatMessage({ id: "TEXT.SOURCING.SCOPTALENT" })}
            style={{ height: 40 }}
            className="btn btn-light-info ml-5"
            onClick={() => setToggleSourcingScopTalentModal(true)}
          >
            <FormattedMessage id="TEXT.SOURCING.SCOPTALENT" />
          </a>
        </div>
      </div>
      <div>
        {interimairesList && interimairesList.list && (
          <BootstrapTable
            remote
            rowClasses={["dashed"]}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={interimairesList && interimairesList.list}
            columns={columns}
          />
        )}
        <div style={{ marginTop: 30 }}>
          <RemotePagination
            data={interimairesList && interimairesList.list}
            page={pageNumber}
            sizePerPage={pageSize}
            totalSize={interimairesList && interimairesList.totalcount}
            onTableChange={handleTableChange}
          />
        </div>
      </div>
    </>
  );
}

export default InterimairesTable;
