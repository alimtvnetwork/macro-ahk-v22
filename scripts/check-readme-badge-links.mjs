#!/usr/bin/env node
/**
 * Validates every badge in the root readme.md hero block:
 *   1. Image URL is on img.shields.io
 *   2. Image URL contains style=flat-square
 *   3. Link target uses HTTPS (or anchor / relative path)
 *   4. For well-known badge alt texts, link target points at the canonical
 *      GitHub service URL (e.g. "Stars" -> /stargazers).
 *
 * Usage:
 *   node scripts/check-readme-badge-links.mjs            # human output
 *   node scripts/check-readme-badge-links.mjs --json     # JSON envelope
 *   node scripts/check-readme-badge-links.mjs --file=readme.md
 *
 * Exit codes: 0 = all valid, 1 = one or more violations.
 *
 * Zero npm dependencies. Companion to scripts/check-readme-compliance.mjs.
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const fileArg = args.find((a) => a.startsWith('--file='));
const filePath = fileArg ? fileArg.slice('--file='.length) : 'readme.md';

const absPath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(absPath)) {
  console.error(`[check-readme-badge-links] file not found: ${absPath}`);
  process.exit(1);
}

const md = fs.readFileSync(absPath, 'utf8');
const heroMatch = md.match(/<div align="center">[\s\S]*?<\/div>/);
const hero = heroMatch ? heroMatch[0] : md;

// Markdown badge pattern: [![alt](imgUrl)](linkUrl)
const re = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
const badges = [];
let m;
while ((m = re.exec(hero)) !== null) {
  badges.push({ alt: m[1], img: m[2], link: m[3] });
}

// Map of well-known badge alt-text (lowercased) -> { pattern, expected }
const LINK_RULES = {
  stars: { pattern: /github\.com\/[^/]+\/[^/]+\/stargazers$/, expected: '/stargazers' },
  forks: { pattern: /github\.com\/[^/]+\/[^/]+\/network\/members$/, expected: '/network/members' },
  watchers: { pattern: /github\.com\/[^/]+\/[^/]+\/watchers$/, expected: '/watchers' },
  contributors: {
    pattern: /github\.com\/[^/]+\/[^/]+\/graphs\/contributors$/,
    expected: '/graphs/contributors',
  },
  discussions: {
    pattern: /github\.com\/[^/]+\/[^/]+\/discussions$/,
    expected: '/discussions',
  },
  'prs welcome': { pattern: /contributing\.md$/i, expected: './contributing.md' },
  issues: { pattern: /github\.com\/[^/]+\/[^/]+\/issues$/, expected: '/issues' },
  'pull requests': { pattern: /github\.com\/[^/]+\/[^/]+\/pulls$/, expected: '/pulls' },
  'last commit': { pattern: /\/commits\/main$/, expected: '/commits/main' },
  'commit activity': { pattern: /\/pulse$/, expected: '/pulse' },
  'repo size': { pattern: /github\.com\/[^/]+\/[^/]+$/, expected: 'repo root' },
};

const checks = [];
for (const b of badges) {
  const violations = [];

  if (!/^https:\/\/img\.shields\.io\//.test(b.img)) {
    violations.push({
      id: 'img-not-shields',
      message: `image URL must be on img.shields.io: ${b.img}`,
    });
  }
  if (!/style=flat-square/.test(b.img)) {
    violations.push({ id: 'missing-flat-square', message: 'image URL missing style=flat-square' });
  }
  if (!/^(https:\/\/|#|\.\/)/.test(b.link)) {
    violations.push({
      id: 'bad-link-protocol',
      message: `link target must be https://, #anchor, or ./relative — got: ${b.link}`,
    });
  }

  const rule = LINK_RULES[b.alt.toLowerCase()];
  if (rule && !rule.pattern.test(b.link)) {
    violations.push({
      id: 'link-mismatch',
      message: `expected link to end with "${rule.expected}", got: ${b.link}`,
    });
  }

  checks.push({ alt: b.alt, img: b.img, link: b.link, ok: violations.length === 0, violations });
}

const okCount = checks.filter((c) => c.ok).length;
const failCount = checks.length - okCount;
const ok = failCount === 0;

if (wantJson) {
  console.log(
    JSON.stringify(
      {
        version: 1,
        ok,
        file: path.relative(process.cwd(), absPath),
        summary: { total: checks.length, ok: okCount, failed: failCount },
        checks,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`[check-readme-badge-links] scanning ${path.relative(process.cwd(), absPath)}`);
  console.log(`[check-readme-badge-links] found ${checks.length} badge(s) in hero\n`);
  for (const c of checks) {
    console.log(`${c.ok ? '✅' : '❌'} [${c.alt}] -> ${c.link}`);
    for (const v of c.violations) console.log(`     ⚠  ${v.id}: ${v.message}`);
  }
  console.log(`\n${ok ? '✅ all valid' : `❌ ${failCount} violation(s)`} (${okCount}/${checks.length} passed)`);
}

process.exit(ok ? 0 : 1);
