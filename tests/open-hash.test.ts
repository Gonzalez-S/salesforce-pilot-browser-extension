import { describe, expect, it } from "vitest";

import { parsePilotOpenSyncHash, parsePilotOpenSyncToken } from "../src/features/sync/open-hash";

/** Mirror Raycast `Buffer…toString("base64url")` for round-trip checks in Node. */
const encodeBase64Url = (value: string) =>
  Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const payload = {
  v: 1 as const,
  color: "#FF1744",
  username: "user@example.com",
  orgId: "00D5e000000ABCDEAE",
  label: "Acme Prod",
  host: "acme.my.salesforce.com",
  kind: "production",
};

describe("parsePilotOpenSyncToken", () => {
  it("decodes a Raycast-compatible payload", () => {
    const token = encodeBase64Url(JSON.stringify(payload));
    expect(parsePilotOpenSyncToken(token)).toEqual(payload);
    expect(parsePilotOpenSyncHash(`#sfp=${token}`)).toEqual(payload);
  });

  it("rejects invalid values", () => {
    expect(parsePilotOpenSyncToken("")).toBeUndefined();
    expect(parsePilotOpenSyncToken("!!!")).toBeUndefined();
    expect(parsePilotOpenSyncHash("#other=1")).toBeUndefined();
  });
});
