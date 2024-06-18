import React, { createContext, useContext } from "react";

const InterimaireFavoritesUIContext = createContext();

export function useInterimaireFavoritesUIContext() {
  return useContext(InterimaireFavoritesUIContext);
}

export const InterimaireFavoritesUIConsumer =
  InterimaireFavoritesUIContext.Consumer;

export function InterimaireFavoritesUIProvider({
  missionsUIEvents,
  children,
  history
}) {
  const value = {
    openDisplayDialog: missionsUIEvents.openDisplayDialog,
    openApproveDialog: missionsUIEvents.openApproveDialog,
    openDeclineMatchingDialog: missionsUIEvents.openDeclineMatchingDialog
  };

  return (
    <InterimaireFavoritesUIContext.Provider value={value}>
      {children}
    </InterimaireFavoritesUIContext.Provider>
  );
}
