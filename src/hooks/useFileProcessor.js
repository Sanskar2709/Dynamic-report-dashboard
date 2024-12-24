// src/hooks/useFileProcessor.js
import { useState, useCallback } from "react";
import Papa from "papaparse";

export const useFileProcessor = () => {
  const [processing, setProcessing] = useState(false);

  const processFile = useCallback(async (file) => {
    setProcessing(true);
    try {
      // File processing logic we wrote earlier
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setProcessing(false);
    }
  }, []);

  return { processFile, processing };
};
