#!/usr/bin/env node
/**
 * generate-readme-txt.mjs
 *
 * Writes readme.txt at the repo root with exactly the locked format:
 *   let's start now {YYYY-MM-DD} {HH:mm:ss}
 *
 * Three words ("let's", "start", "now") followed by the current
 * Malaysia (Asia/Kuala_Lumpur, UTC+8) date and time.
 *
 * Format is locked by user constraint (mem://constraints/readme-txt-format).
 * Do NOT suggest alternative formats. Just regenerate.
 *
 * Usage:
 *   node scripts/generate-readme-txt.mjs
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TZ = "Asia/Kuala_Lumpur";
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");
const TARGET = resolve(REPO_ROOT, "readme.txt");

function nowMalaysia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  // Intl may return "24" for midnight hour — normalize to "00".
  const hour = get("hour") === "24" ? "00" : get("hour");
  const time = `${hour}:${get("minute")}:${get("second")}`;
  return { date, time };
}

const { date, time } = nowMalaysia();
const content = `let's start now ${date} ${time}\n`;

writeFileSync(TARGET, content, "utf8");
console.log(`[generate-readme-txt] wrote ${TARGET}`);
console.log(`[generate-readme-txt] content: ${content.trimEnd()}`);
