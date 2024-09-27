import React, { createContext, useContext } from "react";

const CustomersUIContext = createContext();

export function useCustomersUIContext() {
  return useContext(CustomersUIContext);
}

export const CustomersUIConsumer = CustomersUIContext.Consumer;

export function CustomersUIProvider({ customersUIEvents, children }) {
  const value = {
    newCompanyButtonClick: customersUIEvents.newCompanyButtonClick,
    newWorksiteButtonClick: customersUIEvents.newWorksiteButtonClick,
    openDeleteCompanyDialog: customersUIEvents.openDeleteCompanyDialog,
    openEditCompanyDialog: customersUIEvents.openEditCompanyDialog,
    openEditWorksiteDialog: customersUIEvents.openEditWorksiteDialog,
    openPreviewWorksiteDialog: customersUIEvents.openPreviewWorksiteDialog
  };

  return (
    <CustomersUIContext.Provider value={value}>
      {children}
    </CustomersUIContext.Provider>
  );
}
