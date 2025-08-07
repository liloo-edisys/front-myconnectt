import axios from "axios";

// Filtres de matching (suppression du filtre "all")
export const MATCH_SCORE_FILTERS = [
  { value: "35-50", label: "35% - 50%", min: 35, max: 50 },
  { value: "50-75", label: "50% - 75%", min: 50, max: 75 },
  { value: "75-90", label: "75% - 90%", min: 75, max: 90 },
  { value: "90-100", label: "90% - 100%", min: 90, max: 100 }
];

// Appel API filtré par score (suppression du paramètre page)
export const getMatchingWithVacancy = async (vacancyId, minScore = 35, maxScore = 50) => {
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
export const getAllMatchingCandidates = async (vacancyId, minScore = 35, maxScore = 50) => {
  try {
    const response = await getMatchingWithVacancy(vacancyId, minScore, maxScore);

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