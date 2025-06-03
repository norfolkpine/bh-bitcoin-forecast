const DB_NAME = 'ImageDB';
const STORE_NAME = 'Images';

/**
 * Open or create an IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest)?.result;
      if (!db?.objectStoreNames.contains(STORE_NAME)) {
        db?.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an image as a Blob to IndexedDB.
 * @param {string} id - The key for the image.
 * @param {Blob} blob - The image Blob.
 */
export async function saveImageToIndexedDB(id: string, blob: Blob) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = (db as IDBDatabase).transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put({ id, blob });

    request.onsuccess = () => resolve(void 0);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load an image from IndexedDB.
 * @param {string} id - The key for the image.
 * @returns {Promise<Blob>} - The image Blob.
 */
export async function loadImageFromIndexedDB(id: string) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = (db as IDBDatabase).transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) resolve(request.result.blob);
      else reject(new Error('Image not found in IndexedDB.'));
    };

    request.onerror = () => reject(request.error);
  });
}
