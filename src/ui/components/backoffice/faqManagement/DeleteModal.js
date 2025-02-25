import React, { useState } from 'react';

export const DeleteModal = ({ show, question, onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm();
    } catch (err) {
      setError("Une erreur s'est produite lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title">Confirmation de suppression</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onCancel}
                disabled={isDeleting}
              />
            </div>
            <div className="modal-body text-center py-4">
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}
              <p className="mb-1">
                Êtes-vous sûr de vouloir supprimer cette FAQ ?
              </p>
              <p className="h6 fw-bold text-dark mb-3">
                "{question?.text}"
              </p>
              <p className="text-muted small mb-0">
                Cette action est irréversible
              </p>
            </div>
            <div className="modal-footer border-top">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onCancel}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger d-flex align-items-center" 
                onClick={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={isDeleting ? undefined : onCancel} />
    </>
  );
};