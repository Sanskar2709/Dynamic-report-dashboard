import React, { createContext, useState } from "react";

/**
 * Context for managing global dashboard state
 * Provides access to files, tags, and settings across components
 * @type {React.Context}
 */
export const DashboardContext = createContext();


export const DashboardProvider = ({ children }) => {
  
  const [files, setFiles] = useState([]);

 
  const [tags, setTags] = useState({});

 
 
  const [settings, setSettings] = useState({
    tabColors: {}, // Folder color preferences
    tagColors: {}, // Tag color preferences
  });

  // Providin context to children components
  return (
    <DashboardContext.Provider
      value={{
        files,
        setFiles,
        tags,
        setTags,
        settings,
        setSettings,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};


