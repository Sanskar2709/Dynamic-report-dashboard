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
              uploadTime: new Date().toISOString(),
              tags: [],
            };

            tempFiles.push(tempFile);
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
  return tempFiles;
};

export const clearTempFiles = () => {
  tempFiles = [];
};

// Add event listener for window unload to clear temp files
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    clearTempFiles();
  });
}
