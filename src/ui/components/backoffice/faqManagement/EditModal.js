import React, { useState, useEffect } from "react";
import { Close, Save } from "@material-ui/icons";
import { Modal } from "@material-ui/core";

export const EditModal = ({ show, question, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    text: "",
    answer: ""
  });

  const [errors, setErrors] = useState({
    text: false,
    answer: false
  });

  useEffect(() => {
    if (show && question) {
      setFormData({
        text: question.text || "",
        answer: question.answer || ""
      });
      setErrors({
        text: false,
        answer: false
      });
    }
  }, [show, question]);

  const validateForm = () => {
    const newErrors = {
      text: !formData.text.trim(),
      answer: !formData.answer.trim()
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    if (validateForm()) {
      onSave({
        ...question,
        text: formData.text.trim(),
        answer: formData.answer.trim()
      });
    }
  };

  const handleInputChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal open={show} onClose={onClose} aria-labelledby="edit-faq-modal">
      <div className="modal-dialog modal-lg" style={{ margin: "50px auto" }}>
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-light py-3 px-4 border-bottom border-2">
            <h5 className="modal-title fw-bold fs-4 text-primary">
              Modifier la FAQ
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-4">
                <label
                  htmlFor="question-text"
                  className="form-label fw-semibold mb-2"
                >
                  Question
                </label>
                <input
                  id="question-text"
                  name="text"
                  type="text"
                  className={`form-control form-control-lg shadow-none ${
                    errors.text ? "is-invalid" : ""
                  }`}
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Entrez votre question"
                />
                {errors.text && (
                  <div className="invalid-feedback">
                    La question est requise
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="question-answer"
                  className="form-label fw-semibold mb-2"
                >
                  Réponse
                </label>
                <textarea
                  id="question-answer"
                  name="answer"
                  className={`form-control shadow-none ${
                    errors.answer ? "is-invalid" : ""
                  }`}
                  value={formData.answer}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Entrez votre réponse"
                  style={{ resize: "none" }}
                />
                {errors.answer && (
                  <div className="invalid-feedback">La réponse est requise</div>
                )}
              </div>
            </div>

            <div className="modal-footer border-top border-2 py-3 px-4 gap-3">
              <button
                type="button"
                className="btn btn-light fw-semibold px-4 py-2 d-flex align-items-center gap-2 border"
                onClick={onClose}
              >
                <Close fontSize="small" />
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary fw-semibold px-4 py-2 d-flex align-items-center gap-2"
              >
                <Save fontSize="small" />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
