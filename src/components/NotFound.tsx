export default function NotFound({ type = "User" }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        404 Not Found
      </h1>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 lg:text-3xl">
        {type} not found
      </h2>
    </div>
  );
}
