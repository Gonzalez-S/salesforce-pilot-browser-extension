# Salesforce Pilot (browser)

Browser companion for the Raycast **Salesforce Pilot** extension.

## Install in Zen

1. Build:
   ```bash
   yarn install
   yarn build:firefox
   ```
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
