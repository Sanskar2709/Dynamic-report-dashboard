import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { Folder, FileText } from "lucide-react";
import Papa from "papaparse";
import FileUploader from "./FileUploader";
import DataGrid from "./DataGrid";
import TagManager from "./TagManager";
import Settings from "./Settings";
import Loading from "../common/Loading";
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
  const [selectedFolder, setSelectedFolder] = useState(0);
  const [selectedFile, setSelectedFile] = useState({});

  useEffect(() => {
    loadAllFiles();
  }, []);

  const loadAllFiles = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Reading folder structure...");

      const structure = await readFolderStructure();
      setFolderStructure(structure);

      setLoadingMessage("Loading CSV files...");
      const loadedFiles = [];

      const processFolder = async (folder, folderPath = "") => {
        if (folder.files) {
          for (const filePath of folder.files) {
            try {
              const fileData = await loadCSVFromPublic(filePath);
              loadedFiles.push(fileData);
            } catch (error) {
              console.error(`Error loading file ${filePath}:`, error);
            }
          }
        }

        for (const [subFolderName, subFolder] of Object.entries(folder)) {
          if (subFolderName !== "files") {
            const newPath = folderPath
              ? `${folderPath}/${subFolderName}`
              : subFolderName;
            await processFolder(subFolder, newPath);
          }
        }
      };

      await processFolder(structure);
      setFiles(loadedFiles);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading files:", error);
      setIsLoading(false);
    }
  };

  // Get unique folders and their files
  const foldersWithFiles = files.reduce((acc, file) => {
    const folder = file.folder;
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(file);
    return acc;
  }, {});

  const folders = Object.keys(foldersWithFiles).sort();

  const handleFileUpload = async (newFiles) => {
    setIsLoading(true);
    setLoadingMessage("Processing uploaded files...");

    try {
      // Add files to state - they're already processed and in temp storage
      setFiles((prev) => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Error processing uploaded files:", error);
    }

    setIsLoading(false);
  };

  // Clean up temp files when component unmounts
  useEffect(() => {
    return () => {
      clearTempFiles();
    };
  }, []);

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
              <Settings settings={settings} setSettings={setSettings} />
            </div>
          </div>

          {/* Folder Tabs */}
          <Tab.Group
            selectedIndex={selectedFolder}
            onChange={(index) => {
              setSelectedFolder(index);
              setSelectedFile({});
            }}
          >
            <Tab.List className="flex space-x-2 border-b">
              {folders.map((folder) => (
                <Tab
                  key={folder}
                  className={({ selected }) => `
                    px-4 py-2 rounded-t-lg outline-none
                    ${
                      folder === "temp"
                        ? selected
                          ? "bg-yellow-500 text-white"
                          : "bg-yellow-100 hover:bg-yellow-200"
                        : selected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                    ${folder === "temp" ? "flex items-center gap-2" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} />
                    <span>{folder}</span>
                    {folder === "temp" && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-600 text-white rounded-full">
                        Temporary
                      </span>
                    )}
                  </div>
                </Tab>
              ))}
            </Tab.List>

            {/* File Tabs */}
            <Tab.Panels>
              {folders.map((folder) => (
                <Tab.Panel key={folder} className="pt-4">
                  <Tab.Group
                    selectedIndex={selectedFile[folder] || 0}
                    onChange={(index) =>
                      setSelectedFile((prev) => ({
                        ...prev,
                        [folder]: index,
                      }))
                    }
                  >
                    <Tab.List className="flex space-x-2 border-b mb-4">
                      {foldersWithFiles[folder].map((file) => (
                        <Tab
                          key={file.name}
                          className={({ selected }) => `
                            px-4 py-2 rounded-t-lg outline-none
                            ${
                              folder === "temp"
                                ? selected
                                  ? "bg-yellow-400 text-white"
                                  : "bg-yellow-50 hover:bg-yellow-100"
                                : selected
                                ? "bg-green-500 text-white"
                                : "bg-gray-50 hover:bg-gray-100"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            <span>{file.name}</span>
                          </div>
                        </Tab>
                      ))}
                    </Tab.List>

                    <Tab.Panels>
                      {foldersWithFiles[folder].map((file) => (
                        <Tab.Panel key={file.name}>
                          <DataGrid
                            files={[file]}
                            pageSize={pageSize}
                            tags={tags}
                            settings={settings}
                            onTagFile={handleTagFile}
                            onRemoveTag={handleRemoveTag}
                          />
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </Tab.Group>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>

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
