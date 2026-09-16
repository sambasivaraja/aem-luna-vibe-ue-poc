/*
 * Convert a source page to Universal Editor JCR XML using the project's block
 * parsers/transformers and component models.
 *
 * Runs the SAME pipeline as the bulk import, but emits JCR instead of plain
 * HTML: source DOM -> import transform (builds block tables) -> WebImporter.md2jcr
 * (block tables -> gridtable markdown -> JCR), keyed off component-*.json.
 *
 * We must start from the source DOM (cleaned.html), NOT the flattened
 * *.plain.html — the plain form has already lost block-table structure, so
 * re-converting it produces default content only.
 *
 * Usage:
 *   node tools/importer/convert-to-jcr.mjs <sourceUrl> <cleaned.html> <bundle.js> <out.xml> <jcrPath>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PW = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules/playwright/index.js';
const INJECT = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/static/inject/helix-importer.js';

const [, , sourceUrl, cleanedPath, bundlePath, outPath, jcrPath] = process.argv;
if (!sourceUrl || !cleanedPath || !bundlePath || !outPath || !jcrPath) {
  console.error('Usage: node convert-to-jcr.mjs <sourceUrl> <cleaned.html> <bundle.js> <out.xml> <jcrPath>');
  process.exit(1);
}

const pw = await import(PW);
const { chromium } = pw.default || pw;

const cleanedHtml = readFileSync(cleanedPath, 'utf8');
const injectJs = readFileSync(INJECT, 'utf8');
const bundleJs = readFileSync(bundlePath, 'utf8');
const models = readFileSync('component-models.json', 'utf8');
const definition = readFileSync('component-definition.json', 'utf8');
const filters = readFileSync('component-filters.json', 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();

// Load the source DOM exactly as scraped (relative image srcs are fine — we
// pass originalURL so adjustImageUrls resolves them to absolute).
await page.setContent(cleanedHtml, { waitUntil: 'domcontentloaded' });

// Provide the WebImporter global (helix bundle) and the import transform.
await page.evaluate((script) => {
  const el = document.createElement('script');
  el.textContent = script;
  document.head.appendChild(el);
}, injectJs);

await page.evaluate((script) => {
  const el = document.createElement('script');
  // The bundle declares `var CustomImportScript = (...)`. A <script> textContent
  // runs at global scope, so CustomImportScript becomes window.CustomImportScript.
  el.textContent = script;
  document.head.appendChild(el);
}, bundleJs);

const jcr = await page.evaluate(async ({
  url, jcrDocPath, modelsStr, definitionStr, filtersStr,
}) => {
  if (!window.WebImporter || typeof window.WebImporter.md2jcr !== 'function') {
    throw new Error('WebImporter.md2jcr not available');
  }
  // The bundle declares `var CustomImportScript = { default: {...transform...} }`.
  const cfg = window.CustomImportScript && window.CustomImportScript.default;
  if (!cfg || typeof cfg.transform !== 'function') {
    throw new Error('Import transform config not found on page');
  }

  const components = {
    models: JSON.parse(modelsStr),
    definition: JSON.parse(definitionStr),
    filters: JSON.parse(filtersStr),
  };

  // The bundle reads components from config (4th arg): `components: config.components`,
  // then passes it as params.components to md2jcr, whose options must directly
  // hold { models, definition, filters } (models must be an array).
  const result = await window.WebImporter.md2jcr(
    url,
    document,
    cfg,
    {
      toMd: true, toJcr: true, originalURL: url, components,
    },
    { originalURL: url },
  );
  const out = Array.isArray(result) ? result[0] : result;
  return out.jcr || null;
}, {
  url: sourceUrl,
  jcrDocPath: jcrPath,
  modelsStr: models,
  definitionStr: definition,
  filtersStr: filters,
});

await browser.close();

if (!jcr) {
  console.error('No JCR produced.');
  process.exit(2);
}
writeFileSync(outPath, jcr);
console.log(`JCR written: ${outPath} (${jcr.length} bytes)`);
