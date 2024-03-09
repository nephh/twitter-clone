import ErrorPage from "~/components/ErrorPage";
import FeedSkelly from "~/components/FeedSkelly";
import { api } from "~/utils/api";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type UserProps = {
  user: {
    id: string;
    username: string | null;
    imageUrl: string;
    fullName: string | null;
    createdAt: number;
    email: string | null;
  };
};

function User(props: UserProps) {
  const { user } = props;
  const initials = user.username ? user.username.slice(0, 2) : "";

  if (!user.username) {
    return null;
  }

  const { data: posts, isLoading } = api.post.userPosts.useQuery({
    username: user.username,
  });

  if (isLoading) {
    return <FeedSkelly />;
  }

  if (!posts) {
    return <ErrorPage />;
  }

  return (
    <Link href={`/@${user.username}`}>
      <div className="border-b p-6">
        <div className="mb-6 flex flex-row gap-5">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.imageUrl} alt={`@${user.username}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-3xl font-bold">{user.fullName}</p>
            <p className="text-lg font-semibold">@{user.username}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-4 px-3 text-lg font-semibold text-gray-500">
          {posts.length > 0 && (
            <p className="w-full">
              {posts.length} Post{posts.length > 1 && "s"}
            </p>
          )}
          <p className="w-full text-end">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function Users() {
  const { data: users, isLoading } = api.user.getAllUsers.useQuery();

  if (isLoading) {
    return <FeedSkelly />;
  }

  if (!users) {
    return <ErrorPage />;
  }

  return (
    <div className="flex w-full grow flex-col overflow-y-auto">
      {users.map((user) => {
        if (!user) {
          return null;
        }

        return <User key={user.id} user={user} />;
      })}
    </div>
  );
}
