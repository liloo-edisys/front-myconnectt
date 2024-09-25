import React, { createContext, useContext } from "react";

const MailTemplatesUIContext = createContext();

export function useMailTemplatesUIContext() {
  return useContext(MailTemplatesUIContext);
}

export const MailTemplatesUIConsumer = MailTemplatesUIContext.Consumer;

export function MailTemplatesUIProvider({
  extensionsUIEvents,
  children,
  history
}) {
  const value = {
    openExtensionProfileDialog: extensionsUIEvents.openExtensionProfileDialog
  };

  return (
    <MailTemplatesUIContext.Provider value={value}>
      {children}
    </MailTemplatesUIContext.Provider>
  );
}
