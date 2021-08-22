import { getDMMF } from "@prisma/sdk";
import fs from "fs-extra";
import prettier from 'prettier';
import {
  ROUTES_FOLDER,
  SCHEMA_PATH,
  TEMPLATES_FOLDER_PATH,
  TEMPLATE_NAME,
  PGB_SELECTIONS_FILENAME,
} from "../constants";
import {
  defaultSelections,
  HTTP_METHODS,
  modelLevelModuleType,
  moduleType,
  ScalarField,
  selectionAnswerType,
  selectionMethodFields,
  selectionType,
} from "../types";
import inquirer from "inquirer";
import { DMMF } from "@prisma/client/runtime";
import {
  copyPrismaIntoOutFolder,
  generateOutFolder,
  getFiles,
  getObjectFields,
  getScalarOrEnumFields,
  isDefaultChecked,
  isDisabledScalarField,
} from "../utils";
import { resolve } from "path";

inquirer.registerPrompt("search-list", require("inquirer-search-list"));

async function getRelationAnwers(
  models: DMMF.Model[],
  relationsChain: string[],
  objectFields: DMMF.Field[],
  defaultSelections: selectionMethodFields | undefined
) {
  const selections: selectionType[] = [];
  for (const relation of objectFields) {
    const model = models.find((model) => model.name === relation.type)!;
    const relationAnswers: {
      [relationName: string]: DMMF.Field[];
    } = await inquirer.prompt({
      name: relation.name,
      message: `Choose sub fields of ${relation.name} for ${relationsChain.join(
        "---"
      )}`,
      type: "checkbox",
      choices: model.fields.map((field) => ({
        name: `${field.name} (${field.type})`,
        checked:
          (defaultSelections?.[model.name] as selectionMethodFields | null)?.[
            field.name
          ] ?? isDefaultChecked(field),
        disabled:
          (field.kind === "scalar" &&
            isDisabledScalarField(field as ScalarField)) ||
          relationsChain.includes(field.type), // should we disable this case?
        value: field,
      })),
    });

    const objectFields = relationAnswers[relation.name].filter(
      (field) => field.kind === "object"
    );

    const scalarOrEnumFields = relationAnswers[relation.name].filter(
      (field) => field.kind === "scalar" || field.kind === "enum"
    );

    const subAnswers = await getRelationAnwers(
      models,
      [...relationsChain, relation.name],
      objectFields,
      defaultSelections?.[model.name] as selectionMethodFields
    );

    selections.push({
      ...relation,
      values: [...scalarOrEnumFields, ...subAnswers],
    });
  }

  return selections;
}

function transformAnswerToSelection(
  selectionName: string,
  models: DMMF.Model[],
  answers: selectionType[]
): selectionMethodFields {
  const model = models.find((model) => model.name === selectionName);
  if (!model) throw new Error(`Cannot find model with name ${selectionName}`);
  const res: selectionMethodFields = {};
  getScalarOrEnumFields(model.fields).forEach((field) => {
    res[field.name] = false;
  });
  getObjectFields(model.fields).forEach((field) => {
    res[field.name] = null;
  });

  getScalarOrEnumFields(answers).forEach((answer) => {
    res[answer.name] = true;
  });
  getObjectFields(answers).forEach((answer) => {
    res[answer.name] = transformAnswerToSelection(
      answer.type,
      models,
      answer.values
    );
  });
  return res;
}

export async function model(outFolderPath: string) {
  let defaultSelections: defaultSelections = {};
  if (fs.existsSync(`${TEMPLATES_FOLDER_PATH}/${PGB_SELECTIONS_FILENAME}`)) {
    const defaultSelectionsModule: {
      default: defaultSelections | {};
    } = await import(resolve(TEMPLATES_FOLDER_PATH, PGB_SELECTIONS_FILENAME));
    if (Object.keys(defaultSelectionsModule.default).length > 0) {
      defaultSelections = defaultSelectionsModule.default;
    }
  }

  // create out folder if not exist
  if (!fs.existsSync(outFolderPath)) {
    generateOutFolder(outFolderPath);
    copyPrismaIntoOutFolder(outFolderPath);
  }
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const {
    datamodel: { models },
  } = await getDMMF({ datamodel: schema });
  const selection: selectionAnswerType = {};
  const modelAnswer: { model: string } = await inquirer.prompt([
    {
      name: "model",
      message: "choose model to use with generator",
      type: "search-list",
      choices: models.map((model) => model.name),
    },
  ]);

  const methodsAnswer: { methods: HTTP_METHODS[] } = await inquirer.prompt([
    {
      name: "methods",
      type: "checkbox",
      choices: [
        {
          name: HTTP_METHODS.GET,
          checked: Boolean(
            defaultSelections[modelAnswer.model]?.[HTTP_METHODS.GET]
          ),
        },
        {
          name: HTTP_METHODS.GET_DETAILS,
          checked: Boolean(
            defaultSelections[modelAnswer.model]?.[HTTP_METHODS.GET_DETAILS]
          ),
        },
        {
          name: HTTP_METHODS.POST,
          checked: Boolean(
            defaultSelections[modelAnswer.model]?.[HTTP_METHODS.POST]
          ),
        },
        {
          name: HTTP_METHODS.PUT,
          checked: Boolean(
            defaultSelections[modelAnswer.model]?.[HTTP_METHODS.PUT]
          ),
        },
        {
          name: HTTP_METHODS.DELETE,
          checked: Boolean(
            defaultSelections[modelAnswer.model]?.[HTTP_METHODS.DELETE]
          ),
        },
      ],
    },
  ]);

  const model = models.find((model) => model.name === modelAnswer.model);
  if (!model) throw new Error(`Cannot find model with name ${modelAnswer.model}`);
  for (const method of methodsAnswer.methods) {
    const methodAnswers: {
      [method in HTTP_METHODS]: DMMF.Field[];
    } = await inquirer.prompt({
      name: method,
      message: `Choose fields for ${method}`,
      type: "checkbox",
      choices: model.fields.map((field) => ({
        name: `${field.name} (${field.type})`,
        checked:
          defaultSelections[modelAnswer.model]?.[method]?.[field.name] ??
          isDefaultChecked(field),
        disabled:
          field.kind === "scalar" &&
          isDisabledScalarField(field as ScalarField),
        value: field,
      })),
    });

    const objectFields = getObjectFields(methodAnswers[method]);

    const scalarOrEnumFields = getScalarOrEnumFields(methodAnswers[method]);

    // this is needed to prevent circular relations
    // e.g. user -> post -> user
    const relationsChain = [model.name];
    const answers = await getRelationAnwers(
      models,
      relationsChain,
      objectFields,
      defaultSelections[modelAnswer.model]?.[method]
    );

    selection[method] = [...scalarOrEnumFields, ...answers];
    if (!defaultSelections[model.name]) {
      defaultSelections[model.name] = {};
    }
    defaultSelections[model.name][method] = transformAnswerToSelection(
      model.name,
      models,
      selection[method]!
    );
  }

  const modelLevelDynamicFiles = getFiles(
    TEMPLATES_FOLDER_PATH
  ).filter((filePath) => filePath.includes("{{modelName}}"));

  for (const filePath of modelLevelDynamicFiles) {
    const module: modelLevelModuleType = await import(filePath);

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
      const file = module.default({ model, selection });
      fs.outputFileSync(
        path,
        prettier.format(file, { parser: "typescript" })
      );
    }
  }

  fs.outputFileSync(
    `${TEMPLATES_FOLDER_PATH}/${PGB_SELECTIONS_FILENAME}`,
    `export default ${JSON.stringify(defaultSelections, null, 2)}`
  );
}