import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { addToTempStorage } from "../../utils/tempHandler";

const FileUploader = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    const processedFiles = [];

    for (const file of files) {
      if (
        file.type !== "text/csv" &&
        !file.name.toLowerCase().endsWith(".csv")
      ) {
        alert(`File ${file.name} is not a CSV file`);
        continue;
      }

      try {
        // Add to temporary storage
        const processedFile = await addToTempStorage(file);
        processedFiles.push(processedFile);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        alert(`Error processing file ${file.name}`);
      }
    }

    if (processedFiles.length > 0) {
      onFileUpload(processedFiles);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        multiple
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        <Upload size={16} />
        <span>Upload CSV Files</span>
      </button>
    </div>
  );
};

export default FileUploader;
