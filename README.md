[![Actions Status](https://github.com/adeyahya/prisma-typebox-generator/workflows/build/badge.svg)](https://github.com/adeyahya/prisma-typebox-generator/actions)
[![npm](https://img.shields.io/npm/v/prisma-typebox-generator)](https://www.npmjs.com/package/prisma-typebox-generator)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/adeyahya/prisma-typebox-generator/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/Naereen/badges/)

# Prisma Typebox Generator

A generator, which takes a Prisma 2 `schema.prisma` and generates a typebox snippets.

## Getting Started

**1. Install**

npm:

```shell
npm install prisma-typebox-generator --save-dev
```

yarn:

```shell
yarn add -D prisma-typebox-generator
```

**2. Add the generator to the schema**

```prisma
generator typebox {
  provider = "prisma-typebox-generator"
  // Optionally exclude relations from the generated types
  includeRelations = false // default: true
  // Optionally prefix all types with a string
  prefix = "tbx_" // default: ""
}
```

With a custom output path (default=./typebox)

```prisma
generator typebox {
  provider = "prisma-typebox-generator"
  output = "custom-output-path"
}
```

**3. Run generation**

prisma:

```shell
prisma generate
```

nexus with prisma plugin:

```shell
nexus build
```

## Supported Node Versions

|         Node Version | Support            |
| -------------------: | :----------------- |
| (Maintenance LTS) 10 | :heavy_check_mark: |
|      (Active LTS) 12 | :heavy_check_mark: |
|         (Current) 14 | :heavy_check_mark: |

## Examples

This generator converts a prisma schema like this:

```prisma
datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}

model User {
    id          Int      @id @default(autoincrement())
    createdAt   DateTime @default(now())
    email       String   @unique
    weight      Float?
    is18        Boolean?
    name        String?
    successorId Int?
    successor   User?    @relation("BlogOwnerHistory", fields: [successorId], references: [id])
    predecessor User?    @relation("BlogOwnerHistory")
    role        Role     @default(USER)
    posts       Post[]
    keywords    String[]
    biography   Json
}

model Post {
    id     Int   @id @default(autoincrement())
    user   User? @relation(fields: [userId], references: [id])
    userId Int?
}

enum Role {
    USER
    ADMIN
}
```

## License: MIT

Copyright (c) 2022 Ade Yahya Prasetyo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
