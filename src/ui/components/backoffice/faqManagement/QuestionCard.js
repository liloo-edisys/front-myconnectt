import React from 'react';
import { DragIndicator, Delete, ChevronRight as DoubleRight } from '@material-ui/icons';
import { styles } from './styles';

export const QuestionCard = ({ question, onNavigate, onDelete, onDragStart, onDrop }) => {
  return (
    <div
      className={styles.questionCard}
      draggable
      onDragStart={(e) => onDragStart(e, question.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, question.id)}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-start">
          <DragIndicator className="me-2 text-muted" />
          <div>
            <h5 className="mb-1">{question.text}</h5>
            <p className="mb-0 text-muted">{question.answer}</p>
          </div>
        </div>
        <div className="d-flex align-items-center">
          {question.children?.length > 0 && (
            <button
              className={`${styles.btn.secondary} me-2`}
              onClick={() => onNavigate(question)}
              title="Voir les sous-questions"
            >
              <DoubleRight />
            </button>
          )}
          <button
            className={styles.btn.danger}
            onClick={() => onDelete(question)}
            title="Supprimer"
          >
            <Delete />
          </button>
        </div>
      </div>
      {question.children?.length > 0 && (
        <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-primary">
          {question.children.length}
        </span>
      )}
    </div>
  );
};