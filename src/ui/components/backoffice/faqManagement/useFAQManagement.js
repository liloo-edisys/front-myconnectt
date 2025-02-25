import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api';

const transformData = (data) => {
  return data.map(item => ({
    id: item.id.toString(),
    text: item.question,
    answer: item.answer,
    children: item.slaves ? transformData(item.slaves) : []
  }));
};

export const useFAQManagement = (type = 1) => {
  const [questions, setQuestions] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger les données
  const fetchFAQs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/Faq/Admin/${type}`);
      const transformedData = transformData(response.data);
      setQuestions(transformedData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des FAQs');
      console.error('Erreur lors du chargement des FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const getCurrentQuestions = useCallback(() => {
    let current = questions;
    for (const pathItem of currentPath) {
      current = current.find((q) => q.id === pathItem.id)?.children || [];
    }
    return current;
  }, [questions, currentPath]);

  const handleAdd = useCallback(async (newQuestion) => {
    try {
      setIsLoading(true);
      // Trouver le parent actuel si on est dans une sous-catégorie
      const parentId = currentPath.length > 0 ? 
        parseInt(currentPath[currentPath.length - 1].id) : 0;

      const payload = {
        id: 0, // L'API générera l'ID
        question: newQuestion.text,
        answer: newQuestion.answer,
        faqMasterID: parentId,
        faqType: type
      };

      await axios.post(`${API_URL}/Faq`, payload);
      await fetchFAQs(); // Recharger les données après l'ajout
      setError(null);
    } catch (err) {
      setError('Erreur lors de la création de la FAQ');
      console.error('Erreur lors de la création:', err);
    } finally {
      setIsLoading(false);
    }
  }, [type, currentPath, fetchFAQs]);

  const handleEdit = useCallback(async (question) => {
    try {
      setIsLoading(true);
      const payload = {
        id: parseInt(question.id),
        question: question.text,
        answer: question.answer,
        faqMasterID: currentPath.length > 0 ? 
          parseInt(currentPath[currentPath.length - 1].id) : 0,
        faqType: type
      };

      await axios.post(`${API_URL}/Faq`, payload);
      await fetchFAQs(); // Recharger les données après la modification
      setError(null);
    } catch (err) {
      setError('Erreur lors de la modification de la FAQ');
      console.error('Erreur lors de la modification:', err);
    } finally {
      setIsLoading(false);
    }
  }, [type, currentPath, fetchFAQs]);

  const handleDelete = useCallback(async (questionId) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/Faq/${questionId}`);
      await fetchFAQs(); // Recharger les données après la suppression
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression de la FAQ');
      console.error('Erreur lors de la suppression:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFAQs]);

  const handleDrop = useCallback((draggedId, targetId) => {
    if (draggedId === targetId) return;

    setQuestions((prev) => {
      let draggedQuestion;

      const removeFromArray = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id === draggedId) {
            draggedQuestion = arr[i];
            arr.splice(i, 1);
            return true;
          }
          if (arr[i].children?.length) {
            if (removeFromArray(arr[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      const addToTarget = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id === targetId) {
            if (!arr[i].children) arr[i].children = [];
            arr[i].children.push(draggedQuestion);
            return true;
          }
          if (arr[i].children?.length) {
            if (addToTarget(arr[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      const newQuestions = [...prev];
      removeFromArray(newQuestions);
      if (draggedQuestion) {
        addToTarget(newQuestions);
      }
      return newQuestions;
    });
  }, []);

  const navigation = {
    handleNavigate: useCallback((question) => {
      setCurrentPath((prev) => [...prev, question]);
    }, []),
    handleBack: useCallback(() => {
      setCurrentPath((prev) => prev.slice(0, -1));
    }, []),
    handleRootNavigation: useCallback(() => {
      setCurrentPath([]);
    }, []),
    handlePathNavigation: useCallback((index) => {
      setCurrentPath((prev) => prev.slice(0, index + 1));
    }, []),
  };

  return {
    questions,
    setQuestions,
    currentPath,
    getCurrentQuestions,
    handleAdd,
    handleEdit,
    handleDelete,
    handleDrop,
    navigation,
    isLoading,
    error,
    refetch: fetchFAQs
  };
};