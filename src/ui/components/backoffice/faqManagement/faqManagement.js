import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Modal, Form, Container, Nav } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { toastr } from "react-redux-toastr";

// Enum pour les types de FAQ
const FaqType = {
  Applicant: 1,
  Customer: 2
};

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentFaq, setCurrentFaq] = useState({
    question: "",
    answer: "",
    type: FaqType.Customer
  });
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(FaqType.Customer);

  const fetchFaqs = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Faq/Admin/${type}`,
        {
          headers: {
            'accept': 'text/plain'
          }
        }
      );
      setFaqs(response.data);
    } catch (error) {
      toastr.error("Erreur", "Impossible de charger les FAQs");
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs(activeTab);
  }, [activeTab]);

  const handleAdd = () => {
    setCurrentFaq({ question: "", answer: "", type: activeTab });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (faq) => {
    setCurrentFaq({ ...faq, type: activeTab });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (faq) => {
    setFaqToDelete(faq);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Faq`,
        {
          params: { Id: faqToDelete.id },
          headers: {
            'accept': '*/*'
          }
        }
      );
      toastr.success("Succès", "FAQ supprimée avec succès");
      fetchFaqs(activeTab);
    } catch (error) {
      toastr.error("Erreur", "Impossible de supprimer la FAQ");
      console.error('Error deleting FAQ:', error);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setFaqToDelete(null);
    }
  };

  const handleSubmit = async () => {
    if (!currentFaq.question || !currentFaq.answer) {
      toastr.warning("Attention", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: isEditing ? currentFaq.id : 0,
        question: currentFaq.question,
        answer: currentFaq.answer,
        faqType: activeTab
      };

      await axios.post(
        "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Faq",
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          }
        }
      );
      
      toastr.success("Succès", isEditing ? "FAQ modifiée avec succès" : "FAQ ajoutée avec succès");
      setShowModal(false);
      fetchFaqs(activeTab);
    } catch (error) {
      toastr.error("Erreur", "Une erreur est survenue");
      console.error('Error submitting FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      dataField: "id",
      text: "ID",
      sort: true,
      headerClasses: "text-center",
      classes: "text-center",
    },
    {
      dataField: "question",
      text: "Question",
      sort: true,
    },
    {
      dataField: "answer",
      text: "Réponse",
      sort: true,
    },
    {
      dataField: "actions",
      text: "Actions",
      headerClasses: "text-center",
      classes: "text-center",
      formatter: (cell, row) => (
        <div className="d-flex justify-content-center">
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
      ),
    },
  ];

  return (
    <Container fluid className="mt-4">
      <Card className="card-custom">
        <Card.Header className="border-0 pt-5">
          <Card.Title>
            <h3 className="card-label">Gestion des FAQs</h3>
          </Card.Title>
        </Card.Header>

        <Card.Body>
          <Nav
            variant="tabs"
            className="nav-tabs nav-tabs-line nav-tabs-line-2x nav-tabs-primary mb-5"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(parseInt(k))}
          >
            <Nav.Item>
              <Nav.Link eventKey={FaqType.Customer} className="nav-link-faq">
                <span className="nav-text">FAQ Clients</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey={FaqType.Applicant} className="nav-link-faq">
                <span className="nav-text">FAQ Intérimaires</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <div className="d-flex justify-content-end mb-5">
            <Button variant="primary" size="sm" onClick={handleAdd}>
              <i className="fas fa-plus me-2"></i>
              Ajouter une FAQ
            </Button>
          </div>

          <BootstrapTable
            wrapperClasses="table-responsive"
            classes="table table-head-custom table-vertical-center"
            bootstrap4
            keyField="id"
            data={faqs}
            columns={columns}
            pagination={paginationFactory()}
            noDataIndication="Aucune FAQ disponible"
            loading={loading}
          />
        </Card.Body>
      </Card>

      {/* Modal d'édition */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Modifier la FAQ" : "Ajouter une FAQ"} -
            {activeTab === FaqType.Customer ? " Clients" : " Intérimaires"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez la question"
                value={currentFaq.question}
                onChange={(e) =>
                  setCurrentFaq({ ...currentFaq, question: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Réponse</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Entrez la réponse"
                value={currentFaq.answer}
                onChange={(e) =>
                  setCurrentFaq({ ...currentFaq, answer: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {isEditing ? "Modifier" : "Ajouter"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="delete-confirmation-modal"
      >
        <Modal.Header className="border-0 justify-content-center">
          <div className="text-center">
            <div className="icon-warning mb-4">
              <i
                className="fas fa-exclamation-triangle text-warning"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <h4 className="modal-title font-weight-bolder">
              Confirmer la suppression
            </h4>
          </div>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>
            Êtes-vous sûr de vouloir supprimer cette FAQ ?
            <br />
            <span className="font-weight-bold">"{faqToDelete?.question}"</span>
          </p>
          <p className="text-muted small">Cette action est irréversible</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            className="font-weight-bold me-3"
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="font-weight-bold"
            disabled={loading}
          >
            <i className="fas fa-trash-alt me-2"></i>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FaqManagement;