import { defineConfig } from "wxt";

const SALESFORCE_HOST_PERMISSIONS = [
  "*://*.salesforce.com/*",
  "*://*.my.salesforce.com/*",
  "*://*.lightning.force.com/*",
  "*://*.visual.force.com/*",
  "*://*.force.com/*",
  "*://*.cloudforce.com/*",
  "*://*.salesforce-setup.com/*",
  "*://*.visualforce.com/*",
  "*://*.sfcrmapps.cn/*",
  "*://*.sfcrmproducts.cn/*",
];

export default defineConfig({
  srcDir: ".",
  entrypointsDir: "entrypoints",
  outDir: ".output",
  vite: () => ({
    base: "./",
  }),
  manifest: {
    name: "Salesforce Pilot",
    description: "Browser companion for the Raycast Salesforce Pilot extension.",
    version: "0.1.0",
    icons: {
      "16": "icon-16.png",
      "32": "icon-32.png",
      "48": "icon-48.png",
      "128": "icon-128.png",
    },
    action: {
      default_title: "Salesforce Pilot",
      default_popup: "popup.html",
      default_icon: {
        "16": "icon-16.png",
        "32": "icon-32.png",
        "48": "icon-48.png",
        "128": "icon-128.png",
      },
    },
    permissions: ["storage", "cookies", "tabs"],
    host_permissions: SALESFORCE_HOST_PERMISSIONS,
    browser_specific_settings: {
      gecko: {
        id: "salesforce-pilot@stiven-gonzalez.raycast",
        strict_min_version: "121.0",
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
  },
});
