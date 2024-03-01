import { type User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// using upstash to rate limit the create post endpoint. 5 posts per minute.
//
const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  timeout: 1000, // 1 second
  analytics: true,
});

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
        content: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;
      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded",
        });
      }

      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          authorId,
        },
      });

      return post;
    }),
});
