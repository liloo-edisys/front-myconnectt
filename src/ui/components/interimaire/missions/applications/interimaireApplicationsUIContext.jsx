import React, { createContext, useContext } from "react";

const InterimaireApplicationsUIContext = createContext();

export function useInterimaireApplicationsUIContext() {
  return useContext(InterimaireApplicationsUIContext);
}

export const InterimaireApplicationsUIConsumer =
  InterimaireApplicationsUIContext.Consumer;

export function InterimaireApplicationsUIProvider({
  missionsUIEvents,
  children,
  history
}) {
  const value = {
    openDisplayDialog: missionsUIEvents.openDisplayDialog,
    openApproveDialog: missionsUIEvents.openApproveDialog,
    openDeclineDialog: missionsUIEvents.openDeclineDialog
  };

  return (
    <InterimaireApplicationsUIContext.Provider value={value}>
      {children}
    </InterimaireApplicationsUIContext.Provider>
  );
}
