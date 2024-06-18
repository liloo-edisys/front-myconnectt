import React, { createContext, useContext } from "react";

const InterimaireMatchingUIContext = createContext();

export function useMissionsUIContext() {
  return useContext(InterimaireMatchingUIContext);
}

export const InterimaireMatchingUIConsumer =
  InterimaireMatchingUIContext.Consumer;

export function InterimaireMatchingUIProvider({
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
    <InterimaireMatchingUIContext.Provider value={value}>
      {children}
    </InterimaireMatchingUIContext.Provider>
  );
}
