import React, { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = ({ settings, setSettings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (type, key, color) => {
    setSettings((prev) => ({
      ...prev,
      [`${type}Colors`]: {
        ...prev[`${type}Colors`],
        [key]: color,
      },
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
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-medium mb-2">Tab Colors</h3>
          <div className="space-y-2">
            {["Reports", "Analytics", "Custom"].map((tab) => (
              <div key={tab} className="flex items-center justify-between">
                <span>{tab}</span>
                <input
                  type="color"
                  value={settings.tabColors[tab] || "#ffffff"}
                  onChange={(e) =>
                    handleColorChange("tab", tab, e.target.value)
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>

          <h3 className="font-medium mb-2 mt-4">Tag Colors</h3>
          <div className="space-y-2">
            {Object.keys(settings.tagColors).map((tag) => (
              <div key={tag} className="flex items-center justify-between">
                <span>{tag}</span>
                <input
                  type="color"
                  value={settings.tagColors[tag] || "#ffffff"}
                  onChange={(e) =>
                    handleColorChange("tag", tag, e.target.value)
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
