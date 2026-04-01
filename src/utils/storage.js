function safeRead(storage, key, fallback = "") {
  try {
    if (typeof window === "undefined" || !storage) {
      return fallback;
    }

    const value = storage.getItem(key);
    return value ?? fallback;
  } catch (error) {
    console.warn(`Storage read failed for "${key}":`, error);
    return fallback;
  }
}

function safeWrite(storage, key, value) {
  try {
    if (typeof window === "undefined" || !storage) {
      return;
    }

    storage.setItem(key, value);
  } catch (error) {
    console.warn(`Storage write failed for "${key}":`, error);
  }
}

function safeRemove(storage, key) {
  try {
    if (typeof window === "undefined" || !storage) {
      return;
    }

    storage.removeItem(key);
  } catch (error) {
    console.warn(`Storage remove failed for "${key}":`, error);
  }
}

export function getLocalStorageItem(key, fallback = "") {
  return safeRead(typeof window !== "undefined" ? window.localStorage : null, key, fallback);
}

export function setLocalStorageItem(key, value) {
  safeWrite(typeof window !== "undefined" ? window.localStorage : null, key, value);
}

export function removeLocalStorageItem(key) {
  safeRemove(typeof window !== "undefined" ? window.localStorage : null, key);
}

export function getSessionStorageItem(key, fallback = "") {
  return safeRead(typeof window !== "undefined" ? window.sessionStorage : null, key, fallback);
}

export function setSessionStorageItem(key, value) {
  safeWrite(typeof window !== "undefined" ? window.sessionStorage : null, key, value);
}

export function removeSessionStorageItem(key) {
  safeRemove(typeof window !== "undefined" ? window.sessionStorage : null, key);
}
