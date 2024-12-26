import React, { useState, useEffect } from "react";
import FileUploader from "./FileUploader";
import TagManager from "./TagManager";
import Settings from "./Settings";
import Loading from "../common/Loading";
import FolderTabs from "./FolderTabs";
import {
  readFolderStructure,
  loadCSVFromPublic,
} from "../../utils/folderReader";
import { clearTempFiles } from "../../utils/tempHandler";

/**
 * Dashboard component is the main page of the application.
 * It manages the state of files, tags, settings, and loading status.
 * It renders the FileUploader, TagManager, Settings, and FolderTabs components.
 */
const Dashboard = () => {
  /**
   *  variables
   * - isLoading: boolean flag indicating if files are being loaded
   * - loadingMessage: message to display while files are loading
   * - folderStructure: object representing the folder structure
   * - files: array of loaded CSV files
   * - pageSize: number of rows to display per page
   * - tags: object containing tag information
   * - settings: object containing application settings
   */
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading files...");
  const [folderStructure, setFolderStructure] = useState({});
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [tags, setTags] = useState({});
  const [settings, setSettings] = useState({
    tabColors: {},
    tagColors: {},
  });

  /**
   * useEffect hook to load all files when the component mounts
   * and clear temp files when the component unmounts.
   */
  useEffect(() => {
    loadAllFiles();
    return () => clearTempFiles();
  }, []);

  /**
   * Recursively traverses the folder structure and returns an array of all file paths.
   * @param {Object} structure - The folder structure object.
   * @returns {Array} An array of file paths.
   */
  const getAllFilePaths = (structure) => {
    let paths = [];
    const traverse = (obj) => {
      if (obj.files) {
        paths = [...paths, ...obj.files];
      }
      Object.entries(obj).forEach(([key, value]) => {
        if (key !== "files" && typeof value === "object") {
          traverse(value);
        }
      });
    };
    traverse(structure);
    return paths;
  };

  /**
   * Loads all CSV files from the public folder.
   * Updates the loading state and messages while files are being loaded.
   */
  const loadAllFiles = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Reading folder structure...");

      const structure = await readFolderStructure();
      setFolderStructure(structure);

      setLoadingMessage("Loading CSV files...");

      const allFilePaths = getAllFilePaths(structure);

      const loadedFiles = await Promise.all(
        allFilePaths.map(async (filePath) => {
          try {
            const pathString =
              typeof filePath === "string" ? filePath : filePath.path;
            return await loadCSVFromPublic(pathString);
          } catch (error) {
            console.error(`Error loading file ${filePath}:`, error);
            return null;
          }
        })
      );

      setFiles(loadedFiles.filter(Boolean));
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading files:", error);
      setIsLoading(false);
    }
  };

  /**
   * Handles the file upload process.
   * Updates the folder structure and files state with the uploaded files.
   * @param {Array} newFiles - An array of uploaded files.
   */
  const handleFileUpload = async (newFiles) => {
    setIsLoading(true);
    setLoadingMessage("Processing uploaded files...");

    try {
      const processedFiles = newFiles.map((file) => ({
        ...file,
        folder: "temp",
      }));

      setFolderStructure((prev) => ({
        ...prev,
        temp: {
          files: [
            ...(prev.temp?.files || []),
            ...processedFiles.map((file) => file.path),
          ],
        },
      }));

      setFiles((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error("Error processing uploaded files:", error);
    }

    setIsLoading(false);
  };

  /**
   * Handles the tagging of a file.
   * Updates the files and tags state with the new tag information.
   * @param {string} fileName - The name of the file to tag.
   * @param {string} tag - The tag to add to  file.
   * @param {string} color - The color associated with the tag.
   */
  const handleTagFile = (fileName, tag, color) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.name === fileName) {
          return {
            ...file,
            tags: [...(file.tags || []), tag],
          };
        }
        return file;
      })
    );

    setTags((prev) => ({
      ...prev,
      [tag]: {
        ...(prev[tag] || {}),
        files: [...(prev[tag]?.files || []), fileName],
      },
    }));

    setSettings((prev) => ({
      ...prev,
      tagColors: {
        ...prev.tagColors,
        [tag]: color,
      },
    }));
  };

  /**
   * Handles the removal of a tag from a file.
   * Updates the files and tags state by removing the tag from the file.
   * @param {string} fileName - The name of the file to remove the tag from.
   * @param {string} tag - The tag to remove from the file.
   */
  const handleRemoveTag = (fileName, tag) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.name === fileName) {
          return {
            ...file,
            tags: (file.tags || []).filter((t) => t !== tag),
          };
        }
        return file;
      })
    );

    setTags((prev) => ({
      ...prev,
      [tag]: {
        ...(prev[tag] || {}),
        files: (prev[tag]?.files || []).filter((f) => f !== fileName),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <Loading message={loadingMessage} />}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-6">
            <FileUploader onFileUpload={handleFileUpload} />
            <div className="flex gap-4">
              <TagManager
                tags={tags}
                setTags={setTags}
                settings={settings}
                files={files}
                onTagFile={handleTagFile}
                onRemoveTag={handleRemoveTag}
              />
              <Settings
                settings={settings}
                setSettings={setSettings}
                structure={folderStructure}
              />
            </div>
          </div>

          <FolderTabs
            structure={folderStructure}
            files={files}
            pageSize={pageSize}
            tags={tags}
            settings={settings}
            onTagFile={handleTagFile}
            onRemoveTag={handleRemoveTag}
          />

          <div className="mt-4">
            <label className="mr-2">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded p-1"
            >
              {[20, 50, 100, 1000, "All"].map((size) => (
                <option key={size} value={size === "All" ? -1 : size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
