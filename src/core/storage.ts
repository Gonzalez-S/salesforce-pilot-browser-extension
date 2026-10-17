import { storage } from "wxt/utils/storage";

import type { OrgRegistry } from "./types";
import { STORAGE_KEYS } from "./types";

const emptyRegistry = (): OrgRegistry => ({ version: 1, orgs: [] });

export const registryStorage = storage.defineItem<OrgRegistry>(`local:${STORAGE_KEYS.registry}`, {
  fallback: emptyRegistry(),
});

export const getRegistry = async (): Promise<OrgRegistry> => {
  const value = await registryStorage.getValue();
  return value ?? emptyRegistry();
};

export const setRegistry = async (registry: OrgRegistry): Promise<void> => {
  await registryStorage.setValue(registry);
};
