import { Skeleton } from "./ui/skeleton";

export default function FeedSkelly({ posts = 5 }) {
  return (
    <div className="flex flex-col items-center">
      {Array.from({ length: posts }).map((_, index) => (
        <div
          key={index}
          className="flex w-full flex-col space-y-8 border-b p-6 py-8"
        >
          <div className="flex flex-row space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="ml-4 h-4 w-[600px]" />
        </div>
      ))}
    </div>
  );
}
