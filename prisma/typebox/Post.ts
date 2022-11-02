import { Type, Static } from "@sinclair/typebox";
import { tbx_Role } from "./Role";

export const tbx_Post = Type.Object({
  id: Type.Number(),
  userId: Type.Optional(Type.Number()),
});

export type tbx_PostType = Static<typeof tbx_Post>;
