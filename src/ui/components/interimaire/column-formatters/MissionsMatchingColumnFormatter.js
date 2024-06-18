// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { MixedWidgetMatching } from "../../../../_metronic/_partials/widgets";

function MissionsMatchingColumnFormatter(cell, row) {
  let color = "warning";
  if (cell >= 50) color = "primary";
  if (cell >= 75) color = "success";
  return row !== null ? (
    <MixedWidgetMatching id={row.id} value={cell} basecolor={color} />
  ) : null;
}

export default MissionsMatchingColumnFormatter;
