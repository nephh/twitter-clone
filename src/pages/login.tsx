import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { cn } from "~/lib/utils";
import { buttonVariants } from "../components/ui/button";
import { SignInForm } from "~/components/SignInForm";
import { useUser } from "@clerk/nextjs";
import { BackgroundBeams } from "~/components/ui/background-beams";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function AuthenticationPage() {
  const router = useRouter();
  const { user } = useUser();

  if (user) {
    void router.push("/");
  }

  return (
    <>
      <div className="container relative grid h-full w-full flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8",
          )}
        >
          Sign Up
        </Link>
        <div className="relative hidden h-full flex-col bg-[#0a0a0b] p-10 text-zinc-100 dark:border-r lg:flex">
          <BackgroundBeams />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <h1 className="w-full scroll-m-20 text-right text-4xl font-extrabold tracking-tight lg:text-5xl">
              <Link href="/">Tweeter</Link>
            </h1>
          </div>
          <div className="z-20 flex h-full items-end">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Join the conversation
            </h1>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your username and password below to sign in
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
    </>
  );
}
