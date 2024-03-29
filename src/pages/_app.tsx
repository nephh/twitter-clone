import type { AppProps, AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Head from "next/head";

import { api } from "~/utils/api";

import "~/styles/globals.css";

// Attempting to import google font
//
import { Inter as FontSans } from "next/font/google";

import { cn } from "~/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/ThemeProvider";
import Layout from "./Layout";
import { Sidebar } from "~/components/Sidebar";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        baseTheme: [dark],
        variables: { colorPrimary: "blue" },
        signIn: {
          baseTheme: [dark],
        },
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Head>
          <title>Twitter</title>
          <meta name="description" content="tweet something fun" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div
          className={cn(
            "flex min-h-screen w-screen flex-row justify-center font-sans antialiased",
            fontSans.variable,
          )}
        >
          <Layout>
            <Sidebar />
            <div className="flex h-screen w-full flex-col overflow-hidden">
              <Component {...pageProps} />
            </div>
          </Layout>
          <Toaster theme="dark" />
        </div>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
