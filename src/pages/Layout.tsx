import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex w-full justify-center border-x md:max-w-5xl">
      {children}
    </main>
  );
}
