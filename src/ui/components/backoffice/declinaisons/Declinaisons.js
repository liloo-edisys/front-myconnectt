import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import ApplicantsListModal from "./ApplicantsListModal";
import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";
import { Route, useHistory } from "react-router-dom";
import WorksiteEditModal from "../customers/companiesModals/WorksiteEditModal";

const api = process.env.REACT_APP_WEBAPI_URL;

export default function Declinaisons() {
  const intl = useIntl();
  const history = useHistory();
  const { pathname } = useLocation();
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));
  const [declinaisonsList, setDeclinaisonsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [listType, setListType] = useState("");
  const [activeDataList, setActiveDataList] = useState(null);

  useEffect(() => {
    getDeclinaisons();
    if (!activeDataList) {
      if (pathname === "/decline/client/display") {
        history.push("/decline/client");
      } else if (pathname === "/decline/applicant/display") {
        history.push("/decline/applicant");
      }
    }
  }, [pathname]);

  const columns = [
    {
      dataField: "applicantID",
      text: "ID de l'intérimaire"
    },
    {
      dataField: "applicant.lastname",
      text: "Nom"
    },
    {
      dataField: "applicant.firstname",
      text: "Prénom"
    },
    {
      dataField: "nbrRefus",
      text: "Nombre de refus"
    },
    {
      dataField: "accounts",
      text: "Actions",
      formatter: value => (
        <button
          className="btn btn-light-primary btn-shadow font-weight-bold"
          onClick={() => onShowDataList("accounts", value)}
        >
          Clients
        </button>
      )
    }
  ];

  const columnsClient = [
    {
      dataField: "accountID",
      text: "ID du client"
    },
    {
      dataField: "account.name",
      text: "Nom"
    },
    {
      dataField: "account.address",
      text: "Adresse"
    },
    {
      dataField: "account.postalCode",
      text: "Code postal"
    },
    {
      dataField: "account.city",
      text: "Ville"
    },
    {
      dataField: "nbrRefus",
      text: "Nombre de refus"
    },
    {
      dataField: "applicants",
      text: "Actions",
      formatter: value => (
        <button
          className="btn btn-light-primary btn-shadow font-weight-bold"
          onClick={() => onShowDataList("applicants", value)}
        >
          Intérimaires
        </button>
      )
    }
  ];

  const getDeclinaisons = () => {
    const body = {
      tenantID: user.tenantID,
      pageSize: 10,
      pageNumber: pageNumber
    };

    const DECLINAISONS_URL = pathname.includes("/decline/client")
      ? `${api}api/MissionApplication/AccountsRefus`
      : `${api}api/MissionApplication/ApplicantsRefus`;

    axios
      .post(DECLINAISONS_URL, body)
      .then(res => {
        setDeclinaisonsList(res.data.list);
        setTotalCount(res.data.totalcount);
      })
      .catch(err => console.log(err));
  };

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
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
                    id="MESSAGE.MESSAGES.TOTALCOUNT"
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
        <div className="alert-text">Vous n'avez pas de messages</div>
      </div>
    </div>
  );

  const onHideDataList = () => {
    setActiveDataList(null);
    setListType("");
    history.goBack();
  };

  const onShowDataList = (type, data) => {
    setActiveDataList(data);
    setListType(type);
    if (type === "applicants") {
      history.push("/decline/client/display");
    } else {
      history.push("/decline/applicant/display");
    }
  };

  return (
    <>
      <Route path="/decline/applicant/display">
        {activeDataList && (
          <ApplicantsListModal
            onHide={onHideDataList}
            activeDataList={activeDataList}
            listType={listType}
          />
        )}
      </Route>
      <Route path="/decline/client/display">
        {activeDataList && (
          <ApplicantsListModal
            onHide={onHideDataList}
            activeDataList={activeDataList}
            listType={listType}
          />
        )}
      </Route>
      <Route path="/decline/applicant/edit/:id">
        <WorksiteEditModal
          show={true}
          history={history}
          onHide={onHideDataList}
        />
      </Route>
      <Card>
        <CardHeader
          title={intl.formatMessage({
            id: pathname.includes("/decline/client")
              ? "TEXT.APPLICANT.DECLINE"
              : "TEXT.CLIENT.DECLINE"
          })}
        />
        {/*activeDataList && <ApplicantsListModal onHide={onHideDataList} activeDataList={activeDataList} listType={listType}/>*/}
        <CardBody>
          <BootstrapTable
            remote
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={declinaisonsList}
            columns={
              pathname.includes("/decline/client") ? columnsClient : columns
            }
          />
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={declinaisonsList}
              page={pageNumber}
              sizePerPage={10}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
