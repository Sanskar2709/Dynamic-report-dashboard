// Mock file system service for browser environment
class FileService {
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

    for (const part of parts) {
      current = current[part];
      if (!current) throw new Error(`Directory ${path} not found`);
    }

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

  // Add file to virtual file system
  addFile(folderPath, file) {
    const parts = folderPath.split("/").filter((p) => p);
    let current = this.virtualFS;

    // Navigate to the correct folder
    for (const part of parts) {
      if (!current[part]) {
        current[part] = { files: [] };
      }
      current = current[part];
    }

    if (!current.files) {
      current.files = [];
    }

    // Add file if it doesn't exist
    if (!current.files.find((f) => f.name === file.name)) {
      current.files.push(file);
    }
  }

  // Get all files from a folder and its subfolders
  async getAllFiles(path = "/folder") {
    const parts = path.split("/").filter((p) => p);
    let current = this.virtualFS;

    for (const part of parts) {
      current = current[part];
      if (!current) return [];
    }

    const files = [];

    const traverse = (obj, currentPath) => {
      if (obj.files) {
        files.push(
          ...obj.files.map((file) => ({
            ...file,
            folder: currentPath,
          }))
        );
      }

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
