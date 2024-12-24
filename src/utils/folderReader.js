import Papa from "papaparse";

export const readFolderStructure = async () => {
  try {
    const response = await fetch("/folder/structure.json");
    const structure = await response.json();
    return structure;
  } catch (error) {
    console.error("Error reading folder structure:", error);
    return {};
  }
};

export const loadCSVFromPublic = async (filePath) => {
  try {
    const response = await fetch(`/folder/${filePath}`);
    const text = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          // Extract folder name from the path (first directory in path)
          const pathParts = filePath.split("/");
          const folder = pathParts.length > 1 ? pathParts[0] : "root";

          resolve({
            name: pathParts[pathParts.length - 1], // Get file name
            path: filePath,
            data: results.data,
            headers: results.meta.fields,
            folder: folder,
            tags: [],
          });
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error loading CSV file:", error);
    throw error;
  }
};
