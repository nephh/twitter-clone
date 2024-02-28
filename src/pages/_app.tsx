import type { AppProps, AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { api } from "~/utils/api";

import "~/styles/globals.css";

// Attempting to import google font
//
// import { Poppins } from "next/font/google";

// export const poppins = Poppins({
//   weight: ["400", "600"],
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-poppins",
// });

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
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
