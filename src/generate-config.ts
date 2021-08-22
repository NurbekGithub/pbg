import fs from "fs-extra";
import { getDMMF } from "@prisma/sdk";
import {
  defaultSelections,
  HTTP_METHODS,
  selectionMethodFields,
} from "./types";
import { getObjectFields, getScalarOrEnumFields } from "./utils";

export async function __generateConfig(
  SCHEMA_PATH: string,
  TOKENS_TO_IGNORE: string[]
) {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const dmmf = await getDMMF({ datamodel: schema });

  const modelTypesForSelection = dmmf.datamodel.models
    .map((model) => {
      const scalarAndEnumFields = model.fields.filter(
        (field) => field.kind === "enum" || field.kind === "scalar"
      );
      const objectFields = model.fields.filter(
        (field) => field.kind === "object"
      );

      return `
  type ${model.name}Selection = {
    ${scalarAndEnumFields.map((field) => `${field.name}?: boolean;`).join("\n")}
    ${objectFields
      .map((field) => `${field.name}: ${field.type}Selection | null;`)
      .join("\n")}
  } | null`;
    })
    .join("\n");

  const selections = dmmf.datamodel.models
    .map((model) => {
      const scalarAndEnumFields = model.fields.filter(
        (field) => field.kind === "enum" || field.kind === "scalar"
      );
      const objectFields = model.fields.filter(
        (field) => field.kind === "object"
      );
      const selection = `{
      ${scalarAndEnumFields
        .map(
          (field) => `${field.name}: ${!TOKENS_TO_IGNORE.includes(field.name)},`
        )
        .join("\n")}
      ${objectFields.map((field) => `${field.name}: null`).join(",\n")}
    }`;
      return `
    ${model.name}: {
      get: {
        selection: ${selection} as ${model.name}Selection,
        withOffsetPagination: true,
        withCursorPagination: false,
      },
      getDetails: {
        selection: ${selection}
      },
      post: {
        selection: ${selection}
      },
      put: {
        selection: ${selection}
      }
    }`;
    })
    .join(",\n");
  return { selections, modelTypesForSelection };
}

export async function generateTypes(SCHEMA_PATH: string) {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const dmmf = await getDMMF({ datamodel: schema });
  const modelTypesForSelection = dmmf.datamodel.models
    .map((model) => {
      const scalarAndEnumFields = getScalarOrEnumFields(model.fields);
      const objectFields = getObjectFields(model.fields);

      return `
  type ${model.name}Selection = {
    ${scalarAndEnumFields.map((field) => `${field.name}?: boolean;`).join("\n")}
    ${objectFields
      .map((field) => `${field.name}: ${field.type}Selection | null;`)
      .join("\n")}
  } | null`;
    })
    .join("\n");

  return modelTypesForSelection;
}

export async function generateDefaultSelections(
  SCHEMA_PATH: string,
  TOKENS_TO_IGNORE: string[]
) {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const dmmf = await getDMMF({ datamodel: schema });
  let selections: defaultSelections = {};
  dmmf.datamodel.models.forEach((model) => {
    const scalarAndEnumFields = getScalarOrEnumFields(model.fields);
    const objectFields = getObjectFields(model.fields);

    const selectionMethodFields: selectionMethodFields = {};
    scalarAndEnumFields.forEach((field) => {
      selectionMethodFields[field.name] = !TOKENS_TO_IGNORE.includes(
        field.name
      );
    });

    objectFields.forEach((field) => {
      selectionMethodFields[field.name] = null;
    });

    selections[model.name] = {
      [HTTP_METHODS.GET]: selectionMethodFields,
      [HTTP_METHODS.GET_DETAILS]: selectionMethodFields,
      [HTTP_METHODS.POST]: selectionMethodFields,
      [HTTP_METHODS.PUT]: selectionMethodFields,
      [HTTP_METHODS.DELETE]: selectionMethodFields,
    };
  });

  return selections;
}
