import Papa from "papaparse";

// In-memory storage for temporary files
let tempFiles = [];

export const addToTempStorage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target.result;

        // Parse CSV content
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            const tempFile = {
              name: file.name,
              data: results.data,
              headers: results.meta.fields,
              folder: "temp",
              createdDate: new Date().toISOString(), // Store creation date
              path: `temp/${file.name}`,
              size: file.size,
              type: file.type,
              tags: [],
            };

            tempFiles.push(tempFile);

            // Store metadata in localStorage
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
    // Get metadata from localStorage
    const storedMetadata = localStorage.getItem(`file_${file.name}_metadata`);
    if (storedMetadata) {
      const metadata = JSON.parse(storedMetadata);
      return {
        ...file,
        ...metadata,
      };
    }
    return file;
  });
};

export const clearTempFiles = () => {
  tempFiles = [];
  // Clear metadata from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("file_") && key.endsWith("_metadata")) {
      localStorage.removeItem(key);
    }
  }
};

// Add event listener for window unload to clear temp files
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    clearTempFiles();
  });
}
