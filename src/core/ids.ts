export const normalizeSalesforceId = (id: string | undefined): string | undefined => {
  if (!id) return undefined;
  const trimmed = id.trim();
  if (trimmed.length === 18 || trimmed.length === 15) return trimmed.slice(0, 15);
  return trimmed || undefined;
};
