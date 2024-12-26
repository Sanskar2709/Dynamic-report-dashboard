import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { addToTempStorage } from "../../utils/tempHandler";

/**
 * FileUploader - A component for handling CSV file uploads with validation and processing
 *
 * This component provides a styled upload button that:
 * - Handles single or multiple CSV file uploads
 * - Validates file types before processing
 * - Processes files through temporary storage
 * - Adds metadata like upload dates
 * - Provides visual feedback during the upload process
 *
 * The component uses a hidden file input triggered by a styled button for better UX.
 * It handles file validation and processing errors gracefully with user notifications.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onFileUpload - Callback function called with processed files
 *   @param {Array} props.onFileUpload.processedFiles - Array of processed file objects
 *   Each processed file object contains:
 *   - Original file metadata
 *   - Added uploadDate (ISO string)
 *   - Any additional processing results from addToTempStorage
 *
 * @throws {Error} Throws and handles errors during file processing
 * @fires onFileUpload When files are successfully processed
 * @requires lucide-react
 * @requires ../../utils/tempHandler
 */
const FileUploader = ({ onFileUpload }) => {
  /** Reference to the hidden file input element */
  const fileInputRef = useRef(null);

  /**
   * Handles the file selection event
   * Processes selected files and validates their type
   *
   * @async
   * @param {Event} event - The file input change event
   * @fires onFileUpload
   */
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
        // Add upload date when processing the file
        const processedFile = await addToTempStorage(file);
        processedFile.uploadDate = new Date().toISOString(); // Store upload date
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
        data-testid="file-upload-input"
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
