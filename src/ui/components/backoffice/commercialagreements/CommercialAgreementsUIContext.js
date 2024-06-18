import React, { createContext, useContext } from "react";

const CommercialAgreementsUIContext = createContext();

export function useCommercialAgreementsUIContext() {
  return useContext(CommercialAgreementsUIContext);
}

export const CommercialAgreementsUIConsumer =
  CommercialAgreementsUIContext.Consumer;

export function CommercialAgreementsUIProvider({
  extensionsUIEvents,
  children,
  history
}) {
  const value = {
    openExtensionProfileDialog: extensionsUIEvents.openExtensionProfileDialog
  };

  return (
    <CommercialAgreementsUIContext.Provider value={value}>
      {children}
    </CommercialAgreementsUIContext.Provider>
  );
}
