#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Read package.json
const packageJsonPath = join(projectRoot, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

// Read service worker file
const swPath = join(projectRoot, "public", "sw.js");
let swContent = readFileSync(swPath, "utf8");

// Update version in service worker
const versionRegex = /const APP_VERSION = "[^"]+";/;
const newVersionLine = `const APP_VERSION = "${version}";`;

if (versionRegex.test(swContent)) {
  swContent = swContent.replace(versionRegex, newVersionLine);
  console.log(`Updated service worker version to ${version}`);
} else {
  console.log("Version line not found in service worker");
  process.exit(1);
}

// Write updated service worker
writeFileSync(swPath, swContent);
console.log("Service worker version updated successfully");
