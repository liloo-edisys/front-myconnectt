import React, { useState, useRef } from "react";

import { sendEmail } from "actions/client/EmailActions";
import JoditEditor from "jodit-react";
import { FormattedMessage, injectIntl } from "react-intl";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

const EmailContactForm = ({ onHide }) => {
  const dispatch = useDispatch();

  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [object, setObject] = useState("");

  const config = {
    readonly: false // all options from https://xdsoft.net/jodit/doc/
  };

  const handleSendEmail = () => {
    if (content.length > 0 && object.length > 0) {
      dispatch(sendEmail.request({ body: content, subject: object }));
      onHide();
    } else {
      toastr.error("Erreur", "Veuillez renseigner l'objet et le corps du mail");
    }
  };

  return (
    <div className="m-5 h-100">
      <input
        type="text"
        placeholder="Objet"
        className={`form-control form-control-solid h-auto py-5 px-6 my-5 h-100`}
        name="object"
        //   value={object}
        onChange={e => setObject(e.target.value)}
      />
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1} // tabIndex of textarea
        onBlur={newContent => setContent(newContent)}
        // preferred to use only this option to update the content for performance reasons
      />
      <div className="form-group d-flex flex-wrap flex-center">
        <button
          onClick={() => onHide()}
          type="button"
          id="kt_login_forgot_cancel"
          className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
        >
          <FormattedMessage id="BUTTON.CANCEL" />
        </button>
        <button
          onClick={() => handleSendEmail()}
          id="kt_login_forgot_submit"
          type="submit"
          className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
        >
          <FormattedMessage id="CONTACT.MODAL.SEND_BUTTON" />
        </button>
      </div>
    </div>
  );
};

export default injectIntl(EmailContactForm);
