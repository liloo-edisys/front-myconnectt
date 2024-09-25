// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

function MissionsActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  { openDeleteDialog, openDisplayDialog }
) {
  return (
    <>
      {row.status === 0 && (
        <Link
          to={`/mission/update/${row.id}`}
          className="btn  btn-light-primary mr-2"
        >
          Modifier
        </Link>
      )}
      <a
        onClick={e => {
          e.stopPropagation();
          openDisplayDialog(row.id);
        }}
        className="btn  btn-light-primary mr-2"
      >
        <FormattedMessage id="BUTTON.SEE.VACANCY" />
      </a>
      <Link
        to={`/customer-order/${row.id}`}
        className="btn  btn-light-info mr-2"
      >
        Commande client
      </Link>
      <a
        onClick={e => {
          e.stopPropagation();
          openDeleteDialog(row);
        }}
        title="Supprimer"
        className="btn btn-icon btn-light-danger mr-2"
      >
        <i className="far fa-trash-alt"></i>
      </a>
    </>
  );
}

export default MissionsActionsColumnFormatter;
