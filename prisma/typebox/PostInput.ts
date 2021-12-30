import { Type, Static } from "@sinclair/typebox";
import { Role } from "./Role";

export const PostInput = Type.Object({
  id: Type.Optional(Type.Number()),
  user: Type.Optional(
    Type.Object({
      id: Type.Optional(Type.Number()),
      createdAt: Type.Optional(Type.String()),
      email: Type.String(),
      weight: Type.Optional(Type.Number()),
      is18: Type.Optional(Type.Boolean()),
      name: Type.Optional(Type.String()),
      successorId: Type.Optional(Type.Number()),
      role: Type.Optional(Role),
      keywords: Type.Array(Type.String()),
      biography: Type.String(),
      decimal: Type.Number(),
      biginteger: Type.Integer(),
    })
  ),
  userId: Type.Optional(Type.Number()),
});

export type PostInputType = Static<typeof PostInput>;
