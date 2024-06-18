// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

function ActionsColumnFormatter(cell, row, rowIndex, { openDisplayDialog }) {
  return (
    <>
      <a
        onClick={() => openDisplayDialog(row)}
        className="btn  btn-light-primary mr-2"
      >
        Voir le profil
      </a>
    </>
  );
}

export default ActionsColumnFormatter;
