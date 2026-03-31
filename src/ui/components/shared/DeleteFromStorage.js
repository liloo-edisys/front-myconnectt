let storage = window.localStorage;

export function deleteFromStorage(key) {
  storage.removeItem(key);
}
