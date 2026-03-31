// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

function ActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  { openEditContactModal, openDeleteContactDialog }
) {
  return (
    <>
      {row.isApproved === true && (
        <a
          onClick={() => openEditContactModal(row.id, row)}
          title="Modifier"
          className="btn btn-icon btn-light-info mr-2"
        >
          <i className="far fa-edit"></i>
        </a>
      )}

      <a
        onClick={() => openDeleteContactDialog(row)}
        title="Supprimer"
        className="btn btn-icon btn-light-danger mr-2"
      >
        <i className="far fa-trash-alt"></i>
      </a>
    </>
  );
}

export default ActionsColumnFormatter;
