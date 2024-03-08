import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Icons } from "./ui/icons";
import { toast } from "sonner";
import type { Post, Retweet } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

dayjs.extend(relativeTime);

type PostProps = {
  post: Post & {
    likedBy: { externalId: string | undefined }[];
    retweets: Retweet[];
  };
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
  const { post, author } = props;
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [postLikes, setPostLikes] = useState(0);
  const [postRetweets, setPostRetweets] = useState(0);
  const ctx = api.useUtils();
  const retweetAuthor = props.retweetAuthor;

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
      onError: () => {
        toast.error("You may only retweet a post once");
      },
    });

  const { mutate: deleteMutate, isLoading: loadingDelete } =
    api.post.delete.useMutation({
      onSuccess: () => {
        void ctx.post.getAll.invalidate();
        void ctx.post.userPosts.invalidate();
        toast.success("Post deleted successfully");
      },
      onError: () => {
        toast.error("There was an error deleting the post");
      },
    });

  useEffect(() => {
    const userCheck = post.likedBy.some(
      (user: { externalId: string | undefined }) => {
        return user.externalId === currentUser?.id;
      },
    );

    const retweetCheck = post.retweets.some((retweet: Retweet) => {
      return retweet.authorId === currentUser?.username;
    });

    setIsLiked(userCheck);
    setIsRetweeted(retweetCheck);
    setPostRetweets(post.retweets.length);
    setPostLikes(post.likedBy.length);
  }, [post.likedBy, currentUser?.id, post.retweets, currentUser?.username]);

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
      // this is not working correctly
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

  function handleDelete(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string,
  ) {
    e.preventDefault();

    deleteMutate({ id });
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
          <Link href={`/@${author.username}`}>
            <div className="flex flex-col">
              <p className="scroll-m-20 text-xl font-semibold tracking-tight">
                {author.fullName}
              </p>
              <p className="text-sm font-thin">@{author.username}</p>
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
        <div className="flex flex-row gap-4">
          <Button
            variant={"ghost"}
            onClick={(e) => handleLike(e, post.id)}
            disabled={loadingLike}
            className="flex flex-row items-center justify-center gap-1 p-2"
          >
            {!isLiked ? (
              <Icons.emptyHeart className="h-5 w-5" />
            ) : (
              <Icons.heart className="h-5 w-5" color="#ef4444" />
            )}
            {postLikes}
          </Button>
          <Button
            variant={"ghost"}
            onClick={(e) => handleRetweet(e, post.id, author.id)}
            disabled={loadingRetweet}
            className="flex flex-row items-center justify-center gap-1 p-2"
          >
            {!isRetweeted ? (
              <Icons.retweet className="h-5 w-5" />
            ) : (
              <Icons.retweet className="h-5 w-5" color="#15803d" />
            )}
            {postRetweets}
          </Button>
        </div>
        {currentUser?.id === author.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} name="menu" className="p-2">
                <Icons.menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="center" forceMount>
              <DropdownMenuItem
                className="flex items-center"
                onClick={(e) => handleDelete(e, post.id)}
                disabled={loadingDelete}
              >
                <Icons.delete className="h-5 w-5" />{" "}
                <span className="ml-2 text-base font-semibold">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
