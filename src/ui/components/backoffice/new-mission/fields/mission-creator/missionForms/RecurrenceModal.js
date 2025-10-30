// RecurrenceModal.js
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import moment from "moment";
import { DatePickerField } from "metronic/_partials/controls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";

function RecurrenceModal({ show, onHide, vacancyID }) {
  // États
  const [recurrenceTypes, setRecurrenceTypes] = useState([]);
  const [selectedRecurrenceType, setSelectedRecurrenceType] = useState(0);
  const [existingRecurrence, setExistingRecurrence] = useState(null);
  const [publishDate, setpublishDate] = useState(null);
  const [isLoading, setIsLoading] = useState({
    types: false,
    submit: false,
    initial: true
  });

  // URLs de l'API
  const API_BASE_URL =
    "https://myconnectt-apiback-prod.azurewebsites.net/api";

  const API_ENDPOINTS = {
    types: "/VacancyOfferProgram/Types",
    byVacancyId: id => `/VacancyOfferProgram/ByVacancyId/${id}`,
    base: "/VacancyOfferProgram",
    delete: id => `/VacancyOfferProgram/${id}` // Nouvel endpoint
  };

  const fetchRecurrenceTypes = async () => {
    setIsLoading(prev => ({ ...prev, types: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.types}`);
      setRecurrenceTypes(response.data);
    } catch (error) {
      console.error("Error fetching recurrence types:", error);
      toastr.error("Erreur lors de la récupération des types de récurrence");
    } finally {
      setIsLoading(prev => ({ ...prev, types: false }));
    }
  };

  const fetchExistingRecurrence = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.byVacancyId(vacancyID)}`,
        {
          headers: { accept: "text/plain" }
        }
      );
      console.log("Response data:", response.data); // Pour débugger

      // Mettre à jour existingRecurrence
      setExistingRecurrence(response.data);
      setSelectedRecurrenceType(response.data.TypeID);

      // Mettre à jour la date de publication si présente
      if (response.data && response.data.publishDate) {
        setpublishDate(moment(response.data.publishDate).toDate());
      }
    } catch (error) {
      console.error("Error fetching existing recurrence:", error);
      // Réinitialiser les états en cas d'erreur
      setExistingRecurrence(null);
      setSelectedRecurrenceType(0);
      setpublishDate(null);
    } finally {
      setIsLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const handleDelete = async () => {
    if (!existingRecurrence?.id || isNaN(existingRecurrence.id)) {
      toastr.error("ID de récurrence invalide");
      return;
    }

    setIsLoading(prev => ({ ...prev, submit: true }));
    try {
      await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.base}?id=${existingRecurrence.id}`,
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "text/plain;charset=UTF-8"
          }
        }
      );
      toastr.success("Récurrence supprimée avec succès");
      onHide();
    } catch (error) {
      console.error("Error deleting recurrence:", error);
      toastr.error("Erreur lors de la suppression de la récurrence");
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleSubmit = async () => {
    if (selectedRecurrenceType === 0 && existingRecurrence?.id) {
      await handleDelete();
      return;
    }

    if (selectedRecurrenceType === 0) {
      toastr.warning("Veuillez sélectionner un type de récurrence");
      return;
    }

    setIsLoading(prev => ({ ...prev, submit: true }));
    try {
      const data = {
        id: existingRecurrence?.id || 0,
        vacancyID: vacancyID,
        typeID: selectedRecurrenceType,
        nextDate: moment().toISOString(),
        publishDate: publishDate
          ? moment(publishDate).format("YYYY-MM-DD") + "T00:00:00.000Z"
          : null
      };

      if (existingRecurrence?.id) {
        await axios.put(`${API_BASE_URL}${API_ENDPOINTS.base}`, data, {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json"
          }
        });
        toastr.success("Récurrence modifiée avec succès");
      } else {
        await axios.post(`${API_BASE_URL}${API_ENDPOINTS.base}`, data, {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json"
          }
        });
        toastr.success("Récurrence ajoutée avec succès");
      }
      onHide();
    } catch (error) {
      console.error("Error submitting recurrence:", error);
      toastr.error(
        error.response?.data || "Erreur lors de la soumission de la récurrence"
      );
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  useEffect(() => {
    if (show) {
      fetchRecurrenceTypes();
      if (vacancyID) {
        fetchExistingRecurrence();
      }
    }
  }, [show, vacancyID]);

  const getButtonText = () => {
    if (selectedRecurrenceType === 0 && existingRecurrence?.id) {
      return "BUTTON.SAVE";
    }
    return existingRecurrence?.id ? "BUTTON.EDIT" : "TEXT.ADD";
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="BUTTON.OFFER.PROGRAM" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-group">
          <label className="col-form-label">
            <FormattedMessage id="TEXT.RECURRENCE.TYPE" />
          </label>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="icon-xl fas fa-list text-primary"></i>
              </span>
            </div>
            <select
              name="recurrenceType"
              className="form-control"
              value={selectedRecurrenceType}
              onChange={e =>
                setSelectedRecurrenceType(parseInt(e.target.value))
              }
              disabled={isLoading.types || isLoading.initial}
            >
              <option value={0}>
                {isLoading.types
                  ? "Chargement..."
                  : "Veuillez choisir une valeur"}
              </option>
              {recurrenceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <label className="mt-4">
            <FormattedMessage id="TEXT.PUBLISH_DATE" />
          </label>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="fas fa-calendar-alt text-primary"></i>
              </span>
            </div>
            <DatePicker
              selected={publishDate}
              onChange={date => setpublishDate(date)}
              className="form-control"
              dateFormat="dd/MM/yyyy"
              placeholderText="JJ/MM/AAAA"
              locale={fr}
              minDate={new Date()}
              showMonthDropdown
              showYearDropdown
              yearDropdownItemNumber={9}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onHide}
          className="btn btn-light btn-elevate mr-2"
          disabled={isLoading.submit}
        >
          <FormattedMessage id="BUTTON.CANCEL" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className={`btn ${
            selectedRecurrenceType === 0 && existingRecurrence?.id
              ? "btn-danger"
              : "btn-primary"
          } btn-elevate`}
          disabled={isLoading.submit || isLoading.types || isLoading.initial}
        >
          {isLoading.submit && (
            <span className="spinner spinner-white mr-3"></span>
          )}
          <FormattedMessage id={getButtonText()} />
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default RecurrenceModal;
