import Head from "next/head";
import Image from "next/image";
import NotFound from "~/components/NotFound";
import ErrorPage from "~/components/ErrorPage";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Post from "~/components/Post";
import FeedSkelly from "~/components/FeedSkelly";

function NoPosts() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
        No posts yet.
      </p>
    </div>
  );
}

function ProfileFeed(props: { username: string }) {
  const { username } = props;
  const { data: posts, isLoading } = api.post.userPosts.useQuery({
    username,
  });

  if (isLoading) {
    return <FeedSkelly posts={5} />;
  }

  if (!posts) {
    return <ErrorPage />;
  }

  return posts.length > 0 ? (
    <div className="flex flex-col overflow-y-scroll">
      {posts.map(({ post, author }) => (
        <Post key={post.id} post={post} author={author} />
      ))}
    </div>
  ) : (
    <NoPosts />
  );
}

export default function Profile(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { username } = props;

  const { data: user } = api.user.getUser.useQuery({
    username,
  });

  const { data: posts } = api.post.userPosts.useQuery({
    username,
  });

  if (!user) {
    return <NotFound type="Page" />;
  }

  return (
    <>
      <Head>
        <title>{`@${user.username}`}</title>
      </Head>
      <div className="relative max-h-[14rem] min-h-[14rem] w-full bg-gray-700">
        {user.username === "nephh" && (
          <Image
            src="/example-header.jpg"
            alt="header picture"
            objectFit="cover"
            fill
            priority
          />
        )}
        <Image
          src={user.imageUrl}
          alt="Profile Picture"
          width={140}
          height={140}
          className="absolute -bottom-5 left-6 -mb-12 rounded-full border-4 border-zinc-950"
        />
      </div>
      <div className="border-b p-6 pt-20">
        <p className="text-4xl font-bold">{user.fullName}</p>
        <p className="text-xl font-semibold">@{user.username}</p>
        <div className="mt-4 flex flex-row justify-between gap-4 text-lg font-semibold text-gray-500">
          {posts && (
            <p className="w-full">
              {posts?.length} Post{posts.length > 1 && "s"}
            </p>
          )}
          <p className="w-full text-end">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <ProfileFeed username={username} />
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null },
    transformer: superjson,
  });

  const slug = context.params?.slug as string;
  const username = slug.toString().substring(1);

  await ssg.user.getUser.prefetch({
    username: username,
  });

  // await ssg.post.userPosts.prefetch({
  //   username: username,
  // });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
