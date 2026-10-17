const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#org-list");
const clearButton = document.querySelector("#clear-registry");

const send = async (message) => browser.runtime.sendMessage(message);

const renderOrg = (org) => {
  const li = document.createElement("li");
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.background = org.color;

  const body = document.createElement("div");
  const title = document.createElement("div");
  title.className = "org-title";
  title.textContent = org.label || org.username;

  const meta = document.createElement("div");
  meta.className = "org-meta";
  meta.textContent = [org.kind, org.username].filter(Boolean).join(" · ");

  body.append(title, meta);
  li.append(swatch, body);
  return li;
};

const renderRegistry = (registry) => {
  const count = registry.orgs.length;
  statusEl.textContent = count
    ? `${count} connected org${count === 1 ? "" : "s"}`
    : "Open an org from Raycast Salesforce Pilot to connect.";

  clearButton.hidden = count === 0;
  listEl.replaceChildren();
  if (!count) return;

  const sorted = [...registry.orgs].sort((a, b) =>
    (a.label || a.username).localeCompare(b.label || b.username),
  );
  for (const org of sorted) listEl.append(renderOrg(org));
};

const refresh = async () => {
  const response = await send({ type: "GET_REGISTRY" });
  if (!response?.ok) {
    statusEl.textContent = response?.error || "Couldn’t load synced orgs.";
    clearButton.hidden = true;
    return;
  }
  renderRegistry(response.data);
};

clearButton.addEventListener("click", () => {
  void (async () => {
    if (!confirm("Clear connected orgs from this browser?")) return;
    const response = await send({ type: "CLEAR_REGISTRY" });
    if (!response?.ok) {
      statusEl.textContent = response?.error || "Clear failed.";
      return;
    }
    renderRegistry(response.data);
  })();
});

void refresh();
