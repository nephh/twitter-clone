import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex w-full justify-center md:max-w-5xl">
      <div className="flex h-screen w-full flex-row">{children}</div>
    </main>
  );
}
