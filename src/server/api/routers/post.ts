import { type User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError, createInputMiddleware } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

function filterUserInfo(user: User) {
  return {
    id: user.id,
    email: user.primaryEmailAddressId,
    username: user.username,
    imageUrl: user.imageUrl,
    fullName:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username,
  };
}

export const postRouter = createTRPCRouter({
  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch user info for each post.
    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
      })
    ).map(filterUserInfo);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      return {
        post,
        author,
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(ctx.currentUser);
      const authorId = ctx.currentUser;

      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          authorId,
        },
      });

      return post;
    }),
});
