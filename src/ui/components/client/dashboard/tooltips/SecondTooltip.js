import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

function SecondTooltip(props) {
  const { intl, goToNextStep, user, dispatch } = props;
  return (
    <div
      className="popover show bs-popover-right"
      style={{
        zIndex: 200,
        position: "absolute",
        top: "500px",
        left: "380px",
        width: "400px",
        maxWidth: "400px"
      }}
    >
      <div className="arrow" />
      <div
        className="popover-header"
        style={{
          alignItems: "center",
          display: "flex",
          width: "400px"
        }}
      >
        <h3
          style={{
            width: "400px",
            marginBottom: 0
          }}
        >
          {intl.formatMessage({ id: "CLIENT.WIZARD.SECOND.STEP.TITLE" })}
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
          width: "400px",
          backgroundColor: "white",
          borderRadius: "0px 0px 5px 5px",
          display: "flex"
        }}
      >
        <div className="gif-wrapper">
          <img
            src={"/media/elements/menu.gif"}
            alt=""
            className="align-self-end h-70px static-gif"
          />
          <img
            src={`/media/elements/menu-loop.gif`}
            alt=""
            className="align-self-end h-70px"
          />
        </div>
        <div>
          <div>
            {intl.formatMessage({ id: "CLIENT.WIZARD.SECOND.STEP.CHUNK1" })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(connect()(SecondTooltip));
