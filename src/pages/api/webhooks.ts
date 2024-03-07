import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import { db } from "~/server/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405);
  }
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Error occured -- no svix headers" });
  }

  // Get the body
  const body = (await buffer(req)).toString();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).json({ Error: err });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, ...attributes } = evt.data;

    await db.user.upsert({
      where: {
        externalId: id,
      },
      update: {
        username: attributes.username ?? "",
      },
      create: {
        externalId: id,
        username: attributes.username ?? "",
      },
    });
  } else if (eventType === "user.deleted") {
    // deleted user's posts are not removed from other
    // user's likedPosts array
    const { id } = evt.data;

    const posts = await db.post.findMany({
      include: { likedBy: true },
      where: {
        likedBy: {
          some: {
            externalId: id,
          },
        },
      },
    });

    for (const post of posts) {
      await db.post.update({
        where: { id: post.id },
        include: { likedBy: true },
        data: {
          likedBy: {
            disconnect: {
              externalId: id,
            },
          },
        },
      });
    }

    await db.post.deleteMany({
      where: {
        authorId: id,
      },
    });

    await db.user.delete({
      where: {
        externalId: id,
      },
    });
  }

  return res.status(200).json({ response: "Success" });
}
