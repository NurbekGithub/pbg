import path from "path";
import fs from "fs-extra";
import { generateOutFolder, copyPrismaIntoOutFolder } from "../utils";

export function initTemplate(outFolderPath: string) {
  if (!fs.existsSync(outFolderPath) || path.resolve(outFolderPath) === process.cwd()) {
    generateOutFolder(outFolderPath);
    copyPrismaIntoOutFolder(outFolderPath);
  }
}