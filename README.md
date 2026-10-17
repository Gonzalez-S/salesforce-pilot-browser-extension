# Salesforce Pilot (browser)

Browser companion for the Raycast **Salesforce Pilot** extension. It stores org metadata locally when you open Salesforce from Raycast, then tints the tab favicon so you can tell orgs apart.

Nothing is sent to remote servers. See [PRIVACY.md](./PRIVACY.md).

## Build (AMO / reproduce listed package)

Requires Node.js 20+ and Yarn Classic (`yarn` 1.x).

```bash
yarn install --frozen-lockfile
yarn build:firefox
```

Listed Firefox package for AMO:

```bash
yarn zip
# → .output/salesforce-pilot-browser-extension-<version>-firefox.zip
```

The built artifact lives under `.output/firefox-mv3/` (Manifest V3). The Zen sideload XPI is `.output/salesforce-pilot-zen.xpi` (same build, zip-packed for local install).

Verify:

```bash
yarn compile
yarn test
```

## Install in Zen (unsigned local XPI)

1. `yarn install && yarn build:firefox`
2. `about:config` → set `xpinstall.signatures.required` to **false**
3. `about:addons` → gear → **Install Add-on From File…**
4. Choose `.output/salesforce-pilot-zen.xpi`

## Develop

```bash
yarn install
yarn dev          # Chromium
yarn dev:firefox  # Firefox / Zen
yarn build
```

## Testing without Raycast

Org sync arrives as a base64url JSON query param `sfp` (or hash `#sfp=`). Example payload:

```json
{"v":1,"color":"#E74C3C","username":"reviewer@example.com","orgId":"00D000000000001","label":"Review Org"}
```

Append `?sfp=<base64url(JSON)>` to a Salesforce Lightning URL while logged in. The extension stores the org locally and tints the favicon. The popup lists stored orgs and can clear them.
