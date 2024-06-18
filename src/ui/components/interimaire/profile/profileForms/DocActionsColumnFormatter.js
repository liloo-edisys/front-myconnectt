// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

function DocActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  { openPreviewModal, openDeleteModal }
) {
  return (
    <>
      <a
        onClick={() => openPreviewModal(row, rowIndex)}
        title="Voir"
        className="btn btn-icon btn-light-info mr-2"
      >
        <i className="far fa-eye"></i>
      </a>
      <a
        onClick={() => openDeleteModal(row, rowIndex)}
        title="Supprimer"
        className="btn btn-icon btn-light-danger mr-2"
      >
        <i className="far fa-trash-alt"></i>
      </a>
    </>
  );
}

export default DocActionsColumnFormatter;
