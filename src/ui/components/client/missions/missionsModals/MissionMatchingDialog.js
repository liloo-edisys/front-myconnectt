import React, { useEffect, useRef, useState } from "react";
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
import { getMatchingWithVacancy } from "./getMatchingWithVacancy";

const TENANTID = process.env.REACT_APP_TENANT_ID;

// Styles CSS pour le drawer
// Ajouter l'animation CSS directement dans le head
const spinnerAnimation = document.createElement("style");
spinnerAnimation.innerHTML = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerAnimation);

const drawerStyles = {
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "50%", // Largeur fixe
    maxWidth: "50vw",
    backgroundColor: "var(--bg-color, white)",
    boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease-in-out",
    transform: "translateX(100%)", // Commence hors écran à droite
    overflow: "hidden",
    zIndex: 1050
  },
  drawerOpen: {
    transform: "translateX(0)" // Slide jusqu'à sa position finale
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
    borderBottom: "1px solid var(--border-color, #e6e6e6)"
  },
  drawerTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 500
  },
  drawerBody: {
    padding: "20px",
    overflowY: "auto",
    height: "calc(100vh - 70px)",
    paddingBottom: "80px"
  },
  closeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px"
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "16px",
    borderBottom: "1px solid var(--border-color, #e6e6e6)"
  },
  paginationButton: {
    padding: "8px 16px",
    margin: "0 5px",
    backgroundColor: "var(--primary-color, #0D6EFD)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "100px"
  },
  paginationInfo: {
    display: "flex",
    alignItems: "center",
    margin: "0 15px",
    fontSize: "14px",
    color: "var(--text-secondary, #616061)"
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
    display: "inline-block"
  }
};

// Composant de spinner
const Spinner = () => (
  <span style={drawerStyles.spinner} role="status" aria-hidden="true"></span>
);

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
  const { candidates, mission } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      candidates: state.applicants.matchingCandidates
    }),
    shallowEqual
  );

  // Nouvel état pour gérer les résultats de l'API et la pagination
  const [apiCandidates, setApiCandidates] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isApiDataLoaded, setIsApiDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(null); // 'next' ou 'prev' pour indiquer quel bouton est en chargement

  const page = localStorage.getItem("pageNumber");
  const pageSize = localStorage.getItem("pageSize");
  const accountID = localStorage.getItem("accountID");
  const userID = localStorage.getItem("userId");

  const handleDeny = (missionID, candidateID, mission) => {
    dispatch(
      declineMatching.request(
        { id1: missionID, id2: candidateID },
        userID !== null
          ? {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true,
              userId: parseInt(userID)
            }
          : {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true
            }
      )
    );
    dispatch(getMatching.request(mission));
    dispatch(
      searchMission.request({
        city: null,
        endDate: null,
        hourlySalary: 0,
        isApplicationsOnly: false,
        isMatchingOnly: false,
        loadMissionApplications: false,
        missionJobTitles: [],
        pageNumber: parseInt(localStorage.getItem("pageNumber")),
        pageSize: parseInt(localStorage.getItem("pageSize")),
        startDate: null,
        tenantID: parseInt(TENANTID)
      })
    );
  };

  const handleAccept = (missionID, candidateID, mission) => {
    dispatch(
      approveByCustomer.request(
        { id1: missionID, id2: candidateID },
        userID !== null
          ? {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true,
              userId: parseInt(userID)
            }
          : {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true
            }
      )
    );
    dispatch(getMatching.request(mission));
  };

  let missionId = state && state.id;

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevCandidates = usePrevious(candidates);

  useEffect(() => {
    show && mission.id !== missionId && dispatch(getMission.request(missionId));
  }, [show, mission, candidates, dispatch, missionId, prevCandidates]);

  useEffect(() => {
    show && !isNullOrEmpty(mission) && dispatch(getMatching.request(mission));
  }, [show, mission, dispatch]);

  // Chargement automatique des matchings dès l'ouverture du composant
  useEffect(() => {
    if (show && missionId) {
      handleFetchMatchings(1);
    }
  }, [show, missionId]);

  // Gestion pour empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  // Si le composant n'est pas affiché, ne rien rendre
  if (!show) return null;

  const handleFetchMatchings = async (pageNumber = 1, direction = null) => {
    try {
      setIsLoading(true);
      setLoadingDirection(direction);

      // Appel à l'API avec paramètre de page
      const response = await getMatchingWithVacancy(missionId, pageNumber);
      console.log("Matchings récupérés:", response);

      // Mise à jour de l'état avec les données et informations de pagination
      setApiCandidates(response.data || []);
      setPaginationInfo({
        currentPage: response.currenT_PAGE || pageNumber,
        totalPages: response.totaL_PAGES || 1,
        hasNextPage: response.nexT_PAGE !== "",
        hasPrevPage: response.preV_PAGE !== ""
      });
      setIsApiDataLoaded(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des matchings:", error);
    } finally {
      setIsLoading(false);
      setLoadingDirection(null);
    }
  };

  const handleNextPage = () => {
    if (paginationInfo.hasNextPage && !isLoading) {
      handleFetchMatchings(paginationInfo.currentPage + 1, "next");
    }
  };

  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage && !isLoading) {
      handleFetchMatchings(paginationInfo.currentPage - 1, "prev");
    }
  };

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
        {resumeOpen === true ? (
          <MissionResumeDialog
            show={resumeOpen === true}
            history={history}
            resumeRow={resumeRow}
            onHide={() => {
              onCloseResume();
            }}
          />
        ) : null}

        {/* Header du drawer */}
        <div style={drawerStyles.drawerHeader}>
          <h4 style={drawerStyles.drawerTitle}>
            <FormattedMessage id="MATCHING.MODAL.TITLE" /> :{" "}
            {mission?.vacancyTitle}
          </h4>
          <div>
            {/* Bouton de fermeture */}
            <button
              type="button"
              style={drawerStyles.closeButton}
              onClick={onHide}
              aria-label="Fermer"
            >
              <i aria-hidden="true" className="ki ki-close"></i>
            </button>
          </div>
        </div>

        {/* Barre de pagination en haut du drawer */}
        {isApiDataLoaded && (
          <div style={drawerStyles.paginationContainer}>
            <button
              style={drawerStyles.paginationButton}
              onClick={handlePrevPage}
              disabled={!paginationInfo.hasPrevPage || isLoading}
            >
              {isLoading && loadingDirection === "prev" ? (
                <>
                  <Spinner /> Chargement...
                </>
              ) : (
                "Précédent"
              )}
            </button>

            <div style={drawerStyles.paginationInfo}>
              Page {paginationInfo.currentPage} sur {paginationInfo.totalPages}
            </div>

            <button
              style={drawerStyles.paginationButton}
              onClick={handleNextPage}
              disabled={!paginationInfo.hasNextPage || isLoading}
            >
              {isLoading && loadingDirection === "next" ? (
                <>
                  <Spinner /> Chargement...
                </>
              ) : (
                "Suivant"
              )}
            </button>
          </div>
        )}

        {/* Corps du drawer */}
        <div style={drawerStyles.drawerBody}>
          {/* Afficher soit les données Redux, soit les données de l'API */}
          <MatchingTable
            candidates={isApiDataLoaded ? apiCandidates : candidates}
            handleAccept={handleAccept}
            handleDeny={handleDeny}
            onOpenResume={onOpenResume}
          />
        </div>
      </div>
    </>
  );
}
