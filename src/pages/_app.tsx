import type { AppProps, AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism } from "@clerk/themes";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider {...pageProps} appearance={{
      baseTheme: [dark],
      variables: { colorPrimary: 'blue' },
      signIn: {
        baseTheme: [dark],
      }
    }}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
