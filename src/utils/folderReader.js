import Papa from "papaparse";

export const readFolderStructure = async () => {
  try {
    // Get structure and file stats
    const [structureResponse, statsResponse] = await Promise.all([
      fetch("/folder/structure.json"),
      fetch("/folder/filestats.json"),
    ]);

    const structure = await structureResponse.json();
    const fileStats = await statsResponse.json();

    return removeEmptyFolders(structure);
  } catch (error) {
    console.error("Error reading folder structure:", error);
    return {};
  }
};

const removeEmptyFolders = (structure) => {
  const result = {};

  Object.entries(structure).forEach(([key, value]) => {
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
    // Get the filestats.json data
    const statsResponse = await fetch("/folder/filestats.json");
    const fileStats = await statsResponse.json();

    const actualPath =
      typeof filePath === "string"
        ? filePath
        : filePath.path || filePath.fullPath;

    if (!actualPath) {
      throw new Error("Invalid file path");
    }

    const response = await fetch(`/folder/${actualPath}`);
    const text = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const pathParts = actualPath.split("/");
          const fileName = pathParts.pop();
          const folder = pathParts[0];

          // Get file stats
          const stats = fileStats[actualPath] || {};

          resolve({
            name: fileName,
            path: actualPath,
            data: results.data,
            headers: results.meta.fields,
            folder: folder,
            fullPath: actualPath,
            tags: [],
            createdDate: stats.createdAt, // Use actual creation date
            modifiedDate: stats.modifiedAt, // Use actual modified date
            size: stats.size,
          });
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error loading CSV file:", filePath);
    throw error;
  }
};
