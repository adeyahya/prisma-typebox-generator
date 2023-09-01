import { generatorHandler } from '@prisma/generator-helper';
import { createTransformer } from './generator/transformDMMF';
import { parseEnvValue } from '@prisma/internals';
import * as fs from 'fs';
import * as path from 'path';
import prettier, { Config as PrettierConfig } from 'prettier';
import { loadConfig } from 'c12';

interface GeneratorConfig {
  typeSuffix?: string;
  prettierConfig?: string;
}

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './typebox',
      prettyName: 'Prisma Typebox Generator',
    };
  },
  async onGenerate(options) {
    const generatorConfig = options.generator
      .config as unknown as GeneratorConfig;
    const prettierOptions: PrettierConfig = {
      parser: 'babel-ts',
    };
    if (generatorConfig.prettierConfig) {
      const { config } = await loadConfig({
        configFile: generatorConfig.prettierConfig,
      });
      if (config && typeof config === 'object') {
        Object.keys(config).forEach((key) => {
          (prettierOptions as any)[key] = config[key];
        });
      }
    }
    const transformDMMF = createTransformer(
      options.generator.name,
      generatorConfig.typeSuffix ?? '',
    );
    const payload = transformDMMF(options.dmmf);
    if (!options.generator.output) {
      throw new Error('No output was specified for Prisma Typebox Generator');
    }
    const outputDir =
      // This ensures previous version of prisma are still supported
      typeof options.generator.output === 'string'
        ? (options.generator.output as unknown as string)
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          parseEnvValue(options.generator.output);
    try {
      await fs.promises.mkdir(outputDir, {
        recursive: true,
      });
      const barrelFile = path.join(outputDir, 'index.ts');
      await fs.promises.writeFile(barrelFile, '', {
        encoding: 'utf-8',
      });
      await Promise.all(
        payload.map(async (n) => {
          const fsPromises = [];
          fsPromises.push(
            fs.promises.writeFile(
              path.join(outputDir, n.name + '.ts'),
              await prettier.format(n.rawString, prettierOptions),
              {
                encoding: 'utf-8',
              },
            ),
          );

          fsPromises.push(
            fs.promises.appendFile(
              barrelFile,
              `export * from './${n.name}';\n`,
              { encoding: 'utf-8' },
            ),
          );
          if (n.inputRawString) {
            fsPromises.push(
              fs.promises.writeFile(
                path.join(outputDir, n.name + 'Input.ts'),
                await prettier.format(n.inputRawString, prettierOptions),
                {
                  encoding: 'utf-8',
                },
              ),
            );
            fsPromises.push(
              fs.promises.appendFile(
                barrelFile,
                `export * from './${n.name}Input';\n`,
                { encoding: 'utf-8' },
              ),
            );
          }

          return Promise.all(fsPromises);
        }),
      );
    } catch (e) {
      console.error(
        'Error: unable to write files for Prisma Typebox Generator',
      );
      throw e;
    }
  },
});
