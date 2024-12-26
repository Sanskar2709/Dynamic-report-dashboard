const fs = require("fs");
const path = require("path");

function scanDirectory(directoryPath, relativePath = "") {
  const structure = {};
  const items = fs.readdirSync(directoryPath);

  items.forEach((item) => {
    const fullPath = path.join(directoryPath, item);
    const itemRelativePath = path.join(relativePath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      structure[item] = scanDirectory(fullPath, itemRelativePath);
    } else if (item.toLowerCase().endsWith(".csv")) {
      if (!structure.files) {
        structure.files = [];
      }
      // Store the full relative path of the file
      structure.files.push(itemRelativePath);
    }
  });

  return structure;
}

const folderPath = path.join(__dirname, "../public/folder");
const structure = scanDirectory(folderPath);

// Writingf the structure to a JSON file
fs.writeFileSync(
  path.join(__dirname, "../public/folder/structure.json"),
  JSON.stringify(structure, null, 2)
);

console.log("Structure file generated successfully!");
