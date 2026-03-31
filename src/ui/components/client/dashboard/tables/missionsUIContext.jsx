import React, { createContext, useContext } from "react";

const MissionsUIContext = createContext();

export function useMissionsUIContext() {
  return useContext(MissionsUIContext);
}

export const MissionsUIConsumer = MissionsUIContext.Consumer;

export function MissionsUIProvider({ missionsUIEvents, children, history }) {
  const value = {
    openDeleteDialog: missionsUIEvents.openDeleteDialog,
    openDisplayDialog: missionsUIEvents.openDisplayDialog,
    editMission: missionsUIEvents.editMission,
    openMatchingDialog: missionsUIEvents.openMatchingDialog,
    openResumeDialog: missionsUIEvents.openResumeDialog,
    openDeclineDialog: missionsUIEvents.openDeclineDialog,
    openValidateDialog: missionsUIEvents.openValidateDialog,
    openMissionProfileDialog: missionsUIEvents.openMissionProfileDialog,
    openDeleteApplicationDialog: missionsUIEvents.openDeleteApplicationDialog
  };

  return (
    <MissionsUIContext.Provider value={value}>
      {children}
    </MissionsUIContext.Provider>
  );
}
