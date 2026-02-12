export interface SpriteEntry {
  name: string;
  file: string;
  spriteType: "character" | "enemy";
  frameWidth: number;
  frameHeight: number;
  /** Total columns in the sheet */
  columns: number;
  /** Total rows in the sheet */
  rows: number;
  /** Which character within a multi-character sheet (0-3 for characters) */
  charIndex: number;
  /** Column offset for this character's 4-frame block */
  colOffset: number;
  /** Number of animation frames per direction */
  animCols: number;
}

/**
 * 53 character sheets, each 384x96 = 16 cols x 4 rows at 24x24.
 * Each sheet contains 4 characters (4 cols x 4 rows each).
 * Total: 53 × 4 = 212 individual characters.
 */
const CHARACTERS: SpriteEntry[] = [];
for (let sheet = 0; sheet < 53; sheet++) {
  const num = String(sheet + 1).padStart(3, "0");
  for (let ci = 0; ci < 4; ci++) {
    CHARACTERS.push({
      name: `Character_${num}_${ci + 1}`,
      file: `Character_${num}.png`,
      spriteType: "character",
      frameWidth: 24,
      frameHeight: 24,
      columns: 16,
      rows: 4,
      charIndex: ci,
      colOffset: ci * 4,
      animCols: 4,
    });
  }
}

/** All enemy sprite sheets (72x96 = 3 cols x 4 rows at 24x24, 1 enemy per sheet) */
const ENEMY_FILES = [
  "Enemy_01_01", "Enemy_01_02", "Enemy_01_03", "Enemy_01_04",
  "Enemy_02_01", "Enemy_02_02", "Enemy_02_03", "Enemy_02_04",
  "Enemy_03_01", "Enemy_03_02", "Enemy_03_03", "Enemy_03_04",
  "Enemy_04_01", "Enemy_04_02", "Enemy_04_03", "Enemy_04_04",
  "Enemy_05_01", "Enemy_05_02", "Enemy_05_03", "Enemy_05_04",
  "Enemy06_01", "Enemy06_02", "Enemy06_03", "Enemy06_04",
  "Enemy07_01", "Enemy07_02", "Enemy07_03", "Enemy07_04",
  "Enemy08_01", "Enemy08_02", "Enemy08_03", "Enemy08_04",
  "Enemy09_01",
  "Enemy10_1", "Enemy10_2", "Enemy10_3",
  "Enemy11_01", "Enemy11_02",
  "Enemy12_01", "Enemy12_02", "Enemy12_03",
  "Enemy13_01", "Enemy13_02", "Enemy13_03",
  "Enemy14_01", "Enemy14_02", "Enemy14_03",
  "Enemy15_01", "Enemy15_02", "Enemy15_03",
  "Enemy16_01", "Enemy16_02", "Enemy16_03",
];

const ENEMIES: SpriteEntry[] = ENEMY_FILES.map((name) => ({
  name,
  file: `${name}.png`,
  spriteType: "enemy" as const,
  frameWidth: 24,
  frameHeight: 24,
  columns: 3,
  rows: 4,
  charIndex: 0,
  colOffset: 0,
  animCols: 3,
}));

export function getCharacters(): SpriteEntry[] {
  return CHARACTERS;
}

export function getEnemies(): SpriteEntry[] {
  return ENEMIES;
}

export function getAllSprites(): SpriteEntry[] {
  return [...CHARACTERS, ...ENEMIES];
}

/** Get the base asset path for a sprite type */
export function getSpriteBasePath(spriteType: "character" | "enemy"): string {
  return spriteType === "character" ? "/assets/characters" : "/assets/enemies";
}
