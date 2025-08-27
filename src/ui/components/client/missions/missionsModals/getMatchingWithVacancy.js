import axios from "axios";

// Filtres de matching (suppression du filtre 35-50)
export const MATCH_SCORE_FILTERS = [
  { value: "50-75", label: "50% - 75%", min: 50, max: 75 },
  { value: "75-90", label: "75% - 90%", min: 75, max: 90 },
  { value: "90-100", label: "90% - 100%", min: 90, max: 100 }
];

// Ordre de priorité pour le chargement initial (du meilleur au moins bon)
export const PRIORITY_FILTERS = [
  { min: 90, max: 100, label: "90% - 100%" },
  { min: 75, max: 90, label: "75% - 90%" },
  { min: 50, max: 75, label: "50% - 75%" }
];

// Appel API filtré par score
export const getMatchingWithVacancy = async (
  vacancyId,
  minScore = 50,
  maxScore = 75
) => {
  try {
    const url = `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Applicant/GetMatchingWithVacancy/${vacancyId}?minscore=${minScore}&maxscore=${maxScore}`;

    const headers = {
      accept: "*/*",
      "Content-Type": "application/json"
    };

    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios({
      method: "POST",
      url,
      headers,
      data: null
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des candidats:", error);
    throw error;
  }
};

// Récupère tous les candidats correspondant au filtre de score
export const getAllMatchingCandidates = async (
  vacancyId,
  minScore = 50,
  maxScore = 75
) => {
  try {
    const response = await getMatchingWithVacancy(
      vacancyId,
      minScore,
      maxScore
    );

    if (response && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        totalCount: response.data.length
      };
    } else {
      return {
        success: false,
        data: [],
        totalCount: 0,
        error: "Réponse inattendue du serveur"
      };
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      totalCount: 0,
      error: error.message
    };
  }
};

// NOUVELLE FONCTION : Détecter les filtres qui ont des données
export const getAvailableFilters = async (vacancyId) => {
  console.log("Détection des filtres disponibles pour la mission:", vacancyId);
  const availableFilters = [];
  
  for (const filter of PRIORITY_FILTERS) {
    try {
      const result = await getAllMatchingCandidates(
        vacancyId,
        filter.min,
        filter.max
      );
      
      if (result.success && result.data.length > 0) {
        availableFilters.push({
          value: `${filter.min}-${filter.max}`,
          label: `${filter.label} (${result.data.length} candidat${result.data.length > 1 ? 's' : ''})`,
          min: filter.min,
          max: filter.max,
          count: result.data.length
        });
        console.log(`✓ ${filter.label}: ${result.data.length} candidat(s)`);
      } else {
        console.log(`✗ ${filter.label}: aucun candidat`);
      }
    } catch (error) {
      console.error(`Erreur avec le filtre ${filter.label}:`, error);
      // Continue avec le filtre suivant
    }
  }
  
  return availableFilters;
};

// Nouvelle fonction pour récupérer les candidats avec logique de priorité
export const getBestMatchingCandidates = async vacancyId => {
  console.log("Recherche des meilleurs candidats pour la mission:", vacancyId);

  for (const filter of PRIORITY_FILTERS) {
    console.log(
      `Tentative avec le filtre ${filter.label} (${filter.min}-${filter.max}%)`
    );

    try {
      const result = await getAllMatchingCandidates(
        vacancyId,
        filter.min,
        filter.max
      );

      if (result.success && result.data.length > 0) {
        console.log(
          `✓ Trouvé ${result.data.length} candidat(s) avec le filtre ${filter.label}`
        );
        return {
          ...result,
          appliedFilter: {
            value: `${filter.min}-${filter.max}`,
            label: filter.label,
            min: filter.min,
            max: filter.max
          }
        };
      } else {
        console.log(`✗ Aucun candidat trouvé avec le filtre ${filter.label}`);
      }
    } catch (error) {
      console.error(`Erreur avec le filtre ${filter.label}:`, error);
      // Continue avec le filtre suivant
    }
  }

  // Aucun candidat trouvé avec tous les filtres
  console.log("Aucun candidat trouvé avec tous les filtres disponibles");
  return {
    success: true,
    data: [],
    totalCount: 0,
    appliedFilter: null,
    message: "Aucun candidat ne correspond aux critères de cette mission"
  };
};