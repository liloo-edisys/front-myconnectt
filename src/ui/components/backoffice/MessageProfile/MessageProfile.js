import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Container, Form, Alert } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";

const MessageProfile = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    firstname: "",
    lastname: "",
    displayName: "",
    jobTitlesID: []
  });
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL =
    "https://myconnectt-apiback-prod.azurewebsites.net/api";

  const customStyles = {
    control: base => ({
      ...base,
      minHeight: 38,
      background: "#fff",
      borderColor: "#ced4da",
      "&:hover": {
        borderColor: "#86b7fe"
      }
    }),
    menu: base => ({
      ...base,
      zIndex: 9999
    })
  };

  const loadJobTitles = async inputValue => {
    if (inputValue.length < 2) {
      return [];
    }

    try {
      const response = await axios.get(`${API_URL}/JobTitle/SearchByName`, {
        params: { name: inputValue }
      });

      if (response.data && response.data.data) {
        return response.data.data.map(job => ({
          value: job.id,
          label: job.name,
          code: job.code
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading job titles:", error);
      return [];
    }
  };

  const debouncedLoadJobTitles = debounce(loadJobTitles, 300);

  const columns = [
    {
      dataField: "firstname",
      text: "Nom",
      headerStyle: { width: "20%" }
    },
    {
      dataField: "lastname",
      text: "Prénom",
      headerStyle: { width: "20%" }
    },
    {
      dataField: "displayName",
      text: "Titre",
      headerStyle: { width: "20%" }
    },
    {
      dataField: "jobTitles",
      text: "Titre de poste",
      formatter: (cell, row) => {
        if (Array.isArray(row.jobTitlesID)) {
          return row.jobTitlesID
            .map(job => {
              if (typeof job === "object" && job.name) {
                return job.name;
              }
              return job?.label || `Job ID: ${job}`;
            })
            .join(", ");
        }
        return "";
      },
      headerStyle: { width: "25%" }
    },
    {
      dataField: "actions",
      text: "Actions",
      headerStyle: { width: "15%" },
      formatter: (cell, row) => (
        <div className="d-flex gap-2">
          <Button
            onClick={() => handleEdit(row)}
            className="btn btn-icon btn-light btn-hover-primary btn-sm mx-2"
          >
            <span className="svg-icon svg-icon-md svg-icon-primary">
              <i className="fas fa-pencil-alt"></i>
            </span>
          </Button>
          <Button
            onClick={() => handleDelete(row)}
            className="btn btn-icon btn-light btn-hover-danger btn-sm"
          >
            <span className="svg-icon svg-icon-md svg-icon-danger">
              <i className="fas fa-trash"></i>
            </span>
          </Button>
        </div>
      )
    }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/User/fake/user`);
      setUsers(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        jobTitlesID: selectedJobTitles.map(job => job.value)
      };

      const response = await axios.post(
        `${API_URL}/User/upsert/fake/user`,
        dataToSubmit
      );
      console.log("User saved:", response);

      setSuccess("Profil enregistré avec succès !");
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de l'enregistrement du profil");
      console.error("Error details:", err);
    }
  };

  const handleEdit = async user => {
    setFormData(user);

    if (Array.isArray(user.jobTitlesID)) {
      try {
        let jobTitleOptions;

        if (
          user.jobTitlesID.length > 0 &&
          typeof user.jobTitlesID[0] === "object"
        ) {
          // Si nous avons déjà les objets complets
          jobTitleOptions = user.jobTitlesID.map(job => ({
            value: job.id || job.value,
            label: job.name || job.label,
            code: job.code
          }));
        } else {
          // Si nous n'avons que les IDs
          const promises = user.jobTitlesID.map(id =>
            axios
              .get(`${API_URL}/JobTitle/${id}`)
              .then(response => ({
                value: response.data.id,
                label: response.data.name,
                code: response.data.code
              }))
              .catch(() => null)
          );

          const results = await Promise.all(promises);
          jobTitleOptions = results.filter(job => job !== null);
        }

        setSelectedJobTitles(jobTitleOptions);
      } catch (error) {
        console.error("Error loading job titles details:", error);
        setError("Erreur lors du chargement des titres de poste");
      }
    }

    setShowModal(true);
  };

  const handleDelete = async id => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await axios.delete(`${API_URL}/User/delete/${id}`);
        setSuccess("Utilisateur supprimé avec succès !");
        fetchUsers();
      } catch (err) {
        setError("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      firstname: "",
      lastname: "",
      displayName: "",
      jobTitlesID: []
    });
    setSelectedJobTitles([]);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestion des profils</h2>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="d-flex align-items-center"
        >
          <i className="fas fa-plus me-2"></i>
          Ajouter un profil
        </Button>
      </div>

      {(error || success) && (
        <Alert
          variant={error ? "danger" : "success"}
          dismissible
          onClose={() => {
            setError("");
            setSuccess("");
          }}
        >
          {error || success}
        </Alert>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <BootstrapTable
            keyField="id"
            data={users}
            columns={columns}
            bordered={false}
            classes="table"
            pagination={paginationFactory({
              sizePerPage: 10,
              sizePerPageList: [10, 25, 50, 100]
            })}
            noDataIndication={
              loading ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                </div>
              ) : (
                "Aucun profil disponible"
              )
            }
            hover
            wrapperClasses="table-responsive"
          />
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.id ? "Modifier le profil" : "Créer un profil"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Votre nom"
                value={formData.firstname}
                onChange={e =>
                  setFormData({ ...formData, firstname: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Prénom"
                value={formData.lastname}
                onChange={e =>
                  setFormData({ ...formData, lastname: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titre"
                value={formData.displayName}
                onChange={e =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Titre du poste</Form.Label>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                value={selectedJobTitles}
                loadOptions={debouncedLoadJobTitles}
                onChange={setSelectedJobTitles}
                placeholder="Rechercher des intitulés de poste..."
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 2
                    ? "Entrez au moins 2 caractères..."
                    : "Aucun résultat trouvé"
                }
                loadingMessage={() => "Chargement..."}
                className="react-select"
                classNamePrefix="react-select"
                styles={customStyles}
                filterOption={null}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {formData.id ? "Mettre à jour" : "Créer"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MessageProfile;
