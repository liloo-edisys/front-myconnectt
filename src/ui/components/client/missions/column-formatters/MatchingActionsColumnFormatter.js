// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { FormattedMessage } from "react-intl";

function MatchingActionsColumnFormatter(
  _cellContent,
  row,
  _rowIndex,
  { handleDeny, handleAccept, mission, onOpenResume, approvedCandidates = new Set(), processingCandidates = new Set() }
) {
  const candidateId = row.id;
  const isApproved = approvedCandidates.has(candidateId);
  const isProcessing = processingCandidates.has(candidateId);

  // Debug logs - à supprimer en production
  console.log('🔍 MatchingActionsColumnFormatter - Candidat:', candidateId, {
    isApproved,
    isProcessing,
    approvedCandidates: Array.from(approvedCandidates),
    processingCandidates: Array.from(processingCandidates),
    rowData: row
  });

  return (
    <div className="d-flex flex-column">
      {/* Bouton Accepter/Approuver */}
      <button
        type="submit"
        onClick={() => handleAccept(mission.id, row.id, mission)}
        className={`btn mb-4 ${
          isApproved 
            ? 'btn-success' 
            : 'btn-outline-success'
        }`}
        disabled={isApproved || isProcessing}
        style={{ 
          opacity: isApproved ? 0.7 : 1,
          cursor: (isApproved || isProcessing) ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessing ? (
          <>
            <span 
              className="spinner-border spinner-border-sm me-2" 
              role="status" 
              aria-hidden="true"
              style={{ width: '16px', height: '16px', marginRight: '8px' }}
            ></span>
            En cours...
          </>
        ) : isApproved ? (
          <>
            <i className="flaticon2-check" style={{ marginRight: '8px' }}></i>
            Approuvé
          </>
        ) : (
          <>
            <i className="flaticon2-send-1" style={{ marginRight: '8px' }}></i>
            <FormattedMessage id="MATCHING.MODAL.OFFER" />
          </>
        )}
      </button>

      {/* Bouton Refuser */}
      <button
        type="button"
        onClick={() => handleDeny(mission.id, row.id, mission)}
        className="btn btn-outline-danger"
        disabled={isApproved}
        style={{ 
          opacity: isApproved ? 0.5 : 1,
          cursor: isApproved ? 'not-allowed' : 'pointer'
        }}
      >
        <i className="flaticon2-cancel" style={{ marginRight: '8px' }}></i>
        <FormattedMessage id="MATCHING.MODAL.DENY" />
      </button>
    </div>
  );
}

export default MatchingActionsColumnFormatter;