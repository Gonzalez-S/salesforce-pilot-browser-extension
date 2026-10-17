/**
 * Official Salesforce cloud mark path (no wordmark) from
 * https://www.salesforce.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg
 * viewBox="0 0 92 64"
 */
const SF_CLOUD_PATH =
  "M38.05 6.98c2.948-3.071 7.055-4.978 11.595-4.978 6.035 0 11.302 3.366 14.106 8.363a19.494 19.494 0 0 1 7.974-1.695c10.886 0 19.71 8.902 19.71 19.885 0 10.983-8.824 19.885-19.71 19.885-1.331 0-2.629-.133-3.884-.386-2.469 4.403-7.177 7.379-12.578 7.379-2.261 0-4.4-.52-6.303-1.451C46.456 59.872 40.623 64 33.826 64c-7.078 0-13.112-4.48-15.427-10.761a15.176 15.176 0 0 1-3.137.327C6.833 53.567 0 46.663 0 38.146a15.442 15.442 0 0 1 7.631-13.357 17.662 17.662 0 0 1-1.46-7.053C6.171 7.94 14.122 0 23.93 0a17.73 17.73 0 0 1 14.12 6.98";

const SF_CLOUD_VB_W = 92;
const SF_CLOUD_VB_H = 64;

const sanitizeColor = (color: string) => color.replace(/[^\w#(),.%\s-]/g, "");

/** Build a tinted favicon as PNG data URL (canvas) with SVG fallback. */
export const createTintedFaviconDataUrl = (color: string, size = 64): string => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return createSvgFaviconDataUrl(color);

    ctx.clearRect(0, 0, size, size);
    fillCloud(ctx, sanitizeColor(color), size);

    return canvas.toDataURL("image/png");
  } catch {
    return createSvgFaviconDataUrl(color);
  }
};

/** SVG data URL — more reliable in some Firefox/Zen builds than canvas PNG. */
export const createSvgFaviconDataUrl = (color: string): string => {
  const safe = sanitizeColor(color);
  // Official cloud mark, recolored with the org tint.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SF_CLOUD_VB_W} ${SF_CLOUD_VB_H}">
  <path fill="${safe}" d="${SF_CLOUD_PATH}"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const fillCloud = (ctx: CanvasRenderingContext2D, color: string, size: number) => {
  const pad = size * 0.08;
  const scale = Math.min((size - pad * 2) / SF_CLOUD_VB_W, (size - pad * 2) / SF_CLOUD_VB_H);
  const w = SF_CLOUD_VB_W * scale;
  const h = SF_CLOUD_VB_H * scale;
  const ox = (size - w) / 2;
  const oy = (size - h) / 2;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(SF_CLOUD_PATH));
  ctx.restore();
};

const removeExistingIcons = () => {
  for (const node of document.querySelectorAll(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel*="icon"]',
  )) {
    node.remove();
  }
};

const appendIcon = (href: string, type: string, sizes?: string) => {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = type;
  if (sizes) link.setAttribute("sizes", sizes);
  link.href = href;
  document.head.appendChild(link);
};

/** Replace the page favicon (Firefox / Zen / Chromium). */
export const applyFavicon = (color: string) => {
  if (!document.head) return;

  removeExistingIcons();

  const png = createTintedFaviconDataUrl(color);
  const svg = createSvgFaviconDataUrl(color);

  // Blank poke helps some Gecko builds refresh the tab icon.
  appendIcon("data:,", "image/x-icon");
  document.querySelector('link[href="data:,"]')?.remove();

  appendIcon(svg, "image/svg+xml");
  if (png.startsWith("data:image/png")) {
    appendIcon(png, "image/png", "32x32");
  }

  const shortcut = document.createElement("link");
  shortcut.rel = "shortcut icon";
  shortcut.href = svg;
  document.head.appendChild(shortcut);
};
