import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { updateMailTemplate } from "../../../../../business/actions/backoffice/MailTemplatesActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import JoditEditor from "jodit-react";
import "./styles.scss";
import moment from "moment";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";

export function MailTemplateDialog({ onHide, getData }) {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [mailContent, setMailContent] = useState(null);
  const [smsContent, setSmsContent] = useState(null);
  const [notificationContent, setNotificationContent] = useState(null);
  const [pushContent, setPushContent] = useState(null);
  const [automaticSendDelay, setAutomaticSendDelay] = useState(0);
  const [isRelance, setIsRelance] = useState(false);
  const [waitForDaysBeforeSendAgain, setWaitForDaysBeforeSendAgain] = useState(
    0
  );
  const [isAccroche, setIsAccroche] = useState(false);
  const [accrocheDate, setAccrocheDate] = useState(null);
  const [
    sendAccrocheToAllApplicants,
    setSendAccrocheToAllApplicants
  ] = useState(false);

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
    setName(mailTemplate.name);
    setSubject(mailTemplate.defaultGlobalSubject);
    setSmsContent(mailTemplate.smsContent);
    setMailContent(mailTemplate.defaultGlobalHtmlBody);
    setNotificationContent(mailTemplate.notificationContent);
    setPushContent(mailTemplate.pushContent);
    setAutomaticSendDelay(mailTemplate.automaticSendDelay);
    setIsRelance(mailTemplate.isRelance);
    setWaitForDaysBeforeSendAgain(mailTemplate.waitForDaysBeforeSendAgain);
    setIsAccroche(mailTemplate.isAccroche);
    setAccrocheDate(moment(mailTemplate.accrocheDate).toDate());
    setSendAccrocheToAllApplicants(mailTemplate.sendAccrocheToAllApplicants);
  }, [mailTemplate]);

  const handleClose = () => {
    onHide();
  };

  const modifyMailTemplate = () => {
    dispatch(
      updateMailTemplate.request({
        ...mailTemplate,
        name: !isNullOrEmpty(name) ? name : null,
        defaultGlobalSubject: !isNullOrEmpty(subject) ? subject : null,
        smsContent: !isNullOrEmpty(smsContent) ? smsContent : null,
        notificationContent: !isNullOrEmpty(notificationContent)
          ? notificationContent
          : null,
        pushContent: !isNullOrEmpty(pushContent) ? pushContent : null,
        defaultGlobalHtmlBody: !isNullOrEmpty(mailContent) ? mailContent : null,
        automaticSendDelay: +automaticSendDelay,
        waitForDaysBeforeSendAgain: +waitForDaysBeforeSendAgain,
        accrocheDate: accrocheDate,
        sendAccrocheToAllApplicants: sendAccrocheToAllApplicants
      })
    );
    onHide();
    getData();
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
            {loading
              ? "--"
              : mailTemplate != null
              ? mailTemplate.shortName
              : ""}
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            {loading
              ? "--"
              : mailTemplate != null
              ? mailTemplate.shortName
              : ""}
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
        {isAccroche && (
          <>
            <div className="form-group">
              <label>
                <FormattedMessage id="TEXT.ACCROCHE_DATE" />
              </label>
              <div className="width-100">
                <DatePicker
                  className={`col-lg-12 form-control`}
                  style={{ width: "100%" }}
                  onChange={val => {
                    setAccrocheDate(val, dispatch);
                  }}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-start"
                  selected={accrocheDate}
                  locale={fr}
                  showMonthDropdown
                  showYearDropdown
                  yearItemNumber={9}
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                <FormattedMessage id="TEXT.ACCROCHE_TO_ALL" />
              </label>
              <div>
                <span className="switch switch switch-sm">
                  <label>
                    <input
                      className="col-lg-12 form-control"
                      type="checkbox"
                      checked={sendAccrocheToAllApplicants}
                      onChange={e =>
                        setSendAccrocheToAllApplicants(
                          !sendAccrocheToAllApplicants
                        )
                      }
                    />
                    <span></span>
                  </label>
                </span>
              </div>
            </div>
          </>
        )}
        {(isRelance || (isAccroche && !sendAccrocheToAllApplicants)) && (
          <>
            <div className="form-group">
              <label>
                <FormattedMessage id="TEXT.RELANCE_DELAY" />
              </label>
              <input
                className="col-lg-12 form-control"
                onChange={e => setAutomaticSendDelay(e.target.value)}
                value={automaticSendDelay}
              />
            </div>
          </>
        )}
        {isRelance && (
          <>
            <div className="form-group">
              <label>
                <FormattedMessage id="TEXT.WAIT_FOR_DAYS_BEFORE_SEND_AGAIN" />
              </label>
              <input
                className="col-lg-12 form-control"
                onChange={e => setWaitForDaysBeforeSendAgain(e.target.value)}
                value={waitForDaysBeforeSendAgain}
              />
            </div>
          </>
        )}
        <div className="form-group">
          <label>
            <FormattedMessage id="TEXT.NOTIFICATION.NAME" />
          </label>
          <input
            className="col-lg-12 form-control"
            onChange={e => setName(e.target.value)}
            value={name}
          />
        </div>
        {!isAccroche && (
          <>
            <div className="form-group">
              <label>
                <FormattedMessage id="TEXT.NOTIFICATION.SUBJECT" />
              </label>
              <input
                className="col-lg-12 form-control"
                onChange={e => setSubject(e.target.value)}
                value={subject}
              />
            </div>
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
                onChange=""
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
          </>
        )}
        <div className="form-group">
          <label>
            <FormattedMessage id="NOTIFICATION.NOTIF.PUSH" />
          </label>
          <textarea
            className="col-lg-12 form-control"
            onChange={e => setPushContent(e.target.value)}
            value={pushContent}
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
