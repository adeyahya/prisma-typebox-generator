import { Type, Static } from "@sinclair/typebox";

export const Post = Type.Object({
  id: Type.Number(),
  userId: Type.Optional(Type.Number()),
});

export type Post = Static<typeof Post>;
