import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Icons } from "./ui/icons";
import { UserNav } from "./UserNav";
import { useRouter } from "next/router";
import { SignOutButton, SignedIn } from "@clerk/nextjs";
import Link from "next/link";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();

  if (router.pathname === "/signup" || router.pathname === "/login") {
    return null;
  }

  return (
    <div
      className={cn(
        "hidden h-full w-96 flex-col justify-between border-r px-3 py-4 md:flex",
        className,
      )}
    >
      <div>
        <h2 className="mb-6 mt-3 px-4 text-4xl font-extrabold tracking-tight">
          Tweeter
        </h2>
        <div className="space-y-1">
          <Link href="/">
            <Button
              variant="ghost"
              className={`w-full items-center justify-start gap-4 p-6 text-2xl ${router.pathname === "/" ? "font-bold" : ""}`}
            >
              <Icons.home className="h-5 w-5" />
              <span className="mb-1">Home</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full items-center justify-start gap-4 p-6 text-2xl"
          >
            <Icons.person className="h-5 w-5" />
            <span className="mb-1">Users</span>
          </Button>
          <SignedIn>
            <SignOutButton>
              <Button
                variant="ghost"
                className="w-full items-center justify-start gap-4 p-6 text-2xl"
              >
                <Icons.exit className="h-5 w-5" />
                <span className="mb-1">Logout</span>
              </Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
      <div>
        <UserNav />
      </div>
    </div>
  );
}
