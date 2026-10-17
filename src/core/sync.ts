import { normalizeSalesforceId } from "./ids";
import { getRegistry, setRegistry } from "./storage";
import type { OrgRegistry, PilotOpenSync, RegistryOrg } from "./types";

const mergeOrg = (existing: RegistryOrg | undefined, incoming: PilotOpenSync): RegistryOrg => {
  const orgId = normalizeSalesforceId(incoming.orgId) ?? normalizeSalesforceId(existing?.orgId);
  const instanceHost = incoming.host ?? existing?.instanceHost;
  const knownHosts = new Set<string>(existing?.knownHosts ?? []);
  if (instanceHost) knownHosts.add(instanceHost.toLowerCase());
  for (const host of existing?.knownHosts ?? []) knownHosts.add(host.toLowerCase());

  return {
    username: incoming.username || existing?.username || "",
    orgId,
    instanceHost,
    label: incoming.label ?? existing?.label,
    color: incoming.color || existing?.color || "#2979FF",
    kind: incoming.kind ?? existing?.kind,
    knownHosts: [...knownHosts],
    updatedAt: new Date().toISOString(),
  };
};

const orgKey = (org: Pick<RegistryOrg, "orgId" | "username" | "instanceHost">) => {
  const id = normalizeSalesforceId(org.orgId);
  if (id) return `id:${id}`;
  if (org.username) return `user:${org.username.toLowerCase()}`;
  if (org.instanceHost) return `host:${org.instanceHost.toLowerCase()}`;
  return undefined;
};

export const upsertFromOpenSync = async (incoming: PilotOpenSync): Promise<OrgRegistry> => {
  const current = await getRegistry();
  const byKey = new Map<string, RegistryOrg>();

  for (const org of current.orgs) {
    const key = orgKey(org);
    if (key) byKey.set(key, org);
  }

  const key = orgKey({
    orgId: incoming.orgId,
    username: incoming.username,
    instanceHost: incoming.host,
  });
  if (key) byKey.set(key, mergeOrg(byKey.get(key), incoming));

  const next: OrgRegistry = { version: 1, orgs: [...byKey.values()] };
  await setRegistry(next);
  return next;
};

export const clearRegistry = async (): Promise<OrgRegistry> => {
  const empty: OrgRegistry = { version: 1, orgs: [] };
  await setRegistry(empty);
  return empty;
};

export const rememberHostForOrg = async (match: RegistryOrg, host: string): Promise<void> => {
  const registry = await getRegistry();
  const normalizedHost = host.toLowerCase();
  const nextOrgs = registry.orgs.map((org) => {
    const sameId =
      normalizeSalesforceId(org.orgId) &&
      normalizeSalesforceId(org.orgId) === normalizeSalesforceId(match.orgId);
    const sameUser = org.username && match.username && org.username === match.username;
    if (!sameId && !sameUser) return org;
    const knownHosts = new Set([...(org.knownHosts ?? []), normalizedHost]);
    if (org.instanceHost) knownHosts.add(org.instanceHost.toLowerCase());
    return { ...org, knownHosts: [...knownHosts], updatedAt: new Date().toISOString() };
  });
  await setRegistry({ ...registry, orgs: nextOrgs });
};
