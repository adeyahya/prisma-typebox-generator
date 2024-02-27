import { Type, Static } from "@sinclair/typebox";

export const Post = Type.Object({
  id: Type.Number(),
  userId: Type.Union([Type.Number(), Type.Null()]),
});

export type PostType = Static<typeof Post>;
