import { getDMMF } from "@prisma/sdk";
import fs from "fs-extra";
import path from 'path';
import prettier from "prettier";
import inquirer = require("inquirer");
import {
  SCHEMA_PATH,
  TEMPLATES_FOLDER_PATH,
  PGB_SELECTIONS_FILENAME,
  TEMPLATE_NAME,
} from "../constants";
import {
  selectionAnswerType,
  HTTP_METHODS,
  modelLevelModuleType,
} from "../types";
import {
  getFiles,
  transformSelectionToAnswers,
  generateOutFolder,
  copyPrismaIntoOutFolder,
  getSelections,
} from "../utils";
import { generateDynamicFiles } from "./dynamicFiles";

export async function generateAllDefault(outFolderPath: string) {
  // create out folder if not exist
  if (!fs.existsSync(outFolderPath) || path.resolve(outFolderPath) === process.cwd()) {
    generateOutFolder(outFolderPath);
    copyPrismaIntoOutFolder(outFolderPath);
  }
  // get PGB_SELECTIONS_FILENAME
  // try to import selections
  // if no default export found, then generate one
  // and create PGB_SELECTIONS_FILENAME
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const {
    datamodel: { models },
  } = await getDMMF({ datamodel: schema });

  const defaultSelections = await getSelections();

  await generateDynamicFiles(outFolderPath)

  const modelLevelDynamicFiles = getFiles(TEMPLATES_FOLDER_PATH).filter(
    (filePath) => filePath.includes("{{modelName}}")
  );

  for (const modelName in defaultSelections) {
    for (const filePath of modelLevelDynamicFiles) {
      const module: modelLevelModuleType = await import(filePath);
      const model = models.find((model) => model.name === modelName);
      if (!model) throw new Error(`Cannot find model with name ${modelName}`);

      const fileName = module.config.fileName(model);
      const path = `${outFolderPath}/${filePath
        .split(TEMPLATE_NAME)[1]
        .replace("{{modelName}}", fileName)}`;

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
        const selectedModel = defaultSelections[modelName];
        const selection: selectionAnswerType = {
          [HTTP_METHODS.GET]: transformSelectionToAnswers(
            models,
            modelName,
            selectedModel[HTTP_METHODS.GET]
          ),
          [HTTP_METHODS.GET_DETAILS]: transformSelectionToAnswers(
            models,
            modelName,
            selectedModel[HTTP_METHODS.GET_DETAILS]
          ),
          [HTTP_METHODS.POST]: transformSelectionToAnswers(
            models,
            modelName,
            selectedModel[HTTP_METHODS.POST]
          ),
          [HTTP_METHODS.PUT]: transformSelectionToAnswers(
            models,
            modelName,
            selectedModel[HTTP_METHODS.PUT]
          ),
          [HTTP_METHODS.DELETE]: transformSelectionToAnswers(
            models,
            modelName,
            selectedModel[HTTP_METHODS.DELETE]
          ),
        };
        const file = module.default({ model, selection });
        fs.outputFileSync(
          path,
          prettier.format(file, { parser: "typescript" })
        );
      }
    }
  }

  fs.outputFileSync(
    `${TEMPLATES_FOLDER_PATH}/${PGB_SELECTIONS_FILENAME}`,
    `export default ${JSON.stringify(defaultSelections, null, 2)}`
  );
}
