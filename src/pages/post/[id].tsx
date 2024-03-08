import { createServerSideHelpers } from "@trpc/react-query/server";
import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next/types";
import superjson from "superjson";
import { Loading } from "~/components/Loading";
import Post from "~/components/Post";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { api } from "~/utils/api";

export default function SinglePost(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { id } = props;

  const { data: post, isLoading } = api.post.singlePost.useQuery({ id });

  if (isLoading) {
    return <Loading />;
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Tweet from @{post.author.username}</title>
      </Head>
      {/* Post goes here */}
      <Post
        key={post.retweetId === "" ? post.post.id : post.retweetId}
        post={post.post}
        author={post.author}
        retweetId={post.retweetId}
        retweetAuthor={post.retweetAuthor}
        retweetedAt={new Date(post.retweetedAt)}
      />
      {/* Comments go here */}
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null },
    transformer: superjson,
  });

  const id = context.params?.id as string;

  await ssg.post.singlePost.prefetch({ id });

  // await ssg.post.userPosts.prefetch({
  //   username: username,
  // });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
