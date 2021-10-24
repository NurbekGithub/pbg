import { camelCase as cC, pascalCase as pC } from "change-case";
import {
  fileParams,
  HTTP_METHODS,
  routeParams,
  ScalarField,
  templateConfig,
} from "../../../src/types";
import { distinctPluralize, getStringByMethod } from "../../../src/utils";

function getRoute(params: routeParams) {
  const camelCase = cC(params.modelName);
  const PascalCase = pC(params.modelName);
  const pluralizedCamelCase = distinctPluralize(camelCase);
  const pluralizedPascalCase = distinctPluralize(PascalCase);

  return `fastify.get<{ Querystring: schemaOpts.GetQueryStatic }>("/", schemaOpts.GetOpts, async (req) => {
    const {limit, offset, ...filters} = req.query;
    const { ${pluralizedCamelCase}, totalCount } = await fastify.get${pluralizedPascalCase}(filters, limit, offset);
    return {
      ${pluralizedCamelCase},
      totalCount
    };
  });`;
}

function getDetailsRoute(params: routeParams) {
  const camelCase = cC(params.modelName);
  const PascalCase = pC(params.modelName);
  const ID = params.idField!.name;
  return `fastify.get<{ Params: schemaOpts.GetDetailsParamsStatic }>("/:${ID}", schemaOpts.GetDetailsOpts, async (req) => {
    const { ${ID} } = req.params;
    const { ${camelCase} } = await fastify.get${PascalCase}({ ${ID} });
    return {
      ${camelCase}
    };
  });`;
}

function postRoute(params: routeParams) {
  const camelCase = cC(params.modelName);
  const PascalCase = pC(params.modelName);
  return `fastify.post<{ Body: schemaOpts.PostBodyStatic }>("/", schemaOpts.PostOpts, async (req) => {
    const data = req.body;
    const { ${camelCase} } = await fastify.create${PascalCase}(data);
    return {
      ${camelCase}
    };
  });`;
}

function putRoute(params: routeParams) {
  const camelCase = cC(params.modelName);
  const PascalCase = pC(params.modelName);
  const ID = params.idField!.name;
  return `fastify.put<{ Body: schemaOpts.PutBodyStatic, Params: schemaOpts.PutParamsStatic }>("/:${ID}", schemaOpts.PutOpts, async (req) => {
    const { ${ID} } = req.params;
    const data = req.body;
    const { ${camelCase} } = await fastify.update${PascalCase}(data, { ${ID} });
    return {
      ${camelCase}
    };
  });`;
}

function deleteRoute(params: routeParams) {
  const camelCase = cC(params.modelName);
  const PascalCase = pC(params.modelName);
  const ID = params.idField!.name;
  return `fastify.delete<{ Params: schemaOpts.DeleteParamsStatic }>("/:${ID}", schemaOpts.DeleteOpts, async (req) => {
    const { ${ID} } = req.params;
    const { ${camelCase} } = await fastify.delete${PascalCase}({ ${ID} });
    return {
      ${camelCase}
    };
  });`;
}

export default function file(params: fileParams) {
  const camelCase = cC(params.model.name);
  const SERVICE_NAME = camelCase + "Service";
  const CONTROLLER_NAME = camelCase + "Controller";

  const idField = params.model.fields.find((field) => field.isId) as
    | ScalarField
    | undefined;

  return `import { FastifyPluginAsync } from "fastify";
import {${SERVICE_NAME}} from "./services/${camelCase}.service"
import * as schemaOpts from "./types/${camelCase}.types"

const ${CONTROLLER_NAME}: FastifyPluginAsync = async (fastify, _opts) => {

  await fastify.register(${SERVICE_NAME})

  ${getStringByMethod(
    params.selection[HTTP_METHODS.GET],
    getRoute({ modelName: params.model.name })
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.GET_DETAILS],
    getDetailsRoute({ modelName: params.model.name, idField })
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.POST],
    postRoute({ modelName: params.model.name })
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.PUT],
    putRoute({ modelName: params.model.name, idField })
  )}
  ${getStringByMethod(
    params.selection[HTTP_METHODS.DELETE],
    deleteRoute({ modelName: params.model.name, idField })
  )}
};

export const autoPrefix = "/${camelCase}";
export default ${CONTROLLER_NAME}; 
`;
}

export const config: templateConfig = {
  outPath: "",
  fileName: (model) => cC(model.name),
};
