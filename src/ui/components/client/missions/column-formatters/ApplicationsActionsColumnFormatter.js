// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

function ApplicationsActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  {
    openEditVacancyDialog,
    openDeleteVacancyDialog,
    openDisplayVacancyDialog,
    openDuplicateVacancyDialog,
    openMatchingVacancyDialog,
    openResumeDialog,
    openDeclineDialog,
    history,
    openValidateDialog,
    openMissionProfileDialog,
    openDeleteApplicationDialog
  }
) {
  return (
    <>
      {/*<a
        onClick={() => {
          openMissionProfileDialog(row);
        }}
        title="Afficher le profil"
        className="btn btn-icon btn-light-primary mr-2"
      >
        <i className="far fa-eye"></i>
      </a>*/}

      <a
        className="btn  btn-light-primary mr-2"
        onClick={() => {
          openMissionProfileDialog(row);
        }}
      >
        <FormattedMessage id="BUTTON.SEE.PROFILE" />
      </a>

      {row.status === 1 ? (
        <a
          onClick={e => {
            e.stopPropagation();
            openDeleteApplicationDialog(row);
          }}
          title="Annuler l'invitation"
          className="btn btn-icon btn-light-danger mr-2"
        >
          <i className="far fa-trash-alt"></i>
        </a>
      ) : null}
      {row.status === 2 ? (
        <>
          <a
            onClick={e => {
              e.stopPropagation();
              openValidateDialog(row);
            }}
            title="Valider"
            className="btn btn-icon btn-light-success mr-2"
          >
            <i className="far fa-handshake"></i>
          </a>
          <a
            onClick={e => {
              e.stopPropagation();
              openDeclineDialog(row);
            }}
            title="Décliner"
            className="btn btn-icon btn-light-danger mr-2"
          >
            <i className="flaticon2-cancel"></i>
          </a>
        </>
      ) : null}
    </>
  );
}

export default ApplicationsActionsColumnFormatter;
