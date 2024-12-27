import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import {
  Folder,
  FileText,
  ChevronRight,
  Tag as TagIcon,
  Calendar,
} from "lucide-react";
import DataGrid from "./DataGrid";

/**
 * Animated CSS styles for temporary folder highlighting
 * Creates a glittering effect in desktop view and solid color in mobile
 */
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

  @media (max-width: 640px) {
    .temp-folder {
      animation: none;
      background-color: #F59E0B;
    }
  }
`;

/**
 * FolderTabs Component
 * Main component for handling file and folder navigation, grouping, and visualization
 *
 * @param {Array} files - Array of file objects with properties like name, path, tags
 * @param {Object} structure - Nested object representing folder hierarchhy
 * @param {number} pageSize - No. of items to display per page in DataGrid
 * @param {Object} tags - Object containing tag information and file associations
 * @param {Object} settings - User settings including colors for tags and folders
 * @param {Function} onTagFile - Callbak when a file is tagged
 * @param {Function} onRemoveTag - Callback when a tag is removed from a file
 */

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [grouping, setGrouping] = useState("none");
  const [isMobileView, setIsMobileView] = useState(false);

  // Add temp styles and handle responsive view
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = tempStyles;
    document.head.appendChild(styleSheet);

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      document.head.removeChild(styleSheet);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Helper functions for date handling

  /**
   *
   * @param {*} dateStr -
   * @returns Date
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-IN", options);
  };

  /**
   * Groups files by their assigned tags
   *
   * @param {Array} folderFiles - Array of files to be grouped
   * @returns {Object} Object containing tagged and untagged file groups
   */

  const getFilesByTags = (folderFiles) => {
    const tagGroups = {};
    const untaggedFiles = [];

    folderFiles.forEach((file) => {
      if (file.tags && file.tags.length > 0) {
        file.tags.forEach((tag) => {
          if (!tagGroups[tag]) {
            tagGroups[tag] = [];
          }
          tagGroups[tag].push(file);
        });
      } else {
        untaggedFiles.push(file);
      }
    });

    return { tagGroups, untaggedFiles };
  };

  // Get files by date

  const getFilesByDate = (folderFiles) => {
    const dateGroups = {};

    folderFiles.forEach((file) => {
      const creationDate = file.createdDate;
      if (creationDate) {
        const dateKey = new Date(creationDate).toISOString().split("T")[0];

        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = [];
        }
        dateGroups[dateKey].push(file);
      }
    });

    return Object.entries(dateGroups)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .reduce((acc, [date, files]) => {
        acc[date] = files;
        return acc;
      }, {});
  };

  const getCurrentContent = (path) => {
    let current = structure;
    for (const folder of path) {
      current = current[folder];
      if (!current) return { files: [], subFolders: [] };
    }

    const subFolders = Object.entries(current)
      .filter(([key, value]) => key !== "files" && typeof value === "object")
      .map(([key]) => ({
        name: key,
        hasFiles: !!current[key]?.files?.length,
      }));

    const folderFiles = current.files
      ? current.files
          .map((filePath) =>
            files.find((f) => f.path === filePath || f.fullPath === filePath)
          )
          .filter(Boolean)
      : [];

    return { files: folderFiles, subFolders };
  };

  const renderFile = (file, isSelected, onClick) => (
    <div
      key={file.path}
      onClick={onClick}
      className={`p-3 sm:p-2 rounded cursor-pointer flex items-center gap-2 
        ${isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}
        transition-colors duration-200 ease-in-out
        ${isMobileView ? "text-sm" : ""}`}
    >
      <FileText size={isMobileView ? 14 : 16} />
      <span className="truncate">{file.name}</span>
    </div>
  );

  const renderGroupedFiles = (folderFiles) => {
    if (grouping === "tags") {
      const { tagGroups, untaggedFiles } = getFilesByTags(folderFiles);

      return (
        <div className="space-y-4">
          {Object.entries(tagGroups).map(([tag, taggedFiles]) => (
            <div
              key={tag}
              className="border rounded-lg p-3 sm:p-4"
              style={{
                borderLeft: `4px solid ${settings.tagColors[tag] || "#3B82F6"}`,
              }}
            >
              <h3 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                <TagIcon size={isMobileView ? 14 : 16} />
                {tag} ({taggedFiles.length} files)
              </h3>
              <div className="space-y-2">
                {taggedFiles.map((file) =>
                  renderFile(file, selectedFile?.path === file.path, () =>
                    setSelectedFile(file)
                  )
                )}
              </div>
            </div>
          ))}

          {untaggedFiles.length > 0 && (
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="font-medium mb-2 text-sm sm:text-base">
                Untagged Files
              </h3>
              <div className="space-y-2">
                {untaggedFiles.map((file) =>
                  renderFile(file, selectedFile?.path === file.path, () =>
                    setSelectedFile(file)
                  )
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (grouping === "date") {
      const dateGroups = getFilesByDate(folderFiles);

      return (
        <div className="space-y-4">
          {Object.entries(dateGroups).map(([date, dateFiles]) => (
            <div key={date} className="border rounded-lg p-3 sm:p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Calendar size={isMobileView ? 14 : 16} />
                {formatDate(date)} ({dateFiles.length} files)
              </h3>
              <div className="space-y-2">
                {dateFiles.map((file) =>
                  renderFile(file, selectedFile?.path === file.path, () =>
                    setSelectedFile(file)
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Tab.Group>
        <Tab.List className="flex flex-nowrap gap-2 border-b pb-2 overflow-x-auto">
          {folderFiles.map((file) => (
            <Tab
              key={file.path}
              className={({ selected }) => `
                px-3 sm:px-4 py-2 rounded-t-lg outline-none whitespace-nowrap
                flex-shrink-0 text-sm sm:text-base
                ${
                  selected
                    ? "bg-green-500 text-white"
                    : "bg-green-50 hover:bg-green-100"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <FileText size={isMobileView ? 14 : 16} />
                <span>{file.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {folderFiles.map((file) => (
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
    );
  };

  /**
   * Renders main folder content including subfolders and files
   * Handles grouping controls and file display
   *
   * @returns {JSX.Element} Complete folder content view
   */

  const renderFolderContent = () => {
    const { files: folderFiles, subFolders } = getCurrentContent(currentPath);

    return (
      <div className="space-y-4">
        {folderFiles.length > 0 && (
          <div className="flex justify-end mb-4">
            <div className="relative w-full sm:w-auto">
              <select
                value={grouping}
                onChange={(e) => {
                  setGrouping(e.target.value);
                  setSelectedFile(null);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white border rounded appearance-none cursor-pointer 
                  hover:bg-gray-50 text-sm sm:text-base pr-8"
              >
                <option value="none">No Grouping</option>
                <option value="tags">Group by Tags</option>
                <option value="date">Group by Date</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronRight
                  className="transform rotate-90"
                  size={isMobileView ? 14 : 16}
                />
              </div>
            </div>
          </div>
        )}

        {subFolders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
            {subFolders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => {
                  setCurrentPath((prev) => [...prev, folder.name]);
                  setSelectedFile(null);
                  setGrouping("none");
                }}
                className={`p-3 sm:p-4 rounded-lg text-left 
                  ${
                    folder.name === "temp"
                      ? "temp-folder font-semibold text-amber-900"
                      : "bg-gray-50 hover:bg-gray-100"
                  }
                  transition-colors duration-200 ease-in-out
                  text-sm sm:text-base`}
              >
                <Folder
                  className={`inline mr-2 ${
                    folder.name === "temp" ? "text-amber-900" : ""
                  }`}
                  size={isMobileView ? 14 : 16}
                />
                {folder.name === "temp" ? "Temporary Files" : folder.name}
              </button>
            ))}
          </div>
        )}

        {folderFiles.length > 0 && (
          <div className="mt-4">
            {renderGroupedFiles(folderFiles)}
            {(grouping === "tags" || grouping === "date") && selectedFile && (
              <div className="mt-4 border-t pt-4">
                <DataGrid
                  files={[selectedFile]}
                  pageSize={pageSize}
                  tags={tags}
                  settings={settings}
                  onTagFile={onTagFile}
                  onRemoveTag={onRemoveTag}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      {currentPath.length > 0 && (
        <div className="flex items-center gap-2 text-gray-600 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setCurrentPath((prev) => prev.slice(0, -1));
              setSelectedFile(null);
              setGrouping("none");
            }}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 flex-shrink-0
              text-sm sm:text-base"
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder}>
                {index > 0 && (
                  <ChevronRight
                    size={isMobileView ? 14 : 16}
                    className="text-gray-400 flex-shrink-0"
                  />
                )}
                <span className="font-medium whitespace-nowrap text-sm sm:text-base">
                  {folder}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {renderFolderContent()}
    </div>
  );
};

export default FolderTabs;
