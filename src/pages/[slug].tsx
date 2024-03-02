import Head from "next/head";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import NotFound from "~/components/NotFound";
import ErrorPage from "~/components/ErrorPage";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Post from "~/components/Post";

export default function Profile(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { username } = props;

  const { data: user } = api.profile.getUser.useQuery({
    username,
  });

  const { data: posts } = api.profile.userPosts.useQuery({
    username,
  });

  if (!user) {
    return <NotFound type="User" />;
  }

  if (!posts) {
    return <ErrorPage />;
  }

  return (
    <>
      <Head>
        <title>{user.username}</title>
      </Head>
      <div className="flex flex-row items-center justify-center gap-4 border-b p-4">
        <p className="text-5xl font-bold">{user.username}</p>
      </div>
      {posts.length > 0 ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <Post key={post.id} post={post} author={user} />
          ))}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
            No posts yet.
          </p>
        </div>
      )}
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

  await ssg.profile.getUser.prefetch({
    username: username,
  });

  await ssg.profile.userPosts.prefetch({
    username: username,
  });

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
