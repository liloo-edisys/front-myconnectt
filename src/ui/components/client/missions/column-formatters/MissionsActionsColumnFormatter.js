// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";

function MissionsActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  {
    openDeleteDialog,
    openDisplayDialog,
    openMatchingDialog,
    openDuplicateVacancyDialog,
    openMatchingVacancyDialog,
    history,
    getStored,
    editMission
  }
) {
  return (
    <>
      <a
        onClick={e => {
          e.stopPropagation();
          openDisplayDialog(row.id);
        }}
        className="btn  btn-light-primary mr-2"
      >
        <FormattedMessage id="BUTTON.SEE.VACANCY" />
      </a>

      {row && row.missionIsValidated ? (
        <>
          <a
            className="btn btn-light-warning mr-2"
            onClick={e => {
              e.stopPropagation();
              openMatchingDialog(row);
            }}
          >
            <span className="navi-icon mr-2">
              <i className="fas fa-search"></i>
            </span>
            <span className="menu-text">
              <FormattedMessage id="BUTTON.APPLICANTS.SEARCH" />
            </span>
          </a>
          <Link
            to={`/customer-order/${row.id}`}
            className="btn  btn-light-info mr-2"
          >
            Suivi
          </Link>
        </>
      ) : (
        <a
          onClick={e => {
            e.stopPropagation();
            editMission(row);
          }}
          title="Modifier"
          className="btn btn-icon btn-light-info mr-2"
        >
          <i className="far fa-edit"></i>
        </a>
      )}
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
