import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@clerk/nextjs/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterUserInfo(user: User) {
  return {
    id: user.id,
    email: user.primaryEmailAddressId,
    username: user.username,
    imageUrl: user.imageUrl,
    fullName:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username,
  };
}
