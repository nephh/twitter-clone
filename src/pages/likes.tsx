import ErrorPage from "~/components/ErrorPage";
import FeedSkelly from "~/components/FeedSkelly";
import Post from "~/components/Post";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import NotFound from "~/components/NotFound";

function PostFeed() {
  const { user } = useUser();

  if (!user) {
    return <NotFound type="Page" />;
  }

  const id = user?.id;
  const { data: posts, isLoading } = api.post.userLikes.useQuery({ id });

  if (isLoading) {
    return <FeedSkelly />;
  }

  if (!posts) {
    return <ErrorPage />;
  }

  return (
    <div className="flex w-full grow flex-col overflow-y-auto">
      {posts.map((post) => {
        if (!post) {
          return null;
        }

        return (
          <Post
            key={post.retweetId === "" ? post.post.id : post.retweetId}
            post={post.post}
            author={post.author}
            retweetId={post.retweetId}
            retweetAuthor={post.retweetAuthor}
            retweetedAt={new Date(post.retweetedAt)}
          />
        );
      })}
    </div>
  );
}

export default function Likes() {
  return (
    <>
      <PostFeed />
    </>
  );
}
