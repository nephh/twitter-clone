import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex justify-center">
      <div className="flex h-screen w-full flex-col border-x md:max-w-4xl">
        {children}
      </div>
    </main>
  );
}
