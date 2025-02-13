import React, { useState, useRef, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import { Modal } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import JoditEditor from "jodit-react";
import { FormattedMessage } from "react-intl";
import debounce from "debounce-promise";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import paginationFactory from "react-bootstrap-table2-paginator";
import GroupIcon from "@material-ui/icons/Group";

const api = process.env.REACT_APP_WEBAPI_URL;

const DelayType = {
  AllApplicants: 1,
  SpecifiqApplicants: 2,
  AllClients: 3,
  SpecifiqClients: 4,
};

const MessageFilter = ({ onFilterChange }) => {
  const [selectedType, setSelectedType] = useState(DelayType.AllApplicants); // Par défaut: Tous les intérimaires

  const filterGroups = {
    interimaires: {
      label: "Intérimaires",
      options: [
        { value: DelayType.AllApplicants, label: "Tous les intérimaires" },
        {
          value: DelayType.SpecifiqApplicants,
          label: "Intérimaires spécifiques",
        },
      ],
    },
    clients: {
      label: "Clients",
      options: [
        { value: DelayType.AllClients, label: "Tous les clients" },
        { value: DelayType.SpecifiqClients, label: "Clients spécifiques" },
      ],
    },
  };

  const handleRadioChange = (value) => {
    setSelectedType(value);
    onFilterChange(value);
  };

  return (
    <div className="d-flex gap-5">
      {Object.entries(filterGroups).map(([groupKey, group]) => (
        <div key={groupKey} className="mr-14">
          <h3 className="font-weight-bold mb-2" style={{ fontSize: "1.1rem" }}>
            {group.label}
          </h3>
          <div className="d-flex flex-column gap-2">
            {group.options.map((option) => (
              <div key={option.value} className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`radio-${option.value}`}
                  name="messageTypeFilter"
                  checked={selectedType === option.value}
                  onChange={() => handleRadioChange(option.value)}
                />
                <label
                  className="form-check-label"
                  htmlFor={`radio-${option.value}`}
                  style={{ fontSize: "0.9rem" }}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const MessagesList = () => {
  const editor = useRef(null);
  const [messages, setMessages] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([DelayType.AllApplicants]); // Initialiser avec Tous les intérimaires
  const [loading, setLoading] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // États pour le nouveau message
  const [messageType, setMessageType] = useState("temp");
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [content, setContent] = useState("");

  const config = {
    readonly: false,
    height: 300,
    toolbarButtonSize: "small",
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "link",
      "|",
      "source",
    ],
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: 38,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const columns = [
    {
      dataField: "creationDate",
      text: "Date",
      headerStyle: { width: "20%" },
      formatter: (cell) => {
        const date = new Date(cell);
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      dataField: "destinataire",
      text: "Destinataires",
      headerStyle: { width: "25%" },
      formatter: (cell, row) => {
        switch (row.delayType) {
          case DelayType.AllApplicants:
            return "Tous les intérimaires";
          case DelayType.AllClients:
            return "Tous les clients";
          case DelayType.SpecifiqApplicants:
          case DelayType.SpecifiqClients:
            return cell && cell.length > 0 ? cell.join(", ") : "-";
          default:
            return "-";
        }
      },
    },
    {
      dataField: "subject",
      text: "Sujet",
      headerStyle: { width: "20%" },
    },
    {
      dataField: "body",
      text: "Contenu",
      headerStyle: { width: "35%" },
      formatter: (cell) => (
        <div
          className="text-truncate"
          style={{ maxHeight: "48px", overflow: "hidden" }}
          dangerouslySetInnerHTML={{ __html: cell }}
        />
      ),
    },
    {
      dataField: "actions",
      text: "Actions",
      headerStyle: { width: "10%" },
      formatter: (cell, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleViewMessage(row)}
        >
          Voir
        </button>
      ),
    },
  ];

  const fetchMessages = async (types) => {
    setLoading(true);
    try {
      if (types.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const messagesPromises = types.map((type) =>
        axios.get(`${api}api/Message/DelayedMessage/Type/${type}`)
      );

      const responses = await Promise.all(messagesPromises);
      const allMessages = responses.flatMap((response) => response.data || []);

      const uniqueMessages = [
        ...new Map(allMessages.map((item) => [item.id, item])).values(),
      ];

      setMessages(uniqueMessages);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages(selectedTypes);
  }, [selectedTypes]);

  const loadApplicants = async (inputValue) => {
    if (!inputValue) return [];

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
      console.error("Erreur lors de la recherche des intérimaires:", error);
      return [];
    }
  };

  const loadClients = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const body = {
        tenantID: 1,
        name: inputValue,
        groupID: 0,
        pageSize: 10,
        pageNumber: 1,
        status: null,
      };

      const response = await axios.post(
        `${api}api/Account/SearchAccounts`,
        body
      );

      return response.data.list.map((client) => ({
        value: client.id,
        label: client.name,
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche des clients:", error);
      return [];
    }
  };

  const debouncedLoadApplicants = debounce(loadApplicants, 500);
  const debouncedLoadClients = debounce(loadClients, 500);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
  };

  const resetNewMessageForm = () => {
    setMessageType("temp");
    setSendToAll(false);
    setSelectedRecipients([]);
    setNewMessageSubject("");
    setContent("");
  };

  const handleNewMessage = async () => {
    try {
      let endpoint;
      let messageData;

      if (messageType === "temp") {
        endpoint = `${api}api/Message/DelayedMessage/Applicant`;
        messageData = {
          applicantsID: !sendToAll
            ? selectedRecipients.map((r) => r.value)
            : [],
          allApplicants: sendToAll,
          accountID: 0,
          subject: newMessageSubject,
          body: content,
        };
      } else {
        endpoint = `${api}api/Message/DelayedMessage/Customer`;
        messageData = {
          customersID: !sendToAll ? selectedRecipients.map((r) => r.value) : [],
          allCustomer: sendToAll,
          subject: newMessageSubject,
          body: content,
        };
      }

      await axios.post(endpoint, messageData);
      setShowNewMessageModal(false);
      resetNewMessageForm();
      fetchMessages(selectedTypes);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  return (
    <div className="p-4">
      {/* Header avec filtres et bouton nouveau message */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <MessageFilter
              onFilterChange={(type) => {
                setSelectedTypes([type]);
              }}
            />
            <button
              className="btn btn-primary ms-auto"
              onClick={() => setShowNewMessageModal(true)}
            >
              <FormattedMessage
                id="MESSAGE.NEW"
                defaultMessage="Nouveau message"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Table des messages */}
      <div className="card">
        <div className="card-body">
          <BootstrapTable
            keyField="id"
            data={messages}
            columns={columns}
            bordered={false}
            classes="table"
            pagination={paginationFactory()}
            noDataIndication={
              loading ? "Chargement..." : "Aucun message disponible"
            }
          />
        </div>
      </div>

      {/* Modal Nouveau Message */}
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
            <div className="d-flex justify-content-between mb-4">
              <div className="d-flex">
                <div className="form-check me-4">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="radio-temp"
                    name="messageType"
                    checked={messageType === "temp"}
                    onChange={() => {
                      setMessageType("temp");
                      setSendToAll(false);
                      setSelectedRecipients([]);
                    }}
                  />
                  <label className="form-check-label" htmlFor="radio-temp">
                    Intérimaires
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="radio-client"
                    name="messageType"
                    checked={messageType === "client"}
                    onChange={() => {
                      setMessageType("client");
                      setSendToAll(false);
                      setSelectedRecipients([]);
                    }}
                  />
                  <label className="form-check-label" htmlFor="radio-client">
                    Clients
                  </label>
                </div>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="sendToAll"
                  checked={sendToAll}
                  onChange={(e) => {
                    setSendToAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedRecipients([]);
                    }
                  }}
                />
                <label className="form-check-label" htmlFor="sendToAll">
                  {messageType === "temp" ? (
                    <FormattedMessage
                      id="MESSAGE.SEND_TO_ALL_TEMP"
                      defaultMessage="Envoyer à tous les intérimaires"
                    />
                  ) : (
                    <FormattedMessage
                      id="MESSAGE.SEND_TO_ALL_CLIENT"
                      defaultMessage="Envoyer à tous les clients"
                    />
                  )}
                </label>
              </div>
            </div>

            {!sendToAll && (
              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="MESSAGE.RECIPIENT"
                    defaultMessage="Destinataire"
                  />
                </label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  value={selectedRecipients}
                  isDisabled={sendToAll}
                  loadOptions={
                    messageType === "temp"
                      ? debouncedLoadApplicants
                      : debouncedLoadClients
                  }
                  onChange={(selected) => setSelectedRecipients(selected || [])}
                  placeholder={
                    messageType === "temp"
                      ? "Rechercher des intérimaires..."
                      : "Rechercher des clients..."
                  }
                  noOptionsMessage={() => "Aucun résultat"}
                  loadingMessage={() => "Chargement..."}
                  className="react-select"
                  classNamePrefix="react-select"
                  styles={customStyles}
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
              <FormattedMessage id="MESSAGE.CONTENT" defaultMessage="Message" />
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
            className="btn btn-light me-2"
            onClick={() => {
              setShowNewMessageModal(false);
              resetNewMessageForm();
            }}
          >
            <FormattedMessage id="BUTTON.CANCEL" defaultMessage="Annuler" />
          </button>
          <button onClick={handleNewMessage} className="btn btn-primary">
            <FormattedMessage id="BUTTON.SEND" defaultMessage="Envoyer" />
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal de visualisation du message */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        aria-labelledby="view-message-modal"
      >
        <div className="modal-content">
          {/* Header */}
          <Modal.Header className="bg-primary text-white py-4 px-5">
            <div className="w-100">
              {/* Date */}
              <div className="d-flex align-items-center mb-2">
                <AccessTimeIcon className="me-2" style={{ fontSize: 20 }} />
                <span style={{ fontSize: "14px", fontWeight: "300" }}>
                  {selectedMessage?.creationDate
                    ? new Date(selectedMessage.creationDate).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </span>
              </div>

              {/* Sujet */}
              <h4
                className="mb-0 text-uppercase"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                {selectedMessage?.subject || "Sans sujet"}
              </h4>
            </div>
          </Modal.Header>

          {/* Body */}
          <Modal.Body className="px-5 py-4">
            <div className="mb-4 d-flex align-items-center text-secondary">
              <GroupIcon
                className="me-2"
                style={{ fontSize: 20, color: "#6c757d" }}
              />
              <span>
                {selectedMessage?.delayType === DelayType.AllApplicants
                  ? "Tous les intérimaires"
                  : selectedMessage?.delayType === DelayType.AllClients
                  ? "Tous les clients"
                  : selectedMessage?.destinataire?.length > 0
                  ? selectedMessage.destinataire.join(", ")
                  : "-"}
              </span>
            </div>
            <div
              className="message-content"
              dangerouslySetInnerHTML={{ __html: selectedMessage?.body }}
            />
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer className="bg-light py-3 px-4">
            <button
              className="btn btn-primary px-4"
              onClick={() => setShowViewModal(false)}
            >
              <FormattedMessage id="BUTTON.CLOSE" defaultMessage="Fermer" />
            </button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesList;
