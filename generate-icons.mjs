#!/usr/bin/env node
// generate-icons.mjs
// Run once: node generate-icons.mjs
// Requires: npm install sharp

import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("./public/icons/icon.svg");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-180.png", size: 180 }, // Apple touch icon
];

for (const { name, size } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`./public/icons/${name}`);
  console.log(`Generated ${name}`);
}

console.log("All icons generated.");
