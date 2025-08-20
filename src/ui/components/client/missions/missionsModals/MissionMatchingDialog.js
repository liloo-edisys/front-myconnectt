import React, { useEffect, useRef, useState, useMemo } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { getMatching } from "actions/client/ApplicantsActions";
import MatchingTable from "../missionlist/MatchingTable";
import { getMission } from "actions/client/MissionsActions";
import {
  declineMatching,
  approveByCustomer
} from "../../../../../business/actions/client/ApplicantsActions";
import { MissionResumeDialog } from "./MissionResumeDialog";
import { searchMission } from "../../../../../business/actions/client/MissionsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import {
  getAllMatchingCandidates,
  getBestMatchingCandidates,
  MATCH_SCORE_FILTERS
} from "./getMatchingWithVacancy";

const TENANTID = process.env.REACT_APP_TENANT_ID;

// Injection du CSS pour l'animation du spinner
if (!document.getElementById("matching-spinner-style")) {
  const spinnerAnimation = document.createElement("style");
  spinnerAnimation.id = "matching-spinner-style";
  spinnerAnimation.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerAnimation);
}

// Styles pour le composant
const drawerStyles = {
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "50%",
    maxWidth: "50vw",
    backgroundColor: "white",
    boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease-in-out",
    transform: "translateX(100%)",
    overflow: "hidden",
    zIndex: 1050
  },
  drawerOpen: {
    transform: "translateX(0)"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1040,
    opacity: 0,
    visibility: "hidden",
    transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out"
  },
  overlayVisible: {
    opacity: 1,
    visibility: "visible"
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #e6e6e6",
    backgroundColor: "#f8f9fa"
  },
  drawerTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#2c3e50"
  },
  drawerBody: {
    padding: "20px",
    overflowY: "auto",
    height: "calc(100vh - 180px)",
    backgroundColor: "#ffffff"
  },
  closeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    color: "#6c757d",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s"
  },
  paginationBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e6e6e6"
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  paginationButton: {
    padding: "6px 12px",
    backgroundColor: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "background-color 0.2s",
    minWidth: "80px"
  },
  paginationButtonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
    opacity: 0.6
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#495057",
    fontWeight: 500
  },
  filterSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  filterLabel: {
    fontSize: "14px",
    color: "#495057",
    fontWeight: 500
  },
  filterSelect: {
    padding: "6px 10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    color: "#495057",
    cursor: "pointer",
    minWidth: "150px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  statsInfo: {
    fontSize: "13px",
    color: "#6c757d",
    marginLeft: "10px"
  },
  appliedFilterInfo: {
    marginLeft: "8px",
    fontStyle: "italic",
    color: "#28a745"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "300px"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f4f6",
    borderRadius: "50%",
    borderTopColor: "#0d6efd",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#6c757d"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    color: "#6c757d"
  }
};

export function MatchingDialog({
  show,
  onHide,
  history,
  resumeOpen,
  onOpenResume,
  onCloseResume,
  resumeRow
}) {
  const { state } = history.location;
  const dispatch = useDispatch();

  const { mission } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission
    }),
    shallowEqual
  );

  // États locaux
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("50-75"); // Valeur par défaut changée
  const [appliedFilter, setAppliedFilter] = useState(null); // Nouveau state pour suivre le filtre appliqué
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Ref pour le tooltip
  const tooltipRef = useRef(null);

  // Configuration
  const ITEMS_PER_PAGE = 10;
  const missionId = state && state.id;

  // Récupération des paramètres du localStorage
  const pageSize = localStorage.getItem("pageSize") || "10";
  const accountID = localStorage.getItem("accountID");
  const userID = localStorage.getItem("userId");

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Utilisation de useMemo pour éviter les recalculs inutiles
  const paginationInfo = useMemo(
    () => ({
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      currentPage,
      totalPages: totalPages || 1,
      totalItems: filteredCandidates.length,
      startItem: filteredCandidates.length > 0 ? startIndex + 1 : 0,
      endItem: Math.min(endIndex, filteredCandidates.length)
    }),
    [currentPage, totalPages, filteredCandidates.length, startIndex, endIndex]
  );

  // Fonction pour gérer le refus d'un candidat
  const handleDeny = (missionID, candidateID) => {
    const params = {
      tenantID: parseInt(TENANTID),
      accountID: parseInt(accountID),
      missionJobTitles: null,
      startDate: null,
      endDate: null,
      contactName: null,
      isMatchingOnly: false,
      isApplicationsOnly: false,
      pageSize: parseInt(pageSize),
      pageNumber: 1,
      loadMissionApplications: true
    };

    if (userID) {
      params.userId = parseInt(userID);
    }

    dispatch(
      declineMatching.request({ id1: missionID, id2: candidateID }, params)
    );

    // Mise à jour locale immédiate
    const updatedAll = allCandidates.filter(c => c.id !== candidateID);
    const updatedFiltered = filteredCandidates.filter(
      c => c.id !== candidateID
    );

    setAllCandidates(updatedAll);
    setFilteredCandidates(updatedFiltered);

    // Ajuster la page si nécessaire
    const newTotalPages = Math.ceil(updatedFiltered.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  // Fonction pour gérer l'acceptation d'un candidat
  const handleAccept = (missionID, candidateID) => {
    const params = {
      tenantID: parseInt(TENANTID),
      accountID: parseInt(accountID),
      missionJobTitles: null,
      startDate: null,
      endDate: null,
      contactName: null,
      isMatchingOnly: false,
      isApplicationsOnly: false,
      pageSize: parseInt(pageSize),
      pageNumber: 1,
      loadMissionApplications: true
    };

    if (userID) {
      params.userId = parseInt(userID);
    }

    dispatch(
      approveByCustomer.request({ id1: missionID, id2: candidateID }, params)
    );
    dispatch(getMatching.request(mission));
  };

  // Nouvelle fonction pour le chargement initial avec logique de priorité
  const fetchBestCandidates = async () => {
    if (!missionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getBestMatchingCandidates(missionId);

      if (response.success) {
        const candidatesWithIds = response.data.map((candidate, index) => ({
          ...candidate,
          id: candidate.id || candidate.candidateId || `candidate_${index}`
        }));
        
        setAllCandidates(candidatesWithIds);
        setFilteredCandidates(candidatesWithIds);
        setCurrentPage(1);
        
        // Mettre à jour le filtre sélectionné selon ce qui a été appliqué
        if (response.appliedFilter) {
          setSelectedFilter(response.appliedFilter.value);
          setAppliedFilter(response.appliedFilter);
        } else {
          // Aucun candidat trouvé
          setSelectedFilter("50-75"); // Valeur par défaut
          setAppliedFilter(null);
        }
        
        if (response.message) {
          console.log(response.message);
        }
      } else {
        setError(response.error || "Erreur lors du chargement des candidats");
        setAllCandidates([]);
        setFilteredCandidates([]);
        setAppliedFilter(null);
      }
    } catch (err) {
      console.error("Erreur API:", err);
      setError("Impossible de charger les candidats");
      setAllCandidates([]);
      setFilteredCandidates([]);
      setAppliedFilter(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer tous les candidats (pour les filtres manuels)
  const fetchAllCandidates = async (min = 50, max = 75) => {
    if (!missionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllMatchingCandidates(missionId, min, max);

      if (response.success && response.data) {
        const candidatesWithIds = response.data.map((candidate, index) => ({
          ...candidate,
          id: candidate.id || candidate.candidateId || `candidate_${index}`
        }));
        setAllCandidates(candidatesWithIds);
        setFilteredCandidates(candidatesWithIds);
        setCurrentPage(1);
        
        // Mettre à jour le filtre appliqué
        const filter = MATCH_SCORE_FILTERS.find(f => f.min === min && f.max === max);
        setAppliedFilter(filter || null);
      } else {
        setError(response.error || "Erreur lors du chargement des candidats");
        setAllCandidates([]);
        setFilteredCandidates([]);
        setAppliedFilter(null);
      }
    } catch (err) {
      console.error("Erreur API:", err);
      setError("Impossible de charger les candidats");
      setAllCandidates([]);
      setFilteredCandidates([]);
      setAppliedFilter(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour filtrer les candidats par score (refactorisation)
  const handleFilterChange = filterValue => {
    setSelectedFilter(filterValue);
    setCurrentPage(1);

    const filter = MATCH_SCORE_FILTERS.find(f => f.value === filterValue);
    if (filter) {
      fetchAllCandidates(filter.min, filter.max);
    }
  };

  // Fonctions de navigation
  const handleNextPage = () => {
    if (paginationInfo.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (paginationInfo.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Hook pour fermer le tooltip en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = event => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  // Hook pour gérer l'ouverture/fermeture
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      if (missionId) {
        fetchBestCandidates(); // Utilise la nouvelle fonction au lieu de handleFilterChange
      }
    } else {
      document.body.style.overflow = "auto";
      setSelectedFilter("50-75"); // Changé de "35-50" à "50-75"
      setCurrentPage(1);
      setError(null);
      setAppliedFilter(null);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show, missionId]);

  // Hook pour charger la mission si nécessaire
  useEffect(() => {
    if (show && mission?.id !== missionId && missionId) {
      dispatch(getMission.request(missionId));
    }
  }, [show, mission, missionId, dispatch]);

  // Hook pour charger les matchings Redux si nécessaire
  useEffect(() => {
    if (show && !isNullOrEmpty(mission)) {
      dispatch(getMatching.request(mission));
    }
  }, [show, mission, dispatch]);

  // Ne rien afficher si le drawer est fermé
  if (!show) return null;

  return (
    <>
      {/* Overlay de fond */}
      <div
        style={{
          ...drawerStyles.overlay,
          ...(show ? drawerStyles.overlayVisible : {})
        }}
        onClick={onHide}
      />

      {/* Drawer principal */}
      <div
        style={{
          ...drawerStyles.drawer,
          ...(show ? drawerStyles.drawerOpen : {})
        }}
      >
        {/* Dialog de CV si ouvert */}
        {resumeOpen && (
          <MissionResumeDialog
            show={resumeOpen}
            history={history}
            resumeRow={resumeRow}
            onHide={onCloseResume}
          />
        )}

        {/* Header du drawer */}
        <div style={drawerStyles.drawerHeader}>
          <h4 style={drawerStyles.drawerTitle}>
            <FormattedMessage id="MATCHING.MODAL.TITLE" /> :{" "}
            {mission?.vacancyTitle || ""}
          </h4>
          <button
            type="button"
            style={drawerStyles.closeButton}
            onClick={onHide}
            aria-label="Fermer"
            onMouseEnter={e => (e.target.style.color = "#495057")}
            onMouseLeave={e => (e.target.style.color = "#6c757d")}
          >
            ✕
          </button>
        </div>

        {/* Barre de filtrage - toujours visible */}
        {!isLoading && !error && (
          <div style={drawerStyles.paginationBar}>
            {/* Section de filtrage */}
            <div style={drawerStyles.filterSection}>
              <span style={drawerStyles.filterLabel}>Filtrer par score :</span>
              <select
                style={drawerStyles.filterSelect}
                value={selectedFilter}
                onChange={e => handleFilterChange(e.target.value)}
                onFocus={e => (e.target.style.borderColor = "#0d6efd")}
                onBlur={e => (e.target.style.borderColor = "#ced4da")}
              >
                {MATCH_SCORE_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <div
                style={{ position: "relative", display: "inline-block" }}
                ref={tooltipRef}
              >
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "16px",
                    color: "#6c757d",
                    marginLeft: "8px",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    transition: "background-color 0.2s"
                  }}
                  onClick={() => setShowTooltip(!showTooltip)}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = "#f0f0f0")
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  ℹ️
                </button>
                {showTooltip && (
                  <div
                    style={{
                      position: "absolute",
                      top: "25px",
                      left: "0",
                      backgroundColor: "#333",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      zIndex: 1000,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}
                  >
                    Filtrez selon le pourcentage de correspondance avec la
                    mission.
                    <br />
                    Plus le score est élevé, plus le profil correspond.
                    <div
                      style={{
                        position: "absolute",
                        top: "-5px",
                        left: "10px",
                        width: "0",
                        height: "0",
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderBottom: "5px solid #333"
                      }}
                    ></div>
                  </div>
                )}
              </div>
              <span style={drawerStyles.statsInfo}>
                {filteredCandidates.length} candidat(s)
              </span>
            </div>

            {/* Contrôles de pagination - seulement si il y a des résultats */}
            {filteredCandidates.length > 0 && (
              <div style={drawerStyles.paginationControls}>
                <span style={drawerStyles.paginationInfo}>
                  {paginationInfo.startItem}-{paginationInfo.endItem} sur{" "}
                  {paginationInfo.totalItems}
                </span>
                <button
                  style={{
                    ...drawerStyles.paginationButton,
                    ...(paginationInfo.hasPrev
                      ? {}
                      : drawerStyles.paginationButtonDisabled)
                  }}
                  onClick={handlePrevPage}
                  disabled={!paginationInfo.hasPrev}
                >
                  ← Précédent
                </button>
                <span style={drawerStyles.paginationInfo}>
                  Page {paginationInfo.currentPage} /{" "}
                  {paginationInfo.totalPages}
                </span>
                <button
                  style={{
                    ...drawerStyles.paginationButton,
                    ...(paginationInfo.hasNext
                      ? {}
                      : drawerStyles.paginationButtonDisabled)
                  }}
                  onClick={handleNextPage}
                  disabled={!paginationInfo.hasNext}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Corps du drawer */}
        <div style={drawerStyles.drawerBody}>
          {isLoading ? (
            <div style={drawerStyles.loadingContainer}>
              <div style={drawerStyles.spinner}></div>
              <div style={drawerStyles.loadingText}>
                Chargement des candidats...
              </div>
            </div>
          ) : error ? (
            <div style={drawerStyles.emptyState}>
              <div>⚠️</div>
              <div>{error}</div>
              <button
                style={{ ...drawerStyles.paginationButton, marginTop: "10px" }}
                onClick={() => {
                  fetchBestCandidates(); // Utilise la nouvelle fonction de chargement
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div style={drawerStyles.emptyState}>
              <div>📋</div>
              <div>
                {appliedFilter 
                  ? "Aucun candidat ne correspond à ce filtre" 
                  : "Aucun candidat ne correspond aux critères de cette mission"
                }
              </div>
            </div>
          ) : (
            <MatchingTable
              candidates={displayedCandidates}
              handleAccept={handleAccept}
              handleDeny={handleDeny}
              onOpenResume={onOpenResume}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
}