import React from "react";

//import SVG from "react-inlinesvg";
import { Link } from "react-router-dom";

import { toAbsoluteUrl } from "../../../_helpers";
import { QuickUserToggler } from "../extras/QuiclUserToggler";

export function TopbarClient() {

  return (
    <div className="topbar toolbar-client-height">

      {/*<div className="topbar-item">
        <div className="btn btn-icon btn-lg mr-1" data-toggle="modal" data-target="#kt_chat_modal">
          <Link
            to={`/contact`}
            title="Contacter MyConnectt"
            rel="noopener noreferrer"
            className="nav-link"
          >
            <span className="svg-icon svg-icon-xl svg-icon-white">
              <SVG
                src={toAbsoluteUrl(
                  "/media/svg/icons/Communication/Group-chat.svg"
                )}
                className="svg-icon-lg svg-icon-white"
              ></SVG>
            </span>
          </Link>
        </div>
      </div>

      <div className="btn btn-icon btn-lg mr-1 pulse pulse-white">
        <span className="svg-icon svg-icon-xl svg-icon-white">
          <SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Urgent-mail.svg")} />
        </span>
        <span className="pulse-ring"></span>
      </div>*/}

      <QuickUserToggler />
    </div>
  );
}
