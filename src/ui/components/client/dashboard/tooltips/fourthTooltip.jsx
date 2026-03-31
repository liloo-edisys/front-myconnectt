import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

function FourthTooltip(props) {
  const { intl, goToNextStep, user, dispatch } = props;
  return (
    <div
      className="popover show bs-popover-left"
      style={{
        zIndex: 200,
        position: "absolute",
        top: "600px",
        left: "30px",
        width: "350px",
        maxWidth: "350px"
      }}
    >
      <div className="arrow" />
      <div
        className="popover-header"
        style={{
          alignItems: "center",
          display: "flex",
          width: "350px"
        }}
      >
        <h3
          style={{
            width: "350px",
            marginBottom: 0
          }}
        >
          {intl.formatMessage({ id: "CLIENT.WIZARD.FOURTH.STEP.TITLE" })}
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
          width: "350px",
          backgroundColor: "white",
          borderRadius: "0px 0px 5px 5px",
          display: "flex"
        }}
      >
        <div className="gif-wrapper">
          <img
            src={"/media/elements/panel.gif"}
            alt=""
            className="align-self-end h-70px static-gif"
          />
          <img
            src={`/media/elements/panel-loop.gif`}
            alt=""
            className="align-self-end h-70px"
          />
        </div>
        <div>
          <div>
            {intl.formatMessage({ id: "CLIENT.WIZARD.FOURTH.STEP.CHUNK1" })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(connect()(FourthTooltip));
