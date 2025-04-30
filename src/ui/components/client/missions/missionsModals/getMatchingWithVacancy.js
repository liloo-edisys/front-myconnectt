import axios from "axios";

export const getMatchingWithVacancy = async (vacancyId, page = 1) => {
  try {
    const url = `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Applicant/GetMatchingWithVacancy/${vacancyId}?page=${page}`;

    const headers = {
      accept: "*/*",
      "Content-Type": "application/json"
    };

    // Utilisation d'Axios ici
    const response = await axios({
      method: "POST",
      url: url,
      headers: headers,
      data: ""
    });
    console.log("----------- Réponse de l'API -----------", response.data);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `Erreur HTTP: ${error.response.status}`,
        error.response.data
      );
      throw new Error(`Erreur HTTP: ${error.response.status}`);
    } else if (error.request) {
      console.error("Pas de réponse reçue du serveur", error.request);
      throw new Error("Pas de réponse reçue du serveur");
    } else {
      console.error("Erreur de configuration de la requête:", error.message);
      throw error;
    }
  }
};
