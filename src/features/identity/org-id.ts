import { normalizeSalesforceId } from "../../core/ids";

/** Extract org id from a Salesforce `sid` cookie value (`00D…!session…`). */
export const orgIdFromSid = (sid: string | undefined): string | undefined => {
  if (!sid) return undefined;
  const raw = sid.split("!")[0]?.trim();
  if (!raw) return undefined;
  if (!/^00[Dd][a-zA-Z0-9]{12,15}$/.test(raw)) return undefined;
  return normalizeSalesforceId(raw);
};

export const readSidFromDocumentCookie = (): string | undefined => {
  const match = document.cookie.match(/(?:^|;\s*)sid=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
};
