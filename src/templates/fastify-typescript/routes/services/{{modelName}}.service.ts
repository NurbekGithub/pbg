import { camelCase as cC, pascalCase as pC } from "change-case";
import {
  fileParams,
  HTTP_METHODS,
  selectionType,
  ServiceParams,
  templateConfig,
} from "../../../../types";
import {
  distinctPluralize,
  getEnumFields,
  getIdField,
  getNotGeneratedScalarFields,
  getObjectFields,
  getScalarFields,
  getStringByMethod,
  hasObjectField,
} from "../../../../utils";

function getPrismaSelection(fields: selectionType[]): string {
  const scalarOrEnumFields = [
    ...getScalarFields(fields),
    ...getEnumFields(fields),
  ];
  const objectFields = getObjectFields(fields) as selectionType[];
  return `select: {
    ${scalarOrEnumFields.map((field) => `${field.name}: true,`).join("\n")}
    ${objectFields.map(
      (field) => `${field.name}: {${getPrismaSelection(field.values)}}`
    )}
  }`;
}

function getCreateData(
  fields: selectionType[],
  isFirstLevel: boolean,
  relationsChain: string[] = [],
  isList: boolean = false
): string {
  const scalarOrEnumFields = [
    ...getNotGeneratedScalarFields(fields),
    ...getEnumFields(fields),
  ];
  const objectFields = getObjectFields(fields) as selectionType[];

  if (isFirstLevel) {
    return `data: {
      ${scalarOrEnumFields
        .map((field) => `${field.name}: data.${field.name},`)
        .join("\n")}
      ${objectFields
        .map(
          (field) =>
            `${field.name}: {${getCreateData(
              field.values,
              false,
              [field.name],
              field.isList
            )}}`
        )
        .join(",\n")}
    }`;
  }

  // prisma does not support nested create many yet
  // so this will be last stop and should not contain
  // nested relations further down
  if (isList) {
    return `createMany: {
      data: data.${relationsChain.join(".")}
    },`;
  }

  // if sub relation data has idField
  // try to find it and connect instead of just create
  const idField = getIdField(fields);
  if (idField) {
    return `connectOrCreate: {
      where: {${idField.name}: data.${relationsChain.join(".")}.${idField.name}}
      ${getCreateData(
        fields.filter((field) => !field.isId),
        false,
        relationsChain
      )}
    }`;
  }
  // just create
  return `create: {
    ${scalarOrEnumFields
      .map(
        (field) =>
          `${field.name}: data.${relationsChain.join(".")}.${field.name},`
      )
      .join("\n")}
    ${objectFields
      .map(
        (field) =>
          `${field.name}: {${getCreateData(
            field.values,
            false,
            [...relationsChain, field.name],
            field.isList
          )}}`
      )
      .join(",\n")}
  }`;
}

function getUpdateData(
  fields: selectionType[],
  isFirstLevel: boolean,
  relationsChain: string[] = [],
  isList: boolean = false
): string {
  const scalarOrEnumFields = [
    ...getNotGeneratedScalarFields(fields),
    ...getEnumFields(fields),
  ];
  const objectFields = getObjectFields(fields) as selectionType[];

  if (isFirstLevel) {
    return `data: {
      ${scalarOrEnumFields
        .map((field) => `${field.name}: data.${field.name},`)
        .join("\n")}
      ${objectFields
        .map(
          (field) =>
            `${field.name}: {${getUpdateData(
              field.values,
              false,
              [field.name],
              field.isList
            )}}`
        )
        .join(",\n")}
    }`;
  }

  // prisma does not support nested update many yet
  // so this will be last stop and should not contain
  // nested relations further down
  if (isList) {
    return `updateMany: {
      data: data.${relationsChain.join(".")}
    },`;
  }

  const idField = getIdField(fields);
  if (idField) {
    return `upsert: {
      where: {${idField.name}: data.${relationsChain.join(".")}.${idField.name}}
      ${getCreateData(
        fields.filter((field) => !field.isId),
        false,
        relationsChain
      )}
      ${getUpdateData(
        fields.filter((field) => !field.isId),
        false,
        relationsChain
      )}
    }`;
  }
  return `update: {
      ${scalarOrEnumFields
        .map(
          (field) =>
            `${field.name}: data.${relationsChain.join(".")}.${field.name},`
        )
        .join("\n")}
      ${objectFields
        .map(
          (field) =>
            `${field.name}: {${getUpdateData(
              field.values,
              false,
              [...relationsChain, field.name],
              field.isList
            )}}`
        )
        .join(",\n")}
    }`;
}

// TODO: where updateMany

function getGetService({ model, selection }: ServiceParams) {
  if (!selection) return "";
  const camelCase = cC(model.name);
  const PascalCase = pC(model.name);
  const pluralizedCamelCase = distinctPluralize(camelCase);
  const pluralizedPascalCase = distinctPluralize(PascalCase);

  // TODO: add ordering
  return `async function get${pluralizedPascalCase}(where: Prisma.${
    model.name
  }WhereInput, limit?: number, offset?: number) {
    const ${pluralizedCamelCase} = await db.${model.name.toLowerCase()}.findMany({
      where,
      skip: offset,
      take: limit,
      ${getPrismaSelection(selection)}
    });
    const totalCount = await db.${model.name.toLowerCase()}.count({ where })
    return { ${pluralizedCamelCase}, totalCount }
  }`;
}

function getGetDetailsService({ model, selection }: ServiceParams) {
  if (!selection) return "";
  const camelCase = cC(model.name);
  const PascalCase = pC(model.name);

  return `async function get${PascalCase}(where: Prisma.${
    model.name
  }WhereUniqueInput) {
    const ${camelCase} = await db.${model.name.toLowerCase()}.findUnique({ where, ${getPrismaSelection(
    selection
  )} });
    return { ${camelCase} }
  }`;
}

function getPostService({
  model,
  selection,
  postDataType,
}: ServiceParams & { postDataType: string }) {
  if (!selection) return "";
  const camelCase = cC(model.name);
  const PascalCase = pC(model.name);

  return `async function create${PascalCase}(data: ${postDataType}) {
    const ${camelCase} = await db.${model.name.toLowerCase()}.create({
      ${getCreateData(selection, true)},
      ${getPrismaSelection(selection)},
    });
    return { ${camelCase} }
  }`;
}

function getPutService({
  model,
  selection,
  putDataType,
}: ServiceParams & { putDataType: string }) {
  if (!selection) return "";
  const camelCase = cC(model.name);
  const PascalCase = pC(model.name);

  return `async function update${PascalCase}(data: ${putDataType}, where: Prisma.${
    model.name
  }WhereUniqueInput) {
    const ${camelCase} = await db.${model.name.toLowerCase()}.update({
      where,
      ${getUpdateData(selection, true)},
      ${getPrismaSelection(selection)},
    });
    return { ${camelCase} }
  }`;
}

function getDeleteService({ model, selection }: ServiceParams) {
  if (!selection) return "";
  const camelCase = cC(model.name);
  const PascalCase = pC(model.name);

  return `async function delete${PascalCase}(where: Prisma.${
    model.name
  }WhereUniqueInput) {
    const ${camelCase} = await db.${model.name.toLowerCase()}.delete({ where });
    return { ${camelCase} }
  }`;
}

export default function file(params: fileParams) {
  const modelName = params.model.name;
  const camelCase = cC(modelName);
  const PascalCase = pC(modelName);
  const pluralizedCamelCase = distinctPluralize(camelCase);
  const pluralizedPascalCase = distinctPluralize(PascalCase);
  const SERVICE_NAME = camelCase + "Service";

  // if no nested params selected for POST and PUT methods
  // we will use uncheck version of prisma data type
  let postDataType = `Prisma.${modelName}UncheckedCreateInput`;
  if (hasObjectField(params.selection[HTTP_METHODS.POST])) {
    postDataType = "schemaOpts.PostBodyStatic";
  }
  let putDataType = `Prisma.${modelName}UncheckedUpdateInput`;
  if (hasObjectField(params.selection[HTTP_METHODS.PUT])) {
    putDataType = "schemaOpts.PutBodyStatic";
  }

  return `import fp from 'fastify-plugin'
import { Prisma, ${modelName} } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import * as schemaOpts from "../types/${camelCase}.types"
import { db } from "../../db";

declare module "fastify" {
  interface FastifyInstance {
    ${getStringByMethod(
      params.selection[HTTP_METHODS.GET],
      `get${pluralizedPascalCase}: (
        where: Prisma.${modelName}WhereInput,
        limit?: number,
        offset?: number
      ) => Promise<{${pluralizedCamelCase}: ${modelName}[], totalCount: number}>;`
    )}
    ${getStringByMethod(
      params.selection[HTTP_METHODS.GET_DETAILS],
      `get${PascalCase}: (where: Prisma.${modelName}WhereUniqueInput) => Promise<{${camelCase}: ${modelName}}>;`
    )}
    ${getStringByMethod(
      params.selection[HTTP_METHODS.POST],
      `create${PascalCase}: (data: ${postDataType}) => Promise<{${camelCase}: ${modelName}}>;`
    )}
    ${getStringByMethod(
      params.selection[HTTP_METHODS.PUT],
      `update${PascalCase}: (
        data: ${putDataType},
        where: Prisma.${modelName}WhereUniqueInput
      ) => Promise<{${camelCase}: ${modelName}}>;`
    )}
    ${getStringByMethod(
      params.selection[HTTP_METHODS.DELETE],
      `delete${PascalCase}: (where: Prisma.${modelName}WhereUniqueInput) => Promise<{${camelCase}: ${modelName}}>;`
    )}
  }
}

export const ${SERVICE_NAME}: FastifyPluginAsync = fp(async (fastify, _opts) => {

  ${getGetService({
    model: params.model,
    selection: params.selection[HTTP_METHODS.GET],
  })}
  ${getGetDetailsService({
    model: params.model,
    selection: params.selection[HTTP_METHODS.GET_DETAILS],
  })}
  ${getPostService({
    model: params.model,
    selection: params.selection[HTTP_METHODS.POST],
    postDataType,
  })}
  ${getPutService({
    model: params.model,
    selection: params.selection[HTTP_METHODS.PUT],
    putDataType,
  })}
  ${getDeleteService({
    model: params.model,
    selection: params.selection[HTTP_METHODS.DELETE],
  })}

  ${getStringByMethod(
    params.selection[HTTP_METHODS.GET],
    `fastify.decorate("get${pluralizedPascalCase}", get${pluralizedPascalCase})`
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.GET_DETAILS],
    `fastify.decorate("get${PascalCase}", get${PascalCase})`
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.POST],
    `fastify.decorate("create${PascalCase}", create${PascalCase})`
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.PUT],
    `fastify.decorate("update${PascalCase}", update${PascalCase})`
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.DELETE],
    `fastify.decorate("delete${PascalCase}", delete${PascalCase})`
  )}
})
`;
}

export const config: templateConfig = {
  outPath: "",
  fileName: (model) => cC(model.name),
};
