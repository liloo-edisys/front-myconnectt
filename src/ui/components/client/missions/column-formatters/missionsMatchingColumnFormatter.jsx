import React from "react";
import { MixedWidgetMatching } from "metronic/_partials/widgets";

function MissionsMatchingColumnFormatter(cell, row) {
  let color = "warning";
  if (cell >= 50) color = "primary";
  if (cell >= 75) color = "success";
  return row !== null ? (
    <MixedWidgetMatching id={row.id} value={cell} basecolor={color} />
  ) : null;
}

export default MissionsMatchingColumnFormatter;
