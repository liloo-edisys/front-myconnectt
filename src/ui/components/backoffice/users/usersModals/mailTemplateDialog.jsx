import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { updateMailTemplate } from "../../../../../business/actions/backoffice/mailTemplatesActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import JoditEditor from "jodit-react";
import "./styles.scss";

export function MailTemplateDialog({ onHide }) {
  const dispatch = useDispatch();

  const [mailContent, setMailContent] = useState(null);
  const [smsContent, setSmsContent] = useState(null);
  const [notificationContent, setNotificationContent] = useState(null);

  const { loading, mailTemplate } = useSelector(
    state => ({
      loading: state.mailTemplatesdReducerData.loading,
      mailTemplate: state.mailTemplatesdReducerData.mailTemplate
    }),
    shallowEqual
  );

  const editor = useRef(null);

  const config = {
    readonly: false
  };

  useEffect(() => {
    setSmsContent(mailTemplate.smsContent);
    setMailContent(mailTemplate.defaultGlobalHtmlBody);
    setNotificationContent(mailTemplate.notificationContent);
  }, [mailTemplate]);

  const handleClose = () => {
    onHide();
  };

  const modifyMailTemplate = () => {
    dispatch(
      updateMailTemplate.request({
        ...mailTemplate,
        smsContent: !isNullOrEmpty(smsContent) ? smsContent : null,
        notificationContent: !isNullOrEmpty(notificationContent)
          ? notificationContent
          : null,
        defaultGlobalHtmlBody: !isNullOrEmpty(mailContent) ? mailContent : null
      })
    );
    onHide();
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            {loading ? "--" : mailTemplate != null ? mailTemplate.name : ""}
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            {loading ? "--" : mailTemplate != null ? mailTemplate.name : ""}
          </p>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={() => handleClose()}
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
        <div className="form-group">
          <label>
            <FormattedMessage id="NOTIFICATION.MAIL" />
          </label>
          <JoditEditor
            className="col-lg-12 form-control"
            ref={editor}
            value={mailContent}
            config={config}
            tabIndex={1}
            onBlur={newContent => setMailContent(newContent)}
          />
        </div>
        <div className="form-group">
          <label>
            <FormattedMessage id="NOTIFICATION.SMS" />
          </label>
          <textarea
            className="col-lg-12 form-control"
            onChange={e => setSmsContent(e.target.value)}
            value={smsContent}
          />
        </div>
        <div className="form-group">
          <label>
            <FormattedMessage id="NOTIFICATION.NOTIF" />
          </label>
          <textarea
            className="col-lg-12 form-control"
            onChange={e => setNotificationContent(e.target.value)}
            value={notificationContent}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={modifyMailTemplate}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.SAVE.DONE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
