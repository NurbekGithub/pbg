import { DMMF } from "@prisma/generator-helper";
import fs from "fs-extra";
import pluralize from "pluralize";
import path, { resolve } from "path";
import {
  PGB_SELECTIONS_FILENAME,
  SCHEMA_PATH,
  TEMPLATES_FOLDER_PATH,
  TOKENS_TO_IGNORE,
} from "./constants";
import { ScalarField, selectionMethodFields, selectionType } from "./types";
import { defaultSelections } from "./types";
import { generateDefaultSelections } from "./generate-config";

export function isDefaultChecked(field: DMMF.Field) {
  if (TOKENS_TO_IGNORE.includes(field.name)) return false;

  if (field.kind === "object" || field.kind === "unsupported") return false;

  if (field.kind === "scalar" && isDisabledScalarField(field as ScalarField))
    return false;

  return true;
}

export function isDisabledScalarField(field: ScalarField) {
  return field.type === "Bytes";
}

export function getScalarFields(fields: DMMF.Field[]) {
  return fields.filter((field) => field.kind === "scalar") as ScalarField[];
}

export function getScalarOrEnumFields(fields: DMMF.Field[]) {
  return fields.filter(
    (field) => field.kind === "scalar" || field.kind === "enum"
  );
}

export function getScalarFieldsWithoutId(fields: DMMF.Field[]) {
  return fields.filter(
    (field) => field.kind === "scalar" && !field.isId
  ) as ScalarField[];
}
export function getNotGeneratedScalarFields(fields: DMMF.Field[]) {
  return fields.filter(
    (field) => field.kind === "scalar" && !field.isGenerated
  ) as ScalarField[];
}

export function getEnumFields(fields: DMMF.Field[]) {
  return fields.filter((field) => field.kind === "enum");
}

export function getObjectFields(fields: DMMF.Field[]) {
  return fields.filter((field) => field.kind === "object");
}

export function getIdField(fields: DMMF.Field[]) {
  return fields.find((field) => field.isId) as ScalarField | undefined;
}

export function hasObjectField(fields: selectionType[] | undefined) {
  return Boolean(
    fields && Object.values(fields).some((val) => val.kind === "object")
  );
}

export function getStringByMethod(
  method: selectionType[] | undefined,
  string: string
) {
  if (method) return string;
  return "";
}

export function distinctPluralize(word: string) {
  let pluralized = pluralize(word);

  if (word === pluralized) {
    pluralized += "es";
  }

  return pluralized;
}

export function getFiles(dir: string): string[] {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

/**
 * transforms this: {
 *    a_1: true,
 *    a_2: false,
 *    a_3: {
 *      b_1: true
 *      b_2: false
 *    }
 * }
 * 
 * into this: [
 *    {
 *      "name": "a_1",
        "kind": "scalar",
        "isList": false,
        "isRequired": false,
        "isUnique": false,
        "isId": false,
        "isReadOnly": false,
        "type": "Boolean",
        "hasDefaultValue": false,
        "isGenerated": false,
        "isUpdatedAt": false
 *    },
      {
        "name": "a_3",
        "kind": "object",
        "isList": false,
        "isRequired": false,
        "isUnique": false,
        "isId": false,
        "isReadOnly": false,
        "type": "a_3",
        "hasDefaultValue": false,
        "relationName": "b",
        "relationFromFields": [
          "a_2"
        ],
        "relationToFields": [
          "id"
        ],
        "relationOnDelete": "NONE",
        "isGenerated": false,
        "isUpdatedAt": false,
sub ---> values: [
          {
            "name": "b_1",
            "kind": "scalar",
            "isList": false,
            "isRequired": false,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "type": "BigInt",
            "hasDefaultValue": false,
            "isGenerated": false,
            "isUpdatedAt": false
          }
        ]
      }
 * ]
 */
export function transformSelectionToAnswers(
  models: DMMF.Model[],
  modelName: string,
  selection?: selectionMethodFields
): selectionType[] | undefined {
  if (!selection) return undefined;
  const model = models.find((model) => model.name === modelName);
  if (!model) throw new Error(`no model with name ${modelName}`);
  const res: selectionType[] = [];
  for (const key in selection) {
    const value = selection[key];

    if (value === true) {
      const field = model.fields.find((field) => field.name === key);
      if (!field)
        throw new Error(
          `no field with name ${key} in model with name ${model.name}`
        );
      res.push(field);
      continue;
    }

    if (value && typeof value === "object") {
      const field = model.fields.find((field) => field.name === key);
      if (!field)
        throw new Error(
          `no field with name ${key} in model with name ${model.name}`
        );
      res.push({
        ...field,
        values: transformSelectionToAnswers(models, key, value),
      });
      continue;
    }
  }
  return res;
}

// anti transformSelectionToAnswers
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

export function generateOutFolder(outFolderPath: string) {
  fs.copySync(TEMPLATES_FOLDER_PATH, outFolderPath, {
    overwrite: false,
    filter: (src) =>
      !src.includes("{{modelName}}") &&
      !src.includes("{{dynamic}}") &&
      !src.includes("pgb."),
  });
}

export function copyPrismaIntoOutFolder(outFolderPath: string) {
  fs.copySync("./prisma", `${outFolderPath}/prisma`);
}

export async function getSelections(): Promise<defaultSelections> {
  if (fs.existsSync(`${TEMPLATES_FOLDER_PATH}/${PGB_SELECTIONS_FILENAME}`)) {
    const defaultSelectionsModule: {
      default: defaultSelections | {};
    } = await import(resolve(TEMPLATES_FOLDER_PATH, PGB_SELECTIONS_FILENAME));
    if (Object.keys(defaultSelectionsModule.default).length > 0) {
      return defaultSelectionsModule.default;
    } else {
      return generateDefaultSelections(
        SCHEMA_PATH,
        TOKENS_TO_IGNORE
      );
    }
  } else {
    return generateDefaultSelections(
      SCHEMA_PATH,
      TOKENS_TO_IGNORE
    );
  }
}