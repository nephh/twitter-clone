import Head from "next/head";
import Link from "next/link";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";

import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loading, LoadingPage } from "~/components/Loading";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";

dayjs.extend(relativeTime);

// The UserButton we are using can take a second to load in, so we use an image in the same place
// that will be replaced by the UserButton once it is loaded in. Looks a bit cleaner, but obviously is a bit inefficient.
// The "size" prop also only changes the size of the Image, and we need to go into the styles file to change
// the UserButton. This component can be reused, just make sure to resize the UserButton separately each time if needed.
//
function ProfilePicture({ size = 80 }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{ position: "absolute", zIndex: 1 }}
        className="create-post-avatar"
        itemType="button"
      >
        <UserButton afterSignOutUrl="/" />
      </div>
      <Image
        src={user.imageUrl}
        alt="profile picture"
        width={size}
        height={size}
        className="rounded-full"
        style={{ position: "absolute", zIndex: 0 }}
      />
    </div>
  );
}

function CreatePostWizard() {
  const [value, setValue] = useState("");
  const [charCount, setCharCount] = useState(0);
  const ctx = api.useUtils();
  const { mutate, isLoading } = api.post.create.useMutation({
    onSuccess: () => {
      setValue("");
      setCharCount(0);
      // void means we don't care about waiting for this to finish, no need for async/await
      //
      void ctx.post.getAll.invalidate();
      toast("Post created!", {
        description: "Your post has been created successfully.",
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    },
    onError: (e) => {
      const error = e.data?.zodError?.fieldErrors.content;
      toast("Failed to create post!", {
        description: error
          ? error
          : "Too many requests, try again in a few minutes.",
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newCharCount = e.target.value.length;
    if (newCharCount <= 255) {
      setValue(e.target.value);
      setCharCount(newCharCount);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutate({ content: value });
  }

  return (
    <form
      className="flex w-full flex-row-reverse gap-4"
      onSubmit={(e) => handleSubmit(e)}
    >
      <p className="absolute text-xs text-gray-500">{255 - charCount}</p>
      {isLoading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <button
          name="post"
          className="text-base font-semibold"
          disabled={isLoading}
        >
          Post
        </button>
      )}
      {/* eventually we want this input to be a textarea that will grow vertically
      instead of infinitely to the right */}
      <input
        type="text"
        name="post"
        placeholder="Type something..."
        className={`grow bg-transparent outline-none ${!value && "italic"}`}
        value={value}
        onChange={(e) => handleChange(e)}
        disabled={isLoading}
      />
      <ProfilePicture />
    </form>
  );
}

type PostWithUser = RouterOutputs["post"]["getAll"][number];

function Post(props: PostWithUser) {
  const { post, author } = props;

  return (
    <div className="border-b p-6">
      <div className="mb-4 flex flex-row justify-between">
        <div className="flex w-full flex-row items-center gap-4">
          <Image
            src={author.imageUrl}
            alt="post profile picture"
            width={50}
            height={50}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <p className="scroll-m-20 text-xl font-semibold tracking-tight">
              {author.fullName}
            </p>
            <p className="text-sm font-thin">@{author.username}</p>
          </div>
        </div>
        {/* not sure if I want this in the right corner like this or next to the user's name */}
        <div className="flex w-full justify-end text-sm text-gray-500">
          {dayjs(post.createdAt).fromNow()}
        </div>
      </div>
      <div className="whitespace-pre-wrap p-2 text-base font-semibold">
        {post.content}
      </div>
    </div>
  );
}

function FeedSkelly() {
  const skeletonCount = 5; // Change this to the desired number of skeletons
  return (
    <div className="flex flex-col items-center">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div
          key={index}
          className="flex w-full flex-col space-y-8 border-b p-6 py-8"
        >
          <div className="flex flex-row space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="ml-4 h-4 w-[700px]" />
        </div>
      ))}
    </div>
  );
}

function PostFeed() {
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) {
    return <FeedSkelly />;
  }

  if (!data) {
    return <div>Something went wrong :(</div>;
  }

  return (
    <div className="flex flex-col">
      {data.map(({ post, author }) => (
        <Post key={post.id} post={post} author={author} />
      ))}
    </div>
  );
}

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingPage />;
  }

  return (
    <>

      <main className="flex justify-center">
        <div className="flex h-screen w-full flex-col border-x md:max-w-4xl">
          <div className="flex flex-row items-center justify-center gap-4 border-b p-4">
            {isSignedIn ? (
              <CreatePostWizard />
            ) : (
              <div>
                <SignInButton />
                <SignUpButton />
              </div>
            )}
          </div>
          <PostFeed />
        </div>
      </main>
    </>
  );
}
