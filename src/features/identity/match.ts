import { normalizeSalesforceId } from "../../core/ids";
import type { OrgRegistry, RegistryOrg } from "../../core/types";

const hostMatches = (candidate: string | undefined, host: string): boolean => {
  if (!candidate) return false;
  const a = candidate.toLowerCase();
  const b = host.toLowerCase();
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
};

export const resolveOrg = (registry: OrgRegistry, host: string, orgId?: string): RegistryOrg | undefined => {
  const normalizedId = normalizeSalesforceId(orgId);
  if (normalizedId) {
    const byId = registry.orgs.find((org) => normalizeSalesforceId(org.orgId) === normalizedId);
    if (byId) return byId;
  }

  return registry.orgs.find((org) => {
    if (hostMatches(org.instanceHost, host)) return true;
    return (org.knownHosts ?? []).some((known) => hostMatches(known, host));
  });
};
