// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

const applicationStatus = [
  {
    name: "Matching réfusé",
    id: 0,
    color: "label label-lg font-weight-bold label-light-gray label-inline"
  },
  {
    name: "En attente d’informations pour l’entreprise",
    id: 1,
    color: "label label-lg font-weight-bold label-light-primary label-inline"
  },
  {
    name: "En attente de la réponse de l'entreprise",
    id: 2,
    color: "label label-lg font-weight-bold label-light-primary label-inline"
  },
  {
    name: "Candidature non retenue",
    id: 3,
    color: "label label-lg font-weight-bold label-light-danger label-inline"
  },
  {
    name: "Refus personnel",
    id: 4,
    color: "label label-lg font-weight-bold label-light-danger label-inline"
  },
  {
    name: "Retenu",
    id: 5,
    color: "label label-lg font-weight-bold label-light-success label-inline"
  }
];

function ApplicationsStatusColumnFormatter(value, row, index) {
  var status = applicationStatus.filter(e => e.id === value)[0];
  return status ? (
    <span>
      <span className={status.color}>{status.name}</span>
    </span>
  ) : null;
}

export default ApplicationsStatusColumnFormatter;
