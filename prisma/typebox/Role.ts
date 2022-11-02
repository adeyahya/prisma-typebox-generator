import { Type, Static } from "@sinclair/typebox";

export const tbx_RoleConst = {
  USER: Type.Literal("USER"),
  ADMIN: Type.Literal("ADMIN"),
};

export const tbx_Role = Type.KeyOf(Type.Object(tbx_RoleConst));

export type tbx_RoleType = Static<typeof tbx_Role>;
