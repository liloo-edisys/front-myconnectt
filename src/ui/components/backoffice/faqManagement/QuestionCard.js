import React from "react";
import {
  DragIndicator,
  Delete,
  ChevronRight as DoubleRight,
  Edit
} from "@material-ui/icons";
import { styles } from "./styles";

export const QuestionCard = ({
  question,
  onNavigate,
  onDelete,
  onEdit,
  onDragStart,
  onDrop
}) => {
  return (
    <div
      className={styles.questionCard}
      draggable
      onDragStart={e => onDragStart(e, question.id)}
      onDragOver={e => e.preventDefault()}
      onDrop={e => onDrop(e, question.id)}
    >
      <div className="d-flex justify-content-between align-items-start w-100">
        <div className="d-flex align-items-start flex-grow-1">
          <div className="drag-handle px-1 me-2 d-flex align-items-center text-muted">
            <DragIndicator fontSize="small" />
          </div>
          <div className="content-wrapper flex-grow-1 pe-3">
            <h5 className="mb-2 fw-bold text-dark">{question.text}</h5>
            <p className="mb-0 text-muted small lh-base">{question.answer}</p>
          </div>
        </div>
        <div className="action-buttons d-flex align-items-center">
          {question.children?.length > 0 && (
            <button
              className="btn btn-sm btn-outline-secondary rounded-circle me-2 p-1 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
              onClick={() => onNavigate(question)}
              title="Voir les sous-questions"
            >
              <DoubleRight fontSize="small" />
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-primary rounded-circle me-2 p-1 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            onClick={() => onEdit(question)}
            title="Modifier"
          >
            <Edit fontSize="small" />
          </button>
          <button
            className="btn btn-sm btn-outline-danger rounded-circle p-1 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            onClick={() => onDelete(question)}
            title="Supprimer"
          >
            <Delete fontSize="small" />
          </button>
        </div>
      </div>
      {question.children?.length > 0 && (
        <span
          className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-primary"
          style={{
            marginTop: "-5px",
            marginRight: "-5px",
            fontSize: "0.65rem"
          }}
        >
          {question.children.length}
        </span>
      )}
    </div>
  );
};
