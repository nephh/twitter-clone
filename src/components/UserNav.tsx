import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function UserNav() {
  const { user, isLoaded } = useUser();
  const { push } = useRouter();

  if (!isLoaded) {
    return null;
  }

  if (!user) {
    return (
      <Button variant="ghost" onClick={() => push("/")}>
        Sign in
      </Button>
    );
  }

  const initials = user.username ? user.username.slice(0, 2) : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-18 flex w-full flex-row items-center rounded-full border-0 py-3"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl} alt={`@${user.username}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="w-full text-left">
            <p className="text-md ml-4">{user.username}</p>
            <p className="ml-4 text-sm">@{user.username}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-[105px] w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`@${user.username}`}>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href={`/settings`}>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutButton>
          <Link href="/">
            <DropdownMenuItem>
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
