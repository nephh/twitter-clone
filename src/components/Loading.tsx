import { Icons } from "./ui/icons";

export function Loading() {
  return (
    <div
      role="status"
      className="flex h-full w-full items-center justify-center bg-background"
    >
      <Icons.spinner className="mr-2 h-24 w-24 animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="absolute left-0 top-0 flex h-screen w-screen items-center justify-center">
      <Loading />
    </div>
  );
}
