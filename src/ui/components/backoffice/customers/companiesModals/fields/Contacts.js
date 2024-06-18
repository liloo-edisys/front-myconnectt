import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { inviteContact } from "actions/client/ContactsActions";
import { Input } from "metronic/_partials/controls";
import BootstrapTable from "react-bootstrap-table-next";
import { headerSortingClasses, sortCaret } from "metronic/_helpers";
import axios from "axios";
import { useParams } from "react-router-dom";
import * as Yup from "yup";

function Contacts(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const intl = useIntl();
  const ContactInviteSchema = Yup.object().shape({
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    accountID: Yup.number().min(
      1,
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });
  const { companies } = useSelector(
    state => ({
      companies: state.companies.companies
    }),
    shallowEqual
  );
  let filteredCompanies =
    companies != null
      ? companies.length
        ? companies
            .filter(company => company.parentID === null)
            .map(function(c) {
              return {
                value: c.id,
                label: c.name,
                parentId: c.parentID
              };
            })
        : []
      : [];

  const activeCompany = filteredCompanies.filter(
    company => company.value === parseInt(id)
  );

  const initialValues = {
    lastname: "",
    firstname: "",
    email: "",
    accountID: parseInt(id)
  };

  const { history } = props;
  const [contacts, setContacts] = useState([]);
  const [toggleAddForm, setToggleAddForm] = useState(false);

  useEffect(() => {
    getContactList();
  }, []);

  const getContactList = () => {
    const CONTACTS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/Contact/AccountContacts`;
    const body = {
      id1: parseInt(process.env.REACT_APP_TENANT_ID),
      id2: parseInt(id)
    };
    axios
      .post(CONTACTS_URL, body)
      .then(res => {
        setContacts(res.data);
      })
      .catch(err => console.log(err));
  };

  function isAdminFormatter(cell) {
    return cell !== null && cell ? (
      <span className="label label-lg label-light-success label-inline">
        <FormattedMessage id="TEXT.ADMINISTRATEUR" />
      </span>
    ) : (
      <span className="label label-lg label-light-primary label-inline">
        <FormattedMessage id="TEXT.UTILISATEUR" />
      </span>
    );
  }

  function isApprovedFormatter(cell) {
    return cell !== null && cell ? (
      <span className="label label-lg label-light-success label-inline">
        <FormattedMessage id="TEXT.VALEDATED" />
      </span>
    ) : (
      <span className="label label-lg label-light-warning label-inline">
        <FormattedMessage id="TEXT.WAITINGFOR" />
      </span>
    );
  }
  let columns = [
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "MODEL.LASTNAME" }),
      sort: true
    },
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "poste",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "isAdmin",
      text: intl.formatMessage({ id: "TEXT.DROITS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: isAdminFormatter
    },
    {
      dataField: "isApproved",
      text: intl.formatMessage({ id: "TEXT.STATUS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: isApprovedFormatter
    }
  ];

  const showAddForm = () => {
    setToggleAddForm(true);
  };

  const hideAddFom = () => {
    setToggleAddForm(false);
  };
  const getContactListTimeOut = () => {
    setTimeout(() => {
      getContactList();
    }, 2000);
  };

  return (
    <div className="p-10">
      <Modal
        size="md"
        show={toggleAddForm}
        onHide={hideAddFom}
        aria-labelledby="example-modal-sizes-title-md"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            <FormattedMessage id="CONTACTS.INVITE.TITLE2" />
          </Modal.Title>
        </Modal.Header>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={ContactInviteSchema}
          onSubmit={(values, { setSubmitting, history }) => {
            dispatch(
              inviteContact.request(values, null),
              getContactListTimeOut(),
              hideAddFom()
            );
          }}
        >
          {({ handleSubmit, setFieldValue, touched, errors }) => (
            <>
              <Modal.Body className="overlay overlay-block cursor-default">
                <Form className="form form-label-right">
                  <div className="form-group row">
                    <div className="col-lg-12">
                      <label>
                        <FormattedMessage id="MODEL.LASTNAME" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-user-tie text-primary"></i>
                          </span>
                        </div>
                        <Field
                          name="lastname"
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.LASTNAME"
                          })}
                        />
                      </div>
                    </div>
                    {touched.lastname && errors.lastname && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.lastname}</div>
                      </div>
                    )}
                    <div className="col-lg-12 mt-10">
                      <label>
                        <FormattedMessage id="MODEL.FIRSTNAME" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-user text-primary"></i>
                          </span>
                        </div>
                        <Field
                          name="firstname"
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.FIRSTNAME"
                          })}
                        />
                      </div>
                    </div>
                    {touched.firstname && errors.firstname && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.firstname}</div>
                      </div>
                    )}
                    <div className="col-lg-12 mt-10">
                      <label>
                        <FormattedMessage id="MODEL.EMAIL" />
                      </label>
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
                    {touched.email && errors.email && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.email}</div>
                      </div>
                    )}
                    <div className="col-lg-12 mt-10 backoffice-account-selector">
                      <label>
                        <FormattedMessage id="TEXT.COMPANY" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="display-5 text-primary flaticon2-world"></i>
                          </span>
                        </div>
                        <Field
                          disabled
                          name="accountID"
                          component={Input}
                          value={activeCompany[0].label}
                          placeholder="Entreprise"
                        />
                        {/*<Select
                          name="accountID"
                          className="form-control p-0"
                          style={{ borderWidth: 0 }}
                          options={filteredCompanies}
                          value={selectedCompany}
                          placeholder="Entreprise"
                          onChange={(e) => {
                            onChangeCompany(e, setFieldValue);
                          }}
                        />*/}
                      </div>
                    </div>
                    {touched.accountID && errors.accountID && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.accountID}</div>
                      </div>
                    )}
                  </div>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <button
                  type="button"
                  className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                  onClick={hideAddFom}
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
      </Modal>
      <div
        className="mb-10"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h2 className="font-weight-boldest mb-5">Contacts</h2>
        <button
          type="button"
          className="btn btn-primary font-weight-bold px-5 py-2 btn-shadow"
          onClick={showAddForm}
        >
          <FormattedMessage id="MODEL.CREATE.CONTACT2.TITLE" />
        </button>
      </div>
      <BootstrapTable
        remote
        rowClasses={["dashed"]}
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        keyField="id"
        data={contacts}
        columns={columns}
      />
    </div>
  );
}

export default Contacts;
