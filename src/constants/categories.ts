export const COMPONENT_CATEGORIES = [
  'CPU',
  'CPU_COOLER',
  'MOTHERBOARD',
  'MEMORY',
  'INTERNAL_HARD_DRIVE',
  'VIDEO_CARD',
  'CASE',
  'POWER_SUPPLY',
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export const CATEGORY_FOLDER_MAP: Record<ComponentCategory, string> = {
  CPU: 'CPU',
  CPU_COOLER: 'CPUCooler',
  MOTHERBOARD: 'Motherboard',
  MEMORY: 'RAM',
  INTERNAL_HARD_DRIVE: 'Storage',
  VIDEO_CARD: 'GPU',
  CASE: 'PCCase',
  POWER_SUPPLY: 'PSU',
};

export const FOLDER_CATEGORY_MAP: Record<string, ComponentCategory> = {
  CPU: 'CPU',
  CPUCooler: 'CPU_COOLER',
  Motherboard: 'MOTHERBOARD',
  RAM: 'MEMORY',
  Storage: 'INTERNAL_HARD_DRIVE',
  GPU: 'VIDEO_CARD',
  PCCase: 'CASE',
  PSU: 'POWER_SUPPLY',
};

export const CATEGORY_SCHEMA_MAP: Record<ComponentCategory, string> = {
  CPU: 'CPU.schema.json',
  CPU_COOLER: 'CPUCooler.schema.json',
  MOTHERBOARD: 'Motherboard.schema.json',
  MEMORY: 'RAM.schema.json',
  INTERNAL_HARD_DRIVE: 'Storage.schema.json',
  VIDEO_CARD: 'GPU.schema.json',
  CASE: 'PCCase.schema.json',
  POWER_SUPPLY: 'PSU.schema.json',
};

export function isComponentCategory(value: unknown): value is ComponentCategory {
  return typeof value === 'string' && COMPONENT_CATEGORIES.includes(value as ComponentCategory);
}
