import React, { useEffect, useState, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import axios from "axios";
import { useLocation } from "react-router-dom";
import JoditEditor from "jodit-react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Modal } from "react-bootstrap";
import Select from "react-select/async";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";

const api = process.env.REACT_APP_WEBAPI_URL;

export default function Messenger() {
  const intl = useIntl();
  const { pathname } = useLocation();
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));
  const editor = useRef(null);
  const [messagesList, setMessagesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [responded, setResponded] = useState(false);
  const [notResponded, setNotResponded] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  const [content, setContent] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageRecipient, setNewMessageRecipient] = useState("");
  const [sendToAllTemp, setSendToAllTemp] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);

  const config = {
    readonly: false,
  };

  useEffect(() => {
    getMessages();
  }, [pageNumber, responded, notResponded]);

  const getMessages = () => {
    let responseStatus = 0;
    if (responded === notResponded) {
      responseStatus = 0;
    } else if (notResponded) {
      responseStatus = 1;
    } else if (responded) {
      responseStatus = 2;
    }

    let body = {
      tenantID: user.tenantID,
      responseStatus: responseStatus,
      pageSize: 10,
      pageNumber: pageNumber,
    };
    if (pathname === "/messenger/applicant") {
      body = {
        ...body,
        applicantsOnly: true,
      };
    } else if (pathname === "/messenger/client") {
      body = {
        ...body,
        accountsOnly: true,
      };
    }
    axios
      .post(`${api}api/email/SearchMessagerie`, body)
      .then((res) => {
        setMessagesList(res.data.list);
        setTotalCount(res.data.totalcount);
      })
      .catch((err) => console.log(err));
  };

  const columns = [
    {
      dataField: "content_Subject",
      text: "Sujet",
    },
    {
      dataField: "content_From",
      text: "Envoyé par",
    },
    {
      dataField: "content_To",
      text: "Reçu par",
    },
    {
      dataField: "creationDate",
      text: "Reçu le",
      formatter: (value) => <span>{new Date(value).toLocaleString()}</span>,
    },
    {
      dataField: "isResponded",
      text: "Répondu",
      formatter: (value) => <span>{value ? "Oui" : "Non"}</span>,
    },
    {
      text: "Action",
      dataField: "",
      formatter: (value, row) => (
        <button
          className="btn btn-light-primary mr-2"
          onClick={() => setActiveMessage(row)}
        >
          {row.isResponded ? "Voir les messages" : "Répondre"}
        </button>
      ),
    },
  ];

  const RemotePagination = ({
    data,
    page,
    sizePerPage,
    onTableChange,
    totalSize,
    from,
    to,
  }) => (
    <div>
      <PaginationProvider
        pagination={paginationFactory({
          custom: true,
          page,
          sizePerPage,
          totalSize,
          from,
          to,
          showTotal: true,
          firstPageText: intl.formatMessage({ id: "BEGINNING" }),
          prePageText: "<",
          nextPageText: ">",
          lastPageText: intl.formatMessage({ id: "END" }),
          nextPageTitle: ">",
          prePageTitle: "<",
        })}
      >
        {({ paginationProps, paginationTableProps }) => (
          <div>
            <div style={{ display: "none" }}>
              <BootstrapTable
                remote
                wrapperClasses="table-responsive"
                bordered={false}
                classes="table table-head-custom table-vertical-center overflow-hidden"
                bootstrap4
                keyField="id"
                data={[]}
                columns={columns}
                onTableChange={onTableChange}
                {...paginationTableProps}
                noDataIndication={() => <NoDataIndication />}
              />
            </div>
            <div className="d-flex flex-row justify-content-between">
              <PaginationListStandalone {...paginationProps} />
              <div className="d-flex flex-row align-items-center">
                <p className="ml-5" style={{ margin: 0 }}>
                  <FormattedMessage
                    id="MESSAGE.MESSAGES.TOTALCOUNT"
                    values={{ totalCount: totalCount }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );

  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">Vous n'avez pas de messages</div>
      </div>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
  };

  const handleSendEmail = () => {
    let SEND_EMAIL_URL = `${api}api/Email/SendEmailToUser`;
    let body = null;
    if (activeMessage.accountID) {
      body = {
        body: content,
        subject: activeMessage.content_Subject,
        relatedNotificationID: activeMessage.id,
        accountID: parseInt(activeMessage.accountID),
      };
    } else {
      body = {
        body: content,
        subject: activeMessage.content_Subject,
        relatedNotificationID: activeMessage.id,
        applicantID: parseInt(activeMessage.related_ApplicantID),
        userID: parseInt(activeMessage.senderUserID),
      };
    }
    axios
      .post(SEND_EMAIL_URL, body)
      .then((res) => {
        toastr.success("Succès", "Votre mail a été envoyé avec succès.");
        getMessages();
        setActiveMessage(null);
        setContent("");
      })
      .catch((err) =>
        toastr.error("Erreur", "Cet utilisateur n'a pas d'adresse mail.")
      );
  };

  const handleNewMessage = () => {
    if (
      !newMessageSubject ||
      (!sendToAllTemp && !newMessageRecipient) ||
      !content
    ) {
      toastr.error("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    const body = {
      body: content,
      subject: newMessageSubject,
      recipientEmail: sendToAllTemp ? null : newMessageRecipient,
      sendToAllTemp: sendToAllTemp,
      tenantID: user.tenantID,
    };

    axios
      .post(`${api}api/email/SendNewEmail`, body)
      .then((res) => {
        toastr.success("Succès", "Votre mail a été envoyé avec succès.");
        getMessages();
        setShowNewMessageModal(false);
        resetNewMessageForm();
      })
      .catch((err) =>
        toastr.error(
          "Erreur",
          "Une erreur est survenue lors de l'envoi du message."
        )
      );
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "45px",
      background: state.isDisabled ? "#f3f6f9" : "#ffffff",
      borderColor: "#E4E6EF",
      "&:hover": {
        borderColor: "#E4E6EF",
      },
      boxShadow: "none",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f3f6f9" : "white",
      color: "#3F4254",
      "&:hover": {
        backgroundColor: "#f3f6f9",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e1f0ff",
      borderRadius: "0.42rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#3699FF",
      padding: "2px 8px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#3699FF",
      "&:hover": {
        backgroundColor: "transparent",
        color: "#0073e9",
      },
    }),
  };

  const loadApplicants = async (inputValue) => {
    if (!inputValue) {
      return [];
    }

    try {
      const body = {
        tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
        firstName: "",
        lastName: inputValue,
        email: "",
        phoneNumber: "",
      };

      const response = await axios.post(
        `${api}api/applicant/searchapplicants`,
        body
      );

      return response.data.list.map((applicant) => ({
        value: applicant.id,
        label: `${applicant.firstname} ${applicant.lastname}`,
        email: applicant.email,
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      return [];
    }
  };

  const handleApplicantsChange = (selected) => {
    setSelectedApplicants(selected || []);
  };

  const resetNewMessageForm = () => {
    setNewMessageSubject("");
    setSelectedApplicants([]);
    setContent("");
    setSendToAllTemp(false);
  };

  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({
          id:
            pathname === "/messenger/applicant"
              ? "TEXT.APPLICANT.MESSENGER"
              : "TEXT.CLIENT.MESSENGER",
        })}
      >
        <CardHeaderToolbar>
          <button
            className="btn btn-primary"
            onClick={() => setShowNewMessageModal(true)}
          >
            <FormattedMessage
              id="MESSAGE.NEW"
              defaultMessage="Nouveau message"
            />
          </button>
        </CardHeaderToolbar>
      </CardHeader>
      <CardBody>
        <Modal
          size="xl"
          show={activeMessage ? true : false}
          onHide={() => setActiveMessage(null)}
          aria-labelledby="example-modal-sizes-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
              Object: {activeMessage && activeMessage.content_Subject}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {activeMessage && (
              <>
                <div className="flex-row-fluid ml-lg-8" id="kt_chat_content">
                  <div className="card card-custom">
                    <div className="card-body">
                      <div
                        className="scroll scroll-pull ps ps--active-y"
                        data-mobile-height="350"
                      >
                        <div className="messages">
                          <div className="d-flex flex-column mb-5 align-items-start">
                            <div className="d-flex align-items-center">
                              <div>
                                <a className="text-dark-75 text-hover-primary font-weight-bold font-size-h6 mr-5">
                                  {activeMessage.content_From}
                                </a>
                                <span className="text-muted font-size-sm">
                                  {new Date(
                                    activeMessage.creationDate
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div
                              className="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold font-size-lg text-left max-w-400px"
                              dangerouslySetInnerHTML={{
                                __html: activeMessage.content_Body,
                              }}
                            />
                          </div>
                          {activeMessage.responses.map((response, i) => (
                            <div key={i}>
                              <div className="d-flex flex-column mb-5 align-items-end">
                                <div className="d-flex align-items-center">
                                  <div>
                                    <span className="text-muted font-size-sm mr-5">
                                      {new Date(
                                        response.creationDate
                                      ).toLocaleString()}
                                    </span>
                                    <a className="text-dark-75 text-hover-primary font-weight-bold font-size-h6">
                                      MyConnect
                                    </a>
                                  </div>
                                </div>
                                <div
                                  className="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold font-size-lg text-right max-w-400px"
                                  dangerouslySetInnerHTML={{
                                    __html: response.content_Body,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <JoditEditor
                      ref={editor}
                      value={content}
                      config={config}
                      tabIndex={1}
                      onBlur={(newContent) => setContent(newContent)}
                      row={5}
                    />
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-light-primary mr-2"
              onClick={() => setActiveMessage(null)}
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </button>
            <button
              onClick={() => handleSendEmail()}
              className="btn btn-primary btn-shadow"
            >
              <FormattedMessage id="BUTTON.SEND" />
            </button>
          </Modal.Footer>
        </Modal>

        {/* New Message Modal */}
        <Modal
          size="xl"
          show={showNewMessageModal}
          onHide={() => {
            setShowNewMessageModal(false);
            resetNewMessageForm();
            }}
            aria-labelledby="new-message-modal"
          >
            <Modal.Header closeButton>
            <Modal.Title id="new-message-modal">
              <FormattedMessage
              id="MESSAGE.NEW.TITLE"
              defaultMessage="Nouveau message"
              />
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="form-group mb-4">
              <div className="d-flex align-items-center mb-3 justify-content-end">
              <label className="checkbox checkbox-lg checkbox-primary flex-shrink-0 mr-4">
                <input
                type="checkbox"
                checked={sendToAllTemp}
                onChange={(e) => {
                  setSendToAllTemp(e.target.checked);
                  if (e.target.checked) {
                  setSelectedApplicants([]);
                  }
                }}
                />
                <span></span>
                &nbsp;&nbsp;
                <FormattedMessage
                id="MESSAGE.SEND_TO_ALL_TEMP"
                defaultMessage="Envoyer à tous les intérimaires"
                />
              </label>
              </div>
              {!sendToAllTemp && (
              <div>
                <label>
                <FormattedMessage
                  id="MESSAGE.RECIPIENT"
                  defaultMessage="Destinataire"
                />
                </label>
                <Select
                isMulti
                isClearable
                isDisabled={sendToAllTemp}
                styles={selectStyles}
                loadOptions={loadApplicants}
                onChange={handleApplicantsChange}
                placeholder={intl.formatMessage({
                  id: "MESSAGE.RECIPIENTS.PLACEHOLDER",
                  defaultMessage: "Rechercher des intérimaires...",
                })}
                noOptionsMessage={() =>
                  intl.formatMessage({
                  id: "MESSAGE.NO_RESULTS",
                  defaultMessage: "Aucun résultat",
                  })
                }
                loadingMessage={() =>
                  intl.formatMessage({
                  id: "MESSAGE.LOADING",
                  defaultMessage: "Chargement...",
                  })
                }
                className="react-select"
                classNamePrefix="react-select"
                defaultOptions={[]}
                />
              </div>
              )}
            </div>
            <div className="form-group mb-4">
              <label>
              <FormattedMessage id="MESSAGE.SUBJECT" defaultMessage="Sujet" />
              </label>
              <input
              type="text"
              className="form-control"
              value={newMessageSubject}
              onChange={(e) => setNewMessageSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
              <FormattedMessage
                id="MESSAGE.CONTENT"
                defaultMessage="Message"
              />
              </label>
              <JoditEditor
              ref={editor}
              value={content}
              config={config}
              tabIndex={1}
              onBlur={(newContent) => setContent(newContent)}
              />
            </div>
            </Modal.Body>
            <Modal.Footer>
            <button
              className="btn btn-light-primary mr-2"
              onClick={() => {
                setShowNewMessageModal(false);
                resetNewMessageForm();
              }}
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </button>
            <button
              onClick={handleNewMessage}
              className="btn btn-primary btn-shadow"
            >
              <FormattedMessage id="BUTTON.SEND" defaultMessage="Envoyer" />
            </button>
          </Modal.Footer>
        </Modal>

        <div className="row mb-5 mx-15">
          <div className="col-lg-3 width-100">
            <div className="row">
              <label className="col-lg-8 width-100 d-flex col-form-label">
                <FormattedMessage id="MESSAGE.RESPONDED.MESSAGES" />
              </label>
              <div>
                <span className="switch switch switch-sm">
                  <label>
                    <input
                      type="checkbox"
                      checked={responded}
                      onChange={(e) => setResponded(!responded)}
                    />
                    <span></span>
                  </label>
                </span>
              </div>
            </div>
          </div>
          <div className="col-lg-3 width-100">
            <div className="row">
              <label className="col-lg-8 width-100 d-flex col-form-label">
                <FormattedMessage id="MESSAGE.UNRESPONDED.MESSAGES" />
              </label>
              <div>
                <span className="switch switch switch-sm">
                  <label>
                    <input
                      type="checkbox"
                      checked={notResponded}
                      onChange={(e) => setNotResponded(!notResponded)}
                    />
                    <span></span>
                  </label>
                </span>
              </div>
            </div>
          </div>
        </div>

        <BootstrapTable
          remote
          wrapperClasses="table-responsive"
          bordered={false}
          classes="table table-head-custom table-vertical-center overflow-hidden"
          bootstrap4
          keyField="id"
          data={messagesList}
          columns={columns}
        />
        <div style={{ marginTop: 30 }}>
          <RemotePagination
            data={messagesList}
            page={pageNumber}
            sizePerPage={10}
            totalSize={totalCount}
            onTableChange={handleTableChange}
          />
        </div>
      </CardBody>
    </Card>
  );
}
