import type { PilotOpenSync } from "../../core/types";
import { PILOT_SYNC_HASH_PREFIX, PILOT_SYNC_PARAM } from "../../core/types";

const decodeBase64Url = (value: string): string => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
};

export const parsePilotOpenSyncToken = (encoded: string): PilotOpenSync | undefined => {
  if (!encoded) return undefined;
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(encoded));
    if (!parsed || typeof parsed !== "object") return undefined;
    const row = parsed as Record<string, unknown>;
    if (row.v !== 1) return undefined;
    if (typeof row.color !== "string" || typeof row.username !== "string") return undefined;
    return {
      v: 1,
      color: row.color,
      username: row.username,
      orgId: typeof row.orgId === "string" ? row.orgId : undefined,
      label: typeof row.label === "string" ? row.label : undefined,
      host: typeof row.host === "string" ? row.host : undefined,
      kind: typeof row.kind === "string" ? row.kind : undefined,
    };
  } catch {
    return undefined;
  }
};

export const parsePilotOpenSyncHash = (hash: string): PilotOpenSync | undefined => {
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  if (!normalized.startsWith(`#${PILOT_SYNC_HASH_PREFIX}`)) return undefined;
  return parsePilotOpenSyncToken(normalized.slice(1 + PILOT_SYNC_HASH_PREFIX.length));
};

/** Read sync payload from query (`?sfp=`) or hash (`#sfp=`). Query survives frontdoor redirects. */
export const readPilotOpenSyncFromLocation = (): PilotOpenSync | undefined => {
  try {
    const params = new URLSearchParams(location.search);
    const fromQuery = parsePilotOpenSyncToken(params.get(PILOT_SYNC_PARAM) ?? "");
    if (fromQuery) return fromQuery;
  } catch {
    // ignore
  }
  return parsePilotOpenSyncHash(location.hash);
};

export const stripPilotOpenSyncFromLocation = () => {
  const url = new URL(location.href);
  let changed = false;

  if (url.searchParams.has(PILOT_SYNC_PARAM)) {
    url.searchParams.delete(PILOT_SYNC_PARAM);
    changed = true;
  }
  if (url.hash.startsWith(`#${PILOT_SYNC_HASH_PREFIX}`)) {
    url.hash = "";
    changed = true;
  }
  if (!changed) return;
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
};
