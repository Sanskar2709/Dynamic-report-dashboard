import React, { useState } from "react";
import { Tag as TagIcon } from "lucide-react";

const TagManager = ({
  tags,
  setTags,
  settings,
  files,
  onTagFile,
  onRemoveTag,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const handleAddTag = () => {
    if (newTagName.trim() && selectedFile) {
      // Call the onTagFile prop to update parent state
      onTagFile(selectedFile, newTagName.trim());

      // Clear form
      setNewTagName("");
      setSelectedFile("");
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

          {/* File Selection Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File to Tag
            </label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Choose a file...</option>
              {files.map((file) => (
                <option key={file.path || file.name} value={file.name}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Tag Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                className="flex-1 p-2 border rounded"
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim() || !selectedFile}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Existing Tags */}
          <div>
            <h4 className="font-medium mb-2">Existing Tags</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(tags).length > 0 ? (
                Object.entries(tags).map(([tagName, tagData]) => (
                  <div key={tagName} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor:
                            settings.tagColors?.[tagName] || "#e5e7eb",
                        }}
                      >
                        {tagName}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({tagData.files?.length || 0} files)
                      </span>
                    </div>
                    {tagData.files?.length > 0 && (
                      <div className="mt-2 text-sm">
                        {tagData.files.map((fileName) => (
                          <div
                            key={fileName}
                            className="flex items-center justify-between py-1"
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
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tags created yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
