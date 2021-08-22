import inquirer = require("inquirer");
import fs from "fs-extra";
import prettier from 'prettier';
import { SCHEMA_PATH, TEMPLATES_FOLDER_PATH, TEMPLATE_NAME } from "../constants";
import { dynamicFileModuleType } from "../types";
import { getFiles, getSelections } from "../utils";
import { getDMMF } from "@prisma/sdk";

export async function generateDynamicFiles(outFolderPath: string) {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const {
    datamodel: { models },
  } = await getDMMF({ datamodel: schema });
  const defaultSelections = await getSelections();
  
  const dynamicFiles = getFiles(TEMPLATES_FOLDER_PATH).filter((filePath) =>
    filePath.includes("{{dynamic}}")
  );

  for (const filePath of dynamicFiles) {
    const module: dynamicFileModuleType = await import(filePath);
    const path = `${outFolderPath}/${filePath
      .split(TEMPLATE_NAME)[1]
      .replace("{{dynamic}}.", "")}`;

    let canWrite = true;
    if (fs.existsSync(path)) {
      const answer: { replace: boolean } = await inquirer.prompt({
        type: "confirm",
        message: `${path} already exists. Replace it?`,
        name: "replace",
        default: false,
      });

      canWrite = answer.replace;
    }

    if (canWrite) {
      const file = module.default({ models, selections: defaultSelections });
      fs.outputFileSync(path, prettier.format(file, {parser: "typescript"}));
    }
  }
}