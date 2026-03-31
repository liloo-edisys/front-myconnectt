import React from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  geocodeByPlaceId
} from "react-places-autocomplete";
import "./styles.scss";
import { FormattedMessage, useIntl } from "react-intl";

function LocationSearchInput(props) {
  const { address, setAddress, setFieldValue, intl } = props;

  const handleChange = address => {
    setAddress(address);
  };

  const handleSelect = async (address, placeId, setFieldValue) => {
    const results = await geocodeByAddress(address);
    const latLng = await getLatLng(results[0]);
    const [place] = await geocodeByPlaceId(placeId);
    const { long_name: postalCode = "" } =
      place.address_components.find(c => c.types.includes("postal_code")) || {};
    const { long_name: city = "" } =
      place.address_components.find(c => c.types.includes("locality")) || {};
    const addressArray = address.split(",");
    setAddress(addressArray[0]);
    setFieldValue("address", addressArray[0]);
    setFieldValue("postalcode", postalCode);
    setFieldValue("city", city);
  };
  return (
    <div className="location-input-width">
      <PlacesAutocomplete
        country={["fr"]}
        value={address}
        onChange={handleChange}
        onSelect={(address, placeId) =>
          handleSelect(address, placeId, setFieldValue)
        }
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div style={{ position: "relative" }}>
            <input
              className={`form-control h-auto px-6 google-map-input-content`}
              style={{ width: "100%" }}
              placeholder={intl.formatMessage({
                id: "MODEL.ACCOUNT.ADDRESS"
              })}
              {...getInputProps()}
            />
            <div
              className="autocomplete-dropdown-container google-map-input bg-light-primary"
              style={{ width: "100%", zIndex: 100 }}
            >
              {loading && (
                <div>
                  <FormattedMessage id="MESSAGE.SEARCH.ONGOING" />
                </div>
              )}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? "suggestion-item--active"
                  : "suggestion-item";
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? {
                      cursor: "pointer",
                      padding: 5
                    }
                  : {
                      cursor: "pointer",
                      padding: 5
                    };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
}

export default LocationSearchInput;
