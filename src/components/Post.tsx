import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { Icons } from "./ui/icons";
import { toast } from "sonner";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

export default function Post(props: PostWithUser) {
  const { user: currentUser, isSignedIn } = useUser();
  const [isLikedByUser, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [postLikes, setPostLikes] = useState(props.post.likedBy.length);
  const ctx = api.useUtils();
  const { post, author } = props;

  const { mutate: likeMutate, isLoading: loadingLike } =
    api.post.addLike.useMutation({
      onSuccess: () => {
        void ctx.post.getAll.invalidate();
        void ctx.post.userPosts.invalidate();
      },
    });

  useEffect(() => {
    const likeCheck = post.likedBy.some(
      (user: { externalId: string | undefined }) =>
        user.externalId === currentUser?.id,
    );

    // const retweetCheck = post.likedBy.some(
    //   (user: { externalId: string | undefined }) =>
    //     user.externalId === currentUser?.id,
    // );

    setIsLiked(likeCheck);
    // setIsRetweeted(retweetCheck);
  }, [post.likedBy, currentUser?.id]);

  const { mutate: retweetMutate, isLoading: loadingRetweet } =
    api.post.retweet.useMutation({
      onSuccess: () => {
        // void means we don't care about waiting for this to finish, no need for async/await
        //
        void ctx.post.getAll.invalidate();
        void ctx.post.userPosts.invalidate();
        toast.success("Retweeted successfully");
      },
      onError: (e) => {
        const error = e.data?.zodError?.fieldErrors.content;
        toast.error("Failed to retweet post!", {
          description: error
            ? error
            : "Too many requests, try again in a few minutes.",
        });
      },
    });

  async function handleRetweet(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    content: string,
    originalId: string,
    originalAuthor: string,
  ) {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("You must be signed in to like a post");
      return;
    }

    setIsRetweeted(!isRetweeted);
    retweetMutate({ content, originalId, originalAuthor });
  }

  async function handleLike(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string,
  ) {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("You must be signed in to like a post");
      return;
    }

    if (isLikedByUser) {
      setPostLikes(postLikes - 1);
    } else {
      setPostLikes(postLikes + 1);
    }

    setIsLiked(!isLikedByUser);
    likeMutate({ id });
  }

  return (
    <div className="border-b p-6">
      {post.originalAuthor && (
        <p className="text-md mb-7 italic text-muted-foreground">
          Reposted by: {author.username}
        </p>
      )}
      <div className="mb-4 flex flex-row justify-between">
        <div className="flex w-full flex-row items-center gap-4">
          <Link href={`/@${author.username}`}>
            <Image
              src={author.imageUrl}
              alt="post profile picture"
              width={50}
              height={50}
              className="rounded-full"
            />
          </Link>
          <Link href={`/@${post.originalAuthor ?? author.username}`}>
            <div className="flex flex-col">
              <p className="scroll-m-20 text-xl font-semibold tracking-tight">
                {post.originalAuthor ?? author.fullName}
              </p>
              <p className="text-sm font-thin">
                @{post.originalAuthor ?? author.username}
              </p>
            </div>
          </Link>
        </div>
        {/* not sure if I want this in the right corner like this or next to the user's name */}
        <div className="flex w-full justify-end text-sm text-gray-500">
          {dayjs(post.createdAt).fromNow()}
        </div>
      </div>
      <Link href={`/post/${post.id}`}>
        <div className="mb-4 whitespace-pre-wrap p-2 text-base font-semibold">
          {post.content}
        </div>
      </Link>
      <div className="flex w-full flex-row items-center justify-between gap-4">
        <button
          onClick={(e) =>
            post.originalAuthor
              ? handleLike(e, post.originalId ?? "")
              : handleLike(e, post.id)
          }
          disabled={loadingLike}
          className="flex flex-row items-center justify-center gap-1"
        >
          {!isLikedByUser ? (
            <Icons.emptyHeart className="h-5 w-5" />
          ) : (
            <Icons.heart className="h-5 w-5" color="#ef4444" />
          )}
          {postLikes}
        </button>
        <button
          onClick={(e) =>
            handleRetweet(e, post.content, post.id, author.username ?? "")
          }
          disabled={loadingRetweet}
          className="flex flex-row items-center justify-center gap-1"
        >
          {!isRetweeted ? (
            <Icons.retweet className="h-5 w-5" />
          ) : (
            <Icons.retweet className="h-5 w-5" color="#15803d" />
          )}
        </button>
        <Icons.menu className="h-5 w-5" />
      </div>
    </div>
  );
}
