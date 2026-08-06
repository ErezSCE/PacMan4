import '@testing-library/jest-dom/extend-expect';

// Provide a simple in‑memory mock for localStorage when running in a Node environment (e.g., Jest tests).
if (typeof global.localStorage === 'undefined') {
  const storage = {} as Record<string, string>;
  global.localStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
    setItem(key, value) {
      storage[key] = value;
    },
    removeItem(key) {
      delete storage[key];
    },
    clear() {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
    // The following properties are part of the Storage interface but not needed for tests.
    key(_index) { return null; },
    length: 0,
  } as any;
}
