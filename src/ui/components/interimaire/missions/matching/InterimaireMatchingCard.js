import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import axios from "axios";
import { toastr } from "react-redux-toastr";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";

import InterimaireMatchingTable from "./InterimaireMatchingTable";

const InterimaireMatchingCard = props => {
  const { intl, missions } = props;

  // États
  const [show, setShow] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Récupérer l'état actuel de la localisation depuis l'API
  const fetchLocationState = async () => {
    try {
      const response = await axios.get(
        "https://myconnectt-apiback-prod.azurewebsites.net/api/Applicant/IsCurrentLocalization",
        {
          headers: {
            accept: "*/*"
          }
        }
      );

      const { isCurrentLocalization } = response.data;

      // Mettre à jour l'état local et localStorage
      setUseMyLocation(isCurrentLocalization);
      setIsInitializing(false);
      localStorage.setItem("useMyLocation", isCurrentLocalization);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'état de localisation:",
        error
      );

      // Utiliser localStorage comme fallback en cas d'erreur
      setUseMyLocation(
        localStorage.getItem("useMyLocation") === "true" || false
      );
      setIsInitializing(false);
    }
  };

  // Équivalent de componentDidMount
  useEffect(() => {
    fetchLocationState();
  }, []);

  const handleClose = () => {
    setShow(null);
  };

  const handleShow = id => () => {
    setShow(id);
  };

  const handleUpdateChildren = () => {
    setRefresh(prevRefresh => prevRefresh + 1);
    setTimeout(() => {
      setRefresh(0);
    }, 500);
  };

  // Méthode pour gérer le changement du checkbox
  const handleLocationCheckboxChange = async e => {
    const useLocation = e.target.checked;

    setIsLoadingLocation(true);
    setUseMyLocation(useLocation);

    try {
      // Appel à l'API pour mettre à jour la localisation
      await axios.get(
        `https://myconnectt-apiback-prod.azurewebsites.net/api/Applicant/UseMyCurrentLocalization/${useLocation}`,
        {
          headers: {
            accept: "*/*"
          }
        }
      );

      // Stocker la préférence dans le localStorage
      localStorage.setItem("useMyLocation", useLocation);

      // Rafraîchir les données
      handleUpdateChildren();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la localisation:", error);

      // Remettre l'état précédent en cas d'erreur
      setUseMyLocation(!useLocation);
      localStorage.setItem("useMyLocation", !useLocation);

      toastr.error("Erreur lors de la mise à jour de la localisation");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({
          id: "DASHBOARD.INTERIMAIRE.LIST.MISSIONS.TITLE"
        })}
      >
        <CardHeaderToolbar>
          {/* Checkbox pour activer/désactiver la localisation avec meilleur affichage */}
          <div className="d-flex align-items-center mr-5">
            <label
              className="checkbox checkbox-primary d-flex align-items-center"
              style={{ marginBottom: 0 }}
            >
              <input
                type="checkbox"
                checked={useMyLocation}
                onChange={handleLocationCheckboxChange}
                disabled={isLoadingLocation || isInitializing}
              />
              <span></span>
              <div className="d-flex align-items-center ml-2">
                <span>Utiliser ma localisation</span>
              </div>
            </label>
          </div>

          {/* Bouton de rafraîchissement existant */}
          <button
            onClick={handleUpdateChildren}
            className="btn btn-icon btn-light-primary pulse pulse-primary mr-5"
          >
            <i className="flaticon-refresh"></i>
            <span className="pulse-ring"></span>
          </button>
        </CardHeaderToolbar>
      </CardHeader>
      <CardBody>
        <InterimaireMatchingTable
          missions={missions}
          handleClose={handleClose}
          show={show}
          refresh={refresh}
        />
      </CardBody>
    </Card>
  );
};

export default injectIntl(connect()(InterimaireMatchingCard));
