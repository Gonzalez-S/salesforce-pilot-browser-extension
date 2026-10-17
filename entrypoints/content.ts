import { applyFavicon } from "../src/features/favicon/apply";
import { orgIdFromSid, readSidFromDocumentCookie } from "../src/features/identity/org-id";
import { readPilotOpenSyncFromLocation, stripPilotOpenSyncFromLocation } from "../src/features/sync/open-hash";
import type { PilotMessage, PilotResponse, RegistryOrg } from "../src/core/types";

/** Broad Salesforce host check (My Domain, Lightning, Setup, Visualforce, CN). */
const SALESFORCE_HOST_RE =
  /(^|\.)((my\.)?salesforce(-setup)?\.com|lightning\.force\.com|visual\.force\.com|cloudforce\.com|sfcrm(apps|products)\.cn)$/i;

const MATCHES = [
  "https://*.salesforce.com/*",
  "https://*.my.salesforce.com/*",
  "https://*.lightning.force.com/*",
  "https://*.visual.force.com/*",
  "https://*.force.com/*",
  "https://*.cloudforce.com/*",
  "https://*.salesforce-setup.com/*",
  "https://*.visualforce.com/*",
  "https://*.sfcrmapps.cn/*",
  "https://*.sfcrmproducts.cn/*",
];

export default defineContentScript({
  matches: MATCHES,
  runAt: "document_start",
  main() {
    if (!SALESFORCE_HOST_RE.test(location.hostname) && !location.hostname.endsWith(".force.com")) return;

    let lastColor: string | undefined;
    let applying = false;

    const consumeOpenSync = async (): Promise<string | undefined> => {
      const sync = readPilotOpenSyncFromLocation();
      if (!sync) return undefined;
      await sendMessage({ type: "UPSERT_ORG", org: sync });
      stripPilotOpenSyncFromLocation();
      return sync.color;
    };

    const tint = (color: string) => {
      if (!document.head) return;
      applyFavicon(color);
      lastColor = color;
    };

    const refresh = async () => {
      if (applying) return;
      applying = true;
      try {
        const syncedColor = await consumeOpenSync();
        if (syncedColor) tint(syncedColor);

        const orgId = orgIdFromSid(readSidFromDocumentCookie());
        const response = await sendMessage({
          type: "RESOLVE_ORG",
          host: location.hostname,
          orgId,
        });
        if (!response.ok) return;
        const data = response.data as { org?: RegistryOrg } | undefined;
        const color = data?.org?.color;
        if (!color || color === lastColor) return;
        tint(color);
      } finally {
        applying = false;
      }
    };

    const startObservers = () => {
      void refresh();

      const observer = new MutationObserver(() => {
        if (!lastColor) {
          void refresh();
          return;
        }
        const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]') as HTMLLinkElement | null;
        const href = icon?.href ?? "";
        if (!href.startsWith("data:image/png") && !href.startsWith("data:image/svg")) {
          applyFavicon(lastColor);
        }
      });
      if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }

      const interval = window.setInterval(() => void refresh(), 3000);
      window.addEventListener("hashchange", () => void refresh());
      window.addEventListener("popstate", () => void refresh());
      window.addEventListener("beforeunload", () => {
        observer.disconnect();
        window.clearInterval(interval);
      });
    };

    // Capture sync ASAP (query param arrives on the Lightning URL after frontdoor).
    void consumeOpenSync().then((color) => {
      if (color) lastColor = color;
    });

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          if (lastColor) tint(lastColor);
          startObservers();
        },
        { once: true },
      );
    } else {
      if (lastColor) tint(lastColor);
      startObservers();
    }
  },
});

const sendMessage = async (message: PilotMessage): Promise<PilotResponse> => {
  try {
    return (await browser.runtime.sendMessage(message)) as PilotResponse;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
};
