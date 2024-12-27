/**
 * FileService Class
 * Implements a virtual file system for managing files and folders in memory
 * Simulates basic file system operations like reading directories and getting file stats
 */
class FileService {
  /**
   * Initialize the virtual file system with a predefined structure
   * Creates a base folder with reports, analytics, and custom subfolders
   */
  constructor() {
    this.virtualFS = {
      folder: {
        reports: {
          files: [],
        },
        analytics: {
          files: [],
        },
        custom: {
          files: [],
        },
      },
    };
  }

  async readdir(path) {
    // Split path and navigate through virtualFS
    const parts = path.split("/").filter((p) => p);
    let current = this.virtualFS;

    // Navigate through path parts
    for (const part of parts) {
      current = current[part];
      if (!current) throw new Error(`Directory ${path} not found`);
    }

    // Return directory names (excluding 'files' array)
    return Object.keys(current).filter((key) => key !== "files");
  }

  async stat(path) {
    const parts = path.split("/").filter((p) => p);
    let current = this.virtualFS;

    for (const part of parts) {
      current = current[part];
      if (!current) throw new Error(`Path ${path} not found`);
    }

    return {
      isDirectory: () => typeof current === "object" && !Array.isArray(current),
    };
  }

  /**
   * Add a file to a specific folder in the virtual file system
   * Creates folders in the path if they don't exist
   *
   * @param {string} folderPath - Path where file should be added
   * @param {Object} file - File object to add
   * @param {string} file.name - Name of the file
   * @param {*} file.data - File content/data
   *
   */
  addFile(folderPath, file) {
    const parts = folderPath.split("/").filter((p) => p);
    let current = this.virtualFS;

    // Create folders if they don't exist
    for (const part of parts) {
      if (!current[part]) {
        current[part] = { files: [] };
      }
      current = current[part];
    }

    // Initialize files array if needed
    if (!current.files) {
      current.files = [];
    }

    // Add file if it doesn't already exist
    if (!current.files.find((f) => f.name === file.name)) {
      current.files.push(file);
    }
  }

  async getAllFiles(path = "/folder") {
    const parts = path.split("/").filter((p) => p);
    let current = this.virtualFS;

    // Navigate to starting path
    for (const part of parts) {
      current = current[part];
      if (!current) return [];
    }

    const files = [];

    /**
     * Recursive function to traverse directory structure
     * @param {Object} obj - Current directory object
     * @param {string} currentPath - Current path being traversed
     */
    const traverse = (obj, currentPath) => {
      // Add files from current directory
      if (obj.files) {
        files.push(
          ...obj.files.map((file) => ({
            ...file,
            folder: currentPath,
          }))
        );
      }

      // Recursively process subdirectories
      Object.entries(obj).forEach(([key, value]) => {
        if (key !== "files" && typeof value === "object") {
          traverse(value, `${currentPath}/${key}`);
        }
      });
    };

    traverse(current, path);
    return files;
  }
}

export const fileService = new FileService();
