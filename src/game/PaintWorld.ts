import type { EnemyType } from './Enemy';

export const PAINT_NAMES = ['Prism Shore', 'Spilled Gardens', 'Brushwood Bridges', 'The Violet Works', 'Chromatic Cliffs', 'Duff’s Ink Gallery', 'Turquoise Canals', 'Canvas Rooftops', 'Rainbow Aqueduct', 'The Dripping Archives', 'Colossus Courtyard', 'The Ink Colossus'];
export const PAINT_NAMES_ES = ['Costa prisma', 'Jardines derramados', 'Puentes de pincel', 'Taller violeta', 'Acantilados de color', 'Galería de Duff', 'Canales turquesa', 'Tejados de lienzo', 'Acueducto arcoíris', 'Archivos goteantes', 'Patio del Coloso', 'El Coloso de Tinta'];

// Eleven approaches; the original story chase is preserved as level twelve.
// Different island rhythms and elevated galleries, with every lower gap jumpable.
const layouts = [
  [900, 640, 1150, 760, 1050, 850], [650, 1120, 780, 540, 1280, 920, 660],
  [1100, 470, 760, 1240, 560, 940, 730], [760, 1350, 620, 980, 490, 1200, 890],
  [530, 920, 1270, 610, 880, 1130, 760, 970], [960, 600, 1150, 790, 920, 650, 1350],
  [740, 1140, 500, 970, 1280, 610, 850, 1040], [1200, 680, 890, 540, 1100, 760, 980, 1230],
  [880, 510, 1320, 740, 1060, 620, 1180, 950], [620, 1260, 830, 1100, 570, 960, 1380, 790],
  [1050, 780, 1220, 560, 910, 1350, 670, 1600]
];
export const PAINT_LEVELS = layouts.map((islands, index) => {
  const platforms: { x: number; y: number; w: number; type: 'NORMAL' | 'PAINT' }[] = [];
  const enemies: { x: number; type: EnemyType }[] = [];
  let x = 0;
  for (const [j, width] of islands.entries()) {
    platforms.push({ x, y: 460, w: width, type: 'NORMAL' });
    if (j < islands.length - 1) {
      platforms.push({ x: x + width * .35, y: 355 - (index + j) % 2 * 20, w: 200 + (index % 3) * 40, type: 'PAINT' });
      if ((index + j) % 3 === 0) platforms.push({ x: x + width * .35 + 130, y: 250, w: 160, type: 'NORMAL' });
    }
    if (!(index === 5 && j === islands.length - 1)) {
      enemies.push({ x: x + Math.max(350, width * .55), type: j % 3 === 0 ? 'TECH' : 'REGULAR' });
      if (width > 1000) enemies.push({ x: x + width - 140, type: 'ELITE' });
    }
    x += width + (j < islands.length - 1 ? 90 + (index + j) % 3 * 20 : 0);
  }
  return { length: x, platforms, enemies, items: [{ x: platforms[2].x + 90, y: 310, type: 'DOUBLE_JUMP' as const, collected: false }] };
});

export function drawPaintWorld(ctx: CanvasRenderingContext2D, camera: number, level: number, time: number) {
  ctx.save();
  const palette = ['#b358b9', '#50afb8', '#9d7bd3', '#daa564'];
  ctx.fillStyle = '#1c1732'; ctx.fillRect(0, 0, 1000, 500);
  const offset = (camera * .18) % 240;
  for (let i = -1; i < 6; i++) {
    const x = i * 240 - offset, h = 120 + (i + level + 10) % 3 * 48;
    ctx.fillStyle = '#352344'; ctx.fillRect(x, 460 - h, 150, h);
    ctx.fillStyle = '#584068'; ctx.fillRect(x - 8, 450 - h, 166, 12);
    for (let w = 0; w < 3; w++) { ctx.fillStyle = palette[(level + w) % 4]; ctx.fillRect(x + 20 + w * 42, 480 - h, 12, 27); }
  }
  for (let i = 0; i < 12; i++) {
    const x = ((i * 117 - camera * .35) % 1100 + 1100) % 1100 - 50;
    const drip = 30 + (i * 13 + level * 9) % 75;
    ctx.fillStyle = palette[(i + level) % 4];
    ctx.fillRect(x, 0, 47, 18); ctx.fillRect(x + 9, 12, 10, drip);
    ctx.fillRect(x + 10, 24 + drip + (time * 24 + i * 50) % 290, 7, 9);
  }
  ctx.fillStyle = '#6c3b72'; ctx.fillRect(0, 470, 1000, 30);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = palette[(i + level) % 4]; ctx.fillRect(i * 52, 480 + Math.sin(time * 2 + i) * 4, 40, 4);
  }
  ctx.restore();
}

export function drawPaintMap(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#30264f'; ctx.fillRect(0, 0, 1000, 500);
  ctx.fillStyle = '#e9d6c9'; ctx.fillRect(28, 132, 944, 310);
  const colors = ['#e68db9', '#76d5d5', '#b09ce8', '#efd57d'];
  for (let i = 0; i < 16; i++) {
    const x = 45 + (i * 173) % 875, y = 140 + (i * 79) % 240;
    ctx.fillStyle = colors[i % 4]; ctx.fillRect(x, y, 75, 32); ctx.fillRect(x + 20, y - 14, 25, 66);
    ctx.fillRect(x + 13, y + 25, 8, 22 + Math.sin(time * 2 + i) * 6);
  }
  ctx.fillStyle = '#6863b0'; ctx.fillRect(455, 145, 38, 280);
  ctx.fillStyle = '#72e6d6';
  for (let i = 0; i < 13; i++) ctx.fillRect(463, 150 + (i * 22 + time * 18) % 264, 13, 5);
  ctx.fillStyle = '#e4b775'; ctx.fillRect(433, 281, 82, 18);
  for (const x of [140, 570, 850]) {
    ctx.fillStyle = '#56436c'; ctx.fillRect(x, 160, 10, 44);
    ctx.fillStyle = '#ffdba5'; ctx.fillRect(x - 5, 149, 20, 18);
    ctx.fillStyle = '#d962a6'; ctx.fillRect(x - 5, 143, 20, 9);
  }
}
