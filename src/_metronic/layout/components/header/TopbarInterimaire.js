import React from "react";

import { QuickUserToggler } from "../extras/QuiclUserToggler";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../_helpers";

export function TopbarInterimaire() {

  return (
    <div className="topbar toolbar-interimaire-height">
      {/*<div className="btn btn-icon btn-lg mr-1 pulse pulse-white">
        <span className="svg-icon svg-icon-xl svg-icon-white">
          <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Urgent-mail.svg")} />
        </span>
        <span className="pulse-ring"></span>
      </div>*/}
      <QuickUserToggler />
    </div>
  );
}
