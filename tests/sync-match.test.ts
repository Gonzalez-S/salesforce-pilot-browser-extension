import { describe, expect, it } from "vitest";

import { normalizeSalesforceId } from "../src/core/ids";
import { resolveOrg } from "../src/features/identity/match";
import { orgIdFromSid } from "../src/features/identity/org-id";
import type { OrgRegistry } from "../src/core/types";

describe("normalizeSalesforceId", () => {
  it("keeps 15-char prefix from 15/18 Ids", () => {
    expect(normalizeSalesforceId("00D5e000000ABCDEAE")).toBe("00D5e000000ABCD");
    expect(normalizeSalesforceId("00D5e000000ABCD")).toBe("00D5e000000ABCD");
  });
});

describe("orgIdFromSid", () => {
  it("reads the org id before the bang", () => {
    expect(orgIdFromSid("00D5e000000ABCDEAE!session")).toBe("00D5e000000ABCD");
    expect(orgIdFromSid("bad")).toBeUndefined();
  });
});

describe("resolveOrg", () => {
  const registry: OrgRegistry = {
    version: 1,
    orgs: [
      {
        username: "user@example.com",
        color: "#FF1744",
        orgId: "00D5e000000ABCDEAE",
        instanceHost: "acme.my.salesforce.com",
        knownHosts: ["acme--partial.sandbox.my.salesforce.com"],
      },
    ],
  };

  it("matches by org id first", () => {
    expect(resolveOrg(registry, "other.my.salesforce.com", "00D5e000000ABCDEAE")?.color).toBe("#FF1744");
  });

  it("falls back to host / knownHosts", () => {
    expect(resolveOrg(registry, "acme.my.salesforce.com")?.username).toBe("user@example.com");
    expect(resolveOrg(registry, "acme--partial.sandbox.my.salesforce.com")?.username).toBe("user@example.com");
  });
});
