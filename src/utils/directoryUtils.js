// Function to recursively process directory structure
export const processDirectoryStructure = (structure) => {
  const result = [];

  const processNode = (node, path = []) => {
    const currentResult = {
      name: path[path.length - 1] || "",
      path: path.join("/"),
      type: "directory",
      files: [],
      children: [],
    };

    // Process files in current directory
    if (node.files) {
      currentResult.files = node.files.map((filePath) => ({
        name: filePath.split("/").pop(),
        path: filePath,
        type: "file",
      }));
    }

    // Process subdirectories
    Object.entries(node).forEach(([key, value]) => {
      if (key !== "files" && typeof value === "object") {
        const childResult = processNode(value, [...path, key]);
        if (childResult.files.length > 0 || childResult.children.length > 0) {
          currentResult.children.push(childResult);
        }
      }
    });

    return currentResult;
  };

  // Process each root directory
  Object.entries(structure).forEach(([key, value]) => {
    const processed = processNode(value, [key]);
    if (processed.files.length > 0 || processed.children.length > 0) {
      result.push(processed);
    }
  });

  return result;
};

// Function to get all paths in a directory structure
export const getAllPaths = (structure) => {
  const paths = new Set();

  const traverse = (node, currentPath = "") => {
    paths.add(currentPath);

    if (node.files) {
      node.files.forEach((file) => {
        paths.add(file.split("/").slice(0, -1).join("/"));
      });
    }

    Object.entries(node).forEach(([key, value]) => {
      if (key !== "files" && typeof value === "object") {
        const newPath = currentPath ? `${currentPath}/${key}` : key;
        traverse(value, newPath);
      }
    });
  };

  Object.entries(structure).forEach(([key, value]) => {
    traverse(value, key);
  });

  return Array.from(paths).filter(Boolean);
};

// Function to get files for a specific path
export const getFilesForPath = (structure, targetPath) => {
  const parts = targetPath.split("/");
  let current = structure;

  // Navigate to the target directory
  for (const part of parts) {
    current = current[part];
    if (!current) return [];
  }

  return (current.files || []).map((filePath) => ({
    name: filePath.split("/").pop(),
    path: filePath,
    type: "file",
  }));
};
