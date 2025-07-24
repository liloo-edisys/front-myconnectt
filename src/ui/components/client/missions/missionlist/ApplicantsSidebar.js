import React, { useState, useEffect } from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { FormattedMessage, useIntl } from "react-intl";
import Avatar from "react-avatar";
import ApplicationsStatusColumnFormatter from "../column-formatters/ApplicationsStatusColumnFormatter";
import ApplicationsActionsColumnFormatter from "../column-formatters/ApplicationsActionsColumnFormatter";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

const ApplicantsSidebar = ({ show, onHide, missionId, missionsUIProps }) => {
  const intl = useIntl();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fonction pour récupérer les candidats avec axios
  const fetchApplicants = async (missionId, page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/MissionApplication/GetApplicant/${missionId}/${page}`,
        {
          headers: {
            'accept': '*/*'
          }
        }
      );
      
      console.log('Réponse API:', response.data);
      
      if (response.data) {
        let applicantsData = [];
        let total = 0;
        
        if (Array.isArray(response.data)) {
          applicantsData = response.data;
          total = response.data.length;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          applicantsData = response.data.items;
          total = response.data.totalCount || response.data.items.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          applicantsData = response.data.data;
          total = response.data.total || response.data.data.length;
        } else {
          console.warn('Structure de réponse non reconnue:', response.data);
          applicantsData = [];
          total = 0;
        }
        
        setApplicants(applicantsData);
        setTotalCount(total);
      } else {
        console.error('Pas de données dans la réponse');
        setApplicants([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Erreur axios:', error);
      setApplicants([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données quand le sidebar s'ouvre
  useEffect(() => {
    if (show && missionId) {
      fetchApplicants(missionId, pageNumber);
    }
  }, [show, missionId, pageNumber]);

  // Définition des colonnes simplifiées avec titres visibles
  const applicationColumns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "MATCHING.TABLE.CANDIDATE" }) || "Candidat",
      sort: true,
      style: { width: '50%' },
      classes: "text-left",
      headerClasses: "text-left",
      formatter: (value, row) => (
        <div className="d-flex align-items-left">
          {!isNullOrEmpty(row) && !isNullOrEmpty(row.applicantPicture) ? (
            <Avatar
              size="32"
              className="mr-3"
              color="#3699FF"
              src={`data:image/jpeg;base64,${row.applicantPicture.base64}`}
            />
          ) : (
            <Avatar
              className="mr-3"
              color="#3699FF"
              size="32"
              maxInitials={2}
              name={
                row && row.firstname && row.firstname.concat(" ", row.lastname)
              }
            />
          )}
          <div className="text-left">
            <div className="font-weight-bold mb-0">
              {row.firstname} {row.lastname}
            </div>
          </div>
        </div>
      )
    },
    {
      dataField: "applicationID",
      text: intl.formatMessage({ id: "TEXT.STATUS" }) || "Statut",
      style: { width: '25%' },
      classes: "text-left",
      headerClasses: "text-left",
      formatter: ApplicationsStatusColumnFormatter
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }) || "Actions",
      classes: "text-center",
      headerClasses: "text-center",
      style: { width: '25%' },
      formatter: ApplicationsActionsColumnFormatter,
      formatExtraData: {
        openEditWorksiteDialog: missionsUIProps?.openEditWorksiteDialog,
        openDeleteDialog: missionsUIProps?.openDeleteDialog,
        openDisplayDialog: missionsUIProps?.openDisplayDialog,
        openResumeDialog: missionsUIProps?.openResumeDialog,
        openDeclineDialog: missionsUIProps?.openDeclineDialog,
        openValidateDialog: missionsUIProps?.openValidateDialog,
        openMissionProfileDialog: missionsUIProps?.openMissionProfileDialog,
        openDeleteApplicationDialog: missionsUIProps?.openDeleteApplicationDialog
      }
    }
  ];

  // Composant de pagination simplifié
  const RemotePagination = ({ page, sizePerPage, onTableChange, totalSize }) => (
    <PaginationProvider
      pagination={paginationFactory({
        custom: true,
        page,
        sizePerPage,
        totalSize,
        showTotal: false,
        sizePerPageList: [
          { text: "10", value: 10 },
          { text: "25", value: 25 },
          { text: "50", value: 50 }
        ],
        firstPageText: "‹‹",
        prePageText: "‹",
        nextPageText: "›",
        lastPageText: "››"
      })}
    >
      {({ paginationProps, paginationTableProps }) => (
        <div className="d-flex flex-column h-100">
          {/* Table */}
          <div className="flex-grow-1">
            <BootstrapTable
              remote
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table "
              bootstrap4
              keyField="applicationID"
              data={applicants || []}
              columns={applicationColumns}
              onTableChange={onTableChange}
              {...paginationTableProps}
              noDataIndication={() => (
                <div className="text-center py-4">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <p className="text-muted">
                    <FormattedMessage id="MESSAGE.NO.APPLICANTS" defaultMessage="Aucun candidat trouvé" />
                  </p>
                </div>
              )}
            />
          </div>
          
          {/* Footer avec pagination */}
          <div className="border-top bg-light px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <SizePerPageDropdownStandalone {...paginationProps} />
                <small className="text-muted ml-2">
                  Total: {totalSize} candidat{totalSize > 1 ? 's' : ''}
                </small>
              </div>
              <PaginationListStandalone {...paginationProps} />
            </div>
          </div>
        </div>
      )}
    </PaginationProvider>
  );

  // Gestion du changement de page
  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
    fetchApplicants(missionId, page);
  };

  return (
    <>
      {/* Overlay pour fermer le sidebar */}
      {show && (
        <div 
          className="sidebar-overlay"
          onClick={onHide}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1040
          }}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`sidebar-applicants ${show ? 'show' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: show ? 0 : '-60%',
          width: '60%',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
          zIndex: 1050,
          transition: 'right 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header simplifié */}
        <div className="bg-primary text-white p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 font-weight-bold">
                <i className="fas fa-users mr-2"></i>
                Candidats
              </h6>
            </div>
            <button 
              className="btn btn-sm btn-outline-light"
              onClick={onHide}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-grow-1 d-flex flex-column">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="sr-only">Chargement...</span>
                </div>
                <p className="text-muted">Chargement des candidats...</p>
              </div>
            </div>
          ) : (
            <RemotePagination
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ApplicantsSidebar;