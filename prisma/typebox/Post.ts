import { Type, Static } from "@sinclair/typebox";
import { PostType } from "./PostType";

export const Post = Type.Object(
  {
    id: Type.Number(),
    userId: Type.Optional(Type.Number()),
    type: PostType,
  },
  { $id: "Post" },
);

export type Post = Static<typeof Post>;
