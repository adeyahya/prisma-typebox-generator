import { Type, Static } from "@sinclair/typebox";

export const Post = Type.Object(
  {
    id: Type.Number(),
    userId: Type.Optional(Type.Number()),
  },
  { $id: "Post" },
);

export type Post = Static<typeof Post>;
