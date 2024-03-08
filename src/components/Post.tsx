import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { Icons } from "./ui/icons";
import { toast } from "sonner";
import type { Post } from "@prisma/client";

dayjs.extend(relativeTime);

type PostProps = {
  post: Post & { likedBy: { externalId: string | undefined }[] };
  author: {
    id: string;
    email: string | null;
    username: string | null;
    imageUrl: string;
    fullName: string | null;
    createdAt: number;
  };
  retweetAuthor: string;
  retweetId: string;
  retweetedAt: Date;
};

export default function Post(props: PostProps) {
  const { user: currentUser, isSignedIn } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [postLikes, setPostLikes] = useState(0);
  const ctx = api.useUtils();
  const retweetAuthor = props.retweetAuthor;

  const { post, author } = props;


  const { mutate: likeMutate, isLoading: loadingLike } =
    api.post.addLike.useMutation({
      onSuccess: () => {
        void ctx.post.getAll.invalidate();
        void ctx.post.userPosts.invalidate();
      },
    });

  const { mutate: retweetMutate, isLoading: loadingRetweet } =
    api.post.retweet.useMutation({
      onSuccess: () => {
        void ctx.post.getAll.invalidate();
        void ctx.post.userPosts.invalidate();
      },
      onError: (e) => {
        toast.error("You may only retweet a post once");
      },
    });

  useEffect(() => {
    const likeCheck = post.likedBy.some(
      (user: { externalId: string | undefined }) =>
        user.externalId === currentUser?.id,
    );
    setIsLiked(userCheck);
    setPostLikes(post.likedBy.length);
  }, [post?.likedBy, currentUser?.id]);

  async function handleLike(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string,
  ) {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("You must be signed in to like a post");
      return;
    }


    if (isLiked) {
      setPostLikes(postLikes - 1);
    } else {
      setPostLikes(postLikes + 1);
    }
    setIsLiked(!isLiked);
    likeMutate({ id });
  }

  function handleRetweet(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string,
    originalAuthorId: string,
  ) {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("You must be signed in to retweet a post");
      return;
    }

    retweetMutate({ id, originalAuthorId });
  }

  if (!post || !author) {
    return null;
  }

  return (
    <div className="border-b p-6">
      {retweetAuthor === "" ? null : (
        <p className="mb-5 text-base italic text-muted-foreground opacity-50">
          Retweeted by: {retweetAuthor}
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
          onClick={(e) => handleLike(e, post.id)}
          disabled={loadingLike}
          className="flex flex-row items-center justify-center gap-1"
        >
          {!isLiked ? (
            <Icons.emptyHeart className="h-5 w-5" />
          ) : (
            <Icons.heart className="h-5 w-5" color="#ef4444" />
          )}
          {postLikes}
        </button>
        <button
          onClick={(e) => handleRetweet(e, post.id, author.id)}
          disabled={loadingRetweet}
          className="flex flex-row items-center justify-center gap-1"
        >
          {!isLiked ? (
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
