import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserInfo } from "~/lib/utils";
import type { Post, Retweet, User } from "@prisma/client";
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

export type PostWithLikes = Post & { likedBy: User[]; retweets: Retweet[] };

async function addUserToPost(posts: PostWithLikes[]) {
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
      retweetId: "",
      retweetAuthor: "",
      retweetedAt: new Date(post.createdAt),
    };
  });
}

export const postRouter = createTRPCRouter({
  singlePost: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const post = await ctx.db.post.findUnique({
        where: { id },
        include: { likedBy: true, retweets: true },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const user = await clerkClient.users.getUser(post.authorId);

      if (!user.username) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      const author = filterUserInfo(user);

      return {
        post,
        author,
        retweetId: "",
        retweetAuthor: "",
        retweetedAt: new Date(post.createdAt),
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { likedBy: true, retweets: true },
    });

    if (!posts) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No posts found",
      });
    }

    const retweets = await ctx.db.retweet.findMany({
      include: {
        originalPost: { include: { likedBy: true } },
        originalAuthor: true,
      },
    });

    const originalPosts = await addUserToPost(posts);

    const fullRetweets = retweets.map((post) => {
      const originalPost = originalPosts.find(
        (originalPost) => originalPost.post.id === post.originalPostId,
      );

      if (originalPost) {
        return {
          ...originalPost,
          retweetId: post.id,
          retweetAuthor: post.authorId,
          retweetedAt: post.createdAt,
        };
      }
    });
    const combined = [...originalPosts, ...fullRetweets];

    combined.sort(
      (a, b) =>
        (b?.retweetedAt?.getTime() ?? 0) - (a?.retweetedAt?.getTime() ?? 0),
    );

    return combined;
  }),

  userPosts: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user?.username) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userPosts = await ctx.db.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        include: { likedBy: true, retweets: true },
      });

      const allPosts = await ctx.db.post.findMany({
        orderBy: { createdAt: "desc" },
        include: { likedBy: true, retweets: true },
      });

      const retweets = await ctx.db.retweet.findMany({
        where: { authorId: user.username },
        include: {
          originalPost: { include: { likedBy: true } },
          originalAuthor: true,
        },
      });

      const originalPosts = await addUserToPost(userPosts);
      const allPostsFormatted = await addUserToPost(allPosts);

      const fullRetweets = retweets.map((post) => {
        const originalPost = allPostsFormatted.find(
          (originalPost) => originalPost.post.id === post.originalPostId,
        );

        if (originalPost) {
          return {
            ...originalPost,
            retweetId: post.id,
            retweetAuthor: post.authorId,
            retweetedAt: post.createdAt,
          };
        }
      });

      const combined = [...originalPosts, ...fullRetweets];

      combined.sort(
        (a, b) =>
          (b?.retweetedAt?.getTime() ?? 0) - (a?.retweetedAt?.getTime() ?? 0),
      );

      return combined;
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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.currentUser;

      const post = await ctx.db.post.findUnique({
        where: { id },
        include: { likedBy: true },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const userCheck = post.likedBy.some((user) => user.externalId === userId);

      if (!userCheck) {
        await ctx.db.post.update({
          where: { id },
          include: { likedBy: true },
          data: {
            likedBy: {
              connect: { externalId: userId },
            },
          },
        });
      } else {
        await ctx.db.post.update({
          where: { id },
          include: { likedBy: true },
          data: {
            likedBy: {
              disconnect: { externalId: userId },
            },
          },
        });
      }

      await ctx.db.post.findMany({
        where: {
          likedBy: {
            some: {
              externalId: userId,
            },
          },
        },
        include: { likedBy: true },
      });
    }),

  retweet: privateProcedure
    .input(z.object({ id: z.string(), originalAuthorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, originalAuthorId } = input;
      const authorId = ctx.currentUser;
      const user = await clerkClient.users.getUser(authorId);

      if (!user.username) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const post = await ctx.db.post.findUnique({
        where: { id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const existingRetweet = await ctx.db.retweet.findFirst({
        where: {
          originalPostId: id,
          originalAuthorId,
          authorId: user.username,
        },
      });

      if (existingRetweet) {
        await ctx.db.retweet.delete({
          where: {
            id: existingRetweet.id,
          },
        });

        return;
      }

      const retweet = await ctx.db.retweet.create({
        data: {
          originalPostId: id,
          originalAuthorId,
          authorId: user.username,
        },
      });

      return retweet;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const authorId = ctx.currentUser;

      const post = await ctx.db.post.findUnique({
        where: { id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== authorId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post",
        });
      }

      await ctx.db.retweet.deleteMany({
        where: { originalPostId: id },
      });

      await ctx.db.post.delete({
        where: { id },
      });

      return post;
    }),
});
