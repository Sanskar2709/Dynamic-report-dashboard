import Papa from "papaparse";

/**
 * In-memory storage for temporary CSV files
 * Cleared when the window/tab is closed
 * @type {Array<Object>}
 */
let tempFiles = [];

/**
 * Adds a CSV file to temporary storage with parsed content
 * Stores file metadata in localStorage for persistence
 * 
 * @param {File} file - File object from file input or drag-and-drop
 * @returns {Promise<Object>} Promise resolving to the processed temp file object
 * 
 * @throws {Error} If file reading fails or CSV parsing fails
 * 
 */

export const addToTempStorage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target.result;

        // Configure Papa Parse options for CSV parsing
        Papa.parse(content, {
          header: true,           // First row is headers
          skipEmptyLines: true,   // Skip empty rows
          dynamicTyping: true,    // Convert numbers and booleans
          complete: (results) => {
            // Create temporary file object with metadata
            const tempFile = {
              name: file.name,
              data: results.data,           // Parsed CSV rows
              headers: results.meta.fields, // CSV column headers
              folder: "temp",
              createdDate: new Date().toISOString(),
              path: `temp/${file.name}`,
              size: file.size,
              type: file.type,
              tags: [],                    // Initialize empty tags array
            };

            // Add to in-memory storage
            tempFiles.push(tempFile);

            // Persist metadata in localStorage
            const metadata = {
              createdDate: tempFile.createdDate,
              path: tempFile.path,
              tags: [],
            };
            localStorage.setItem(
              `file_${file.name}_metadata`,
              JSON.stringify(metadata)
            );

            resolve(tempFile);
          },
          error: (error) => reject(error),
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};


export const getTempFiles = () => {
  return tempFiles.map((file) => {
    // Check for metadata in localStorage
    const storedMetadata = localStorage.getItem(`file_${file.name}_metadata`);
    if (storedMetadata) {
      const metadata = JSON.parse(storedMetadata);
      return {
        ...file,
        ...metadata, // Overlay stored metadata on file object
      };
    }
    return file;
  });
};

/**
 * Clears all temporary files and their metadata
 * Called automatically when the window/tab is closed
 * 
 * @example
 * // Clear all temporary fies
 * clearTempFiles();
 */
export const clearTempFiles = () => {
  tempFiles = []; // Clear in-memory storage

  // Clear metadata from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("file_") && key.endsWith("_metadata")) {
      localStorage.removeItem(key);
    }
  }
};

/**
 * Setup cleanup on window close
 * Ensures temporary files are cleared when the user leaves
 */
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    clearTempFiles();
  });
}
