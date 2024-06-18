import React, { createContext, useContext } from "react";

const CompaniesUIContext = createContext();

export function useCompaniesUIContext() {
  return useContext(CompaniesUIContext);
}

export const CompaniesUIConsumer = CompaniesUIContext.Consumer;

export function CompaniesUIProvider({ companiesUIEvents, children }) {
  const value = {
    newCompanyButtonClick: companiesUIEvents.newCompanyButtonClick,
    newWorksiteButtonClick: companiesUIEvents.newWorksiteButtonClick,
    openDeleteCompanyDialog: companiesUIEvents.openDeleteCompanyDialog,
    openEditCompanyDialog: companiesUIEvents.openEditCompanyDialog,
    openEditWorksiteDialog: companiesUIEvents.openEditWorksiteDialog,
    openPreviewWorksiteDialog: companiesUIEvents.openPreviewWorksiteDialog
  };

  return (
    <CompaniesUIContext.Provider value={value}>
      {children}
    </CompaniesUIContext.Provider>
  );
}
