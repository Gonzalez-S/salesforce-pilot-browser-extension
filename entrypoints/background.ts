import { orgIdFromSid } from "../src/features/identity/org-id";
import { resolveOrg } from "../src/features/identity/match";
import { getRegistry } from "../src/core/storage";
import { clearRegistry, rememberHostForOrg, upsertFromOpenSync } from "../src/core/sync";
import type { PilotMessage, PilotResponse, RegistryOrg } from "../src/core/types";

const ensurePopup = () => {
  try {
    void browser.action.setPopup({ popup: "popup.html" });
  } catch {
    // ignore
  }
};

export default defineBackground(() => {
  ensurePopup();
  browser.runtime.onInstalled.addListener(ensurePopup);

  browser.runtime.onMessage.addListener((message: PilotMessage, sender, sendResponse) => {
    void handleMessage(message, sender)
      .then((response) => sendResponse(response))
      .catch((error: unknown) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        } satisfies PilotResponse),
      );
    return true;
  });
});

const handleMessage = async (
  message: PilotMessage,
  sender: Browser.runtime.MessageSender,
): Promise<PilotResponse> => {
  switch (message.type) {
    case "GET_REGISTRY":
      return { ok: true, data: await getRegistry() };
    case "UPSERT_ORG":
      return { ok: true, data: await upsertFromOpenSync(message.org) };
    case "CLEAR_REGISTRY":
      return { ok: true, data: await clearRegistry() };
    case "RESOLVE_ORG": {
      const orgId = message.orgId ?? (await readOrgIdFromCookies(message.host, sender.tab?.url));
      const registry = await getRegistry();
      const org = resolveOrg(registry, message.host, orgId);
      if (org) await rememberHostForOrg(org, message.host);
      return { ok: true, data: { org, orgId } satisfies { org?: RegistryOrg; orgId?: string } };
    }
    default:
      return { ok: false, error: "Unknown message" };
  }
};

const readOrgIdFromCookies = async (host: string, tabUrl?: string): Promise<string | undefined> => {
  const urls = [`https://${host}/`, tabUrl].filter(Boolean) as string[];
  for (const url of urls) {
    try {
      const cookie = await browser.cookies.get({ url, name: "sid" });
      const orgId = orgIdFromSid(cookie?.value);
      if (orgId) return orgId;
    } catch {
      // try next
    }
  }

  try {
    const all = await browser.cookies.getAll({ name: "sid" });
    for (const cookie of all) {
      if (!cookie.domain) continue;
      const domain = cookie.domain.replace(/^\./, "");
      if (host === domain || host.endsWith(`.${domain}`) || domain.endsWith(`.${host}`)) {
        const orgId = orgIdFromSid(cookie.value);
        if (orgId) return orgId;
      }
    }
  } catch {
    // unavailable
  }

  return undefined;
};
