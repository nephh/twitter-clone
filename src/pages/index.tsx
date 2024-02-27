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

import { api } from "~/utils/api";
import Image from "next/image";

export function CreatePostWizard() {
  const { user, isSignedIn } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div>
      <Image src={user.imageUrl} alt="user image" width={30} height={30} />
    </div>
  )
}

export default function Home() {
  const { user, isSignedIn } = useUser();
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Something went wrong :(</div>;
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <div className="flex flex-col w-full h-screen bg-black md:max-w-4xl border-x">
          <div className="flex flex-row gap-4 justify-center items-center p-4 border-b">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
          </div>
          <CreatePostWizard />
          <div className="flex flex-col">
            {data?.map((post) => (
              <div key={post.id} className="p-6 border-b border-zinc-300">
                <div>{post.createdAt.toLocaleString()}</div>
                <div>{post.content}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
