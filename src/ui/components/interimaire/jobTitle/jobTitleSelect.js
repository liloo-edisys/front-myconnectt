import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";
import { FormattedMessage } from "react-intl";
import { debounce } from "lodash";

function JobTitleSelect({ value, onChange, className, styles }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchJobTitles = debounce(async inputValue => {
    if (!inputValue) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_WEBAPI_URL}api/JobTitle/SearchByName?name=${inputValue}`
      );

      // Adaptation pour la structure de réponse avec "data"
      const formattedOptions = response.data.data.map(jobTitle => ({
        label: `${jobTitle.name} (${jobTitle.code})`, // Affiche le nom et le code
        value: jobTitle.id,
        code: jobTitle.code, // Stocke le code si besoin
        tenantID: jobTitle.tenantID // Stocke le tenantID si besoin
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error("Erreur lors de la recherche des titres:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = newValue => {
    searchJobTitles(newValue);
  };

  return (
    <div className="mt-10">
      <label>
        <FormattedMessage id="TEXT.JOB.TITLE" />
      </label>
      <Select
        isMulti
        value={value}
        onChange={onChange}
        options={options}
        onInputChange={handleInputChange}
        isLoading={isLoading}
        styles={styles}
        className={className}
        noOptionsMessage={({ inputValue }) =>
          !inputValue
            ? "Commencez à taper pour rechercher"
            : "Aucun résultat trouvé"
        }
        placeholder="Rechercher un titre de poste..."
      />
    </div>
  );
}

export default JobTitleSelect;
