import React, { useMemo, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { useIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";
import MatchingCandidateColumnFormatter from "../column-formatters/MatchingCandidateColumnFormatter";
import MatchingCandidateLastJobsFormatter from "../column-formatters/MatchingCandidateLastJobsFormatter";
import MissionsMatchingColumnFormatter from "../column-formatters/MissionsMatchingColumnFormatter";
import MatchingActionsColumnFormatter from "../column-formatters/MatchingActionsColumnFormatter";

function MatchingTable({
  candidates = [],
  handleDeny,
  handleAccept,
  onOpenResume,
  isLoading = false // Nouveau prop pour gérer le loading
}) {
  const intl = useIntl();

  // État pour tracker les candidats approuvés
  const [approvedCandidates, setApprovedCandidates] = useState(new Set());
  const [processingCandidates, setProcessingCandidates] = useState(new Set());

  const handleAcceptWithState = async (missionId, candidateId, mission) => {
    console.log("🔄 Début approbation pour candidat:", candidateId);

    try {
      setProcessingCandidates(prev => {
        console.log("⏳ Ajout candidat en traitement:", candidateId);
        return new Set([...prev, candidateId]);
      });

      // IMPORTANT: Vérifiez que handleAccept retourne une Promise
      const result = await handleAccept(missionId, candidateId, mission);
      console.log("✅ Approbation réussie pour candidat:", candidateId, result);

      setApprovedCandidates(prev => {
        console.log("🎉 Ajout candidat approuvé:", candidateId);
        return new Set([...prev, candidateId]);
      });
    } catch (error) {
      console.error("❌ Erreur approbation candidat:", candidateId, error);
    } finally {
      setProcessingCandidates(prev => {
        console.log("🏁 Retrait candidat du traitement:", candidateId);
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  // Données depuis Redux (suppression de candidatesLoading)
  const { mission } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission
    }),
    shallowEqual
  );

  // Configuration des colonnes du tableau
  const columns = useMemo(
    () => [
      {
        dataField: "name",
        text: intl.formatMessage({ id: "MATCHING.TABLE.CANDIDATE" }),
        sort: false,
        formatter: MatchingCandidateColumnFormatter,
        formatExtraData: {
          onOpenResume: onOpenResume
        },
        headerStyle: {
          width: "25%",
          minWidth: "200px"
        }
      },
      // {
      //   dataField: "lastJobTitles",
      //   text: intl.formatMessage({ id: "MATCHING.TABLE.LAST_JOBS" }),
      //   sort: false,
      //   formatter: MatchingCandidateLastJobsFormatter,
      //   headerStyle: {
      //     width: "35%",
      //     minWidth: "250px"
      //   }
      // },
      // {
      //   dataField: "matchingScore",
      //   text: intl.formatMessage({ id: "MATCHING.TABLE.MATCHING" }),
      //   sort: false,
      //   formatter: MissionsMatchingColumnFormatter,
      //   headerStyle: {
      //     width: "15%",
      //     minWidth: "100px",
      //     textAlign: "center"
      //   },
      //   style: {
      //     textAlign: "center"
      //   }
      // },
      {
        dataField: "action",
        text: intl.formatMessage({ id: "MATCHING.TABLE.ACTIONS" }),
        formatter: MatchingActionsColumnFormatter,
        classes: "text-right pr-0",
        headerClasses: "text-right pr-3",
        headerStyle: {
          width: "25%",
          minWidth: "190px"
        },
        formatExtraData: {
          handleDeny: handleDeny,
          mission: mission,
          handleAccept: handleAcceptWithState, // ✅ CORRECTION: Utilisez handleAcceptWithState
          onOpenResume: onOpenResume,
          approvedCandidates: approvedCandidates, // ✅ CORRECTION: Ajoutez les états
          processingCandidates: processingCandidates // ✅ CORRECTION: Ajoutez les états
        }
      }
    ],
    [
      intl,
      handleDeny,
      handleAcceptWithState,
      onOpenResume,
      mission,
      approvedCandidates,
      processingCandidates
    ]
  );

  // Composant pour afficher quand il n'y a pas de données
  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-warning fade show px-5 py-3"
        role="alert"
        style={{
          borderRadius: "8px",
          backgroundColor: "#fff3cd",
          borderColor: "#ffc107",
          color: "#856404"
        }}
      >
        <div className="alert-icon">
          <i
            className="flaticon-warning"
            style={{ fontSize: "24px", marginRight: "10px" }}
          ></i>
        </div>
        <div className="alert-text">
          <strong>Aucun candidat à afficher</strong>
          <br />
          <small>Les candidats correspondants apparaîtront ici</small>
        </div>
      </div>
    </div>
  );

  // Styles pour le tableau
  const tableStyles = {
    table: {
      backgroundColor: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    },
    headerRow: {
      backgroundColor: "#f8f9fa",
      borderBottom: "2px solid #dee2e6",
      fontWeight: 600,
      fontSize: "14px",
      color: "#495057"
    },
    row: {
      borderBottom: "1px solid #e9ecef",
      fontSize: "14px",
      transition: "background-color 0.2s"
    },
    rowHover: {
      backgroundColor: "#f8f9fa",
      cursor: "pointer"
    }
  };

  // Vérification de la validité des données
  const validCandidates = useMemo(() => {
    if (!Array.isArray(candidates)) {
      console.warn("Les candidats fournis ne sont pas un tableau:", candidates);
      return [];
    }

    // S'assurer que chaque candidat a un ID unique
    return candidates.map((candidate, index) => ({
      ...candidate,
      id: candidate.id || candidate.candidateId || `temp_${index}`,
      // Ajouter des valeurs par défaut pour éviter les erreurs
      name: candidate.name || "Candidat sans nom",
      lastJobTitles: candidate.lastJobTitles || [],
      matchingScore: candidate.matchingScore || 0
    }));
  }, [candidates]);

  // Log pour debug
  console.log("MatchingTable - Candidats reçus:", validCandidates.length);

  return (
    <div className="matching-table-container">
      {isLoading ? ( // Utilisation du prop isLoading au lieu de candidatesLoading
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
        </div>
      ) : (
        <BootstrapTable
          remote={false}
          wrapperClasses="table-responsive"
          bordered={false}
          classes="table table-head-custom table-vertical-center"
          bootstrap4
          keyField="id"
          data={validCandidates}
          columns={columns}
          noDataIndication={() => <NoDataIndication />}
          hover
          headerClasses="text-uppercase"
          rowStyle={(row, rowIndex) => ({
            ...tableStyles.row,
            backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa"
          })}
          rowEvents={{
            onMouseEnter: (e, row, rowIndex) => {
              e.currentTarget.style.backgroundColor = "#e8f4ff";
            },
            onMouseLeave: (e, row, rowIndex) => {
              e.currentTarget.style.backgroundColor =
                rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";
            }
          }}
        />
      )}

      <style jsx>{`
        .matching-table-container {
          width: 100%;
        }

        .matching-table-container .table {
          margin-bottom: 0;
        }

        .matching-table-container .table thead th {
          padding: 12px 15px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .matching-table-container .table tbody td {
          padding: 12px 15px;
          vertical-align: middle;
        }

        .matching-table-container .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default MatchingTable;
