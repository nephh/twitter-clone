import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Icons } from "./ui/icons";
import { UserNav } from "./UserNav";
import { useRouter } from "next/router";
import { SignOutButton } from "@clerk/nextjs";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();

  if (router.pathname === "/signup" || router.pathname === "/login") {
    return null;
  }

  return (
    <div className={cn("hidden border-r pb-12 md:flex", className)}>
      <div className="space-y-4 py-4">
        <div className="flex h-full flex-col justify-between px-3 py-2">
          <div>
            <h2 className="mb-4 px-4 text-2xl font-semibold tracking-tight">
              Explore
            </h2>
            <div className="space-y-1">
              <Button
                variant="secondary"
                className="w-full justify-start text-lg"
              >
                <Icons.home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="ghost" className="w-full justify-start text-lg">
                <Icons.person className="mr-2 h-4 w-4" />
                Users
              </Button>
              <SignOutButton>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  onClick={() => router.push("/")}
                >
                  Logout
                </Button>
              </SignOutButton>
            </div>
          </div>
          <div className="ml-2">
            <UserNav />
          </div>
        </div>
      </div>
    </div>
  );
}
