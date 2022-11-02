import { Type, Static } from "@sinclair/typebox";

export const tbx_User = Type.Object({
  id: Type.Number(),
  createdAt: Type.Optional(Type.String()),
  email: Type.String(),
  weight: Type.Optional(Type.Number()),
  is18: Type.Optional(Type.Boolean()),
  name: Type.Optional(Type.String()),
  successorId: Type.Optional(Type.Number()),
  keywords: Type.Array(Type.String()),
  biography: Type.String(),
  decimal: Type.Number(),
  biginteger: Type.Integer(),
});

export type tbx_UserType = Static<typeof tbx_User>;
