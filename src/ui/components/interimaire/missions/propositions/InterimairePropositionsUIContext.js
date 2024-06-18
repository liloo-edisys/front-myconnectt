import React, { createContext, useContext } from "react";

const InterimairePropositionsUIContext = createContext();

export function useInterimairePropositionsUIContext() {
  return useContext(InterimairePropositionsUIContext);
}

export const InterimairePropositionsUIConsumer =
  InterimairePropositionsUIContext.Consumer;

export function InterimairePropositionsUIProvider({
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
    <InterimairePropositionsUIContext.Provider value={value}>
      {children}
    </InterimairePropositionsUIContext.Provider>
  );
}
