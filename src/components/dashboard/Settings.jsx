import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";


/**
 * Settings Component
 * Manages color customisation for folders and tags
 * Provides a modal interface for settings configuraton
 * 
 * @param {Object} settings - Current settings including colors for tabs and tags
 * @param {Function} setSettings - Function to update settings state
 * @param {Object} structure - Folder structure for determining main folders
 */


const Settings = ({ settings, setSettings, structure = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get main folders from structure
  const mainFolders = Object.keys(structure).filter((key) => {
    const hasFiles = structure[key]?.files?.length > 0;
    const hasSubFolders = Object.entries(structure[key]).some(
      ([k, v]) => k !== "files" && typeof v === "object"
    );
    return hasFiles || hasSubFolders;
  });

  // Function to lighten a color
  const lightenColor = (color, amount) => {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Lighten
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    // Convert back to hex
    const rr = r.toString(16).padStart(2, "0");
    const gg = g.toString(16).padStart(2, "0");
    const bb = b.toString(16).padStart(2, "0");

    return `#${rr}${gg}${bb}`;
  };

  // Handle color change for a main folder
  const handleColorChange = (folder, color) => {
    const newColors = { ...settings.tabColors };
    newColors[folder] = color;

    // Update colors for all subfolders
    const updateSubFolderColors = (parentFolder, parentColor, level = 1) => {
      const subFolders = Object.keys(structure[parentFolder] || {}).filter(
        (key) =>
          key !== "files" && typeof structure[parentFolder][key] === "object"
      );

      subFolders.forEach((subFolder) => {
        const fullPath = `${parentFolder}/${subFolder}`;
        // Lighten color more for each level deep
        newColors[fullPath] = lightenColor(parentColor, level * 30);

        // Recursively update sub-subfolder colors
        updateSubFolderColors(fullPath, parentColor, level + 1);
      });
    };

    updateSubFolderColors(folder, color);

    setSettings((prev) => ({
      ...prev,
      tabColors: newColors,
    }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <SettingsIcon size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Tab Colors */}
          <div className="space-y-4">
            <h4 className="font-medium mb-2">Tab Colors</h4>
            {mainFolders.map((folder) => (
              <div key={folder} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{folder}</span>
                  <div className="text-xs text-gray-500">
                    (subtabs will auto-adjust)
                  </div>
                </div>
                <input
                  type="color"
                  value={settings.tabColors[folder] || "#ffffff"}
                  onChange={(e) => handleColorChange(folder, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            ))}
            <div className="mt-2 text-xs text-gray-500">
              Note: Subfolder colors will automatically be lighter shades of the
              parent folder's color.
            </div>
          </div>

          {/* Tag Colors */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Tag Colors</h4>
            <div className="space-y-2">
              {Object.keys(settings.tagColors).map((tag) => (
                <div key={tag} className="flex items-center justify-between">
                  <span>{tag}</span>
                  <input
                    type="color"
                    value={settings.tagColors[tag] || "#ffffff"}
                    onChange={(e) => {
                      setSettings((prev) => ({
                        ...prev,
                        tagColors: {
                          ...prev.tagColors,
                          [tag]: e.target.value,
                        },
                      }));
                    }}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
