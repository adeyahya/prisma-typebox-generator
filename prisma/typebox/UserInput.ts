import { Type, type Static } from '@sinclair/typebox';
import { Role } from './Role';

export const UserInput = Type.Object(
  {
    id: Type.Optional(Type.Number()),
    createdAt: Type.Optional(Type.String()),
    email: Type.String(),
    weight: Type.Optional(Type.Number()),
    is18: Type.Optional(Type.Boolean()),
    name: Type.Optional(Type.String()),
    successorId: Type.Optional(Type.Number()),
    role: Type.Optional(Role),
    posts: Type.Array(
      Type.Object(
        {
          id: Type.Optional(Type.Number()),
          userId: Type.Optional(Type.Number()),
        },
        { $id: 'PostInput' },
      ),
    ),
    keywords: Type.Array(Type.String({ minLength: 3 }), { maxItems: 10 }),
    biography: Type.String({ description: 'field description' }),
    decimal: Type.Number({ description: 'used description' }),
    biginteger: Type.Integer({ description: 'multiline\ndescription' }),
    unsigned: Type.Integer({ minimum: 0 }),
  },
  { $id: 'UserInput', description: 'model description' },
);

export type UserInput = Static<typeof UserInput>;
