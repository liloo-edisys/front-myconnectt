import React, { useState } from 'react';
import { Add } from '@material-ui/icons';
import { styles } from './styles';

export const QuestionForm = ({ onAdd }) => {
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [formErrors, setFormErrors] = useState({
    question: false,
    answer: false,
  });

  const validateForm = () => {
    const errors = {
      question: !questionText.trim(),
      answer: !answerText.trim(),
    };
    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onAdd({
      id: Date.now().toString(),
      text: questionText.trim(),
      answer: answerText.trim(),
      children: [],
    });

    setQuestionText("");
    setAnswerText("");
    setFormErrors({ question: false, answer: false });
  };

  return (
    <div className={styles.sidebar}>
      <h4 className="mb-4">Ajouter une question</h4>
      <div className="mb-3">
        <input
          type="text"
          className={`form-control ${formErrors.question ? "is-invalid" : ""}`}
          placeholder="Question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        {formErrors.question && (
          <div className="invalid-feedback">La question est requise</div>
        )}
      </div>

      <div className="mb-3">
        <textarea
          className={`form-control ${formErrors.answer ? "is-invalid" : ""}`}
          placeholder="Réponse"
          rows="4"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
        {formErrors.answer && (
          <div className="invalid-feedback">La réponse est requise</div>
        )}
      </div>

      <button className={styles.btn.primary} onClick={handleSubmit}>
        <Add className="me-2" />
        Ajouter
      </button>
    </div>
  );
};