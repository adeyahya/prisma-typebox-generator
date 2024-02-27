import { Type, Static } from "@sinclair/typebox";
import { Role } from "./Role";

export const User = Type.Object(
  {
    id: Type.Number(),
    createdAt: Type.Union([Type.String(), Type.Null()]),
    email: Type.String(),
    weight: Type.Union([Type.Number(), Type.Null()]),
    is18: Type.Union([Type.Boolean(), Type.Null()]),
    name: Type.Union([Type.String(), Type.Null()]),
    successorId: Type.Union([Type.Number(), Type.Null()]),
    role: Type.Union([Role, Type.Null()]),
    posts: Type.Array(
      Type.Object({
        id: Type.Number(),
        userId: Type.Union([Type.Number(), Type.Null()]),
      })
    ),
    keywords: Type.Array(Type.String({ minLength: 3 }), { maxItems: 10 }),
    biography: Type.String({ description: "field description" }),
    decimal: Type.Number({ description: "used description" }),
    biginteger: Type.Integer({ description: "multiline\ndescription" }),
    unsigned: Type.Integer({ minimum: 0 }),
  },
  { description: "model description" }
);

export type UserType = Static<typeof User>;
