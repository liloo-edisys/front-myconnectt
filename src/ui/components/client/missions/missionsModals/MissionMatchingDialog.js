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
  getOptimalMatchingCandidates,
  getAvailableFilters,
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

// Styles pour le composant (identiques à l'original)
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
  resumeRow,
  openMissionProfileDialog
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
  const [selectedFilter, setSelectedFilter] = useState("50-75");
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // États pour les filtres dynamiques
  const [availableFilters, setAvailableFilters] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Ref pour le tooltip
  const tooltipRef = useRef(null);

  // Ref pour tracker le dernier missionId chargé (pour éviter les rechargements inutiles)
  const lastLoadedMissionIdRef = useRef(null);

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

    // Mettre à jour le cache avec la liste filtrée
    if (missionId) {
      const cacheKey = `matching_candidates_${missionId}`;
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          missionId,
          allCandidates: updatedAll,
          filteredCandidates: updatedFiltered,
          appliedFilter,
          selectedFilter,
          currentPage,
          timestamp: Date.now()
        })
      );
      console.log(`💾 Cache mis à jour après refus (mission ${missionId})`);
    }

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

    // Invalider le cache car le statut du candidat a changé
    if (missionId) {
      const cacheKey = `matching_candidates_${missionId}`;
      sessionStorage.removeItem(cacheKey);
      lastLoadedMissionIdRef.current = null; // Réinitialiser pour forcer le rechargement
      console.log(`🗑️ Cache invalidé après acceptation (mission ${missionId})`);
    }
  };

  // NOUVELLE FONCTION OPTIMISÉE : Un seul appel pour chargement initial
  const fetchOptimalCandidates = async () => {
    if (!missionId) return;

    console.log("🚀 Démarrage du chargement optimal des candidats");
    setIsLoading(true);
    setError(null);

    try {
      // UN SEUL APPEL qui fait la cascade intelligente
      const response = await getOptimalMatchingCandidates(missionId);

      if (response.success) {
        const candidatesWithIds = response.data.map((candidate, index) => ({
          ...candidate,
          id: candidate.id || candidate.candidateId || `candidate_${index}`
        }));

        // Mise à jour de tous les états en une fois
        setAllCandidates(candidatesWithIds);
        setFilteredCandidates(candidatesWithIds);
        setCurrentPage(1);

        // Gestion des filtres
        if (response.appliedFilter) {
          setSelectedFilter(response.appliedFilter.value);
          setAppliedFilter(response.appliedFilter);
          setAvailableFilters(
            response.availableFilters || [response.appliedFilter]
          );
        } else {
          setSelectedFilter("50-75");
          setAppliedFilter(null);
          setAvailableFilters([]);
        }

        if (response.message) {
          console.log("📋", response.message);
        }

        console.log("✅ Chargement optimal terminé avec succès");
      } else {
        setError(response.error || "Erreur lors du chargement des candidats");
        setAllCandidates([]);
        setFilteredCandidates([]);
        setAppliedFilter(null);
        setAvailableFilters([]);
      }
    } catch (err) {
      console.error("💥 Erreur lors du chargement optimal:", err);
      setError("Impossible de charger les candidats");
      setAllCandidates([]);
      setFilteredCandidates([]);
      setAppliedFilter(null);
      setAvailableFilters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // FONCTION pour charger les filtres complets (utilisée lors du changement de filtre)
  const loadAllAvailableFilters = async () => {
    if (!missionId) return;

    console.log("🔄 Chargement complet des filtres disponibles");
    setIsLoadingFilters(true);

    try {
      const filters = await getAvailableFilters(missionId);
      setAvailableFilters(filters);

      // Si aucun filtre disponible, vider tout
      if (filters.length === 0) {
        setAllCandidates([]);
        setFilteredCandidates([]);
        setAppliedFilter(null);
      }
    } catch (error) {
      console.error("💥 Erreur lors du chargement des filtres:", error);
      setAvailableFilters([]);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Fonction pour récupérer tous les candidats (pour les filtres manuels)
  const fetchAllCandidates = async (min = 50, max = 75) => {
    if (!missionId) return;

    console.log(`🎯 Chargement manuel du niveau ${min}-${max}%`);
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
        const filter = MATCH_SCORE_FILTERS.find(
          f => f.min === min && f.max === max
        );
        setAppliedFilter(filter || null);

        console.log(
          `✅ Chargement manuel terminé: ${candidatesWithIds.length} candidat(s)`
        );
      } else {
        setError(response.error || "Erreur lors du chargement des candidats");
        setAllCandidates([]);
        setFilteredCandidates([]);
        setAppliedFilter(null);
      }
    } catch (err) {
      console.error("💥 Erreur lors du chargement manuel:", err);
      setError("Impossible de charger les candidats");
      setAllCandidates([]);
      setFilteredCandidates([]);
      setAppliedFilter(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour filtrer les candidats par score (refactorisation)
  const handleFilterChange = async filterValue => {
    console.log(`🔄 Changement de filtre vers: ${filterValue}`);
    setSelectedFilter(filterValue);
    setCurrentPage(1);

    // Si on n'a pas encore tous les filtres, les charger d'abord
    if (availableFilters.length <= 1) {
      await loadAllAvailableFilters();
    }

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

  // HOOK PRINCIPAL : gestion de l'ouverture/fermeture avec cache intelligent
  useEffect(() => {
    if (show) {
      console.log(`🎬 Ouverture du MatchingDialog pour mission ${missionId}`);
      document.body.style.overflow = "hidden";

      if (missionId) {
        const lastLoadedId = lastLoadedMissionIdRef.current;

        // Cas 1 : Changement de mission → toujours recharger
        if (
          lastLoadedId !== null &&
          String(lastLoadedId) !== String(missionId)
        ) {
          console.log(
            `🔄 Changement de mission (${lastLoadedId} → ${missionId}), rechargement...`
          );
          lastLoadedMissionIdRef.current = missionId;
          fetchOptimalCandidates();
          return;
        }

        // Cas 2 : Même mission, vérifier le cache
        if (String(lastLoadedId) === String(missionId)) {
          const cacheKey = `matching_candidates_${missionId}`;
          const cachedData = sessionStorage.getItem(cacheKey);

          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);

              // Vérifier que le cache est bien pour cette mission
              if (String(parsed.missionId) === String(missionId)) {
                console.log(
                  `♻️ Restauration depuis le cache pour mission ${missionId}`
                );
                setAllCandidates(parsed.allCandidates || []);
                setFilteredCandidates(parsed.filteredCandidates || []);
                setAppliedFilter(parsed.appliedFilter || null);
                setSelectedFilter(parsed.selectedFilter || "50-75");
                setCurrentPage(parsed.currentPage || 1);
                return;
              }
            } catch (e) {
              console.error("Erreur cache:", e);
            }
          }

          // Pas de cache valide, recharger
          console.log(
            `🔄 Pas de cache valide, rechargement pour mission ${missionId}`
          );
          fetchOptimalCandidates();
          return;
        }

        // Cas 3 : Première ouverture
        console.log(
          `🆕 Première ouverture, chargement pour mission ${missionId}`
        );
        lastLoadedMissionIdRef.current = missionId;
        fetchOptimalCandidates();
      }
    } else {
      console.log("🔚 Fermeture du MatchingDialog");
      document.body.style.overflow = "auto";

      // Sauvegarder dans le cache SANS réinitialiser les états
      if (missionId && allCandidates.length > 0) {
        const cacheKey = `matching_candidates_${missionId}`;
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            missionId,
            allCandidates,
            filteredCandidates,
            appliedFilter,
            selectedFilter,
            currentPage,
            timestamp: Date.now()
          })
        );
        console.log(`💾 Cache sauvegardé pour mission ${missionId}`);
      }
    }

    return () => {
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

              {/* SELECT DYNAMIQUE */}
              <select
                style={{
                  ...drawerStyles.filterSelect,
                  opacity: isLoadingFilters ? 0.6 : 1
                }}
                value={selectedFilter}
                onChange={e => handleFilterChange(e.target.value)}
                disabled={isLoadingFilters || availableFilters.length === 0}
                onFocus={e => (e.target.style.borderColor = "#0d6efd")}
                onBlur={e => (e.target.style.borderColor = "#ced4da")}
              >
                {availableFilters.length === 0 ? (
                  <option value="">
                    {isLoadingFilters
                      ? "Chargement..."
                      : "Aucun candidat disponible"}
                  </option>
                ) : availableFilters.length === 1 ? (
                  // Cas optimal : un seul niveau trouvé lors du chargement initial
                  <option
                    key={availableFilters[0].value}
                    value={availableFilters[0].value}
                  >
                    {availableFilters[0].label}
                  </option>
                ) : (
                  // Cas manuel : plusieurs niveaux après chargement complet
                  availableFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))
                )}
              </select>

              {/* Bouton pour charger tous les filtres si un seul niveau est affiché */}
              {/* {availableFilters.length === 1 && !isLoadingFilters && (
                <button
                  style={{
                    ...drawerStyles.paginationButton,
                    minWidth: "auto",
                    padding: "4px 8px",
                    fontSize: "12px",
                    backgroundColor: "#28a745"
                  }}
                  onClick={loadAllAvailableFilters}
                  title="Voir tous les niveaux disponibles"
                >
                  + Autres niveaux
                </button>
              )} */}

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

              {/* STATS AMÉLIORÉES */}
              <span style={drawerStyles.statsInfo}>
                {filteredCandidates.length} candidat(s)
                {availableFilters.length > 1 && (
                  <span style={{ marginLeft: "8px", fontStyle: "italic" }}>
                    ({availableFilters.length} niveau
                    {availableFilters.length > 1 ? "x" : ""} disponible
                    {availableFilters.length > 1 ? "s" : ""})
                  </span>
                )}
                {/* {appliedFilter && (
                  <span style={drawerStyles.appliedFilterInfo}>
                    • Niveau optimal: {appliedFilter.label}
                  </span>
                )} */}
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
                Recherche des meilleurs candidats...
              </div>
            </div>
          ) : error ? (
            <div style={drawerStyles.emptyState}>
              <div>⚠️</div>
              <div>{error}</div>
              <button
                style={{ ...drawerStyles.paginationButton, marginTop: "10px" }}
                onClick={() => {
                  fetchOptimalCandidates();
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
                  : "Aucun candidat ne correspond aux critères de cette mission"}
              </div>
            </div>
          ) : (
            <MatchingTable
              candidates={displayedCandidates}
              handleAccept={handleAccept}
              handleDeny={handleDeny}
              onOpenResume={onOpenResume}
              openMissionProfileDialog={openMissionProfileDialog}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
}
