import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import _, { debounce, isNull } from "lodash";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { toastr } from "react-redux-toastr";
import JoditEditor from "jodit-react";
import axios from "axios";

function HoursStatementComplaint(props) {
  const { id } = useParams();
  const { getRH } = props;
  const history = useHistory();
  const [complaint, setComplaint] = useState("");
  const editor = useRef(null);
  const intl = useIntl();
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));

  const config = {
    readonly: false
  };

  const sendComplaint = () => {
    const POST_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecordClaim`;

    if (!isNullOrEmpty(complaint)) {
      const body = {
        tenantID: user.tenantID,
        timeRecordID: parseInt(id),
        description: complaint,
        claimType: 1,
        senderType: 2
      };
      axios
        .post(POST_TIME_RECORDS_URL, body)
        .then(res => {
          toastr.success(
            intl.formatMessage({ id: "SUCCESS" }),
            intl.formatMessage({ id: "SUCCESS.CLAIM" })
          );
          history.goBack();
          getRH();
        })
        .catch(err => console.log(err));
    } else
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        intl.formatMessage({ id: "ERROR.CLAIM" })
      );
  };

  return (
    <Modal
      show={true}
      onHide={() => history.goBack()}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage id="TEXT.COMPLAINT" />
          </p>
        </Modal.Title>
        <button
          onClick={() => history.goBack()}
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body className="py-0 m-5">
        {/*<JoditEditor
          ref={editor}
          value={complaint}
          config={config}
          tabIndex={1}
          onBlur={(newContent) => setComplaint(newContent)}
        />*/}

        <div>
          <textarea
            value={complaint}
            placeholder="Ecrivez ici..."
            rows="5"
            style={{ width: "100%" }}
            onChange={e => setComplaint(e.target.value)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => history.goBack()}
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => sendComplaint()}
          >
            <FormattedMessage id="CONTACT.MODAL.SEND_BUTTON" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default HoursStatementComplaint;
