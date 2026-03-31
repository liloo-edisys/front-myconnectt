import React, { createContext, useContext } from "react";

const ContactsUIContext = createContext();

export function useContactsUIContext() {
  return useContext(ContactsUIContext);
}

export const ContactsUIConsumer = ContactsUIContext.Consumer;

export function ContactsUIProvider({ contactsUIEvents, children }) {
  const value = {
    newContactButtonClick: contactsUIEvents.newCompanyButtonClick,
    openEditContactModal: contactsUIEvents.openEditContactModal,
    openDeleteContactDialog: contactsUIEvents.openDeleteContactDialog
  };

  return (
    <ContactsUIContext.Provider value={value}>
      {children}
    </ContactsUIContext.Provider>
  );
}
