// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { FormattedMessage } from "react-intl";

function MatchingActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  { handleDeny, handleAccept, mission, onOpenResume }
) {
  return (
    <div className="d-flex flex-column">
      <button
        type="submit"
        onClick={() => handleAccept(mission.id, row.id, mission)}
        className="btn btn-outline-success mb-4"
      >
        <i className="flaticon2-send-1"></i>
        <FormattedMessage id="MATCHING.MODAL.OFFER" />
      </button>
      <button
        type="button"
        onClick={() => handleDeny(mission.id, row.id, mission)}
        className="btn btn-outline-danger"
      >
        <i className="flaticon2-cancel"></i>
        <FormattedMessage id="MATCHING.MODAL.DENY" />
      </button>
    </div>
  );
}

export default MatchingActionsColumnFormatter;
