import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright Global Setup — Chrome Extension
 *
 * Runs once before all tests:
 *   1. Builds the extension into dist/
 *   2. Validates manifest.json structure
 *
 * Enable in playwright.config.ts:
 *   globalSetup: './tests/e2e/global-setup.ts'
 */

const EXTENSION_DIR = path.resolve(__dirname, '../../dist');
const MANIFEST_PATH = path.join(EXTENSION_DIR, 'manifest.json');

const REQUIRED_MANIFEST_KEYS = [
  'manifest_version',
  'name',
  'version',
  'permissions',
] as const;

const REQUIRED_PERMISSIONS = [
  'storage',
  'cookies',
  'scripting',
  'activeTab',
];

async function globalSetup() {
  console.log('\n🔨 Building extension…');

  const repoRoot = path.resolve(__dirname, '../..');

  // build:extension requires standalone dist artifacts (marco-sdk, xpath, macro-controller)
  // to already exist on disk. CI builds them in parallel jobs; for local/playwright runs we
  // must build them sequentially first, then run the extension build.
  const buildSteps: { label: string; cmd: string; timeout: number }[] = [
    { label: 'marco-sdk',        cmd: 'npm run build:sdk',              timeout: 180_000 },
    { label: 'xpath',            cmd: 'npm run build:xpath',            timeout: 180_000 },
    { label: 'macro-controller', cmd: 'npm run build:macro-controller', timeout: 240_000 },
    { label: 'extension',        cmd: 'npm run build:extension',        timeout: 240_000 },
  ];

  for (const step of buildSteps) {
    console.log(`\n→ Building ${step.label} (${step.cmd})…`);
    try {
      execSync(step.cmd, {
        cwd: repoRoot,
        stdio: 'inherit',
        timeout: step.timeout,
      });
    } catch (err) {
      throw new Error(
        `Build step "${step.label}" failed (command: ${step.cmd}).\n` +
        `Ensure the corresponding npm script exists in package.json and that prior steps produced their dist/ output.\n${err}`
      );
    }
  }

  // Step 2: Verify dist/ exists
  if (!existsSync(EXTENSION_DIR)) {
    throw new Error(`Build output not found at ${EXTENSION_DIR}`);
  }

  // Step 3: Validate manifest.json
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(`manifest.json not found at ${MANIFEST_PATH}`);
  }

  console.log('📋 Validating manifest.json…');

  let manifest: Record<string, unknown>;
  try {
    const raw = readFileSync(MANIFEST_PATH, 'utf-8');
    manifest = JSON.parse(raw);
  } catch (err) {
    throw new Error(`manifest.json is not valid JSON: ${err}`);
  }

  // Required top-level keys
  for (const key of REQUIRED_MANIFEST_KEYS) {
    if (!(key in manifest)) {
      throw new Error(`manifest.json missing required key: "${key}"`);
    }
  }

  // MV3 check
  if (manifest.manifest_version !== 3) {
    throw new Error(
      `Expected manifest_version 3, got ${manifest.manifest_version}`
    );
  }

  // Required permissions
  const permissions = manifest.permissions as string[] | undefined;
  if (!Array.isArray(permissions)) {
    throw new Error('manifest.json "permissions" must be an array');
  }

  const missing = REQUIRED_PERMISSIONS.filter(p => !permissions.includes(p));
  if (missing.length > 0) {
    throw new Error(
      `manifest.json missing required permissions: ${missing.join(', ')}`
    );
  }

  // Service worker background
  const background = manifest.background as Record<string, unknown> | undefined;
  if (!background?.service_worker) {
    console.warn('⚠️  manifest.json has no background.service_worker — SW rehydration tests will fail');
  }

  console.log(
    `✅ Extension ready: ${manifest.name} v${manifest.version} (MV${manifest.manifest_version})\n`
  );
}

export default globalSetup;
