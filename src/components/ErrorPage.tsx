export default function ErrorPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        Something went horribly wrong
      </h1>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 lg:text-3xl">
        It&apos;s okay to cry
      </h2>
    </div>
  );
}
