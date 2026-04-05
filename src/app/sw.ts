import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // POST requests to API must always go to network (never cache)
    {
      matcher: ({ sameOrigin, request, url: { pathname } }) =>
        sameOrigin && pathname.startsWith("/api/") && request.method === "POST",
      method: "POST",
      handler: new NetworkOnly(),
    },
    // All other default caching rules
    ...defaultCache,
  ],
});

serwist.addEventListeners();
