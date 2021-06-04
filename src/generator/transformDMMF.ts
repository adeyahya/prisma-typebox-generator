import type { DMMF } from '@prisma/generator-helper';

const transformField = (field: DMMF.Field) => {
  const tokens = [field.name + ':'];

  if (['Int', 'Float'].includes(field.type)) {
    tokens.push('Type.Number()');
  } else if (['String', 'DateTime', 'Json', 'Date'].includes(field.type)) {
    tokens.push('Type.String()');
  } else if (field.type === 'Boolean') {
    tokens.push('Type.Boolean()');
  } else {
    return '';
  }

  if (field.isList) {
    tokens.splice(1, 0, 'Type.Array(');
    tokens.splice(tokens.length, 0, ')');
  }

  if (!field.isRequired) {
    tokens.splice(1, 0, 'Type.Optional(');
    tokens.splice(tokens.length, 0, ')');
  }

  return tokens.join(' ').concat('\n');
};

const transformFields = (fields: DMMF.Field[]) => {
  let dependencies = new Set();
  const _fields: string[] = [];

  fields.map(transformField).forEach((field) => {
    _fields.push(field);
  });

  return {
    dependencies,
    rawString: _fields.filter((f) => !!f).join(','),
  };
};

const transformModel = (model: DMMF.Model) => {
  const fields = transformFields(model.fields);

  return [
    `import {Type, Static} from '@sinclair/typebox'\n`,
    `\nexport const ${model.name} = Type.Object({\n\t`,
    fields.rawString,
    '})\n',
    `\nexport type ${model.name}Type = Static<typeof ${model.name}>`,
  ].join('');
};

export const transformEnum = (enm: DMMF.DatamodelEnum) => {
  const values = enm.values
    .map((v) => `${v.name}: Type.Literal('${v.name}'),\n`)
    .join('');

  return [
    "import {Type, Static} from '@sinclair/typebox'\n",
    `export const ${enm.name}Const = {`,
    values,
    '}\n',
    `export const ${enm.name} = Type.KeyOf(Type.Object(${enm.name}Const))\n`,
    `export type ${enm.name}Type = Static<typeof ${enm.name}>`,
  ].join('\n');
};

export function transformDMMF(dmmf: DMMF.Document) {
  const { models, enums } = dmmf.datamodel;

  return [
    ...models.map((model) => {
      return {
        name: model.name,
        rawString: transformModel(model),
      };
    }),
    ...enums.map((enm) => {
      return {
        name: enm.name,
        rawString: transformEnum(enm),
      };
    }),
  ];
}
