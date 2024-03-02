import Head from "next/head";

export default function SinglePost() {
  return (
    <>
      <Head>
        <title>Single Post</title>
      </Head>
      <main className="flex justify-center">
        <div className="flex h-screen w-full flex-col border-x md:max-w-4xl">
          <div className="flex flex-row items-center justify-center gap-4 border-b p-4">
            <p className="text-5xl font-bold">Single Post Page</p>
          </div>
        </div>
      </main>
    </>
  );
}
