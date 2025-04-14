import React, { useEffect, useRef } from "react";
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
const TENANTID = process.env.REACT_APP_TENANT_ID;

// Styles CSS pour le drawer
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
    height: "calc(100vh - 70px)"
  },
  closeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px"
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
  const { candidates, mission } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      candidates: state.applicants.matchingCandidates
    }),
    shallowEqual
  );
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
    console.log("mission ------------>  ",mission);
    
  };

  // Fonction pour logger les candidats
 

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

  // Gestion pour empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [show]);

  // Si le composant n'est pas affiché, ne rien rendre
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
            <FormattedMessage id="MATCHING.MODAL.TITLE" />
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
        
        {/* Corps du drawer */}
        <div style={drawerStyles.drawerBody}>
          <MatchingTable
            candidates={candidates}
            handleAccept={handleAccept}
            handleDeny={handleDeny}
            onOpenResume={onOpenResume}
          />
        </div>
      </div>
    </>
  );
}