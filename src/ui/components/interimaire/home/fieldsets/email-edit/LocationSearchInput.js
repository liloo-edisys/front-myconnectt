import React from "react";
import { FormattedMessage } from "react-intl";
import LocationSearchInputClass from "./LocationSearchInputClass";

function LocationSearchInput(props) {
  return (
    <LocationSearchInputClass FormattedMessage={FormattedMessage} {...props} />
  );
}

export default LocationSearchInput;
