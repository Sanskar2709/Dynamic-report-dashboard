// scripts/generateFileStats.js
const fs = require("fs").promises;
const path = require("path");

async function generateFileStats() {
  const folderPath = path.join(__dirname, "../public/folder");
  const stats = {};

  async function processDirectory(dirPath, relativePath = "") {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativeName = path
        .join(relativePath, entry.name)
        .replace(/\\/g, "/");

      if (entry.isDirectory()) {
        await processDirectory(fullPath, relativeName);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".csv")) {
        const fileStats = await fs.stat(fullPath);
        stats[relativeName] = {
          createdAt: fileStats.birthtime.toISOString(),
          modifiedAt: fileStats.mtime.toISOString(),
          size: fileStats.size,
        };
      }
    }
  }

  try {
    await processDirectory(folderPath);

    // 
    await fs.writeFile(
      path.join(folderPath, "filestats.json"),
      JSON.stringify(stats, null, 2)
    );
    console.log("Successfully generated filestats.json");
  } catch (error) {
    console.error("Error generating file stats:", error);
  }
}

generateFileStats();
