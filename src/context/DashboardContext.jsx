// src/context/DashboardContext.jsx
import React, { createContext, useState } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState({});
  const [settings, setSettings] = useState({
    tabColors: {},
    tagColors: {},
  });

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
