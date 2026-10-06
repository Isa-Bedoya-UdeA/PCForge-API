/// <reference types="node" />

import _Ajv from 'ajv';
import _addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv = (_Ajv as any).default ?? _Ajv;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = (_addFormats as any).default ?? _addFormats;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

interface CategoryMapping {
  canonicalName: string;
  folderName: string;
  schemaFile: string;
}

const CATEGORIES: CategoryMapping[] = [
  { canonicalName: 'CPU', folderName: 'CPU', schemaFile: 'CPU.schema.json' },
  { canonicalName: 'CPU_COOLER', folderName: 'CPUCooler', schemaFile: 'CPUCooler.schema.json' },
  { canonicalName: 'MOTHERBOARD', folderName: 'Motherboard', schemaFile: 'Motherboard.schema.json' },
  { canonicalName: 'MEMORY', folderName: 'RAM', schemaFile: 'RAM.schema.json' },
  { canonicalName: 'INTERNAL_HARD_DRIVE', folderName: 'Storage', schemaFile: 'Storage.schema.json' },
  { canonicalName: 'VIDEO_CARD', folderName: 'GPU', schemaFile: 'GPU.schema.json' },
  { canonicalName: 'CASE', folderName: 'PCCase', schemaFile: 'PCCase.schema.json' },
  { canonicalName: 'POWER_SUPPLY', folderName: 'PSU', schemaFile: 'PSU.schema.json' },
];

async function validateData(): Promise<void> {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  console.log('--- Starting OpenDB Data & Schema Validation ---');

  let totalCategories = 0;
  let totalRecords = 0;
  let failureCount = 0;

  for (const category of CATEGORIES) {
    const schemaPath = path.join(projectRoot, 'data', 'schemas', category.schemaFile);
    if (!fs.existsSync(schemaPath)) {
      console.error(`[ERROR] Missing schema file for ${category.canonicalName}: ${schemaPath}`);
      failureCount++;
      continue;
    }

    const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schemaContent);

    const folderPath = path.join(projectRoot, 'data', 'opendb', category.folderName);
    if (!fs.existsSync(folderPath)) {
      console.error(`[ERROR] Missing category folder for ${category.canonicalName}: ${folderPath}`);
      failureCount++;
      continue;
    }

    const files = fs.readdirSync(folderPath).filter((f: string) => f.endsWith('.json'));
    if (files.length === 0) {
      console.error(`[ERROR] No data records found in: ${folderPath}`);
      failureCount++;
      continue;
    }

    let categoryValid = true;
    let validatedInCategory = 0;

    for (const fileName of files) {
      const filePath = path.join(folderPath, fileName);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const record = JSON.parse(fileContent);
        const isValid = validate(record);
        if (!isValid) {
          console.error(`[FAIL] Validation error in ${category.canonicalName} (${fileName}):`, validate.errors);
          categoryValid = false;
          failureCount++;
          break;
        }
        validatedInCategory++;
      } catch (err) {
        console.error(`[FAIL] Parse error in ${category.canonicalName} (${fileName}):`, err);
        categoryValid = false;
        failureCount++;
        break;
      }
    }

    if (categoryValid) {
      console.log(`[PASS] ${category.canonicalName.padEnd(20)} (${category.folderName.padEnd(12)}) -> Verified all ${validatedInCategory} records.`);
      totalCategories++;
      totalRecords += validatedInCategory;
    }
  }

  console.log('------------------------------------------------');
  console.log(`Total verified categories: ${totalCategories} / ${CATEGORIES.length}`);
  console.log(`Total verified records:    ${totalRecords}`);

  if (failureCount > 0) {
    console.error(`Validation finished with ${failureCount} failure(s).`);
    process.exit(1);
  }

  console.log('All categories and schemas validated successfully with Ajv Draft-07!');
}

validateData().catch((err) => {
  console.error('Fatal validation runner error:', err);
  process.exit(1);
});
