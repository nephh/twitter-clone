import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Icons } from "./ui/icons";
import { UserNav } from "./UserNav";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("hidden pb-12 md:flex", className)}>
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
              <Button variant="ghost" className="w-full justify-start text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                  <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                  <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
                </svg>
                Logout
              </Button>
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
