import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { Folder, FileText, ChevronRight } from "lucide-react";
import DataGrid from "./DataGrid";

// Animation styles for temp folder
const tempStyles = `
  @keyframes glitter {
    0% { background-color: #F59E0B; }
    50% { background-color: #FCD34D; }
    100% { background-color: #F59E0B; }
  }

  .temp-folder {
    animation: glitter 2s infinite;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    transition: all 0.3s ease;
  }

  .temp-folder:hover {
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.7);
    transform: scale(1.02);
  }
`;

const FolderTabs = ({
  files = [],
  structure = {},
  pageSize,
  tags,
  settings,
  onTagFile,
  onRemoveTag,
}) => {
  const [currentPath, setCurrentPath] = useState([]);

  // Add temp styles to document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = tempStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Helper function to get content of current folder
  const getCurrentContent = (path) => {
    // Navigate to current folder in structure
    let current = structure;
    for (const folder of path) {
      current = current[folder];
      if (!current) return { files: [], subFolders: [] };
    }

    // Get subfolders (excluding 'files' key)
    const subFolders = Object.entries(current)
      .filter(([key, value]) => key !== "files" && typeof value === "object")
      .map(([key]) => ({
        name: key,
        hasFiles: !!current[key].files?.length,
      }));

    // Get files for current folder
    const folderFiles = (current.files || [])
      .map((filePath) => files.find((f) => f.path === filePath))
      .filter(Boolean);

    return { files: folderFiles, subFolders };
  };

  // Get root folders (excluding empty ones)
  const rootFolders = Object.entries(structure)
    .filter(([_, value]) => {
      const hasFiles = value.files?.length > 0;
      const hasSubFolders = Object.entries(value).some(
        ([key, v]) => key !== "files" && typeof v === "object"
      );
      return hasFiles || hasSubFolders;
    })
    .map(([key]) => key);

  // Current folder content
  const { files: currentFiles, subFolders } = getCurrentContent(currentPath);

  // Navigate to folder
  const handleFolderClick = (folderName) => {
    setCurrentPath((prev) => [...prev, folderName]);
  };

  // Go back one level
  const handleBack = () => {
    setCurrentPath((prev) => prev.slice(0, -1));
  };

  // Helper to get folder color based on path
  const getFolderColor = (folderName, isRoot = false) => {
    if (folderName === "temp") {
      return {
        color: "#78350F", // Darker amber text
      };
    }

    if (isRoot) {
      const color = settings.tabColors[folderName];
      if (!color) return null;
      return {
        backgroundColor: color,
        color: "white",
        ":hover": {
          backgroundColor: color + "dd",
        },
      };
    }

    const fullPath = [...currentPath, folderName].join("/");
    const rootFolder = currentPath[0];
    const rootColor = settings.tabColors[rootFolder];

    if (!rootColor) return null;

    // Calculate lighter shade based on nesting level
    const level = currentPath.length;
    const opacity = Math.max(0.3, 1 - level * 0.2);
    const color =
      rootColor +
      Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0");

    return {
      backgroundColor: color,
      color: "white",
      ":hover": {
        backgroundColor: color + "dd",
      },
    };
  };

  return (
    <div className="space-y-4">
      {/* Path Navigation */}
      {currentPath.length > 0 && (
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <button
            onClick={handleBack}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder}>
                {index > 0 && (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
                <span className="font-medium">{folder}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Root Level or Subfolders */}
      <div className="grid grid-cols-3 gap-4">
        {(currentPath.length === 0 ? rootFolders : subFolders).map((folder) => {
          const folderName = typeof folder === "string" ? folder : folder.name;
          const style = getFolderColor(folderName, currentPath.length === 0);
          const isTemp = folderName === "temp";

          return (
            <button
              key={folderName}
              onClick={() => handleFolderClick(folderName)}
              className={`p-4 rounded-lg text-left group transition-colors duration-150
                ${isTemp ? "temp-folder font-semibold" : ""}
              `}
              style={
                !isTemp
                  ? style || {
                      backgroundColor: "rgb(249 250 251)",
                      ":hover": {
                        backgroundColor: "rgb(243 244 246)",
                      },
                    }
                  : style
              }
            >
              <div className="flex items-center gap-2">
                <Folder
                  size={20}
                  className={
                    isTemp
                      ? "text-amber-900"
                      : style
                      ? "text-white"
                      : "text-blue-500 group-hover:text-blue-600"
                  }
                />
                <span
                  className={`font-medium ${isTemp ? "text-amber-900" : ""}`}
                >
                  {isTemp ? "Temporary Files" : folderName}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Files in Current Folder */}
      {currentFiles.length > 0 && (
        <div className="mt-6">
          <Tab.Group>
            <Tab.List className="flex flex-wrap gap-2 border-b pb-2">
              {currentFiles.map((file) => (
                <Tab
                  key={file.path}
                  className={({ selected }) => `
                    px-4 py-2 rounded-t-lg outline-none
                    ${
                      selected
                        ? "bg-green-500 text-white"
                        : "bg-green-50 hover:bg-green-100"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} />
                    <span>{file.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="mt-4">
              {currentFiles.map((file) => (
                <Tab.Panel key={file.path}>
                  <DataGrid
                    files={[file]}
                    pageSize={pageSize}
                    tags={tags}
                    settings={settings}
                    onTagFile={onTagFile}
                    onRemoveTag={onRemoveTag}
                  />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
};

export default FolderTabs;
