import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserInfo } from "~/lib/utils";

export const profileRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      // clerk only allows us to search a single user by id, so we search the list for
      // users with the given username and get the first result.
      //
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return filterUserInfo(user);
    }),
});
