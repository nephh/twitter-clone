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
        "hidden h-full min-w-72 flex-col justify-between border-r px-3 py-4 md:flex",
        className,
      )}
    >
      <div>
        <h2 className="mb-4 px-4 text-2xl font-semibold tracking-tight">
          Explore
        </h2>
        <div className="space-y-1">
          <Link href="/">
            <Button
              variant="secondary"
              className="w-full justify-start text-lg"
            >
              <Icons.home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Icons.person className="mr-2 h-4 w-4" />
            Users
          </Button>
          <SignedIn>
            <SignOutButton>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg"
                onClick={() => router.push("/")}
              >
                Logout
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
