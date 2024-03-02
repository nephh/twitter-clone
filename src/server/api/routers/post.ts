import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserInfo } from "~/lib/utils";
import type { Post } from "@prisma/client";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// using upstash to rate limit the create post endpoint. 5 posts per minute.
//
export const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  timeout: 1000,
  analytics: true,
});

async function addUserToPost(posts: Post[]) {
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
}

export const postRouter = createTRPCRouter({
  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      include: { likedBy: true },
    });
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { likedBy: true },
    });

    if (!posts) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No posts found",
      });
    }

    return addUserToPost(posts);
  }),

  userPosts: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const posts = await ctx.db.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        include: { likedBy: true },
      });

      return addUserToPost(posts);
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .max(255)
          .refine((value) => value.trim().length > 0, {
            message: "Content must not be empty",
          }),
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

  addLike: privateProcedure
    .input(z.object({ id: z.string(), payload: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: postId, payload } = input;
      const userId = ctx.currentUser;

      const post = await ctx.db.post.findUnique({
        where: { id: postId },
        include: { likedBy: true },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // const user = await ctx.db.user.findUnique({
      //   where: { externalId: userId },
      // });

      // if (!user) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: "User not found",
      //   });
      // }

      // await ctx.db.user.update({
      //   where: { externalId: userId },
      //   include: { likedPosts: true },
      //   data: {
      //     likedPosts: {
      //       connect: { id: postId },
      //     },
      //   },
      // });

      const userCheck = post.likedBy.some((user) => user.externalId === userId);

      if (!userCheck) {
        await ctx.db.post.update({
          where: { id: postId },
          include: { likedBy: true },
          data: {
            likedBy: {
              connect: { externalId: userId },
            },
          },
        });
      } else {
        await ctx.db.post.update({
          where: { id: postId },
          include: { likedBy: true },
          data: {
            likedBy: {
              disconnect: { externalId: userId },
            },
          },
        });
      }
    }),
});
