import React, { createContext, useContext } from "react";

const UIContext = createContext();

export function useUIContext() {
  return useContext(UIContext);
}

export const UIConsumer = UIContext.Consumer;

export function UIProvider({ UIEvents, children }) {
  const value = {
    openDeleteDialog: UIEvents.openDeleteDialog,
    openEditDialog: UIEvents.openEditDialog
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
