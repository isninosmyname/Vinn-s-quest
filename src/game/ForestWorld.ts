import type { EnemyType } from './Enemy';

export const FOREST_NAMES = ['Royal Trail', 'Canopy Crossing', 'Briar Bear Cave', 'Duff’s Ironwood Keep', 'River Ruins', 'Hanging Gardens', 'Moonroot Pass', 'Golem’s Stronghold'];
export const DUFF_ARENA = 5800;
export type ForestPlatform = { x: number; y: number; w: number; h?: number; type?: 'NORMAL' | 'MUSHROOM' | 'PAINT' };
type ForestLevel = {
  length: number; platforms: ForestPlatform[]; enemies: { x: number; type: EnemyType }[];
  items: { x: number; y: number; type: 'DOUBLE_JUMP'; collected: boolean }[];
  isBoss?: boolean; bossType?: 'GOLEM';
};

// Layouts are authored individually: these helpers only unpack coordinates.
function course(length: number, ground: [number, number][], ledges: [number, number, number][], patrols: [number, EnemyType][], crystals: [number, number][]): ForestLevel {
  return { length,
    platforms: [...ground.map(([x, w]) => ({ x, y: 460, w, h: 40 })), ...ledges.map(([x, y, w]) => ({ x, y, w }))],
    enemies: patrols.map(([x, type]) => ({ x, type })),
    items: crystals.map(([x, y]) => ({ x, y, type: 'DOUBLE_JUMP', collected: false })) };
}
export const FOREST_LEVELS: ForestLevel[] = [
  // Royal Trail: royal picnic meadow, fallen oak bridge, a patrol clearing,
  // then an old watchtower with a high optional route.
  course(6000,
    [[0,720],[800,510],[1410,980],[2500,360],[2970,620],[3690,1050],[4860,1140]],
    [[390,385,190],[900,355,260],[1250,285,200],[1750,345,380],[2180,385,200],
     [3040,365,180],[3300,275,240],[3650,200,190],[3950,300,320],[4400,375,170],[5160,350,480]],
    [[650,'TECH'],[1160,'WOLF'],[1800,'TECH'],[2190,'TECH'],[2700,'WOLF'],
     [3200,'TECH'],[3540,'TECH'],[4080,'WOLF'],[4500,'TECH'],[5240,'TECH'],[5540,'WOLF']],
    [[820,412],[3090,320],[4980,412]]),
  // Canopy Crossing: three tree crowns over the low trail, a narrow log
  // crossing, and a descending run of ancient aqueduct stones.
  course(6800,
    [[0,480],[570,890],[1590,420],[2120,330],[2580,1270],[3970,560],[4660,760],[5540,1260]],
    [[250,365,160],[530,270,300],[940,195,360],[1370,270,190],[1700,350,140],
     [2230,375,180],[2670,365,220],[2980,285,260],[3340,205,330],[3820,270,190],
     [4090,330,170],[4810,360,220],[5130,280,250],[5490,200,210],[5850,295,250],[6260,375,190]],
    [[780,'TECH'],[1300,'WOLF'],[1820,'TECH'],[2370,'TECH'],[2860,'WOLF'],[3390,'TECH'],
     [3730,'TECH'],[4230,'WOLF'],[4950,'TECH'],[5670,'TECH'],[6040,'WOLF'],[6540,'TECH']],
    [[130,412],[2340,330],[4140,285],[6030,412]]),
  // Briar Bear Cave: rocky ravine, a long briar clearing, broken stairs,
  // then an uninterrupted cave floor for the mandatory bear fight.
  course(7200,
    [[0,940],[1040,310],[1470,630],[2210,1080],[3410,540],[4090,690],[4900,510],[5530,1670]],
    [[530,380,170],[810,295,250],[1280,350,200],[1670,260,300],[2040,340,200],
     [2380,365,200],[2760,305,340],[3500,355,160],[3810,270,170],[4350,375,280],
     [4990,365,150],[5220,285,180],[5480,205,240],[5810,320,200]],
    [[710,'TECH'],[1240,'TECH'],[1860,'WOLF'],[2500,'TECH'],[3030,'WOLF'],
     [3740,'TECH'],[4440,'WOLF'],[4630,'TECH'],[5160,'TECH'],[5760,'TECH'],[6770,'BEAR']],
    [[1070,412],[2870,260],[4980,412],[6140,412]]),
  // Ironwood Keep: the outer gate, guard barracks, broken gallery and
  // forge galleries all precede Duff's room at 5800.
  course(6800,
    [[0,1100],[1200,570],[1880,880],[2880,420],[3420,720],[4290,430],[4840,1960]],
    [[640,380,170],[850,300,190],[1110,225,240],[1490,310,180],[2000,370,230],
     [2320,290,180],[2610,215,240],[3040,360,180],[3520,345,240],[3860,255,210],
     [4180,325,160],[4450,385,170],[4920,365,230],[5270,295,200],[5530,375,170]],
    [[850,'TECH'],[1540,'TECH'],[2050,'TECH'],[2470,'TECH'],[3160,'TECH'],
     [3630,'TECH'],[3960,'TECH'],[4530,'TECH'],[5080,'TECH'],[5520,'TECH']],
    [[1260,412],[3550,300],[5480,412]]),
  // River Ruins: a broad river, small islands, paired broken bridge ends,
  // a dry ruins courtyard and the final waterfall overlook.
  course(7800,
    [[0,630],[750,280],[1160,350],[1640,500],[2260,290],[2680,440],[3250,850],
     [4210,500],[4840,330],[5290,700],[6120,280],[6520,1280]],
    [[410,365,190],[780,285,170],[1130,205,190],[1470,285,220],[1840,355,200],
     [2310,365,180],[2700,310,290],[3120,245,220],[3550,355,410],[4310,340,230],
     [4760,270,230],[5140,345,170],[5520,365,290],[5940,285,220],[6460,355,270],[6940,300,390]],
    [[540,'TECH'],[1380,'WOLF'],[1980,'TECH'],[2400,'TECH'],[2890,'TECH'],[3730,'WOLF'],
     [4550,'TECH'],[4990,'TECH'],[5690,'WOLF'],[6320,'TECH'],[6950,'TECH'],[7440,'TECH']],
    [[830,240],[3360,412],[5630,320],[6680,412]]),
  // Hanging Gardens: a low fern valley leads into two broad, tiered
  // gardens. The second garden has a different staircase and exit route.
  course(8400,
    [[0,1260],[1380,550],[2050,360],[2530,1100],[3760,640],[4530,420],
     [5070,920],[6120,500],[6750,440],[7310,1090]],
    [[560,370,260],[920,285,190],[1460,365,280],[1870,275,280],[2310,190,370],
     [2810,275,430],[3370,350,200],[3870,360,220],[4200,265,310],[4650,180,330],
     [5070,265,350],[5510,340,350],[6230,360,200],[6610,270,230],[6970,195,260],[7420,320,420]],
    [[790,'WOLF'],[1130,'TECH'],[1650,'TECH'],[2320,'TECH'],[2900,'WOLF'],[3480,'TECH'],
     [4040,'TECH'],[4770,'TECH'],[5660,'WOLF'],[6500,'TECH'],[7020,'TECH'],[7810,'WOLF'],[8170,'TECH']],
    [[1430,412],[2950,230],[5210,220],[7460,275]]),
  // Moonroot Pass: tightly spaced ravines, a single long shelter below
  // the giant root arch, then a watch-post gauntlet approaching the keep.
  course(9000,
    [[0,780],[890,450],[1460,300],[1890,620],[2630,480],[3230,1570],
     [4930,340],[5390,410],[5930,660],[6720,370],[7210,640],[7990,1010]],
    [[430,360,180],[760,265,190],[1090,345,190],[1530,360,150],[2050,335,210],
     [2390,250,190],[2740,345,200],[3380,365,300],[3790,275,360],[4290,195,250],
     [4680,280,200],[5010,370,180],[5530,345,180],[6070,285,280],[6490,365,210],
     [7330,360,220],[7660,270,200],[8080,335,270],[8530,255,220]],
    [[680,'TECH'],[1240,'WOLF'],[1670,'TECH'],[2380,'TECH'],[2890,'TECH'],[3670,'WOLF'],
     [4200,'TECH'],[4610,'WOLF'],[5160,'TECH'],[5650,'TECH'],[6310,'TECH'],[6910,'WOLF'],
     [7620,'TECH'],[8370,'TECH'],[8730,'TECH']],
    [[1520,412],[3440,320],[5020,412],[7300,412]]),
  // Golem's Stronghold: wooded approach, shattered outworks, the guard
  // terrace, then a continuous 1200-pixel arena.
  { ...course(7600,
    [[0,920],[1040,660],[1820,400],[2340,820],[3280,380],[3780,590],[4490,880],[5490,2110]],
    [[580,375,220],[940,285,220],[1280,205,210],[1680,290,190],[1990,365,180],
     [2460,350,290],[2900,270,210],[3380,350,180],[3890,360,180],[4190,275,210],
     [4600,190,260],[4990,290,210],[5550,365,260],[5990,285,220]],
    [[780,'TECH'],[1550,'TECH'],[2050,'WOLF'],[2590,'TECH'],[2990,'TECH'],[3500,'TECH'],
     [3980,'WOLF'],[4610,'TECH'],[5110,'TECH'],[5690,'TECH'],[6070,'TECH']],
    [[1110,412],[2540,305],[3930,412],[5860,412]]), isBoss: true, bossType: 'GOLEM' }
];

// Most bushes are empty; these are scenery positions, independent of enemies.
export const FOREST_BUSHES: number[][] = [
  [340,490,1160,1600,1940,2700,3070,3380,3870,4080,4600,5060,5540,5750],
  [360,690,980,1300,1720,2250,2860,3100,3530,4050,4230,4880,5380,5740,6040,6310],
  [310,670,1200,1640,1860,2360,2740,3030,3600,4230,4440,5050,5660,5980],
  [],
  [280,810,1380,1760,2020,2810,3460,3730,4390,4930,5500,5690,6220,6770,7130,7510],
  [390,790,1090,1510,2260,2780,2900,3400,3920,4580,5320,5660,6330,6880,7450,7810,8140],
  [330,680,1040,1240,1570,2210,2740,3400,3670,4030,4450,4610,5040,5540,6170,6910,7490,8230],
  [310,720,1190,1530,2050,2630,2950,3440,3890,3980,4780,5200,5620,6130]
];
export const FOREST_LETTERS = [
  [{ x: 230, text: 'Dear Vinn, A/D moves, W jumps, and SPACE swings your sword. Hold C to crouch and walk beneath low obstacles. Follow the signs along the royal trail.' },
   { x: 910, text: 'Some wolves hide in bushes. Many bushes are empty. A pair of glowing eyes is your warning. Step back when the wolf prepares to attack, then strike while it rests.' },
   { x: 650, text: 'Feather crystals give you a second jump for sixty seconds. Collect another to reset the minute. Watch the timer. The lower trail remains passable after the magic fades.' }],
  [{ x: 230, text: 'The branches above the trail form a second route. Jump from the low boughs to explore the canopy. You can always return to the lower path.' }],
  [{ x: 5910, text: 'Press E at the cave door to enter. The bear swipes its claws and sometimes raises its front paws for a stomp. Jump over the shockwave, then strike while it rests. Defeat it to open the exit.' }],
  [{ x: 5460, text: 'Duff waits beyond these halls. Duck the high pole and jump the low pole. Strike RIGHT, then LEFT. The poles will become steps. Reach his perch to hit him. Four hits will break his machine.' }],
  [{ x: 210, text: 'This river has washed away the old bridge. Use the remaining islands and the stone arches above them. The moving water below the gaps marks where the bridge has fallen.' }],
  [], [],
  [{ x: 6180, text: 'Press E at the fortress gate. Duff throws swords from the gallery while Golem attacks. Each landing sends two shockwaves, one in each direction. Jump over them, avoid falling stones, and strike Golem while he is stunned.' }]
];

export function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#164b38'; ctx.fillRect(x - 48, y - 22, 96, 22);
  ctx.fillStyle = '#2d7950'; ctx.fillRect(x - 36, y - 32, 68, 28); ctx.fillRect(x - 17, y - 42, 38, 36);
  ctx.fillStyle = '#73a955'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 34 + i * 13, y - 20 - (i % 3) * 7, 7, 5);
}

export function drawForestWorld(ctx: CanvasRenderingContext2D, camera: number, level: number, time: number, language: 'en' | 'es' = 'en') {
  const castle = level === 4;
  const skies = ['#acd6b7', '#91c7b8', '#9daea2', '#242337', '#a5d4dc', '#c9ddac', '#9babc0', '#d8cbaa'];
  ctx.fillStyle = skies[level - 1]; ctx.fillRect(0, 0, 1000, 500);
  if (castle) {
    for (let row = 0; row < 8; row++) for (let x = -camera % 100 - 100; x < 1000; x += 100) {
      ctx.fillStyle = row % 2 ? '#323046' : '#3b354b'; ctx.fillRect(x + row % 2 * 50, row * 62, 96, 58);
    }
    for (let i = Math.floor(camera / 450); i < camera / 450 + 4; i++) {
      const x = i * 450 + 180 - camera;
      ctx.fillStyle = '#141a2e'; ctx.fillRect(x - 48, 100, 96, 200);
      ctx.fillStyle = '#637f8e'; ctx.fillRect(x - 34, 115, 68, 160);
      ctx.fillStyle = '#252435'; ctx.fillRect(x - 3, 100, 6, 200); ctx.fillRect(x - 48, 190, 96, 8);
      ctx.fillStyle = '#823b46'; ctx.fillRect(x + 70, 110, 48, 125);
      ctx.fillStyle = '#d4a669'; ctx.fillRect(x + 89, 120, 10, 85);
      const flame = Math.floor(time * 9 + i) % 3;
      ctx.fillStyle = '#a87b54'; ctx.fillRect(x - 95, 260, 9, 38);
      ctx.fillStyle = '#f06b36'; ctx.fillRect(x - 102, 238 - flame * 2, 22, 26 + flame * 2);
      ctx.fillStyle = '#ffe49a'; ctx.fillRect(x - 96, 241 - flame * 2, 10, 20 + flame * 2);
    }
    ctx.fillStyle = '#e1b273'; ctx.font = '16px monospace';
    if (camera < 800) ctx.fillText(language === 'en' ? 'IRONWOOD KEEP  →  DUFF’S MACHINE ROOM' : 'FORTALEZA  →  SALA DE MÁQUINAS DE DUFF', 220 - camera, 70);
    return;
  }
  for (let layer = 0; layer < 3; layer++) {
    const speed = [0.15, 0.35, 0.65][layer]; const spacing = [240, 310, 400][layer];
    for (let i = -1; i < 1000 / spacing + 2; i++) {
      const x = Math.round(i * spacing - camera * speed % spacing);
      ctx.fillStyle = ['#80b89f', '#447f69', '#275343'][layer];
      ctx.fillRect(x + 46, 40 + layer * 5, 22 + layer * 9, 430);
      ctx.fillRect(x - 12, 30, 160, 44); ctx.fillRect(x + 10, 10, 120, 50);
      ctx.fillRect(x + 55, 200, 115, 12); ctx.fillRect(x - 35, 300, 105, 10);
      if (layer === 2) {
        ctx.strokeStyle = '#94b663'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 120, 70);
        for (let y = 70; y < 295; y += 15) ctx.lineTo(x + 120 + Math.sin(y / 45 + time * 0.6) * 12, y);
        ctx.stroke();
        ctx.fillStyle = '#6d9e58'; for (let y = 100; y < 270; y += 36) ctx.fillRect(x + 112 + Math.sin(y / 45 + time * 0.6) * 12, y, 16, 7);
      }
    }
  }
  ctx.fillStyle = '#d8ecc4'; for (let i = 0; i < 20; i++) ctx.fillRect((i * 137 - camera * 0.2 + time * 7) % 1000, 110 + i * 37 % 320, 3, 3);
  if (level === 1) {
    const x = 1850 - camera;
    ctx.fillStyle = '#b47377'; ctx.beginPath(); ctx.moveTo(x, 425); ctx.lineTo(x + 100, 300); ctx.lineTo(x + 200, 425); ctx.fill();
    ctx.fillStyle = '#f4d9aa'; ctx.beginPath(); ctx.moveTo(x + 70, 425); ctx.lineTo(x + 100, 342); ctx.lineTo(x + 133, 425); ctx.fill();
    ctx.fillStyle = '#856141'; ctx.fillRect(x + 260, 401, 110, 11); ctx.fillRect(x + 273, 412, 10, 48); ctx.fillRect(x + 348, 412, 10, 48);
  }
  if (level === 2) {
    for (const anchor of [2600, 3220, 3970]) {
      const x = anchor - camera; ctx.fillStyle = '#81968c'; ctx.fillRect(x, 175, 350, 34); ctx.fillRect(x + 20, 200, 36, 260); ctx.fillRect(x + 270, 200, 36, 260);
      ctx.fillStyle = '#5c776b'; ctx.fillRect(x + 30, 165, 100, 10); ctx.fillRect(x + 135, 200, 25, 35);
    }
  }
  if (level === 5) {
    ctx.fillStyle = '#347d90'; ctx.fillRect(0, 434, 1000, 66);
    ctx.fillStyle = '#90d9db';
    for (let i = 0; i < 24; i++) ctx.fillRect((i * 97 + time * 28 - camera * 0.65) % 1000, 442 + i % 4 * 13, 38, 3);
    const x = 6070 - camera; ctx.fillStyle = '#499ba4'; ctx.fillRect(x, 170, 160, 290);
    ctx.fillStyle = '#bdebe1'; for (let i = 0; i < 9; i++) ctx.fillRect(x + i * 18, 170 + (time * 80 + i * 37) % 180, 7, 90);
  }
  if (level === 6) {
    for (const anchor of [1150, 2650, 4480, 6880]) {
      const x = anchor - camera;
      ctx.fillStyle = '#a49c64'; ctx.fillRect(x - 66, 60, 4, 160); ctx.fillRect(x + 66, 60, 4, 160);
      ctx.fillStyle = '#956557'; ctx.fillRect(x - 78, 220, 160, 28); ctx.fillRect(x - 60, 245, 124, 20);
      ctx.fillStyle = '#61985d'; ctx.fillRect(x - 84, 200, 174, 22);
      for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#eb9da2' : '#efd985'; ctx.fillRect(x - 70 + i * 20, 186 - i % 3 * 5, 12, 12); }
    }
  }
  if (level === 7) {
    const x = 3680 - camera;
    ctx.strokeStyle = '#564d43'; ctx.lineWidth = 55; ctx.beginPath(); ctx.moveTo(x, 460); ctx.lineTo(x + 110, 275); ctx.lineTo(x + 440, 170); ctx.lineTo(x + 700, 290); ctx.lineTo(x + 850, 460); ctx.stroke();
    ctx.strokeStyle = '#9c9167'; ctx.lineWidth = 8; ctx.stroke();
  }
  if (level === 8) {
    const x = 6270 - camera;
    ctx.fillStyle = '#646b60'; ctx.fillRect(x, 170, 1500, 290);
    ctx.fillStyle = '#92927b'; for (let i = 0; i < 12; i++) ctx.fillRect(x + i * 130, 140, 62, 55);
    ctx.fillStyle = '#263832'; ctx.fillRect(x + 270, 285, 150, 175); ctx.fillRect(x + 650, 240, 200, 220);
  }
  if (level === 3) {
    const x = FOREST_LEVELS[2].length - 1000 - camera;
    ctx.fillStyle = '#3c443f'; ctx.fillRect(x, 160, 1050, 300);
    ctx.fillRect(x + 90, 100, 960, 80); ctx.fillRect(x + 170, 60, 880, 70);
    ctx.fillStyle = '#131e20'; ctx.fillRect(x + 160, 240, 840, 220); ctx.fillRect(x + 260, 190, 740, 60);
    ctx.fillStyle = '#687368'; for (let i = 0; i < 8; i++) ctx.fillRect(x + 30 + i * 117, 180 - i % 3 * 24, 72, 32);
    ctx.fillStyle = '#f8d88c'; ctx.font = '16px monospace'; ctx.fillText(language === 'en' ? 'BRIAR BEAR CAVE' : 'CUEVA DEL OSO', x + 160, 170);
  }
}

export function drawQueenPaper(ctx: CanvasRenderingContext2D, message: string, language: 'en' | 'es' = 'en') {
  ctx.save(); ctx.fillStyle = 'rgba(7,17,18,.78)'; ctx.fillRect(0, 0, 1000, 500);
  ctx.fillStyle = '#8d643e'; ctx.fillRect(153, 51, 708, 405);
  ctx.fillStyle = '#f3ddb0'; ctx.fillRect(145, 43, 708, 405);
  ctx.strokeStyle = '#bd9461'; ctx.lineWidth = 2; ctx.strokeRect(157, 55, 684, 381);
  ctx.fillStyle = '#dfc293'; for (let i = 0; i < 140; i++) ctx.fillRect(164 + i * 73 % 660, 65 + i * 41 % 360, 3 + i % 8, 1);
  // Queen's portrait, matching her pink figure, purple dress and gold crown.
  ctx.fillStyle = '#ba8191'; ctx.fillRect(175, 70, 70, 84);
  ctx.fillStyle = '#ffd3cf'; ctx.fillRect(198, 88, 24, 24);
  ctx.fillStyle = '#864785'; ctx.fillRect(189, 114, 42, 30);
  ctx.fillStyle = '#ffda68'; ctx.fillRect(193, 82, 34, 8); ctx.fillRect(193, 74, 6, 12); ctx.fillRect(207, 70, 6, 16); ctx.fillRect(221, 74, 6, 12);
  ctx.fillStyle = '#533d47'; ctx.font = 'bold 23px Georgia'; ctx.fillText(language === 'en' ? 'A letter from your Queen' : 'Una carta de tu Reina', 270, 107);
  ctx.font = '19px Georgia'; let line = ''; let y = 191;
  for (const word of message.split(' ')) {
    if (ctx.measureText(line + word).width > 600) { ctx.fillText(line, 195, y); line = ''; y += 28; }
    line += word + ' ';
  }
  ctx.fillText(line, 195, y); ctx.font = 'italic 21px Georgia'; ctx.fillText(language === 'en' ? 'Greetings, The queen.' : 'Saludos, La reina.', 540, 392);
  ctx.font = '14px monospace'; ctx.fillText(language === 'en' ? 'E / ESC: close' : 'E / ESC: cerrar', 195, 416); ctx.restore();
}
