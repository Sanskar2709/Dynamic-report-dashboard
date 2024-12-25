import Papa from "papaparse";

export const readFolderStructure = async () => {
  try {
    const response = await fetch("/folder/structure.json");
    const structure = await response.json();

    // Remove empty folders (no files and no subfolders with files)
    const cleanStructure = removeEmptyFolders(structure);
    return cleanStructure;
  } catch (error) {
    console.error("Error reading folder structure:", error);
    return {};
  }
};

// Helper function to remove empty folders
const removeEmptyFolders = (structure) => {
  const result = {};

  Object.entries(structure).forEach(([key, value]) => {
    // Check if folder has files or non-empty subfolders
    const hasFiles = value.files && value.files.length > 0;
    const hasSubfolders = Object.keys(value).some((k) => k !== "files");

    if (hasFiles || hasSubfolders) {
      result[key] = value;
    }
  });

  return result;
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
          const pathParts = filePath.split("/");
          const fileName = pathParts.pop();
          const folder = pathParts[0];

          resolve({
            name: fileName,
            path: filePath,
            data: results.data,
            headers: results.meta.fields,
            folder: folder,
            fullPath: filePath,
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
