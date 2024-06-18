// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import "./styles.scss";

function ActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  {
    openEditCompanyDialog,
    openDeleteCompanyDialog,
    newWorksiteButtonClick,
    openEditWorksiteDialog,
    openPreviewWorksiteDialog,
    user
  }
) {
  return (
    <>
      <a
        onClick={() => openPreviewWorksiteDialog(row.id, row)}
        title="Créer un nouveau chantier"
        className="btn btn-icon btn-light-primary mr-2 button-width"
      >
        <div>Voir plus</div>
      </a>
      {row.parentID ? null : (
        <a
          onClick={() => newWorksiteButtonClick(row)}
          title="Créer un nouveau chantier"
          className="btn btn-icon btn-light-primary mr-2 button-width"
        >
          <div>Ajouter</div>
        </a>
      )}
      {row.parentID
        ? user &&
          user.isAdmin === true && (
            <a
              onClick={() => openEditWorksiteDialog(row.id, row)}
              title="Modifier ce chantier"
              className="btn btn-icon btn-light-info mr-2"
            >
              <i className="far fa-edit"></i>
            </a>
          )
        : user &&
          user.isAdmin === true && (
            <a
              onClick={() => openEditCompanyDialog(row.id, row)}
              title="Modifier cette entreprise"
              className="btn btn-icon btn-light-info mr-2"
            >
              <i className="far fa-edit"></i>
            </a>
          )}

      {user && user.isAdmin === true && (
        <a
          onClick={() => openDeleteCompanyDialog(row)}
          title="Supprimer"
          className="btn btn-icon btn-light-danger mr-2"
        >
          <i className="far fa-trash-alt"></i>
        </a>
      )}
    </>
  );
}

export default ActionsColumnFormatter;
