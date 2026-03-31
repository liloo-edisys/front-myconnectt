import React, { createContext, useContext } from "react";

const InterimaireMissionsUIContext = createContext();

export function useInterimaireMissionsUIContext() {
  return useContext(InterimaireMissionsUIContext);
}

export const InterimaireMissionsUIConsumer =
  InterimaireMissionsUIContext.Consumer;

export function InterimaireMissionsUIProvider({
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
    <InterimaireMissionsUIContext.Provider value={value}>
      {children}
    </InterimaireMissionsUIContext.Provider>
  );
}
