import React, { useState } from "react";
import { Tag as TagIcon } from "lucide-react";

const TagManager = ({
  tags,
  setTags,
  files = [],
  settings,
  onTagFile,
  onRemoveTag,
  //applyTagGrouping,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#3B82F6");

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      // Add tag to selected files
      selectedFiles.forEach((fileName) => {
        onTagFile(fileName, newTagName.trim(), selectedColor);
      });
      

      // Reset form
      setNewTagName("");
      setSelectedFiles([]);
      setSelectedColor("#3B82F6");
    }
  };

 

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        <TagIcon size={16} />
        <span>Manage Tags</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Tag Manager</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Create New Tag */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Tag Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="flex-1 px-3 py-2 border rounded"
                />
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                  title="Choose tag color"
                />
              </div>
            </div>

            {/* File Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Files to Tag
              </label>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {files.map((file) => (
                  <label
                    key={file.path}
                    className="flex items-center gap-2 p-1 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.name)}
                      onChange={(e) => {
                        setSelectedFiles((prev) =>
                          e.target.checked
                            ? [...prev, file.name]
                            : prev.filter((f) => f !== file.name)
                        );
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{file.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || selectedFiles.length === 0}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Tag
            </button>
          </div>

          {/* Existing Tags */}
          <div>
            <h4 className="font-medium mb-2">Existing Tags</h4>
            <div className="space-y-2">
              {Object.entries(tags).map(([tagName, tagData]) => (
                <div
                  key={tagName}
                  className="p-2 bg-gray-50 rounded"
                  style={{
                    borderLeft: `4px solid ${
                      settings.tagColors[tagName] || "#3B82F6"
                    }`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{tagName}</span>
                      <span className="text-xs text-gray-500">
                        ({tagData.files?.length || 0} files)
                      </span>
                    </div>
                  </div>

                  {/* Tagged Files */}
                  {tagData.files?.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      {tagData.files.map((fileName) => (
                        <div
                          key={fileName}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span className="text-gray-600">{fileName}</span>
                          <button
                            onClick={() => onRemoveTag(fileName, tagName)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
