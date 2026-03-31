import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

function FirstTooltip(props) {
  const { intl, goToNextStep, user, dispatch } = props;
  return (
    <div
      className="popover show bs-popover-right"
      style={{
        zIndex: 200,
        position: "absolute",
        top: "33%",
        left: "33%",
        maxWidth: "600px",
        width: "600px"
      }}
    >
      <div
        className="popover-header"
        style={{
          alignItems: "center",
          display: "flex",
          width: "600px"
        }}
      >
        <h3
          style={{
            width: "600px",
            marginBottom: 0
          }}
        >
          {intl.formatMessage({ id: "CLIENT.WIZARD.FIRST.STEP.TITLE" })}
        </h3>
        <a
          href="#"
          onClick={() => {
            goToNextStep(user, 13, dispatch, true);
          }}
          className="btn btn-xs btn-icon btn-light btn-hover-primary"
          id="kt_quick_user_close"
        >
          <i className="ki ki-close icon-xs text-muted" />
        </a>
      </div>
      <div
        className="popover-body"
        style={{
          width: "600px",
          backgroundColor: "white",
          borderRadius: "0px 0px 5px 5px",
          display: "flex"
        }}
      >
        <div className="gif-wrapper">
          <img
            src={"/media/elements/welcome-client.gif"}
            alt=""
            className="align-self-end h-70px static-gif"
          />
          <img
            src={`/media/elements/welcome-client-loop.gif`}
            alt=""
            className="align-self-end h-70px"
          />
        </div>
        <div>
          <div>
            {intl.formatMessage({ id: "CLIENT.WIZARD.FIRST.STEP.CHUNK1" })}
          </div>
          <div>
            {intl.formatMessage({ id: "CLIENT.WIZARD.FIRST.STEP.CHUNK2" })}
          </div>
          <div>
            {intl.formatMessage({ id: "CLIENT.WIZARD.FIRST.STEP.CHUNK3" })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(connect()(FirstTooltip));
