import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { FormattedMessage } from "react-intl";
import {
  Modal,
  Button,
  Alert,
  ProgressBar,
  Card,
  Form,
  Row,
  Col,
  Table,
  Badge
} from "react-bootstrap";
import axios from "axios";
import uuid from "react-uuid";

import { shallowEqual, useSelector } from "react-redux";

const CVModificationModal = ({
  show,
  onHide,
  onCVUpdate,
  intl,
  loading = false,
  currentCVFilename = null,
  onDataUpdate
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [showData, setShowData] = useState(false);
  const [cvIdTemporary, setCvIdTemporary] = useState("");
  const [editingExperience, setEditingExperience] = useState(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceForm, setExperienceForm] = useState({
    id: null,
    id_temp: null,
    jobTitle: "",
    employerNameAndPlace: "",
    startDate: "",
    endDate: "",
    isCurrentItem: "False"
  });

  const { parsed, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      companies: state.companies.companies,
      parsed: state.interimairesReducerData.interimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );

  // Fonction pour normaliser les expériences existantes
  const normalizeExistingExperiences = existingExperiences => {
    if (!existingExperiences || !Array.isArray(existingExperiences)) return [];

    return existingExperiences.map(exp => ({
      id: exp.id,
      id_temp: null,
      jobTitle: exp.jobTitle || "",
      employerNameAndPlace: exp.employerNameAndPlace || "",
      startDate: exp.startDate
        ? new Date(exp.startDate).toISOString().split("T")[0]
        : "",
      endDate: exp.endDate
        ? new Date(exp.endDate).toISOString().split("T")[0]
        : "",
      isCurrentItem: exp.isCurrentItem || "False",
      // Conserver les données originales pour référence
      _original: exp
    }));
  };

  // Initialiser les expériences vides au début
  const [experiences, setExperiences] = useState([]);

  console.log(" ---experiences--- ", experiences);

  // Fonction pour envoyer le CV à l'API
  const uploadCVToAPI = async file => {
    if (!file) return null;

    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://myconnectt-apiback-prod.azurewebsites.net/api/Applicant/scan/cv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("CV upload response:", response.data);

      if (response.data && response.data.id) {
        setCvIdTemporary(response.data.id);
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement du CV:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toastr.warning(
        "Attention",
        "Veuillez sélectionner un fichier avant de continuer"
      );
      return;
    }

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const analysisData = await uploadCVToAPI(selectedFile);

      if (analysisData) {
        setCvData(analysisData);

        // Traiter les nouvelles expériences extraites du CV
        let newExperiences = [];
        if (
          analysisData.experiences &&
          Array.isArray(analysisData.experiences)
        ) {
          newExperiences = analysisData.experiences.map(exp => ({
            id: null,
            id_temp: uuid(),
            jobTitle: exp.jobtTitle || "",
            employerNameAndPlace: exp.entreprise || "",
            startDate: exp.startDate
              ? new Date(exp.startDate).toISOString().split("T")[0]
              : "",
            endDate: exp.endDate
              ? new Date(exp.endDate).toISOString().split("T")[0]
              : "",
            isCurrentItem: "False",
            _isFromCV: true // Marquer comme venant du CV
          }));
        }

        // Ajouter les expériences existantes puis les nouvelles
        const existingExperiences = normalizeExistingExperiences(
          parsed && parsed.applicantExperiences
            ? parsed.applicantExperiences
            : []
        );

        const allExperiences = [...existingExperiences, ...newExperiences];
        setExperiences(allExperiences);
        setShowData(true);

        toastr.success(
          "Succès",
          `CV analysé avec succès ! ${newExperiences.length} nouvelle(s) expérience(s) trouvée(s).`
        );
      }

      if (onCVUpdate) {
        await onCVUpdate(selectedFile);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du CV:", error);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setDragActive(false);
    setCvData(null);
    setShowData(false);
    setCvIdTemporary("");
    // Réinitialiser complètement les expériences
    setExperiences([]);
    setEditingExperience(null);
    setShowExperienceForm(false);
    resetExperienceForm();

    const fileInput = document.getElementById("file-upload-modal");
    if (fileInput) {
      fileInput.value = "";
    }
    onHide();
  };

  const handleConfirmAndClose = async () => {
    try {
      if (!cvIdTemporary) {
        toastr.error("Erreur", "Aucun CV temporaire trouvé.");
        return;
      }

      // Construire le payload pour l'API
      const payload = experiences.map(exp => ({
        jobTitle: exp.jobTitle || "",
        place: "",
        employerNameAndPlace: exp.employerNameAndPlace || "",
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : null,
        endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
        description: exp.description || "",
        isCurrentItem: exp.isCurrentItem || "False",
        entreprise: exp.employerNameAndPlace || "",
        localization: "",
        interimAgence: "",
        id: exp.id || 0,
        tenantID: 0,
        applicantID: 0,
        contractTypeID: 0
      }));

      const url = `https://myconnectt-apiback-prod.azurewebsites.net/api/Applicant/update/step/experiences?cv_id_temporary=${cvIdTemporary}`;

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" }
      });

      toastr.success("Succès", "CV et expériences mis à jour avec succès");
      console.log("Réponse API update experiences:", response.data);

      // ========================================
      // NOUVEAU: Notifier le parent pour refresh
      // ========================================
      if (onDataUpdate && typeof onDataUpdate === "function") {
        onDataUpdate({
          success: true,
          applicantId: parsed?.id,
          experiences: experiences
        });
      }

      handleClose();
    } catch (error) {
      console.error("Erreur lors de la confirmation des expériences:", error);
      toastr.error("Erreur", "Impossible de sauvegarder les expériences");
    }
  };

  // Fonctions de gestion des expériences
  const resetExperienceForm = () => {
    setExperienceForm({
      id: null,
      id_temp: null,
      jobTitle: "",
      employerNameAndPlace: "",
      startDate: "",
      endDate: "",
      isCurrentItem: "False"
    });
  };

  const handleAddExperience = () => {
    resetExperienceForm();
    setEditingExperience(null);
    setShowExperienceForm(true);
  };

  const handleEditExperience = experience => {
    setExperienceForm({
      id: experience.id,
      id_temp: experience.id_temp,
      jobTitle: experience.jobTitle,
      employerNameAndPlace: experience.employerNameAndPlace,
      startDate: experience.startDate,
      endDate: experience.endDate,
      isCurrentItem: experience.isCurrentItem
    });
    setEditingExperience(experience.id || experience.id_temp);
    setShowExperienceForm(true);
  };

  const handleDeleteExperience = (experienceId, isTemp = false) => {
    const updatedExperiences = experiences.filter(exp =>
      isTemp ? exp.id_temp !== experienceId : exp.id !== experienceId
    );
    setExperiences(updatedExperiences);
    toastr.success("Succès", "Expérience supprimée");
  };

  const handleSaveExperience = () => {
    // Validation
    if (!experienceForm.jobTitle.trim()) {
      toastr.error("Erreur", "Le titre du poste est requis");
      return;
    }
    if (!experienceForm.employerNameAndPlace.trim()) {
      toastr.error("Erreur", "L'entreprise est requise");
      return;
    }
    if (!experienceForm.startDate) {
      toastr.error("Erreur", "La date de début est requise");
      return;
    }
    if (experienceForm.isCurrentItem === "False" && !experienceForm.endDate) {
      toastr.error(
        "Erreur",
        "La date de fin est requise pour un poste terminé"
      );
      return;
    }

    const experienceToSave = {
      ...experienceForm,
      id:
        editingExperience && !experienceForm.id_temp ? experienceForm.id : null,
      id_temp:
        editingExperience && experienceForm.id_temp
          ? experienceForm.id_temp
          : uuid()
    };

    if (editingExperience) {
      const updatedExperiences = experiences.map(exp => {
        if (
          (exp.id && exp.id === editingExperience) ||
          (exp.id_temp && exp.id_temp === editingExperience)
        ) {
          return experienceToSave;
        }
        return exp;
      });
      setExperiences(updatedExperiences);
      toastr.success("Succès", "Expérience modifiée");
    } else {
      setExperiences([...experiences, experienceToSave]);
      toastr.success("Succès", "Expérience ajoutée");
    }

    setShowExperienceForm(false);
    setEditingExperience(null);
    resetExperienceForm();
  };

  const handleCancelExperience = () => {
    setShowExperienceForm(false);
    setEditingExperience(null);
    resetExperienceForm();
  };

  const handleExperienceFormChange = (field, value) => {
    setExperienceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = dateString => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric"
    });
  };

  const calculateDuration = (startDate, endDate, isCurrentItem) => {
    if (!startDate) return "";

    const start = new Date(startDate);
    const end =
      isCurrentItem === "True"
        ? new Date()
        : endDate
        ? new Date(endDate)
        : new Date();
    const monthsDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const years = Math.floor(monthsDiff / 12);
    const months = monthsDiff % 12;

    if (years > 0 && months > 0) {
      return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
    } else if (years > 0) {
      return `${years} an${years > 1 ? "s" : ""}`;
    } else if (months > 0) {
      return `${months} mois`;
    } else {
      return "Moins d'un mois";
    }
  };

  // Fonction pour déterminer le type d'expérience
  const getExperienceType = experience => {
    if (experience._isFromCV) return "CV";
    if (experience.id) return "Existante";
    return "Nouvelle";
  };

  const getExperienceTypeVariant = experience => {
    if (experience._isFromCV) return "info";
    if (experience.id) return "secondary";
    return "success";
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-file-alt mr-2"></i>
          <FormattedMessage
            id="TEXT.MODIFY_CV.TITLE"
            defaultMessage="Gestion du CV"
          />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          {/* Colonne Upload */}
          <Col lg={showData && cvData ? 4 : 12}>
            {currentCVFilename && (
              <Alert variant="info" className="mb-3">
                <strong>CV actuel :</strong> {currentCVFilename}
              </Alert>
            )}

            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-upload mr-2"></i>
                  Télécharger un nouveau CV
                </h6>
              </Card.Header>
              <Card.Body>
                <div
                  className="border border-dashed p-4 text-center"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    document.getElementById("file-upload-modal").click()
                  }
                  onDragOver={e => {
                    e.preventDefault();
                    e.currentTarget.classList.add("border-primary", "bg-light");
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-primary",
                      "bg-light"
                    );
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-primary",
                      "bg-light"
                    );

                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      if (
                        file.type === "application/pdf" ||
                        file.name.toLowerCase().endsWith(".pdf")
                      ) {
                        if (file.size <= 5 * 1024 * 1024) {
                          setSelectedFile(file);
                          setShowData(false);
                          setCvData(null);
                          toastr.success(
                            "Succès",
                            `Fichier "${file.name}" sélectionné`
                          );
                        } else {
                          toastr.error(
                            "Erreur",
                            "Fichier trop volumineux (max 5MB)"
                          );
                        }
                      } else {
                        toastr.error("Erreur", "Format PDF uniquement");
                      }
                    }
                  }}
                >
                  {selectedFile ? (
                    <div>
                      <i className="fas fa-file-pdf fa-3x text-success mb-3"></i>
                      <h6 className="text-success">Fichier sélectionné</h6>
                      <p className="mb-0">{selectedFile.name}</p>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="mt-2"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setUploadProgress(0);
                          setShowData(false);
                          setCvData(null);
                          document.getElementById("file-upload-modal").value =
                            "";
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                      <h6>Glissez-déposez votre CV ici</h6>
                      <p className="text-muted mb-2">
                        ou cliquez pour parcourir
                      </p>
                      <small className="text-muted">Format PDF • Max 5MB</small>
                    </div>
                  )}
                  <input
                    id="file-upload-modal"
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size <= 5 * 1024 * 1024) {
                          setSelectedFile(file);
                          setShowData(false);
                          setCvData(null);
                          toastr.success(
                            "Succès",
                            `Fichier "${file.name}" sélectionné`
                          );
                        } else {
                          toastr.error(
                            "Erreur",
                            "Fichier trop volumineux (max 5MB)"
                          );
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                </div>

                {uploadProgress > 0 && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Analyse en cours...</small>
                      <small>{uploadProgress}%</small>
                    </div>
                    <ProgressBar
                      now={uploadProgress}
                      variant={uploadProgress === 100 ? "success" : "primary"}
                      animated={uploadProgress < 100}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne Expériences - seulement après analyse */}
          {showData && cvData && (
            <Col lg={8}>
              <Card>
                <Card.Header className="bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="fas fa-briefcase mr-2"></i>
                      Expériences professionnelles ({experiences.length})
                    </h6>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={handleAddExperience}
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Ajouter
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {/* Formulaire d'expérience */}
                  {showExperienceForm && (
                    <Card className="mb-4 border-info">
                      <Card.Header className="bg-info text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            {editingExperience
                              ? "Modifier l'expérience"
                              : "Nouvelle expérience"}
                          </h6>
                          <Button
                            variant="link"
                            className="text-white p-0"
                            onClick={handleCancelExperience}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Titre du poste *</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={experienceForm.jobTitle}
                                  onChange={e =>
                                    handleExperienceFormChange(
                                      "jobTitle",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: Développeur Full Stack"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Entreprise *</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={experienceForm.employerNameAndPlace}
                                  onChange={e =>
                                    handleExperienceFormChange(
                                      "employerNameAndPlace",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: Google France, Paris"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Date de début *</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={experienceForm.startDate}
                                  onChange={e =>
                                    handleExperienceFormChange(
                                      "startDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Date de fin</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={experienceForm.endDate}
                                  onChange={e =>
                                    handleExperienceFormChange(
                                      "endDate",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    experienceForm.isCurrentItem === "True"
                                  }
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Statut</Form.Label>
                                <Form.Check
                                  type="checkbox"
                                  label="Poste actuel"
                                  checked={
                                    experienceForm.isCurrentItem === "True"
                                  }
                                  onChange={e => {
                                    handleExperienceFormChange(
                                      "isCurrentItem",
                                      e.target.checked ? "True" : "False"
                                    );
                                    if (e.target.checked) {
                                      handleExperienceFormChange("endDate", "");
                                    }
                                  }}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="text-right">
                            <Button
                              variant="secondary"
                              className="mr-2"
                              onClick={handleCancelExperience}
                            >
                              Annuler
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleSaveExperience}
                            >
                              {editingExperience ? "Modifier" : "Ajouter"}
                            </Button>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Liste des expériences avec séparation */}
                  {experiences.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
                      <h6 className="text-muted">Aucune expérience trouvée</h6>
                      <Button variant="primary" onClick={handleAddExperience}>
                        Ajouter une expérience
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {/* Expériences existantes */}
                      {experiences.filter(exp => exp.id && !exp._isFromCV)
                        .length > 0 && (
                        <>
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">
                              <i className="fas fa-history mr-2"></i>
                              Expériences existantes (
                              {
                                experiences.filter(
                                  exp => exp.id && !exp._isFromCV
                                ).length
                              }
                              )
                            </h6>
                            <Table responsive hover className="mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th>Poste</th>
                                  <th>Entreprise</th>
                                  <th>Période</th>
                                  <th>Durée</th>
                                  <th width="100">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {experiences
                                  .filter(exp => exp.id && !exp._isFromCV)
                                  .sort((a, b) => {
                                    const dateA = new Date(
                                      a.startDate || "1900-01-01"
                                    );
                                    const dateB = new Date(
                                      b.startDate || "1900-01-01"
                                    );
                                    return dateB - dateA;
                                  })
                                  .map(experience => (
                                    <tr key={experience.id}>
                                      <td>
                                        <strong>{experience.jobTitle}</strong>
                                        {experience.isCurrentItem ===
                                          "True" && (
                                          <Badge
                                            variant="success"
                                            className="ml-2"
                                          >
                                            Actuel
                                          </Badge>
                                        )}
                                      </td>
                                      <td>{experience.employerNameAndPlace}</td>
                                      <td>
                                        {formatDate(experience.startDate)} -{" "}
                                        {experience.isCurrentItem === "True" ? (
                                          <span className="text-success font-weight-bold">
                                            Présent
                                          </span>
                                        ) : (
                                          formatDate(experience.endDate) ||
                                          "Non spécifié"
                                        )}
                                      </td>
                                      <td>
                                        <small className="text-muted">
                                          {calculateDuration(
                                            experience.startDate,
                                            experience.endDate,
                                            experience.isCurrentItem
                                          )}
                                        </small>
                                      </td>
                                      <td>
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="mr-1"
                                          onClick={() =>
                                            handleEditExperience(experience)
                                          }
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteExperience(
                                              experience.id,
                                              false
                                            )
                                          }
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </Table>
                          </div>
                        </>
                      )}

                      {/* Expériences du CV */}
                      {experiences.filter(exp => exp._isFromCV).length > 0 && (
                        <>
                          <div className="mb-3">
                            <h6 className="text-primary mb-2">
                              <i className="fas fa-file-alt mr-2"></i>
                              Expériences extraites du CV (
                              {experiences.filter(exp => exp._isFromCV).length})
                            </h6>
                            <Table responsive hover className="mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th>Poste</th>
                                  <th>Entreprise</th>
                                  <th>Période</th>
                                  <th>Durée</th>
                                  <th width="100">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {experiences
                                  .filter(exp => exp._isFromCV)
                                  .sort((a, b) => {
                                    const dateA = new Date(
                                      a.startDate || "1900-01-01"
                                    );
                                    const dateB = new Date(
                                      b.startDate || "1900-01-01"
                                    );
                                    return dateB - dateA;
                                  })
                                  .map(experience => (
                                    <tr key={experience.id_temp} className="">
                                      <td>
                                        <strong>{experience.jobTitle}</strong>
                                        {experience.isCurrentItem ===
                                          "True" && (
                                          <Badge
                                            variant="success"
                                            className="ml-2"
                                          >
                                            Actuel
                                          </Badge>
                                        )}
                                      </td>
                                      <td>{experience.employerNameAndPlace}</td>
                                      <td>
                                        {formatDate(experience.startDate)} -{" "}
                                        {experience.isCurrentItem === "True" ? (
                                          <span className="text-success font-weight-bold">
                                            Présent
                                          </span>
                                        ) : (
                                          formatDate(experience.endDate) ||
                                          "Non spécifié"
                                        )}
                                      </td>
                                      <td>
                                        <small className="text-muted">
                                          {calculateDuration(
                                            experience.startDate,
                                            experience.endDate,
                                            experience.isCurrentItem
                                          )}
                                        </small>
                                      </td>
                                      <td>
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="mr-1"
                                          onClick={() =>
                                            handleEditExperience(experience)
                                          }
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteExperience(
                                              experience.id_temp,
                                              true
                                            )
                                          }
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </Table>
                          </div>
                        </>
                      )}

                      {/* Expériences ajoutées manuellement */}
                      {experiences.filter(exp => !exp.id && !exp._isFromCV)
                        .length > 0 && (
                        <>
                          <div className="mb-3">
                            <h6 className="text-success mb-2">
                              <i className="fas fa-plus mr-2"></i>
                              Expériences ajoutées (
                              {
                                experiences.filter(
                                  exp => !exp.id && !exp._isFromCV
                                ).length
                              }
                              )
                            </h6>
                            <Table responsive hover className="mb-0">
                              <thead className="bg-success text-white">
                                <tr>
                                  <th>Poste</th>
                                  <th>Entreprise</th>
                                  <th>Période</th>
                                  <th>Durée</th>
                                  <th width="100">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {experiences
                                  .filter(exp => !exp.id && !exp._isFromCV)
                                  .sort((a, b) => {
                                    const dateA = new Date(
                                      a.startDate || "1900-01-01"
                                    );
                                    const dateB = new Date(
                                      b.startDate || "1900-01-01"
                                    );
                                    return dateB - dateA;
                                  })
                                  .map(experience => (
                                    <tr
                                      key={experience.id_temp}
                                      className="table-success"
                                    >
                                      <td>
                                        <strong>{experience.jobTitle}</strong>
                                        {experience.isCurrentItem ===
                                          "True" && (
                                          <Badge
                                            variant="success"
                                            className="ml-2"
                                          >
                                            Actuel
                                          </Badge>
                                        )}
                                      </td>
                                      <td>{experience.employerNameAndPlace}</td>
                                      <td>
                                        {formatDate(experience.startDate)} -{" "}
                                        {experience.isCurrentItem === "True" ? (
                                          <span className="text-success font-weight-bold">
                                            Présent
                                          </span>
                                        ) : (
                                          formatDate(experience.endDate) ||
                                          "Non spécifié"
                                        )}
                                      </td>
                                      <td>
                                        <small className="text-muted">
                                          {calculateDuration(
                                            experience.startDate,
                                            experience.endDate,
                                            experience.isCurrentItem
                                          )}
                                        </small>
                                      </td>
                                      <td>
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="mr-1"
                                          onClick={() =>
                                            handleEditExperience(experience)
                                          }
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteExperience(
                                              experience.id_temp,
                                              true
                                            )
                                          }
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </Table>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <div className="w-100 d-flex justify-content-between">
          <div>
            {experiences.length > 0 && (
              <small className="text-muted">
                {cvData ? `CV analysé • ` : ""}
                {experiences.length} expérience(s)
                {experiences.filter(e => e.id).length > 0 &&
                  ` (${experiences.filter(e => e.id).length} existante(s))`}
                {experiences.filter(e => e._isFromCV).length > 0 &&
                  ` (${experiences.filter(e => e._isFromCV).length} du CV)`}
              </small>
            )}
          </div>
          <div>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading || (uploadProgress > 0 && uploadProgress < 100)}
              className="mr-2"
            >
              Fermer
            </Button>

            {!showData ? (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={
                  !selectedFile ||
                  loading ||
                  (uploadProgress > 0 && uploadProgress < 100)
                }
              >
                {loading || (uploadProgress > 0 && uploadProgress < 100) ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2"></span>
                    Analyse...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search mr-2"></i>
                    Analyser le CV
                  </>
                )}
              </Button>
            ) : (
              <Button variant="success" onClick={handleConfirmAndClose}>
                <i className="fas fa-check mr-2"></i>
                Confirmer
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CVModificationModal;
