/// <reference types="node" />

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadCatalogSnapshot, normalizeRecord } from '../../src/data/loader.js';
import { COMPONENT_CATEGORIES } from '../../src/constants/categories.js';

describe('Catalog Loader (src/data/loader.ts)', () => {
  it('normalizes a raw record correctly stripping metadata envelope', () => {
    const rawRecord = {
      opendb_id: 'test-uuid-1234',
      socket: 'AM5',
      tdp: 120,
      hasWifi: false,
      count: 0,
      metadata: {
        name: 'AMD Ryzen 7 7800X3D',
        manufacturer: 'AMD',
        author: 'John Doe',
        opendb_version: '1.0.0',
      },
      general_product_information: {
        url: 'https://example.com',
      },
      identifiers: {
        ean: '123456789',
      },
    };

    const normalized = normalizeRecord('test-uuid-1234', 'CPU', rawRecord);

    expect(normalized.id).toBe('test-uuid-1234');
    expect(normalized.category).toBe('CPU');
    expect(normalized.name).toBe('AMD Ryzen 7 7800X3D');
    expect(normalized.manufacturer).toBe('AMD');

    // Specifications should include domain fields
    expect(normalized.specifications.socket).toBe('AM5');
    expect(normalized.specifications.tdp).toBe(120);
    expect(normalized.specifications.hasWifi).toBe(false);
    expect(normalized.specifications.count).toBe(0);

    // Envelopes should be excluded
    expect(normalized.specifications.metadata).toBeUndefined();
    expect(normalized.specifications.general_product_information).toBeUndefined();
    expect(normalized.specifications.identifiers).toBeUndefined();
    expect(normalized.specifications.opendb_id).toBeUndefined();
  });

  it('preserves null manufacturer when omitted or null', () => {
    const rawRecord = {
      metadata: {
        name: 'Generic Component',
      },
    };

    const normalized = normalizeRecord('id-1', 'CPU', rawRecord);
    expect(normalized.manufacturer).toBeNull();
    expect(normalized.name).toBe('Generic Component');
  });

  it('loads real OpenDB snapshot with maxPerCategory constraint for quick startup', () => {
    const snapshot = loadCatalogSnapshot({ maxPerCategory: 5, validateSchemas: true });

    expect(snapshot.totalCount).toBe(40); // 8 categories * 5
    expect(snapshot.components.length).toBe(40);
    expect(snapshot.byId.size).toBe(40);

    for (const cat of COMPONENT_CATEGORIES) {
      const list = snapshot.byCategory.get(cat);
      expect(list).toBeDefined();
      expect(list!.length).toBe(5);
    }
  });

  it('fails fast when a required category directory is missing', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-cat-'));

    expect(() => {
      loadCatalogSnapshot({ dataDir: tempDir });
    }).toThrow(/Missing required category directory/);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('fails fast when a required schema file is missing', () => {
    const tempSchemasDir = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-schema-'));

    expect(() => {
      loadCatalogSnapshot({ schemasDir: tempSchemasDir });
    }).toThrow(/Missing required schema file/);

    fs.rmSync(tempSchemasDir, { recursive: true, force: true });
  });

  it('fails fast on invalid JSON in category directory', () => {
    const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'corrupt-json-'));
    const tempOpendb = path.join(tempBase, 'opendb');
    const tempSchemas = path.join(tempBase, 'schemas');

    fs.mkdirSync(tempOpendb);
    fs.mkdirSync(tempSchemas);

    // Create mock schema
    const mockSchema = { type: 'object' };
    for (const cat of COMPONENT_CATEGORIES) {
      const folderName = cat === 'CPU' ? 'CPU' : cat === 'CPU_COOLER' ? 'CPUCooler' : cat;
      fs.writeFileSync(path.join(tempSchemas, `${folderName}.schema.json`), JSON.stringify(mockSchema));
      const catDir = path.join(tempOpendb, folderName);
      fs.mkdirSync(catDir);
      // Write corrupted JSON in CPU
      if (cat === 'CPU') {
        fs.writeFileSync(path.join(catDir, 'bad.json'), '{ invalid json');
      } else {
        fs.writeFileSync(path.join(catDir, 'item.json'), JSON.stringify({ name: 'ok' }));
      }
    }

    expect(() => {
      loadCatalogSnapshot({ dataDir: tempOpendb, schemasDir: tempSchemas, validateSchemas: false });
    }).toThrow(/Corrupt JSON/);

    fs.rmSync(tempBase, { recursive: true, force: true });
  });
});
