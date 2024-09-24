import React, { createContext, useContext } from "react";

const UIContext = createContext();

export function useUIContext() {
  return useContext(UIContext);
}

export const UIConsumer = UIContext.Consumer;

export function UIProvider({ UIEvents, children }) {
  const value = {
    openDisplayDialog: UIEvents.openDisplayDialog
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
