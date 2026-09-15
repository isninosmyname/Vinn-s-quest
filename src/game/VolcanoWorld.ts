import type { FOREST_LEVELS } from './ForestWorld';
type VolcanoLevel = Omit<(typeof FOREST_LEVELS)[number], 'bossType'> & { bossType?: 'BLAZE_KING' | 'LIVING_VOLCANO' };

export const VOLCANO_NAMES = ['Ember Foothills', 'Cinder Steps', 'Basalt Bridges', 'Ashfall Canyon', 'The Living Volcano', 'Obsidian Ridge', 'Lava Channels', 'Smoke Spires', 'Caldera Ascent', 'Blaze King’s Citadel'];
export const VOLCANO_NAMES_ES = ['Laderas de Brasas', 'Escalones de Ceniza', 'Puentes de Basalto', 'Cañón de Cenizas', 'El Volcán Viviente', 'Cresta de Obsidiana', 'Canales de Lava', 'Agujas de Humo', 'Ascenso a la Caldera', 'Ciudadela del Rey de Fuego'];

// Each route is individually laid out. The helper only unpacks coordinates.
function route(length: number, ground: [number, number][], ledges: [number, number, number][], enemies: number[], crystals: number[]): VolcanoLevel {
    return {
        length,
        platforms: [...ground.map(([x, w]) => ({ x, y: 460, w, h: 40 })), ...ledges.map(([x, y, w]) => ({ x, y, w, h: 20 }))],
        enemies: enemies.map((x, i) => ({ x, type: i % 3 === 0 ? 'TECH' : 'REGULAR' })),
        items: crystals.map(x => ({ x, y: 412, type: 'DOUBLE_JUMP', collected: false }))
    };
}

export const VOLCANO_LEVELS: VolcanoLevel[] = [
    route(3200, [[0,760],[880,560],[1560,410],[2090,450],[2660,540]],
        [[500,375,180],[1080,340,220],[1780,360,200],[2350,300,200]],
        [580,1030,1350,1670,1870,2230,2440,2820,3050], [990,2180]),
    route(3600, [[0,530],[650,420],[1200,720],[2050,340],[2510,390],[3030,570]],
        [[400,365,200],[740,275,190],[1130,185,220],[1520,280,200],[2010,355,220],[2700,320,180]],
        [380,790,960,1370,1690,2180,2640,2810,3190,3440], [1290,3130]),
    route(3900, [[0,820],[950,290],[1370,440],[1940,310],[2380,540],[3050,850]],
        [[680,360,260],[1140,300,280],[1640,300,290],[2150,360,270],[2780,285,310]],
        [590,1080,1510,1720,2110,2510,2770,3230,3480,3740], [1450,3120]),
    route(4200, [[0,670],[790,800],[1720,340],[2190,730],[3050,400],[3580,620]],
        [[480,370,200],[980,260,240],[1430,350,260],[2010,290,240],[2470,200,280],[2900,310,210],[3390,365,220]],
        [420,970,1300,1480,1870,2380,2670,2810,3210,3750,4050], [920,2300,3700]),
    { ...route(4600, [[0,1040],[1160,540],[1830,790],[2750,300],[3180,1420]],
        [[690,365,300],[1080,270,230],[1530,185,250],[1990,300,260],[2430,370,300],[3040,295,220]],
        [640,920,1380,1610,2100,2400,2890,3350,3500], [1260,3270]), isBoss: true, bossType: 'LIVING_VOLCANO' },
    route(4900, [[0,430],[560,580],[1270,420],[1820,1050],[3000,400],[3530,570],[4230,670]],
        [[290,350,220],[800,250,220],[1330,340,230],[1650,260,220],[2080,170,290],[2530,265,230],[3230,340,260],[3970,270,240]],
        [310,750,1020,1460,2040,2350,2700,3150,3750,4000,4490,4740], [670,3110]),
    route(5200, [[0,880],[1010,330],[1470,480],[2080,560],[2770,390],[3290,700],[4120,460],[4710,490]],
        [[640,370,270],[1190,305,300],[1740,370,280],[2410,290,300],[3050,360,250],[3700,270,290],[4440,355,300]],
        [520,790,1190,1660,1870,2310,2550,2920,3530,3800,4380,4910], [1530,3370,4770]),
    route(5500, [[0,610],[740,730],[1600,390],[2120,510],[2760,760],[3650,380],[4160,550],[4840,660]],
        [[410,350,190],[860,240,230],[1260,160,210],[1710,270,220],[2240,360,230],[2940,280,210],[3330,190,250],[3790,290,220],[4530,370,250]],
        [430,960,1280,1820,2350,2500,2990,3270,3810,4370,4620,5140,5330], [1670,3720,4920]),
    route(6000, [[0,790],[920,410],[1460,850],[2440,360],[2930,620],[3680,440],[4250,520],[4900,1100]],
        [[560,365,240],[1060,275,230],[1510,190,250],[1960,290,230],[2680,365,270],[3210,265,240],[3810,180,220],[4530,300,260],[5120,370,300]],
        [450,690,1100,1730,2070,2610,3160,3420,3890,4460,4700,5210,5660,5880], [1020,3020,5030]),
    { ...route(6800, [[0,910],[1040,680],[1850,500],[2480,850],[3460,450],[4040,720],[4890,1910]],
        [[650,360,280],[1210,270,220],[1600,180,240],[2090,300,250],[2830,360,310],[3700,280,250],[4440,190,240],[5180,350,310]],
        [570,820,1260,1550,2070,2250,2750,3120,3650,3840,4260,4630,5140,5500], [1130,2580,5010]), isBoss: true, bossType: 'BLAZE_KING' }
];

export function drawVolcanoWorld(ctx: CanvasRenderingContext2D, camera: number, level: number, time: number) {
    ctx.fillStyle = level >= 8 ? '#21172e' : '#462337'; ctx.fillRect(0, 0, 1000, 500);
    ctx.fillStyle = '#b54c44'; ctx.fillRect(0, 270, 1000, 230);
    for (let i = -1; i < 6; i++) {
        const x = i * 330 - camera * 0.16 % 330;
        ctx.fillStyle = '#342332'; ctx.beginPath(); ctx.moveTo(x - 120, 440); ctx.lineTo(x + 90, 120 + i % 2 * 40); ctx.lineTo(x + 310, 440); ctx.fill();
        ctx.fillStyle = '#ee8860'; ctx.fillRect(x + 73, 175 + i % 2 * 40, 35, 10);
    }
    ctx.fillStyle = '#eb6837'; ctx.fillRect(0, 470, 1000, 30);
    for (let i = 0; i < 26; i++) {
        ctx.fillStyle = i % 2 ? '#ffbc54' : '#ff8a38';
        ctx.fillRect((i * 43 + time * 25) % 1050 - 30, 478 + i % 3 * 6, 24, 4);
    }
    // Different landmarks distinguish the ten approaches beyond their layouts.
    const x = 1700 + level * 170 - camera;
    ctx.fillStyle = '#271e2b';
    if ([3, 7].includes(level)) {
        for (let i = 0; i < 5; i++) { ctx.fillRect(x + i * 110, 265, 20, 195); ctx.fillRect(x + i * 110, 265, 120, 18); }
    } else if ([5, 10].includes(level)) {
        ctx.fillRect(x, 180, 380, 280); ctx.fillRect(x - 40, 120, 80, 340); ctx.fillRect(x + 330, 120, 90, 340);
        ctx.fillStyle = '#ab5e48'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 45 + i * 65, 230, 25, 55);
    } else {
        for (let i = 0; i < 6; i++) ctx.fillRect(x + i * 70, 190 + i % 3 * 55, 45, 270);
    }
}
