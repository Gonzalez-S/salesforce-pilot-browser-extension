#!/usr/bin/env node
/**
 * Pack a Gecko-ready XPI with files at the archive root (not nested in a folder).
 * Zen/Firefox break when the zip wraps a parent directory.
 */
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, ".output", "firefox-mv3");
const stage = join(root, ".output", "gecko-stage");
const outZip = join(root, ".output", "salesforce-pilot-zen.xpi");

if (!existsSync(srcDir)) {
  console.error("Missing", srcDir, "— run: yarn wxt build -b firefox --mv3");
  process.exit(1);
}

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

const files = [
  "manifest.json",
  "background.js",
  "popup.html",
  "popup.js",
  "popup.css",
  "icon-16.png",
  "icon-32.png",
  "icon-48.png",
  "icon-128.png",
];

for (const file of files) {
  copyFileSync(join(srcDir, file), join(stage, file));
}
mkdirSync(join(stage, "content-scripts"), { recursive: true });
copyFileSync(join(srcDir, "content-scripts", "content.js"), join(stage, "content-scripts", "content.js"));

const manifest = JSON.parse(readFileSync(join(stage, "manifest.json"), "utf8"));
manifest.version = "0.1.0";
manifest.manifest_version = 3;
delete manifest.browser_action;
manifest.action = {
  default_title: "Salesforce Pilot",
  default_popup: "popup.html",
  default_icon: {
    "16": "icon-16.png",
    "32": "icon-32.png",
    "48": "icon-48.png",
    "128": "icon-128.png",
  },
};
manifest.background = { scripts: ["background.js"] };
writeFileSync(join(stage, "manifest.json"), JSON.stringify(manifest, null, 2));

writeFileSync(
  join(stage, "BUILD.txt"),
  `Salesforce Pilot ${manifest.version} (MV3)\nPacked: ${new Date().toISOString()}\n`,
);

rmSync(outZip, { force: true });
execFileSync("zip", ["-r", "-X", outZip, "."], { cwd: stage, stdio: "inherit" });

console.log("Wrote", outZip);
execFileSync("unzip", ["-l", outZip], { stdio: "inherit" });
