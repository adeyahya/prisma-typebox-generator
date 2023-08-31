import { Type, Static } from "@sinclair/typebox";

export const RoleConst = {
  USER: Type.Literal("USER"),
  ADMIN: Type.Literal("ADMIN"),
};

export const Role = Type.KeyOf(Type.Object(RoleConst));

export type Role = Static<typeof Role>;