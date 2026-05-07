import { defineRelations } from "drizzle-orm";
import {
  accounts,
  passkeys,
  sessions,
  twoFactors,
  users,
} from "../db/schema/auth.ts";
import { postImages, posts } from "../db/schema/blog.ts";

export const relations = defineRelations(
  {
    users,
    sessions,
    accounts,
    twoFactors,
    passkeys,
    posts,
    postImages,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
      }),
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
      twoFactors: r.many.twoFactors({
        from: r.users.id,
        to: r.twoFactors.userId,
      }),
      passkeys: r.many.passkeys({
        from: r.users.id,
        to: r.passkeys.userId,
      }),
      posts: r.many.posts({
        from: r.users.id,
        to: r.posts.authorId,
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
    twoFactors: {
      user: r.one.users({
        from: r.twoFactors.userId,
        to: r.users.id,
      }),
    },
    passkeys: {
      user: r.one.users({
        from: r.passkeys.userId,
        to: r.users.id,
      }),
    },
    posts: {
      author: r.one.users({
        from: r.posts.authorId,
        to: r.users.id,
      }),
      images: r.many.postImages({
        from: r.posts.id,
        to: r.postImages.postId,
      }),
    },
    postImages: {
      post: r.one.posts({
        from: r.postImages.postId,
        to: r.posts.id,
      }),
    },
  }),
);
