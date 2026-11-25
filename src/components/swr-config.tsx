"use client";

import { SWRConfig } from "swr";
import type { PropsWithChildren } from "react";
import { swrFetcher } from "@/lib/api/fetcher";

export default function SwrConfig({ children }: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
