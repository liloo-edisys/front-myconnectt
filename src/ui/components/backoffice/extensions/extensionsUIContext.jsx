import React, { createContext, useContext } from "react";

const ExtensionsUIContext = createContext();

export function useExtensionsUIContext() {
  return useContext(ExtensionsUIContext);
}

export const ExtensionsUIConsumer = ExtensionsUIContext.Consumer;

export function ExtensionsUIProvider({
  extensionsUIEvents,
  children,
  history
}) {
  const value = {
    openProcessDialog: extensionsUIEvents.openProcessDialog,
    openExtensionProfileDialog: extensionsUIEvents.openExtensionProfileDialog
  };

  return (
    <ExtensionsUIContext.Provider value={value}>
      {children}
    </ExtensionsUIContext.Provider>
  );
}
