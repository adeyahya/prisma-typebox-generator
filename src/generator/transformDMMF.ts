import type { DMMF } from '@prisma/generator-helper';

type TransformDMMFOptions = {
  prefix?: string;
  includeRelations?: 'true' | 'false';
};

function prefixName(name: string, prefix?: string) {
  if (prefix) {
    return `${prefix}${name}`;
  }
  return name;
}

const transformField = (field: DMMF.Field) => {
  const tokens = [field.name + ':'];
  let inputTokens = [];
  const deps = new Set();

  if (['Int', 'Float', 'Decimal'].includes(field.type)) {
    tokens.push('Type.Number()');
  } else if (['BigInt'].includes(field.type)) {
    tokens.push('Type.Integer()');
  } else if (['String', 'DateTime', 'Json', 'Date'].includes(field.type)) {
    tokens.push('Type.String()');
  } else if (field.type === 'Boolean') {
    tokens.push('Type.Boolean()');
  } else {
    tokens.push(`::${field.type}::`);
    deps.add(field.type);
  }

  if (field.isList) {
    tokens.splice(1, 0, 'Type.Array(');
    tokens.splice(tokens.length, 0, ')');
  }

  inputTokens = [...tokens];

  // @id can be optional for input value if it has a default defined
  if (field.isId && (field?.default as any)) {
    inputTokens.splice(1, 0, 'Type.Optional(');
    inputTokens.splice(inputTokens.length, 0, ')');
  }

  if ((!field.isRequired || field.hasDefaultValue) && !field.isId) {
    tokens.splice(1, 0, 'Type.Optional(');
    tokens.splice(tokens.length, 0, ')');
    inputTokens.splice(1, 0, 'Type.Optional(');
    inputTokens.splice(inputTokens.length, 0, ')');
  }

  return {
    str: tokens.join(' ').concat('\n'),
    strInput: inputTokens.join(' ').concat('\n'),
    deps,
    original: field,
  };
};

const transformFields = (
  fields: DMMF.Field[],
  config: TransformDMMFOptions,
) => {
  let dependencies = new Set();
  const _fields: string[] = [];
  const _inputFields: string[] = [];

  fields.map(transformField).forEach((field) => {
    // TODO: Remove and add raw models as separate files.
    if (
      field.deps.size > 0 &&
      config.includeRelations === 'false' &&
      // Check if the field is a relation, so we'll still include enums.
      !!field.original.relationName
    ) {
      return;
    }

    _fields.push(field.str);
    _inputFields.push(field.strInput);

    [...field.deps].forEach((d) => {
      dependencies.add(d);
    });
  });

  return {
    dependencies,
    rawString: _fields.filter((f) => !!f).join(','),
    rawInputString: _inputFields.filter((f) => !!f).join(','),
  };
};

const transformModel = (
  config: TransformDMMFOptions,
  model: DMMF.Model,
  models?: DMMF.Model[],
) => {
  const fields = transformFields(model.fields, config);
  let raw = [
    `${
      models ? '' : `export const ${prefixName(model.name, config.prefix)} = `
    }Type.Object({\n\t`,
    fields.rawString,
    '})',
  ].join('\n');
  let inputRaw = [
    `${
      models
        ? ''
        : `export const ${prefixName(model.name, config.prefix)}Input = `
    }Type.Object({\n\t`,
    fields.rawInputString,
    '})',
  ].join('\n');

  if (Array.isArray(models)) {
    models.forEach((md) => {
      const re = new RegExp(`.+::${md.name}.+\n`, 'gm');
      const inputRe = new RegExp(`.+::${md.name}.+\n`, 'gm');
      raw = raw.replace(re, '');
      inputRaw = inputRaw.replace(inputRe, '');
    });
  }

  return {
    raw,
    inputRaw,
    deps: fields.dependencies,
  };
};

export const transformEnum = (
  enm: DMMF.DatamodelEnum,
  config: TransformDMMFOptions,
) => {
  const values = enm.values
    .map((v) => `${v.name}: Type.Literal('${v.name}'),\n`)
    .join('');

  return [
    `export const ${prefixName(enm.name, config.prefix)}Const = {`,
    values,
    '}\n',
    `export const ${prefixName(
      enm.name,
      config.prefix,
    )} = Type.KeyOf(Type.Object(${prefixName(
      enm.name,
      config.prefix,
    )}Const))\n`,
    `export type ${prefixName(
      enm.name,
      config.prefix,
    )}Type = Static<typeof ${prefixName(enm.name, config.prefix)}>`,
  ].join('\n');
};

export function transformDMMF(
  dmmf: DMMF.Document,
  _config: TransformDMMFOptions,
) {
  const { includeRelations = 'true', prefix = undefined } = _config;

  // Set default config!
  const config: TransformDMMFOptions = {
    includeRelations,
    prefix,
  };

  const { models, enums } = dmmf.datamodel;
  const importStatements = new Set([
    'import {Type, Static} from "@sinclair/typebox"',
  ]);

  return [
    ...models.map((model) => {
      let { raw, inputRaw, deps } = transformModel(config, model);

      [...deps].forEach((d) => {
        const depsModel = models.find((m) => m.name === d) as DMMF.Model;
        if (depsModel) {
          const replacer = transformModel(config, depsModel, models);
          const re = new RegExp(`::${d}::`, 'gm');
          raw = raw.replace(re, replacer.raw);
          inputRaw = inputRaw.replace(re, replacer.inputRaw);
        }
      });

      enums.forEach((enm) => {
        const re = new RegExp(`::${enm.name}::`, 'gm');
        if (raw.match(re)) {
          raw = raw.replace(re, prefixName(enm.name, config.prefix));
          inputRaw = inputRaw.replace(re, prefixName(enm.name, config.prefix));
          importStatements.add(
            `import { ${prefixName(enm.name, config.prefix)} } from './${
              enm.name
            }'`,
          );
        }
      });

      return {
        // TODO: Add prefix to file names as well?
        // name: prefixName(model.name, config.prefix),
        name: model.name,
        rawString: [
          [...importStatements].join('\n'),
          raw,
          `export type ${prefixName(
            model.name,
            config.prefix,
          )}Type = Static<typeof ${prefixName(model.name, config.prefix)}>`,
        ].join('\n\n'),
        inputRawString: [
          [...importStatements].join('\n'),
          inputRaw,
          `export type ${prefixName(
            model.name,
            config.prefix,
          )}InputType = Static<typeof ${prefixName(
            model.name,
            config.prefix,
          )}Input>`,
        ].join('\n\n'),
      };
    }),
    ...enums.map((enm) => {
      return {
        name: enm.name,
        inputRawString: null,
        rawString:
          'import {Type, Static} from "@sinclair/typebox"\n\n' +
          transformEnum(enm, config),
      };
    }),
  ];
}
