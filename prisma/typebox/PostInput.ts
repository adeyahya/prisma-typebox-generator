import { Type, Static } from "@sinclair/typebox";
import { tbx_Role } from "./Role";

export const tbx_PostInput = Type.Object({
  id: Type.Optional(Type.Number()),
  userId: Type.Optional(Type.Number()),
});

export type tbx_PostInputType = Static<typeof tbx_PostInput>;
