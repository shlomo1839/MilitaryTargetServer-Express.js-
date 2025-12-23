import fs from "fs/promises";
import path from "path";

async function read(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return data;
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    throw err;
  }
}

async function write(filePath, data, createIfNotExists = true) {
  try {
    if (createIfNotExists) {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(filePath, data, "utf-8");
    return `File written successfully: ${filePath}`;
  } catch (err) {
    console.error(`Error writing file: ${err.message}`);
    throw err;
  }
}

export default { read, write };
