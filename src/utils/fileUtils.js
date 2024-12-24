import Papa from "papaparse";
import { fileService } from "../services/fileService";

export const scanDirectory = async (path = "/folder") => {
  try {
    const structure = {};
    const files = await fileService.readdir(path);

    for (const file of files) {
      const fullPath = `${path}/${file}`;
      const stats = await fileService.stat(fullPath);

      if (stats.isDirectory()) {
        structure[file] = await scanDirectory(fullPath);
      }
    }

    const folderFiles = await fileService.getAllFiles(path);
    if (folderFiles.length > 0) {
      structure.files = folderFiles;
    }

    return structure;
  } catch (error) {
    console.error("Error scanning directory:", error);
    return {};
  }
};

export const parseCSVContent = (content) => {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results),
      error: (error) => reject(error),
    });
  });
};

export const loadCSVFile = async (file) => {
  try {
    const content = await file.text();
    const results = await parseCSVContent(content);

    return {
      name: file.name,
      data: results.data,
      headers: results.meta.fields,
      folder: "Uploads",
      tags: [],
    };
  } catch (error) {
    console.error("Error loading CSV file:", error);
    throw error;
  }
};
