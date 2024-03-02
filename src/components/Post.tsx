import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

export default function Post(props: PostWithUser) {
  const ctx = api.useUtils();
  const { post, author } = props;
  const { mutate, isLoading } = api.post.addLike.useMutation({
    onSuccess: () => {
      void ctx.post.getAll.invalidate();
      void ctx.post.userPosts.invalidate();
    },
  });

  async function handleClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string,
    payload: "addLike" | "removeLike",
  ) {
    e.preventDefault();
    mutate({ id, payload });
  }

  return (
    <div className="border-b p-6">
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
        <div className="whitespace-pre-wrap p-2 text-base font-semibold">
          {post.content}
        </div>
      </Link>
      <div className="flex flex-row items-center justify-between gap-4">
        <button onClick={(e) => handleClick(e, post.id, "addLike")}>
          Likes: {post.likedBy.length}
        </button>
      </div>
    </div>
  );
}
