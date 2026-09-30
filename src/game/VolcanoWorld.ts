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

// Individually authored second halves: new terrain, not copies of the first half.
// The final uninterrupted stretches of 5 and 10 remain reserved for their bosses.
const expansions = [
    route(6200, [[3320,610],[4050,420],[4590,750],[5460,740]], [[3400,355,240],[3780,270,220],[4170,360,210],[4710,300,280],[5130,210,230],[5590,350,320]], [3540,3820,4250,4780,5120,5720,6010], [3430]),
    route(6800, [[3720,740],[4580,330],[5030,590],[5740,1060]], [[3880,355,250],[4240,255,230],[4680,350,180],[5170,300,240],[5500,210,200],[5910,340,250],[6340,245,230]], [3940,4290,4730,5240,5490,5980,6360,6610], [3900]),
    route(7300, [[4020,410],[4550,660],[5330,430],[5880,580],[6580,720]], [[4140,360,230],[4460,290,210],[4820,210,280],[5430,360,230],[6050,300,250],[6460,220,210],[6760,350,320]], [4230,4720,5060,5530,6120,6370,6850,7100], [4170]),
    route(7800, [[4320,540],[4980,820],[5920,340],[6380,660],[7160,640]], [[4420,370,230],[4780,290,250],[5270,200,290],[5720,290,230],[6020,365,190],[6520,290,270],[6920,200,230],[7380,350,270]], [4520,4770,5180,5500,6070,6590,6880,7340,7600], [4480]),
    route(8400, [[4720,710],[5550,390],[6060,670],[6850,1550]], [[4850,360,260],[5200,260,220],[5650,350,220],[6240,290,290],[6660,360,260]], [4930,5200,5730,6270,6550,7020,7330], [4920]),
    route(8700, [[5020,390],[5530,560],[6210,910],[7240,450],[7810,890]], [[5120,360,230],[5700,265,250],[6050,175,230],[6400,280,240],[6830,365,260],[7360,280,220],[8020,350,320]], [5200,5730,5980,6510,6820,7000,7440,8020,8460], [5180]),
    route(9200, [[5320,680],[6120,420],[6660,550],[7330,700],[8150,1050]], [[5460,365,280],[5870,285,210],[6240,360,220],[6810,300,270],[7210,210,240],[7530,310,280],[8000,365,220],[8530,290,300]], [5510,5830,6320,6830,7050,7560,7890,8410,8830,9020], [5480]),
    route(9700, [[5620,510],[6250,810],[7180,360],[7660,470],[8250,610],[8980,720]], [[5800,355,210],[6130,260,210],[6480,175,270],[6870,280,230],[7280,365,180],[7810,280,220],[8480,200,250],[9140,345,290]], [5820,6020,6490,6860,7350,7900,8460,8750,9230,9500], [5850,9120]),
    route(10200, [[6120,570],[6810,390],[7320,810],[8250,490],[8860,1340]], [[6280,365,210],[6610,270,210],[6930,180,240],[7470,275,280],[7900,365,250],[8400,270,250],[8810,180,250],[9230,280,280],[9680,360,300]], [6310,6550,7020,7590,7970,8460,8670,9120,9510,9930], [6250,9330]),
    route(11000, [[6920,610],[7650,840],[8610,390],[9120,1880]], [[7080,360,250],[7430,260,220],[7850,175,260],[8210,285,250],[8710,360,200],[9330,290,300],[9750,365,230]], [7130,7380,7900,8270,8770,9360,9700,9890], [7110,9400])
];
expansions.forEach((extension, i) => {
    const level = VOLCANO_LEVELS[i];
    level.length = extension.length;
    level.platforms.push(...extension.platforms);
    level.enemies.push(...extension.enemies);
    level.items = extension.items; // Scarcer only in Volcano Land; forest counts are unchanged.
});

export const VOLCANO_LETTERS: { x: number; text: string; es: string }[][] = [
    [{ x: 220, text: 'Dear Vinn, the pale basalt islands are the safe path through these lava fields. I followed the lower stones, one leap at a time. Save the rare feathers for exploring the high ruins; you do not need them to reach the royal flag.', es: 'Querido Vinn: las islas de basalto claro marcan el camino seguro entre la lava. Seguí las piedras bajas, salto a salto. Guarda las escasas plumas para explorar las ruinas altas; no las necesitas para llegar a la bandera real.' }],
    [],
    [{ x: 3820, text: 'The second bridge has fallen into separate stone piers. Look beneath the broken arches: each dark landing has a flat, pale rim. Follow those piers across the chasm. I left a small crown on the last bridge as a promise that we will meet again.', es: 'El segundo puente se ha roto en pilares separados. Mira bajo los arcos: cada apoyo oscuro tiene un borde claro y plano. Sigue esos pilares sobre el abismo. Dejé una pequeña corona en el último puente, como promesa de que nos volveremos a ver.' }],
    [],
    [{ x: 7190, text: 'This mountain is not asleep. I saw its eyes following the guards. Its mouth shines before the beam: crouch beneath it. When the glow fades, its heart rises from the ground. That is your chance to strike. Please come back safely.', es: 'Esta montaña no está dormida. Vi sus ojos siguiendo a los guardias. Su boca brilla antes del rayo: agáchate para esquivarlo. Cuando se apaga el brillo, su corazón sale del suelo. Esa es tu oportunidad para atacar. Por favor, vuelve a salvo.' }],
    [{ x: 4820, text: 'Beyond this ridge, the obsidian terraces climb high above the trail. The lower ledges still lead to the exit, but the upper ledges let you pass over the patrols. Choose your path, brave knight. The black glass reflects the sunrise beautifully.', es: 'Tras esta cresta, las terrazas de obsidiana suben sobre el sendero. Los apoyos bajos llevan a la salida; los altos permiten pasar por encima de las patrullas. Elige tu camino, valiente caballero. El cristal negro refleja un amanecer precioso.' }],
    [{ x: 5050, text: 'The lava channels split around long islands here. Rest on a wide island before your next crossing. Even when a feather fades, every gap on the lower trail is within one good jump. I can still hear the river from our forest in my dreams.', es: 'Los canales de lava rodean largas islas. Descansa en una isla ancha antes de cruzar de nuevo. Aunque se apague una pluma, cada hueco del camino bajo se supera de un buen salto. Todavía sueño con el río de nuestro bosque.' }],
    [],
    [{ x: 5830, text: 'The caldera has two routes: a steep crown of terraces and a winding lower path. Both lead to the citadel. Follow the gold-tipped flag at the end; raise it so I can see that you are coming. I have not lost hope.', es: 'La caldera tiene dos rutas: terrazas elevadas y un camino bajo que serpentea. Ambas llevan a la ciudadela. Busca la bandera de punta dorada al final; ízala para que sepa que vienes. No he perdido la esperanza.' }],
    []
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
    // Distant ash is scenery, not an unexplained wind force on the player.
    for (let i = 0; i < 24; i++) { ctx.fillStyle = i % 2 ? '#cb8b73' : '#845666'; ctx.fillRect((i * 89 + time * 13 - camera * .12) % 1050, 60 + i * 37 % 340, 3, 3); }
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
    const extensionX = VOLCANO_LEVELS[level - 1].length - 2000 - camera;
    if ([3, 7].includes(level)) {
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = '#44303b'; ctx.fillRect(extensionX + i * 175, 280, 50, 180);
            ctx.fillStyle = '#996753'; ctx.fillRect(extensionX + i * 175 - 10, 280, 70, 12);
        }
        if (level === 3) { ctx.fillStyle = '#ffd887'; ctx.fillRect(extensionX + 1046, 266, 20, 10); for (let i = 0; i < 3; i++) ctx.fillRect(extensionX + 1046 + i * 8, 258, 4, 10); }
    } else if ([6, 9].includes(level)) {
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = i % 2 ? '#493a55' : '#342a44'; ctx.fillRect(extensionX + i * 150, 170 + i % 3 * 55, 95, 290);
            ctx.fillStyle = '#a58eaa'; ctx.fillRect(extensionX + i * 150 + 6, 178 + i % 3 * 55, 5, 180);
        }
    }
}
