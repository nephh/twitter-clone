import type { AppProps, AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { api } from "~/utils/api";

import "~/styles/globals.css";

// Attempting to import google font
//
import { Inter as FontSans } from "next/font/google";

import { cn } from "~/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/ThemeProvider";

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
        <div
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable,
          )}
        >
          <Component {...pageProps} />
          <Toaster theme="dark" />
        </div>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
