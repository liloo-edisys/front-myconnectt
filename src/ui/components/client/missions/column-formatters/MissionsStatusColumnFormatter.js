// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";

const missionStatus = [
  {
    name: "Brouillon",
    id: 0,
    color: "label label-lg font-weight-bold label-light-gray label-inline"
  },
  {
    name: "Non pourvue",
    id: 1,
    color: "label label-lg font-weight-bold label-light-primary label-inline"
  },
  {
    name: "Partiellement pourvue",
    id: 2,
    color: "label label-lg font-weight-bold label-light-info label-inline"
  },
  {
    name: "Pourvue",
    id: 3,
    color: "label label-lg font-weight-bold label-light-success label-inline"
  },
  {
    name: "Demande annulée",
    id: 4,
    color: "label label-lg font-weight-bold label-light-danger label-inline"
  },
  {
    name: "Validée par MyConnectt",
    id: 5,
    color: "label label-lg font-weight-bold label-light-success label-inline"
  }
];

function MissionsStatusColumnFormatter(value, row, index) {
  var status = missionStatus.filter(e => e.id === value)[0];
  return value !== null && status ? (
    <span>
      <span className={status.color}>{status.name}</span>
    </span>
  ) : null;
}

export default MissionsStatusColumnFormatter;
