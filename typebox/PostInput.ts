import { Type, Static } from "@sinclair/typebox";

export const PostInput = Type.Object({
  id: Type.Optional(Type.Number()),
  userId: Type.Optional(Type.Number()),
});

export type PostInput = Static<typeof PostInput>;
