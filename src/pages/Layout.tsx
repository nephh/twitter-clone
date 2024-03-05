import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex justify-center w-full md:max-w-5xl">
      <div className="flex h-screen w-full flex-row border-x">{children}</div>
    </main>
  );
}
