import { Type, Static } from "@sinclair/typebox";
import { Role } from "./Role";

export const User = Type.Object({
  id: Type.Optional(Type.Number()),
  createdAt: Type.Optional(Type.String()),
  email: Type.String(),
  weight: Type.Optional(Type.Number()),
  is18: Type.Optional(Type.Boolean()),
  name: Type.Optional(Type.String()),
  successorId: Type.Optional(Type.Number()),
  role: Type.Optional(Role),
  posts: Type.Array(
    Type.Object({
      id: Type.Optional(Type.Number()),
      userId: Type.Optional(Type.Number()),
    })
  ),
  keywords: Type.Array(Type.String()),
  biography: Type.String(),
});

export type UserType = Static<typeof User>;
