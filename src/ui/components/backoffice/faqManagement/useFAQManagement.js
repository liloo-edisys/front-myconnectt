import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_URL =
  "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api";

const transformData = data => {
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
      setError("Erreur lors du chargement des FAQs");
      console.error("Erreur lors du chargement des FAQs:", err);
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
      current = current.find(q => q.id === pathItem.id)?.children || [];
    }
    return current;
  }, [questions, currentPath]);

  const handleAdd = useCallback(
    async newQuestion => {
      try {
        setIsLoading(true);
        // Trouver le parent actuel si on est dans une sous-catégorie
        const parentId =
          currentPath.length > 0
            ? parseInt(currentPath[currentPath.length - 1].id)
            : null;

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
        setError("Erreur lors de la création de la FAQ");
        console.error("Erreur lors de la création:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [type, currentPath, fetchFAQs]
  );

  const handleEdit = useCallback(
    async question => {
      try {
        setIsLoading(true);

        // Trouver le faqMasterID actuel de la question
        const findParentId = (arr, id, parentId = 0) => {
          for (const item of arr) {
            if (item.id === id) {
              return parentId;
            }
            if (item.children && item.children.length > 0) {
              const foundId = findParentId(item.children, id, item.id);
              if (foundId !== null) {
                return foundId;
              }
            }
          }
          return null;
        };

        // Chercher le parent actuel de la question
        const parentId =
          findParentId(questions, question.id) ||
          (currentPath.length > 0
            ? parseInt(currentPath[currentPath.length - 1].id)
            : null);

        const payload = {
          id: parseInt(question.id),
          question: question.text,
          answer: question.answer,
          faqMasterID: parentId,
          faqType: type
        };

        await axios.post(`${API_URL}/Faq`, payload);
        await fetchFAQs(); // Recharger les données après la modification
        setError(null);
      } catch (err) {
        setError("Erreur lors de la modification de la FAQ");
        console.error("Erreur lors de la modification:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [questions, type, currentPath, fetchFAQs]
  );

  const handleDelete = useCallback(
    async questionId => {
      try {
        setIsLoading(true);
        await axios.delete(`${API_URL}/Faq/${questionId}`);
        await fetchFAQs(); // Recharger les données après la suppression
        setError(null);
      } catch (err) {
        setError("Erreur lors de la suppression de la FAQ");
        console.error("Erreur lors de la suppression:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFAQs]
  );

  const handleDrop = useCallback(
    async (draggedId, targetId) => {
      if (draggedId === targetId) return;

      try {
        // On commence par mettre à jour l'UI localement pour une expérience fluide
        setQuestions(prev => {
          let draggedQuestion;

          const removeFromArray = arr => {
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

          const addToTarget = arr => {
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

        // On prépare maintenant l'appel API pour persister le changement
        setIsLoading(true);

        // Récupérer l'élément déplacé
        const findQuestion = (arr, id) => {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
              return arr[i];
            }
            if (arr[i].children?.length) {
              const found = findQuestion(arr[i].children, id);
              if (found) return found;
            }
          }
          return null;
        };

        // Préparer la payload pour l'API
        const draggedQuestion = findQuestion(questions, draggedId);
        if (draggedQuestion) {
          const payload = {
            id: parseInt(draggedId),
            question: draggedQuestion.text,
            answer: draggedQuestion.answer,
            faqMasterID: parseInt(targetId), // Nouveau parent
            faqType: type
          };

          // Appel API pour mettre à jour le faqMasterID
          await axios.post(`${API_URL}/Faq`, payload);

          // Recharger les données pour s'assurer que tout est synchronisé
          await fetchFAQs();
        }

        setError(null);
      } catch (err) {
        setError("Erreur lors du déplacement de la FAQ");
        console.error("Erreur lors du déplacement:", err);

        // Recharger les données pour rétablir l'état initial en cas d'erreur
        await fetchFAQs();
      } finally {
        setIsLoading(false);
      }
    },
    [questions, type, fetchFAQs]
  );

  const navigation = {
    handleNavigate: useCallback(question => {
      setCurrentPath(prev => [...prev, question]);
    }, []),
    handleBack: useCallback(() => {
      setCurrentPath(prev => prev.slice(0, -1));
    }, []),
    handleRootNavigation: useCallback(() => {
      setCurrentPath([]);
    }, []),
    handlePathNavigation: useCallback(index => {
      setCurrentPath(prev => prev.slice(0, index + 1));
    }, [])
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
