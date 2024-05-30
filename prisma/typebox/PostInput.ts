import { Type, type Static } from '@sinclair/typebox';
import { PostType } from './PostType';

export const PostInput = Type.Object(
  {
    id: Type.Optional(Type.Number()),
    userId: Type.Optional(Type.Number()),
    type: PostType,
  },
  { $id: 'PostInput' },
);

export type PostInput = Static<typeof PostInput>;
