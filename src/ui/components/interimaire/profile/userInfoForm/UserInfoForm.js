import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ProgressBar,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import "bootstrap/dist/css/bootstrap.min.css";

// Styles intégrés
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#0D6EFD",
  },
  optionCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e6e6e6",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  optionCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  optionIcon: {
    fontSize: "32px",
    marginRight: "20px",
    color: "#0D6EFD",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    marginTop: 0,
    marginBottom: "5px",
    fontSize: "1.5rem",
  },
  optionDescription: {
    margin: 0,
    color: "#616061",
  },
  formSection: {
    backgroundColor: "#ffffff",
    border: "1px solid #e6e6e6",
    borderRadius: "8px",
    padding: "30px",
    marginTop: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  backToOptions: {
    display: "inline-block",
    color: "#0D6EFD",
    marginBottom: "20px",
    cursor: "pointer",
  },
  backToOptionsHover: {
    textDecoration: "underline",
  },
  fileUploadContainer: {
    border: "2px dashed #e6e6e6",
    borderRadius: "8px",
    padding: "30px",
    textAlign: "center",
    transition: "border-color 0.2s",
    marginBottom: "20px",
  },
  fileUploadContainerActive: {
    borderColor: "#0D6EFD",
  },
  fileUploadIcon: {
    fontSize: "40px",
    color: "#0D6EFD",
    marginBottom: "15px",
  },
  fileUploadText: {
    color: "#616061",
    marginBottom: "15px",
  },
  progressBar: {
    height: "6px",
    marginBottom: "30px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "30px",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
  },
};

const UserInfoForm = () => {
  // États pour gérer les différentes vues et étapes
  const [view, setView] = useState("options");
  const [currentStep, setCurrentStep] = useState(1);
  const [importedFile, setImportedFile] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // États pour les interactions UI
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBackLink, setHoveredBackLink] = useState(false);

  // Configuration de la zone de drop pour l'importation de fichiers
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
    },
    onDrop: (acceptedFiles) => {
      setImportedFile(acceptedFiles[0]);
    },
  });

  // Validation du schéma pour le formulaire des informations personnelles
  const personalInfoSchema = Yup.object().shape({
    firstname: Yup.string().required("Le prénom est requis"),
    lastname: Yup.string().required("Le nom est requis"),
    email: Yup.string()
      .email("Email invalide")
      .required("L'email est requis"),
    phone: Yup.string().required("Le numéro de téléphone est requis"),
    address: Yup.string().required("L'adresse est requise"),
  });

  // Calculer le pourcentage de progression
  const progressPercentage = ((currentStep - 1) / 1) * 100;

  // Traiter l'importation d'un profil
  const handleImport = () => {
    if (importedFile) {
      // En situation réelle, on analyserait le fichier ici
      alert(
        `Le fichier ${importedFile.name} a été importé avec succès. Vous pouvez maintenant modifier vos informations.`
      );
      setView("create");
      setCurrentStep(1);
    } else {
      alert("Veuillez sélectionner un fichier à importer.");
    }
  };

  // Finaliser le formulaire
  const handleFinish = (values) => {
    const userData = {
      personal: values,
    };

    // En situation réelle, on enverrait ces données à un serveur
    console.log("Données utilisateur:", userData);
    setFormSubmitted(true);

    // Réinitialisation après 3 secondes
    setTimeout(() => {
      setFormSubmitted(false);
      setView("options");
      setCurrentStep(1);
    }, 3000);
  };

  // Rendu des options initiales
  const renderOptions = () => (
    <Row className="justify-content-center">
      <Col md={6}>
        <div
          style={{
            ...styles.optionCard,
            ...(hoveredCard === "create" ? styles.optionCardHover : {}),
          }}
          onMouseEnter={() => setHoveredCard("create")}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => setView("create")}
        >
          <div style={styles.optionIcon}>📝</div>
          <div style={styles.optionText}>
            <h2 style={styles.optionTitle}>Saisir mes informations</h2>
            <p style={styles.optionDescription}>
              Remplissez un formulaire pour enregistrer vos informations
            </p>
          </div>
        </div>
      </Col>
      <Col md={6}>
        <div
          style={{
            ...styles.optionCard,
            ...(hoveredCard === "import" ? styles.optionCardHover : {}),
          }}
          onMouseEnter={() => setHoveredCard("import")}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => setView("import")}
        >
          <div style={styles.optionIcon}>📤</div>
          <div style={styles.optionText}>
            <h2 style={styles.optionTitle}>Importer mon profil</h2>
            <p style={styles.optionDescription}>
              Téléchargez un fichier contenant vos informations
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );

  // Rendu de l'écran d'importation
  const renderImport = () => (
    <div>
      <div
        style={{
          ...styles.backToOptions,
          ...(hoveredBackLink ? styles.backToOptionsHover : {}),
        }}
        onMouseEnter={() => setHoveredBackLink(true)}
        onMouseLeave={() => setHoveredBackLink(false)}
        onClick={() => setView("options")}
      >
        ← Retour aux options
      </div>
      <h2 className="mb-4">Importer votre profil</h2>

      <div
        {...getRootProps()}
        style={{
          ...styles.fileUploadContainer,
          ...(isDragActive ? styles.fileUploadContainerActive : {}),
        }}
      >
        <input {...getInputProps()} />
        <div style={styles.fileUploadIcon}>📄</div>
        <div style={styles.fileUploadText}>
          {importedFile
            ? `Fichier sélectionné : ${importedFile.name}`
            : "Glissez-déposez votre fichier ici ou cliquez pour parcourir vos fichiers"}
        </div>
        <Button variant="primary" className="mt-3">
          Parcourir
        </Button>
      </div>

      <div style={styles.buttonContainer}>
        <Button variant="secondary" onClick={() => setView("options")}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleImport}>
          Continuer
        </Button>
      </div>
    </div>
  );

  // Rendu de l'étape des informations personnelles
  const renderPersonalInfo = (formik) => (
    <div>
      <h2 className="mb-4">Informations personnelles</h2>

      <Form.Group className="mb-3">
        <Form.Label>Prénom</Form.Label>
        <Form.Control
          type="text"
          name="firstname"
          placeholder="Votre prénom"
          value={formik.values.firstname}
          onChange={formik.handleChange}
          isInvalid={formik.touched.firstname && formik.errors.firstname}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.firstname}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Nom</Form.Label>
        <Form.Control
          type="text"
          name="lastname"
          placeholder="Votre nom"
          value={formik.values.lastname}
          onChange={formik.handleChange}
          isInvalid={formik.touched.lastname && formik.errors.lastname}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.lastname}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Votre email"
          value={formik.values.email}
          onChange={formik.handleChange}
          isInvalid={formik.touched.email && formik.errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Téléphone</Form.Label>
        <Form.Control
          type="tel"
          name="phone"
          placeholder="Votre numéro de téléphone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          isInvalid={formik.touched.phone && formik.errors.phone}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.phone}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Adresse</Form.Label>
        <Form.Control
          type="text"
          name="address"
          placeholder="Votre adresse"
          value={formik.values.address}
          onChange={formik.handleChange}
          isInvalid={formik.touched.address && formik.errors.address}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.address}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Vos compétences</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="skills"
          placeholder="Listez vos compétences, séparées par des virgules"
          value={formik.values.skills}
          onChange={formik.handleChange}
        />
      </Form.Group>

      <div style={styles.buttonContainer}>
        <Button variant="secondary" onClick={() => setView("options")}>
          Annuler
        </Button>
        <Button variant="primary" onClick={formik.handleSubmit}>
          Enregistrer mes informations
        </Button>
      </div>
    </div>
  );

  // Rendu de la section de création avec les différentes étapes
  const renderCreateSection = () => (
    <div>
      {formSubmitted ? (
        <div style={styles.successMessage}>
          <h3>Merci !</h3>
          <p>Vos informations ont été enregistrées avec succès.</p>
        </div>
      ) : (
        <>
          <div
            style={{
              ...styles.backToOptions,
              ...(hoveredBackLink ? styles.backToOptionsHover : {}),
            }}
            onMouseEnter={() => setHoveredBackLink(true)}
            onMouseLeave={() => setHoveredBackLink(false)}
            onClick={() => setView("options")}
          >
            ← Retour aux options
          </div>

          <Formik
            initialValues={{
              firstname: "",
              lastname: "",
              email: "",
              phone: "",
              address: "",
              skills: "",
            }}
            validationSchema={personalInfoSchema}
            onSubmit={handleFinish}
          >
            {(formik) => renderPersonalInfo(formik)}
          </Formik>
        </>
      )}
    </div>
  );

  return (
    <Container style={styles.container}>
      <h1 style={styles.title}>Formulaire d'informations utilisateur</h1>

      {view === "options" && renderOptions()}
      {view === "import" && (
        <div style={styles.formSection}>{renderImport()}</div>
      )}
      {view === "create" && (
        <div style={styles.formSection}>{renderCreateSection()}</div>
      )}
    </Container>
  );
};

export default UserInfoForm;
