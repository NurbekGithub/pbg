import { camelCase as cC, pascalCase as pC } from "change-case";
import { fileParams, HTTP_METHODS, templateConfig, TestParams } from "../../../../types";
import { distinctPluralize } from "../../../../utils";

// TODO: where updateMany

function getGetTest({ model, selection }: TestParams) {
  if (!selection) return "";
  const camelCase = cC(model.name);
  const PascalCase = pC(model.name);
  const pluralizedCamelCase = distinctPluralize(camelCase);
  const pluralizedPascalCase = distinctPluralize(PascalCase);

  return `
  test('requests the "/${camelCase}" route', async t => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/${camelCase}'
    })
    t.equal(response.statusCode, 200, 'returns a status code of 200')
    console.log(response.json())
  });
  `;
}

function getGetDetailsTest({ model, selection }: TestParams) {
  if (!selection) return "";
  const camelCase = cC(model.name);

  return `
  test('requests the "/${camelCase}/:id" route', async t => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/${camelCase}/1'
    })
    t.equal(response.statusCode, 200, 'returns a status code of 200')
    console.log(response.json())
  });
  `;
}

export const config: templateConfig = {
  outPath: "",
  fileName: (model) => cC(model.name),
};

// function getPostTest({
//   model,
//   selection,
//   postDataType,
// }: TestParams & { postDataType: string }) {
//   if (!selection) return "";
//   const camelCase = cC(model.name);
//   const PascalCase = pC(model.name);

//   return `async function create${PascalCase}(data: ${postDataType}) {
//     const ${camelCase} = await db.${model.name.toLowerCase()}.create({
//       ${getCreateData(selection, true)},
//       ${getPrismaSelection(selection)},
//     });
//     return { ${camelCase} }
//   }`;
// }

// function getPutTest({
//   model,
//   selection,
//   putDataType,
// }: TestParams & { putDataType: string }) {
//   if (!selection) return "";
//   const camelCase = cC(model.name);
//   const PascalCase = pC(model.name);

//   return `async function update${PascalCase}(data: ${putDataType}, where: Prisma.${
//     model.name
//   }WhereUniqueInput) {
//     const ${camelCase} = await db.${model.name.toLowerCase()}.update({
//       where,
//       ${getUpdateData(selection, true)},
//       ${getPrismaSelection(selection)},
//     });
//     return { ${camelCase} }
//   }`;
// }

// function getDeleteTest({ model, selection }: TestParams) {
//   if (!selection) return "";
//   const camelCase = cC(model.name);
//   const PascalCase = pC(model.name);

//   return `async function delete${PascalCase}(where: Prisma.${
//     model.name
//   }WhereUniqueInput) {
//     const ${camelCase} = await db.${model.name.toLowerCase()}.delete({ where });
//     return { ${camelCase} }
//   }`;
// }

export default function file(params: fileParams) {
  return `
    import { test } from 'tap'
    import { buildApp } from "../../utils/test-utils";

    ${getGetTest({
      model: params.model,
      selection: params.selection[HTTP_METHODS.GET],
    })}
    ${getGetDetailsTest({
      model: params.model,
      selection: params.selection[HTTP_METHODS.GET_DETAILS],
    })}
  `
}

// ${getPostTest({
//   model: params.model,
//   selection: params.selection[HTTP_METHODS.POST],
//   postDataType,
// })}
// ${getPutTest({
//   model: params.model,
//   selection: params.selection[HTTP_METHODS.PUT],
//   putDataType,
// })}
// ${getDeleteTest({
//   model: params.model,
//   selection: params.selection[HTTP_METHODS.DELETE],
// })}