import React, { createContext, useContext } from "react";

const MissionsUIContext = createContext();

export function useMissionsUIContext() {
  return useContext(MissionsUIContext);
}

export const MissionsUIConsumer = MissionsUIContext.Consumer;

export function MissionsUIProvider({ missionsUIEvents, children, history }) {
  const value = {
    openDeleteDialog: missionsUIEvents.openDeleteDialog,
    openDisplayDialog: missionsUIEvents.openDisplayDialog
  };

  return (
    <MissionsUIContext.Provider value={value}>
      {children}
    </MissionsUIContext.Provider>
  );
}
