import { Type, Static } from "@sinclair/typebox";

export const PostTypeConst = {
  TEXT: Type.Literal("TEXT"),
  IMAGE: Type.Literal("IMAGE"),
  VIDEO: Type.Literal("VIDEO"),
};

export const PostType = Type.KeyOf(Type.Object(PostTypeConst), {
  $id: "PostType",
});

export type PostType = Static<typeof PostType>;
