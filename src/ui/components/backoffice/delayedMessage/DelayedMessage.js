import React, { useState, useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import BootstrapTable from "react-bootstrap-table-next";
import axios from "axios";
import { Modal } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import JoditEditor from "jodit-react";
import { FormattedMessage } from "react-intl";
import debounce from "debounce-promise";

const useStyles = makeStyles(() => ({
  container: {
    padding: "20px",
    backgroundColor: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  typeSelect: {
    width: "250px",
  },
  table: {
    "& .table": {
      backgroundColor: "#fff",
      borderSpacing: "0 8px",
      borderCollapse: "separate",
    },
    "& th": {
      backgroundColor: "#f3f6f9",
      border: "none",
      color: "#6c757d",
      fontWeight: 500,
      padding: "12px 16px",
      fontSize: "0.875rem",
    },
    "& td": {
      border: "none",
      padding: "12px 16px",
      fontSize: "0.875rem",
      backgroundColor: "#fff",
      verticalAlign: "middle",
    },
  },
  viewButton: {
    textTransform: "none",
    minWidth: "auto",
    backgroundColor: "#e8f0fe",
    color: "#3699ff",
    padding: "6px 12px",
    "&:hover": {
      backgroundColor: "#d4e4fc",
    },
  },
  radioGroup: {
    marginBottom: "1rem",
  },
  radio: {
    marginRight: "1rem",
  },
}));

const api = process.env.REACT_APP_WEBAPI_URL;

const delayTypes = [
  { value: 1, label: "Tous les intérimaires" },
  { value: 2, label: "Intérimaires spécifiques" },
  { value: 3, label: "Tous les clients" },
  { value: 4, label: "Clients spécifiques" },
];

const columns = [
  {
    dataField: "subject",
    text: "Sujet",
    headerStyle: { width: "30%" },
  },
  {
    dataField: "body",
    text: "Contenu",
    headerStyle: { width: "50%" },
    formatter: (cell) => <div dangerouslySetInnerHTML={{ __html: cell }} />,
  },
  {
    dataField: "actions",
    text: "Actions",
    headerStyle: { width: "20%" },
    formatter: () => (
      <button className="btn btn-primary btn-sm">
        Voir
      </button>
    ),
  },
];

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

const MessagesList = () => {
  const classes = useStyles();
  const editor = useRef(null);

  // États pour la liste des messages
  const [messages, setMessages] = useState([]);
  const [selectedType, setSelectedType] = useState(delayTypes[0]);
  const [loading, setLoading] = useState(false);

  // États pour le modal de nouveau message
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [messageType, setMessageType] = useState('temp');
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [content, setContent] = useState("");

  const config = {
    readonly: false,
    height: 300,
    toolbarButtonSize: "small",
    buttons: [
      'bold', 'italic', 'underline', '|',
      'ul', 'ol', '|',
      'link', '|',
      'source'
    ],
  };

  // Gestion du changement de type
  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  // Chargement des messages
  const fetchMessages = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${api}api/Message/DelayedMessage/Type/${type}`
      );
      setMessages(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedType) {
      fetchMessages(selectedType.value);
    }
  }, [selectedType]);

  // Gestion des intérimaires
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

  // Gestion des clients
  const loadClients = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const body = {
        tenantID: 1,
        name: inputValue,
        groupID: 0,
        pageSize: 10,
        pageNumber: 1,
        status: null
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

  // Gestion du formulaire
  const resetNewMessageForm = () => {
    setMessageType('temp');
    setSendToAll(false);
    setSelectedRecipients([]);
    setNewMessageSubject("");
    setContent("");
  };

  const handleNewMessage = async () => {
    try {
      let endpoint;
      let messageData;

      if (messageType === 'temp') {
        endpoint = `${api}api/Message/DelayedMessage/Applicant`;
        messageData = {
          applicantsID: !sendToAll ? selectedRecipients.map(r => r.value) : [],
          allApplicants: sendToAll,
          accountID: 0, // À ajuster selon vos besoins
          subject: newMessageSubject,
          body: content
        };
      } else {
        endpoint = `${api}api/Message/DelayedMessage/Customer`;
        messageData = {
          customersID: !sendToAll ? selectedRecipients.map(r => r.value) : [],
          allCustomer: sendToAll,
          subject: newMessageSubject,
          body: content
        };
      }

      // Envoyer le message
      await axios.post(endpoint, messageData);

      // Fermer le modal et réinitialiser le formulaire
      setShowNewMessageModal(false);
      resetNewMessageForm();
      
      // Recharger la liste des messages
      fetchMessages(selectedType.value);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      // Gérer l'erreur
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.typeSelect}>
          <select
            className="form-control"
            value={selectedType?.value || ''}
            onChange={(e) => {
              const type = delayTypes.find(t => t.value === parseInt(e.target.value));
              handleTypeChange(type);
            }}
          >
            {delayTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewMessageModal(true)}
        >
          <FormattedMessage id="MESSAGE.NEW" defaultMessage="Nouveau message" />
        </button>
      </div>

      <div className={classes.table}>
        <BootstrapTable
          keyField="accountID"
          data={messages}
          columns={columns}
          bordered={false}
          classes="table"
          noDataIndication={
            loading ? "Chargement..." : "Aucun message disponible"
          }
        />
      </div>

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
              <div className={classes.radioGroup}>
                <label className="radio radio-lg radio-primary mr-4">
                  <input
                    type="radio"
                    name="messageType"
                    checked={messageType === 'temp'}
                    onChange={() => {
                      setMessageType('temp');
                      setSendToAll(false);
                      setSelectedRecipients([]);
                    }}
                  />
                  <span></span>
                  <FormattedMessage
                    id="MESSAGE.TYPE.TEMP"
                    defaultMessage="Intérimaires"
                  />
                </label>
                <label className="radio radio-lg radio-primary ml-4">
                  <input
                    type="radio"
                    name="messageType"
                    checked={messageType === 'client'}
                    onChange={() => {
                      setMessageType('client');
                      setSendToAll(false);
                      setSelectedRecipients([]);
                    }}
                  />
                  <span></span>
                  <FormattedMessage
                    id="MESSAGE.TYPE.CLIENT"
                    defaultMessage="Clients"
                  />
                </label>
              </div>
              <div>
                <label className="checkbox checkbox-lg checkbox-primary flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => {
                      setSendToAll(e.target.checked);
                      if (e.target.checked) {
                        setSelectedRecipients([]);
                      }
                    }}
                  />
                  <span></span>
                  &nbsp;&nbsp;
                  {messageType === 'temp' ? (
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
              <div>
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
                  loadOptions={messageType === 'temp' ? debouncedLoadApplicants : debouncedLoadClients}
                  onChange={(selected) => setSelectedRecipients(selected || [])}
                  placeholder={
                    messageType === 'temp' 
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
            className="btn btn-light-primary mr-2"
            onClick={() => {
              setShowNewMessageModal(false);
              resetNewMessageForm();
            }}
          >
            <FormattedMessage id="BUTTON.CANCEL" defaultMessage="Annuler" />
          </button>
          <button
            onClick={handleNewMessage}
            className="btn btn-primary btn-shadow"
          >
            <FormattedMessage id="BUTTON.SEND" defaultMessage="Envoyer" />
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MessagesList;