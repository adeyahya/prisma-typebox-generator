import type { DMMF } from '@prisma/generator-helper';
import { ObjectOptions } from '@sinclair/typebox';

export function createTransformer(generatorName: string, typeSuffix = '') {
  const transformField = (field: DMMF.Field) => {
    const lineRegex = new RegExp(`^@${generatorName}\\.([a-z]+) (.+)`);

    const tokens = [field.name + ':'];
    let inputTokens = [];
    const deps = new Set();

    let overrideType;
    const options = [];
    const listOptions = [];
    const description = [];
    if (field.documentation) {
      const lines = field.documentation.split('\n');
      for (let line of lines) {
        line = line.trim();
        const match = line.match(lineRegex);
        if (match) {
          switch (match[1]) {
            case 'type':
              overrideType = match[2];
              break;
            case 'opt':
              options.push(match[2]);
              break;
            case 'listopt':
              listOptions.push(match[2]);
              break;
            default:
              throw new Error(
                `${field.name}(${field.type}): uknown hint '@${generatorName}.${match[1]}'`,
              );
          }
        } else if (line === `@${generatorName}.hide`) {
          return {
            str: '',
            strInput: '',
            deps: [],
          };
        } else if (!line.startsWith('@')) {
          description.push(line);
        }
      }
    }

    if (description.length) {
      const opts = field.isList ? listOptions : options;
      if (!opts.some((opt) => opt.indexOf('description') >= 0)) {
        opts.push(
          'description: ' + JSON.stringify(description.join('\n').trim()),
        );
      }
    }

    const optionsStr = options.length ? `{ ${options.join(', ')} }` : '';

    let typeStr;
    if (['Int', 'Float', 'Decimal'].includes(field.type)) {
      typeStr = `Type.${overrideType || 'Number'}(${optionsStr})`;
    } else if (['BigInt'].includes(field.type)) {
      typeStr = `Type.${overrideType || 'Integer'}(${optionsStr})`;
    } else if (['String', 'DateTime', 'Json', 'Date'].includes(field.type)) {
      typeStr = `Type.${overrideType || 'String'}(${optionsStr})`;
    } else if (field.type === 'Boolean') {
      typeStr = `Type.${overrideType || 'Boolean'}(${optionsStr})`;
    } else {
      typeStr = `::${field.type}::`;
      deps.add(field.type);
    }

    if (field.isList) {
      const listOptionsStr = listOptions.length
        ? `, { ${listOptions.join(', ')} }`
        : '';
      typeStr = `Type.Array(${typeStr}${listOptionsStr})`;
    }

    tokens.push(typeStr);

    inputTokens = [...tokens];

    // @id cannot be optional except for input if it's auto increment
    if (field.isId && (field?.default as any)?.name === 'autoincrement') {
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
    };
  };

  const transformFields = (fields: DMMF.Field[]) => {
    let dependencies = new Set();
    const _fields: string[] = [];
    const _inputFields: string[] = [];

    fields.map(transformField).forEach((field) => {
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

  const transformModel = (model: DMMF.Model, models?: DMMF.Model[]) => {
    const description = model.documentation
      ?.split('\n')
      .filter((line) => !line.startsWith('@'))
      .join('\n')
      .trim();
    const options: ObjectOptions = {
      $id: model.name,
    };
    if (description?.length) {
      options.description = description;
    }
    const fields = transformFields(model.fields);
    let raw = [
      `${models ? '' : `export const ${model.name} = `}Type.Object({\n\t`,
      fields.rawString,
      `}, ${JSON.stringify(options)})`,
    ].join('\n');
    options.$id = `${model.name}Input`;
    let inputRaw = [
      `${models ? '' : `export const ${model.name}Input = `}Type.Object({\n\t`,
      fields.rawInputString,
      `}, ${JSON.stringify(options)})`,
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

  const transformEnum = (enm: DMMF.DatamodelEnum) => {
    const values = enm.values
      .map((v) => `${v.name}: Type.Literal('${v.name}'),\n`)
      .join('');

    return [
      `export const ${enm.name}Const = {`,
      values,
      '}\n',
      `export const ${enm.name} = Type.KeyOf(Type.Object(${enm.name}Const), { $id: "${enm.name}"})\n`,
      `export type ${enm.name}${typeSuffix} = Static<typeof ${enm.name}>`,
    ].join('\n');
  };

  function transformDMMF(dmmf: DMMF.Document) {
    const { models, enums } = dmmf.datamodel;
    const mainImport = 'import { Type, type Static } from "@sinclair/typebox"';

    return [
      ...models.map((model) => {
        let { raw, inputRaw, deps } = transformModel(model);

        [...deps].forEach((d) => {
          const depsModel = models.find((m) => m.name === d) as DMMF.Model;
          if (depsModel) {
            const replacer = transformModel(depsModel, models);
            const re = new RegExp(`::${d}::`, 'gm');
            raw = raw.replace(re, replacer.raw);
            inputRaw = inputRaw.replace(re, replacer.inputRaw);
          }
        });

        const importStatements = new Set();
        enums.forEach((enm) => {
          const re = new RegExp(`::${enm.name}::`, 'gm');
          if (raw.match(re)) {
            raw = raw.replace(re, enm.name);
            inputRaw = inputRaw.replace(re, enm.name);
            importStatements.add(`import { ${enm.name} } from './${enm.name}'`);
          }
        });

        return {
          name: model.name,
          rawString: [
            [mainImport, ...importStatements].join('\n'),
            raw,
            `export type ${model.name}${typeSuffix} = Static<typeof ${model.name}>`,
          ].join('\n\n'),
          inputRawString: [
            [mainImport, ...importStatements].join('\n'),
            inputRaw,
            `export type ${model.name}Input = Static<typeof ${model.name}Input>`,
          ].join('\n\n'),
        };
      }),
      ...enums.map((enm) => {
        return {
          name: enm.name,
          inputRawString: null,
          rawString:
            'import {Type, Static} from "@sinclair/typebox"\n\n' +
            transformEnum(enm),
        };
      }),
    ];
  }

  return transformDMMF;
}
