import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../messages/', import.meta.url);
const [id, en] = await Promise.all(
  ['id.json', 'en.json'].map(async (file) => JSON.parse(await readFile(new URL(file, root), 'utf8'))),
);

const keys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child) ? keys(child, path) : path;
});

assert.deepEqual(keys(id).sort(), keys(en).sort(), 'id.json and en.json must have identical keys');
console.log(`Message parity OK: ${keys(id).length} keys`);
