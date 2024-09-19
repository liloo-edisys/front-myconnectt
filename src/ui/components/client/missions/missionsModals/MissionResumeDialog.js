/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import IframeGoogleDocs from "../../../../../utils/googleHacks";
import { getFormattedCV } from "actions/client/applicantsActions";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

export function MissionResumeDialog({ show, onHide, history, resumeRow }) {
  const TENANTID = process.env.REACT_APP_TENANT_ID;
  const userID = history.location.state
    ? history.location.state.applicantID
    : "";
  const resumeUserID = resumeRow && resumeRow.id;

  const dispatch = useDispatch();
  useEffect(() => {
    show === true &&
      dispatch(
        getFormattedCV.request({
          id1: parseInt(TENANTID),
          id2: userID || resumeUserID
        })
      );
  }, [show, dispatch]);
  function encoreUrl(str) {
    let newUrl = "";
    const len = str && str.length;
    let url;
    for (let i = 0; i < len; i++) {
      let c = str.charAt(i);
      let code = str.charCodeAt(i);

      if (c === " ") {
        newUrl += "+";
      } else if (
        (code < 48 && code !== 45 && code !== 46) ||
        (code < 65 && code > 57) ||
        (code > 90 && code < 97 && code !== 95) ||
        code > 122
      ) {
        newUrl += "%" + code.toString(16);
      } else {
        newUrl += c;
      }
    }
    if (newUrl.indexOf(".doc") > 0 || newUrl.indexOf(".docx") > 0) {
      url = "https://view.officeapps.live.com/op/embed.aspx?src=" + newUrl;
    } else {
      url =
        "https://docs.google.com/gview?url=" +
        newUrl +
        "&embedded=true&SameSite=None";
    }
    return url;
  }
  const { url } = useSelector(
    state => ({
      url: state.applicants.resume
    }),
    shallowEqual
  );

  // useEffect(() => {
  //   url === null
  // }, [show]);

  let resume = url && encoreUrl(url);
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      size="xl"
      style={{ zIndex: "9999" }}
    >
      <Modal.Header closeButton>
        <Modal.Title className="pageSubtitle" id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.SHOW_CV.TITLE" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {resume !== null && (
          <div
            style={{ height: "70vh" }}
            className="custom-dropzone w-500 h-500 d-flex justify-content-center"
          >
            {" "}
            <IframeGoogleDocs
              width="100%"
              loading={false}
              height="600px"
              url={resume}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="MATCHING.MODAL.CLOSE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
