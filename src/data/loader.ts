/// <reference types="node" />

import _Ajv from 'ajv';
import type { ValidateFunction } from 'ajv';
import _addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  COMPONENT_CATEGORIES,
  CATEGORY_FOLDER_MAP,
  CATEGORY_SCHEMA_MAP,
  ComponentCategory,
} from '../constants/categories.js';
import { NormalizedComponent } from '../types/component.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv = (_Ajv as any).default ?? _Ajv;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = (_addFormats as any).default ?? _addFormats;

export interface LoaderOptions {
  dataDir?: string;
  schemasDir?: string;
  maxPerCategory?: number;
  validateSchemas?: boolean;
}

export interface CatalogSnapshot {
  components: NormalizedComponent[];
  byId: Map<string, NormalizedComponent>;
  byCategory: Map<ComponentCategory, NormalizedComponent[]>;
  totalCount: number;
}

const EXCLUDED_SPECIFICATION_KEYS = new Set([
  'opendb_id',
  'metadata',
  'general_product_information',
  'identifiers',
]);

export function normalizeRecord(
  id: string,
  category: ComponentCategory,
  rawRecord: Record<string, unknown>
): NormalizedComponent {
  const metadata = (rawRecord.metadata as Record<string, unknown> | undefined) ?? {};

  const name =
    typeof metadata.name === 'string' && metadata.name.trim() !== ''
      ? metadata.name.trim()
      : typeof rawRecord.name === 'string' && rawRecord.name.trim() !== ''
        ? rawRecord.name.trim()
        : id;

  const rawManufacturer = metadata.manufacturer ?? rawRecord.manufacturer;
  const manufacturer =
    typeof rawManufacturer === 'string' && rawManufacturer.trim() !== ''
      ? rawManufacturer.trim()
      : null;

  const specifications: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawRecord)) {
    if (!EXCLUDED_SPECIFICATION_KEYS.has(key)) {
      specifications[key] = value;
    }
  }

  return {
    id,
    category,
    name,
    manufacturer,
    specifications,
  };
}

export function loadCatalogSnapshot(options: LoaderOptions = {}): CatalogSnapshot {
  const rootDir = process.cwd();
  const dataDir = options.dataDir ?? path.resolve(rootDir, 'data', 'opendb');
  const schemasDir = options.schemasDir ?? path.resolve(rootDir, 'data', 'schemas');
  const validateSchemas = options.validateSchemas ?? true;

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const byId = new Map<string, NormalizedComponent>();
  const byCategory = new Map<ComponentCategory, NormalizedComponent[]>();

  for (const category of COMPONENT_CATEGORIES) {
    byCategory.set(category, []);
  }

  for (const category of COMPONENT_CATEGORIES) {
    const folderName = CATEGORY_FOLDER_MAP[category];
    const categoryPath = path.join(dataDir, folderName);

    if (!fs.existsSync(categoryPath)) {
      throw new Error(`Failed to load catalog: Missing required category directory "${categoryPath}" for category ${category}.`);
    }

    const schemaFileName = CATEGORY_SCHEMA_MAP[category];
    const schemaPath = path.join(schemasDir, schemaFileName);

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Failed to load catalog: Missing required schema file "${schemaPath}" for category ${category}.`);
    }

    let validateFn: ValidateFunction | null = null;
    if (validateSchemas) {
      try {
        const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
        const schemaJson = JSON.parse(schemaRaw);
        validateFn = ajv.compile(schemaJson);
      } catch (err) {
        throw new Error(
          `Failed to load catalog: Failed to compile schema for category ${category} at "${schemaPath}": ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    const fileEntries = fs.readdirSync(categoryPath).filter((f: string) => f.endsWith('.json'));

    if (fileEntries.length === 0) {
      throw new Error(`Failed to load catalog: Category directory "${categoryPath}" contains zero JSON files.`);
    }

    const entriesToLoad =
      options.maxPerCategory !== undefined && options.maxPerCategory > 0
        ? fileEntries.slice(0, options.maxPerCategory)
        : fileEntries;

    const categoryList = byCategory.get(category)!;

    for (const fileName of entriesToLoad) {
      const filePath = path.join(categoryPath, fileName);
      const id = path.basename(fileName, '.json');

      let rawRecord: Record<string, unknown>;
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        rawRecord = JSON.parse(fileContent);
      } catch (err) {
        throw new Error(
          `Failed to load catalog: Corrupt JSON in file "${filePath}": ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }

      if (validateFn && !validateFn(rawRecord)) {
        const errorDetails = ajv.errorsText(validateFn.errors as never);
        throw new Error(
          `Failed to load catalog: Record in "${filePath}" failed schema validation for category ${category}: ${errorDetails}`
        );
      }

      const normalized = normalizeRecord(id, category, rawRecord);

      byId.set(id, normalized);
      categoryList.push(normalized);
    }

    // Sort category list deterministically by id
    categoryList.sort((a, b) => a.id.localeCompare(b.id));
  }

  // Construct flattened deterministically ordered array:
  // Ordered by canonical category order, then by id ascending
  const components: NormalizedComponent[] = [];
  for (const category of COMPONENT_CATEGORIES) {
    const items = byCategory.get(category) ?? [];
    components.push(...items);
  }

  return {
    components,
    byId,
    byCategory,
    totalCount: components.length,
  };
}
