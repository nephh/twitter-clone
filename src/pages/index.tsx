import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { Loading, LoadingPage } from "~/components/Loading";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import Post from "~/components/Post";
import ErrorPage from "~/components/ErrorPage";

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
      toast.success("Your post has been created successfully.", {
        // action: {
        //   label: "Close",
        //   onClick: () => toast.dismiss(),
        // },
      });
    },
    onError: (e) => {
      const error = e.data?.zodError?.fieldErrors.content;
      toast.error("Failed to create post!", {
        description: error
          ? error
          : "Too many requests, try again in a few minutes.",
        // action: {
        //   label: "Close",
        //   onClick: () => toast.dismiss(),
        // },
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
        className={`grow bg-transparent text-2xl font-semibold placeholder-zinc-600 outline-none ${!value && "italic"}`}
        value={value}
        onChange={(e) => handleChange(e)}
        disabled={isLoading}
      />
      <ProfilePicture />
    </form>
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
  const { data: posts, isLoading } = api.post.getAll.useQuery();

  if (isLoading) {
    return <FeedSkelly />;
  }

  if (!posts) {
    return <ErrorPage />;
  }

  return (
    <div className="flex flex-col">
      {posts.map(({ post, author }) => (
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
    </>
  );
}
