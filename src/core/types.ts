/** Org accent stored by the extension (filled when Raycast opens an org). */
export type RegistryOrg = {
  username: string;
  color: string;
  orgId?: string;
  instanceHost?: string;
  label?: string;
  kind?: string;
  knownHosts?: string[];
  updatedAt?: string;
};

export type OrgRegistry = {
  version: 1;
  orgs: RegistryOrg[];
};

export type PilotOpenSync = {
  v: 1;
  color: string;
  username: string;
  orgId?: string;
  label?: string;
  host?: string;
  kind?: string;
};

export type PilotMessage =
  | { type: "GET_REGISTRY" }
  | { type: "UPSERT_ORG"; org: PilotOpenSync }
  | { type: "CLEAR_REGISTRY" }
  | { type: "RESOLVE_ORG"; host: string; orgId?: string };

export type PilotResponse = { ok: true; data?: unknown } | { ok: false; error: string };

export const STORAGE_KEYS = {
  registry: "salesforce-pilot.registry",
} as const;

export const PILOT_SYNC_PARAM = "sfp";
export const PILOT_SYNC_HASH_PREFIX = `${PILOT_SYNC_PARAM}=`;
