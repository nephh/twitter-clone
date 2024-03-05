import { SignOutButton, useUser } from "@clerk/nextjs";
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
          variant="ghost"
          className="h-18 flex w-full flex-row items-center p-6"
        >
          <Button variant="ghost" className="h-14 w-14 rounded-full">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.imageUrl} alt={`@${user.username}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
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
          <DropdownMenuItem onClick={() => push(`@${user.username}`)}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem onClick={() => push("/")}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
