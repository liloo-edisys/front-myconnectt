import React, { useState, useCallback } from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { People, Business } from '@material-ui/icons';
import { styles } from './styles';
import { useFAQManagement } from './useFAQManagement';
import { QuestionForm } from './QuestionForm';
import { Breadcrumb } from './Breadcrumb';
import { QuestionCard } from './QuestionCard';
import { DeleteModal } from './DeleteModal';
import { EditModal } from './EditModal';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`faq-tabpanel-${index}`}
      aria-labelledby={`faq-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `faq-tab-${index}`,
    'aria-controls': `faq-tabpanel-${index}`,
  };
}

const FaqManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const interimaireFAQ = useFAQManagement(1);
  const clientFAQ = useFAQManagement(2);

  const getCurrentFAQ = () => {
    return tabValue === 0 ? interimaireFAQ : clientFAQ;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDeleteClick = useCallback((question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!questionToDelete) return;
    getCurrentFAQ().handleDelete(questionToDelete.id);
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  }, [questionToDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  }, []);

  const handleEditClick = useCallback((question) => {
    setEditingQuestion(question);
    setShowEditModal(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingQuestion(null);
  }, []);

  const handleSaveEdit = useCallback(async (updatedQuestion) => {
    try {
      await getCurrentFAQ().handleEdit(updatedQuestion);
      setShowEditModal(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  }, []);

  const handleDragStart = (e, questionId) => {
    e.dataTransfer.setData("text/plain", questionId);
  };

  const handleQuestionDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    getCurrentFAQ().handleDrop(draggedId, targetId);
  };

  const renderFAQContent = (faq) => {
    return (
      <div className="row g-4">
        <div className="col-md-4">
          <QuestionForm onAdd={faq.handleAdd} />
        </div>

        <div className="col-md-8">
          <div className={styles.mainContent}>
            <Breadcrumb 
              currentPath={faq.currentPath} 
              navigation={faq.navigation} 
            />

            {faq.isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                </div>
              </div>
            ) : faq.error ? (
              <div className="alert alert-danger" role="alert">
                {faq.error}
              </div>
            ) : faq.getCurrentQuestions().length === 0 ? (
              <div className="text-center text-muted py-5">
                <h5>Aucune question à ce niveau</h5>
                <p>Commencez par ajouter une question</p>
              </div>
            ) : (
              faq.getCurrentQuestions().map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onNavigate={faq.navigation.handleNavigate}
                  onDelete={handleDeleteClick}
                  onEdit={handleEditClick}
                  onDragStart={handleDragStart}
                  onDrop={handleQuestionDrop}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className="mb-4 border-bottom">
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="FAQ tabs"
          variant="fullWidth"
          className="border-bottom-0"
        >
          <Tab 
            icon={<People />}
            label="FAQs Intérimaires" 
            {...a11yProps(0)}
          />
          <Tab 
            icon={<Business />}
            label="FAQs Clients" 
            {...a11yProps(1)}
          />
        </Tabs>
      </div>

      <TabPanel value={tabValue} index={0}>
        {renderFAQContent(interimaireFAQ)}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderFAQContent(clientFAQ)}
      </TabPanel>

      <DeleteModal
        show={showDeleteModal}
        question={questionToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <EditModal
        show={showEditModal}
        question={editingQuestion}
        onSave={handleSaveEdit}
        onClose={handleCancelEdit}
      />
    </div>
  );
};

export default FaqManagement;