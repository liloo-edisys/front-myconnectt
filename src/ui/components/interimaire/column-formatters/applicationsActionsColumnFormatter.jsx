// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

function ApplicationsActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  {
    openDisplayDialog,
    openApproveDialog,
    openDeclineDialog  }
) {
  return (
    <>
      <a
        title="Afficher"
        className="btn btn-icon btn-light-primary mr-2"
        onClick={() => openDisplayDialog(row.id)}
      >
        <i className="far fa-eye"></i>
      </a>
      {row.applicationStatus === 1 && (
        <>
          <a
            title="Accepter"
            className="btn btn-icon btn-light-success mr-2"
            onClick={() => openApproveDialog(row.id)}
          >
            <i className="far fa-handshake"></i>
          </a>

          <a
            title="Décliner"
            className="btn btn-icon btn-light-danger mr-2"
            onClick={() => openDeclineDialog(row.id)}
          >
            <i className="flaticon2-cancel"></i>
          </a>
        </>
      )}
    </>
  );
}

export default ApplicationsActionsColumnFormatter;
