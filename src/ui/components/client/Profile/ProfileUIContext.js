import React, { createContext, useContext } from "react";

const ProfileUIContext = createContext();

export function useProfileUIContext() {
  return useContext(ProfileUIContext);
}

export const ProfileUIConsumer = ProfileUIContext.Consumer;

export function ProfileUIProvider({ profileUIEvents, children }) {
  const value = {
    openDeleteProfileDialog: profileUIEvents.openDeleteProfileDialog
  };

  return (
    <ProfileUIContext.Provider value={value}>
      {children}
    </ProfileUIContext.Provider>
  );
}
