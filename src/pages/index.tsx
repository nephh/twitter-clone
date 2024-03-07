import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { Loading, LoadingPage } from "~/components/Loading";
import { useState } from "react";
import { toast } from "sonner";
import Post from "~/components/Post";
import ErrorPage from "~/components/ErrorPage";
import FeedSkelly from "~/components/FeedSkelly";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

function CreatePostWizard() {
  const [value, setValue] = useState("");
  const [charCount, setCharCount] = useState(0);
  const ctx = api.useUtils();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const initials = user.username ? user.username.slice(0, 2) : "";
  const { mutate, isLoading } = api.post.create.useMutation({
    onSuccess: () => {
      setValue("");
      setCharCount(0);
      // void means we don't care about waiting for this to finish, no need for async/await
      //
      void ctx.post.getAll.invalidate();
      toast.success("Your post has been created successfully.");
    },
    onError: (e) => {
      const error = e.data?.zodError?.fieldErrors.content;
      toast.error("Failed to create post!", {
        description: error
          ? error
          : "Too many requests, try again in a few minutes.",
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
      className="flex w-full flex-row-reverse items-center gap-4"
      onSubmit={(e) => handleSubmit(e)}
    >
      <p className="absolute top-3 text-xs text-gray-500">{255 - charCount}</p>
      {isLoading ? (
        <div className="mr-4 flex items-center justify-center">
          <Loading size={8} />
        </div>
      ) : (
        <Button
          variant="ghost"
          name="post"
          className="text-xl font-semibold"
          disabled={isLoading}
        >
          Post
        </Button>
      )}
      {/* eventually we want this input to be a textarea that will grow vertically
      instead of infinitely to the right */}
      <input
        type="text"
        name="post"
        placeholder="Type something..."
        className={`grow bg-transparent text-2xl font-semibold placeholder-gray-500 outline-none ${!value && "italic"}`}
        value={value}
        onChange={(e) => handleChange(e)}
        disabled={isLoading}
      />
      <Link href={`/@${user.username}`}>
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.imageUrl} alt={`@${user.username}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Link>
    </form>
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
    <div className="flex w-full grow flex-col overflow-y-auto">
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
          <h1 className="scroll-m-20 p-4 text-center text-4xl font-bold tracking-tight lg:text-5xl">
            <Link href="/login">
              <span className="hover:cursor-pointer hover:text-zinc-300">
                Login{" "}
              </span>
            </Link>
            and join the conversation
          </h1>
        )}
      </div>
      <PostFeed />
    </>
  );
}
