import React from "react";

import { inviteContact } from "actions/client/ContactsActions";
import { Formik, Form, Field } from "formik";
import { Input } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

function InviteContactForm({ onHide, intl }) {
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));
  const dispatch = useDispatch();
  const initialValues = {
    email: ""
  };

  // Validation schema
  const ContactInviteSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={ContactInviteSchema}
        onSubmit={(values, { setSubmitting, history }) => {
          const body = {
            ...values,
            accountID: user.accountID
          };
          dispatch(inviteContact.request(body), onHide());
        }}
      >
        {({ handleSubmit }) => (
          <>
            <Modal.Body className="overlay overlay-block cursor-default">
              <Form className="form form-label-right">
                <div className="form-group row">
                  <div className="col-lg-12">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-envelope text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="email"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.EMAIL"
                        })}
                      />
                    </div>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                onClick={onHide}
                className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.CANCEL" />
              </button>
              <> </>
              <button
                type="submit"
                onClick={() => handleSubmit()}
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.SUBMIT" />
              </button>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </>
  );
}

export default injectIntl(InviteContactForm);
