"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import { Icons } from "~/components/ui/icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import type { OAuthStrategy } from "@clerk/nextjs/server";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function SignUpForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isLoaded, signUp } = useSignUp();
  const { isLoaded: loadingSignin, signIn } = useSignIn();

  const signInWith = (strategy: OAuthStrategy) => {
    if (!loadingSignin) {
      return;
    }

    setIsLoading(true);

    return signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        username,
        password,
      });

      if (signUp.status === "complete") {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              placeholder="cooluser"
              type="username"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <Label className="sr-only" htmlFor="password">
              Username
            </Label>
            <Input
              id="password"
              placeholder="*******"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => signInWith("oauth_github")}
          variant="outline"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
        {/* Broken Google Sign In */}
        {/* <Button
          onClick={() => signInWith("oauth_google")}
          variant="outline"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button> */}
      </div>
    </div>
  );
}
