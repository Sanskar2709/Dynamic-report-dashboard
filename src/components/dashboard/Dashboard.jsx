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

const Dashboard = () => {
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

  useEffect(() => {
    loadAllFiles();
    return () => clearTempFiles();
  }, []);

  // Recursive function to get all file paths from structure
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

  const loadAllFiles = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Reading folder structure...");

      const structure = await readFolderStructure();
      setFolderStructure(structure);

      setLoadingMessage("Loading CSV files...");

      // Get all file paths from structure
      const allFilePaths = getAllFilePaths(structure);

      // Load all files concurrently
      const loadedFiles = await Promise.all(
        allFilePaths.map(async (filePath) => {
          try {
            return await loadCSVFromPublic(filePath);
          } catch (error) {
            console.error(`Error loading file ${filePath}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed loads
      setFiles(loadedFiles.filter(Boolean));
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading files:", error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (newFiles) => {
    setIsLoading(true);
    setLoadingMessage("Processing uploaded files...");

    try {
      const processedFiles = newFiles.map((file) => ({
        ...file,
        folder: "temp", // All uploaded files go to temp folder
      }));

      // Update structure to include temp folder
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

  const handleTagFile = (fileName, tag) => {
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
  };

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
          {/* Controls */}
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

          {/* Folder Structure */}
          <FolderTabs
            structure={folderStructure}
            files={files}
            pageSize={pageSize}
            tags={tags}
            settings={settings}
            onTagFile={handleTagFile}
            onRemoveTag={handleRemoveTag}
          />

          {/* Page Size Selector */}
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
