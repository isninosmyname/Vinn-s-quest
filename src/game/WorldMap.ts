import { FOREST_NAMES } from './ForestWorld';
import { VOLCANO_NAMES, VOLCANO_NAMES_ES } from './VolcanoWorld';
export type WorldMapLanguage = 'en' | 'es';

import { FOREST_NAMES_ES } from './ForestText';
type MapNode = { x: number; y: number; level: number };

export class World1Map {
    readonly world: 1 | 2;
    constructor(world: 1 | 2 = 1) { this.world = world; }
    get levelCount() { return this.world === 1 ? 8 : 10; }
    levelName(language: WorldMapLanguage, level = this.selectedLevel) {
        return (this.world === 1 ? (language === 'en' ? FOREST_NAMES : FOREST_NAMES_ES) : (language === 'en' ? VOLCANO_NAMES : VOLCANO_NAMES_ES))[level - 1];
    }
    selectedLevel = 1;
    maxUnlocked = 1;
    timer = 0;
    completed: number[] = [];

    selectAt(x: number, y: number) {
        if (Math.abs(y - 250) < 38 && x < 70) { this.moveSelection(-1); return; }
        if (Math.abs(y - 250) < 38 && x > 930) { this.moveSelection(1); return; }
        const cardStart = this.world === 1 ? 110 : 70, cardStep = this.world === 1 ? 98 : 86;
        if (y >= 68 && y <= 118 && x >= cardStart && x < cardStart + cardStep * this.levelCount) {
            const level = Math.floor((x - cardStart) / cardStep) + 1;
            if (level <= this.maxUnlocked) this.selectedLevel = level;
            return;
        }
        const node = this.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 38);
        if (node && node.level <= this.maxUnlocked) this.selectedLevel = node.level;
    }

    private readonly forestNodes: MapNode[] = [
        { x: 95, y: 360, level: 1 },
        { x: 220, y: 260, level: 2 },
        { x: 350, y: 365, level: 3 },
        { x: 485, y: 225, level: 4 },
        { x: 620, y: 305, level: 5 },
        { x: 745, y: 200, level: 6 },
        { x: 855, y: 330, level: 7 },
        { x: 920, y: 190, level: 8 }
    ];

    private readonly volcanoNodes: MapNode[] = [
        { x: 100, y: 365, level: 1 }, { x: 235, y: 390, level: 2 },
        { x: 360, y: 330, level: 3 }, { x: 245, y: 215, level: 4 },
        { x: 420, y: 175, level: 5 }, { x: 540, y: 270, level: 6 },
        { x: 650, y: 375, level: 7 }, { x: 805, y: 360, level: 8 },
        { x: 730, y: 220, level: 9 }, { x: 910, y: 180, level: 10 }
    ];
    private get nodes() { return this.world === 1 ? this.forestNodes : this.volcanoNodes; }

    open(selectedLevel: number, maxUnlocked: number, completed: number[] = []) {
        this.completed = completed;
        this.maxUnlocked = Math.max(1, Math.min(this.levelCount, maxUnlocked));
        this.selectedLevel = Math.max(1, Math.min(this.maxUnlocked, selectedLevel));
        this.timer = 0;
    }

    moveSelection(direction: -1 | 1) {
        this.selectedLevel = Math.max(1, Math.min(this.maxUnlocked, this.selectedLevel + direction));
    }

    update(dt: number) {
        this.timer += dt;
    }

    getSelectedNode() {
        return this.nodes[this.selectedLevel - 1];
    }

    draw(ctx: CanvasRenderingContext2D, language: WorldMapLanguage, showTraveller = true) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // A bright, hand-painted 8-bit overworld: the map has no enemies or
        // creatures, only the path Vinn is travelling.
        ctx.fillStyle = '#f7d98a'; ctx.fillRect(0, 0, 1000, 500);
        ctx.fillStyle = '#f0bd67';
        for (let x = 0; x < 1000; x += 48) {
            for (let y = 80; y < 500; y += 44) {
                if ((x / 48 + y / 44) % 2 === 0) ctx.fillRect(x + 5, y + 4, 20, 9);
            }
        }

        // Water and hills frame the route without adding extra characters.
        ctx.fillStyle = '#69c5da'; ctx.fillRect(0, 0, 1000, 72);
        ctx.fillStyle = '#a1e5ed';
        for (let x = 0; x < 1000; x += 100) ctx.fillRect(x + 18, 35, 48, 10);
        ctx.fillStyle = '#7fc45e';
        for (let x = 0; x < 1000; x += 90) {
            ctx.fillRect(x, 72, 60, 18);
            ctx.fillRect(x + 14, 54, 34, 34);
        }
        // Layered grassy islands, little forests and a stream recall the
        // illustrated map while keeping every stage sign legible.
        ctx.fillStyle = '#d99186'; ctx.fillRect(30, 146, 930, 278);
        ctx.fillStyle = '#bad485'; ctx.fillRect(42, 138, 906, 274);
        ctx.fillStyle = '#dce7a1'; ctx.fillRect(58, 151, 875, 245);
        ctx.fillStyle = '#77bfd0'; ctx.fillRect(550, 130, 32, 280); ctx.fillRect(532, 220, 68, 76);
        ctx.fillStyle = '#b1e4db'; for (let y = 140; y < 410; y += 32) ctx.fillRect(556, y, 15, 5);
        ctx.fillStyle = '#c89161'; ctx.fillRect(526, 264, 80, 32);
        ctx.fillStyle = '#f2d296'; for (let x = 532; x < 600; x += 10) ctx.fillRect(x, 267, 6, 26);
        for (const [x, y] of [[80,190],[150,175],[320,220],[410,160],[685,355],[710,385],[890,405],[950,390]]) {
            ctx.fillStyle = '#ae6f58'; ctx.fillRect(x - 4, y, 8, 24);
            ctx.fillStyle = '#528b55'; ctx.fillRect(x - 24, y - 10, 48, 20); ctx.fillRect(x - 16, y - 26, 32, 20);
            ctx.fillStyle = '#85ae60'; ctx.fillRect(x - 12, y - 30, 20, 9);
        }

        if (this.world === 2) this.drawVolcanoMap(ctx);
        ctx.fillStyle = this.world === 1 ? '#452b58' : '#ffe5a6'; ctx.font = '18px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(this.world === 1 ? (language === 'en' ? 'WORLD 1  •  THE GREEN TRAIL' : 'MUNDO 1  •  EL SENDERO VERDE') : (language === 'en' ? 'WORLD 2  •  VOLCANO LAND' : 'MUNDO 2  •  TIERRA VOLCÁNICA'), 500, 30);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText(this.levelName(language), 500, 52);
        for (let i = 0; i < this.levelCount; i++) {
            const x = (this.world === 1 ? 110 : 70) + i * (this.world === 1 ? 98 : 86);
            const cardWidth = this.world === 1 ? 88 : 78;
            ctx.fillStyle = this.selectedLevel === i + 1 ? '#f9ecac' : this.world === 1 ? '#c9e69c' : '#d9a18a'; ctx.fillRect(x, 68, cardWidth, 50);
            ctx.strokeStyle = '#537457'; ctx.lineWidth = 2; ctx.strokeRect(x, 68, cardWidth, 50);
            ctx.fillStyle = this.completed.includes(i + 1) ? '#b34754' : '#345c49'; ctx.font = '12px monospace';
            ctx.fillText(this.world + '-' + (i + 1), x + cardWidth / 2, 85);
            ctx.fillText(this.completed.includes(i + 1) ? (language === 'en' ? 'CLEAR' : 'LISTO') : this.world === 2 && i === 4 ? (language === 'en' ? 'VOLCANO' : 'VOLCÁN') : this.world === 1 && i === 3 ? (language === 'en' ? 'KEEP' : 'CASTILLO') : i === this.levelCount - 1 ? (this.world === 1 ? 'GOLEM' : 'BLAZE') : i + 1 <= this.maxUnlocked ? (language === 'en' ? 'OPEN' : 'ABIERTO') : (language === 'en' ? 'LOCKED' : 'CERRADO'), x + cardWidth / 2, 105);
        }

        // Dotted route.
        ctx.strokeStyle = '#8a5b35'; ctx.lineWidth = 8; ctx.setLineDash([10, 12]);
        ctx.beginPath(); ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
        for (let i = 1; i < this.nodes.length; i++) ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
        ctx.stroke(); ctx.setLineDash([]);

        this.nodes.forEach(node => {
            const unlocked = node.level <= this.maxUnlocked;
            const selected = node.level === this.selectedLevel;
            const pulse = selected ? Math.floor((Math.sin(this.timer * 7) + 1) * 3) : 0;
            ctx.fillStyle = selected ? '#fff4a8' : (unlocked ? '#fff8d7' : '#b9a98e');
            ctx.fillRect(node.x - 22 - pulse, node.y - 22 - pulse, 44 + pulse * 2, 44 + pulse * 2);
            ctx.strokeStyle = selected ? '#ff3d81' : (unlocked ? '#54385d' : '#7e766d');
            ctx.lineWidth = selected ? 4 : 3; ctx.strokeRect(node.x - 22 - pulse, node.y - 22 - pulse, 44 + pulse * 2, 44 + pulse * 2);

            if (this.world === 2 && node.level === 5) {
                const clear = this.completed.includes(5);
                for (let row = 0; row < 6; row++) {
                    ctx.fillStyle = clear ? '#716065' : unlocked ? '#693847' : '#68606b';
                    ctx.fillRect(node.x - 8 - row * 4, node.y - 22 + row * 7, 16 + row * 8, 7);
                }
                ctx.fillStyle = clear ? '#756264' : '#ff894c'; ctx.fillRect(node.x - 8, node.y - 22, 16, 5);
                ctx.fillStyle = clear ? '#302b36' : '#fff0aa';
                const eye = clear ? 2 : 3 + Math.floor((Math.sin(this.timer * 2) + 1) * 2);
                ctx.fillRect(node.x - 14, node.y - 3, 8, eye); ctx.fillRect(node.x + 6, node.y - 3, 8, eye);
                ctx.fillStyle = '#211828'; ctx.fillRect(node.x - 6, node.y + 7, 12, 6);
                if (clear) { ctx.fillStyle = '#ddd2c0'; ctx.fillRect(node.x + 19, node.y - 32, 3, 25); ctx.fillStyle = '#ef4e59'; ctx.fillRect(node.x + 22, node.y - 32, 14, 9); }
            }
            else if ((this.world === 1 && node.level === 4) || node.level === this.levelCount) this.drawCastleMarker(ctx, node.x, node.y, unlocked, this.completed.includes(node.level));
            else {
                ctx.fillStyle = unlocked ? (this.world === 2 ? '#b96145' : '#3d8c49') : '#6f6d6a';
                ctx.fillRect(node.x - 11, node.y - 11, 22, 22);
                ctx.fillStyle = '#f8d36a'; ctx.fillRect(node.x - 6, node.y - 16, 12, 8);
                ctx.fillStyle = '#234c36'; ctx.fillRect(node.x - 3, node.y - 4, 6, 15);
            }

            ctx.fillStyle = '#2f2645'; ctx.font = '12px "Press Start 2P"';
            ctx.fillStyle = '#886346'; ctx.fillRect(node.x - 3, node.y + 21, 6, 31);
            ctx.fillStyle = '#fff0b2'; ctx.fillRect(node.x - 18, node.y + 24, 36, 22);
            ctx.fillStyle = '#2f2645'; ctx.fillText(`${node.level}`, node.x, node.y + 39);
            if (!unlocked) {
                ctx.fillStyle = '#6d6870'; ctx.font = '16px monospace'; ctx.fillText('×', node.x, node.y + 6);
            }
        });

        const selected = this.getSelectedNode();
        // Vinn is the only travelling character on the map.
        if (showTraveller) {
        ctx.save(); ctx.translate(selected.x - 35, selected.y - 8);
        ctx.strokeStyle = '#174e59'; ctx.lineWidth = 6; ctx.strokeRect(-6, -26, 12, 12);
        ctx.strokeStyle = '#00c9e8'; ctx.lineWidth = 3; ctx.strokeRect(-6, -26, 12, 12);
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 0); ctx.lineTo(-8, 12);
        ctx.moveTo(0, 0); ctx.lineTo(8, 12); ctx.moveTo(-9, -6); ctx.lineTo(9, -6); ctx.stroke();
        ctx.fillStyle = '#edac50'; ctx.fillRect(9, -23, 3, 24); ctx.restore();
        ctx.fillStyle = '#fff4a8'; ctx.strokeStyle = '#51365a'; ctx.lineWidth = 3;
        ctx.fillRect(selected.x - 30, selected.y - 63, 60, 20); ctx.strokeRect(selected.x - 30, selected.y - 63, 60, 20);
        ctx.fillStyle = '#302442'; ctx.font = '8px "Press Start 2P"';
        ctx.fillText(this.world === 2 && selected.level === 5 ? (language === 'en' ? 'BOSS' : 'JEFE') : (this.world === 1 && selected.level === 4) || selected.level === this.levelCount ? (language === 'en' ? 'CASTLE' : 'CASTILLO') : `${language === 'en' ? 'LEVEL' : 'NIVEL'} ${selected.level}`, selected.x, selected.y - 49);
        }

        // Big pixel arrows are part of the map itself, not extra characters.
        this.drawArrow(ctx, 34, 250, -1, this.selectedLevel > 1);
        this.drawArrow(ctx, 966, 250, 1, this.selectedLevel < this.maxUnlocked);
        ctx.fillStyle = this.world === 1 ? '#51365a' : '#ffe5a6'; ctx.font = '10px "Press Start 2P"';
        ctx.fillText(language === 'en' ? 'SPACE: ENTER' : 'ESPACIO: ENTRAR', 500, 480);
        ctx.restore();
    }

    private drawVolcanoMap(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#452d42'; ctx.fillRect(0, 0, 1000, 500);
        ctx.fillStyle = '#a54c43'; ctx.fillRect(25, 130, 950, 310);
        ctx.fillStyle = '#d57b52'; ctx.fillRect(35, 140, 930, 290);
        for (let i = 0; i < 10; i++) {
            const x = 60 + i * 93;
            ctx.fillStyle = '#653d43'; ctx.fillRect(x, 140 + i % 3 * 25, 75, 265 - i % 3 * 20);
        }
        ctx.fillStyle = '#ef6532'; ctx.fillRect(475, 120, 38, 310); ctx.fillRect(100, 280, 800, 20);
        ctx.fillStyle = '#ffc464';
        for (let i = 0; i < 17; i++) ctx.fillRect(484, 130 + (i * 19 + this.timer * 12) % 290, 12, 6);
        for (const [x, y] of [[125,210],[605,170],[905,405]]) {
            ctx.fillStyle = '#3c303d'; ctx.beginPath(); ctx.moveTo(x - 55, y + 25); ctx.lineTo(x - 12, y - 55); ctx.lineTo(x + 14, y - 55); ctx.lineTo(x + 60, y + 25); ctx.fill();
            ctx.fillStyle = '#ffbf58'; ctx.fillRect(x - 14, y - 50, 30, 8);
            ctx.fillStyle = '#88747e'; ctx.fillRect(x - 7, y - 76, 19, 14); ctx.fillRect(x + 8, y - 93, 25, 13);
        }
        ctx.fillStyle = '#d2ad86'; ctx.fillRect(459, 246, 70, 22); ctx.fillRect(692, 267, 80, 37);
        ctx.fillStyle = '#bd6660'; for (let x = 0; x < 1000; x += 26) ctx.fillRect(x, 453, 18, 5);
    }

    private drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, direction: -1 | 1, active: boolean) {
        ctx.save(); ctx.globalAlpha = active ? 1 : 0.25;
        ctx.fillStyle = active ? '#ff3d81' : '#765d70';
        ctx.beginPath();
        ctx.moveTo(x + direction * 24, y); ctx.lineTo(x - direction * 10, y - 22);
        ctx.lineTo(x - direction * 10, y - 8); ctx.lineTo(x - direction * 28, y - 8);
        ctx.lineTo(x - direction * 28, y + 8); ctx.lineTo(x - direction * 10, y + 8);
        ctx.lineTo(x - direction * 10, y + 22); ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    private drawCastleMarker(ctx: CanvasRenderingContext2D, x: number, y: number, unlocked: boolean, cleared: boolean) {
        if (cleared) {
            const collapse = Math.min(1, this.timer / 1.6);
            ctx.save(); ctx.translate(x, y + 16); ctx.scale(1, 1 - collapse * 0.77); ctx.translate(-x, -y - 16);
            ctx.fillStyle = '#83756b'; ctx.fillRect(x - 20, y - 22, 40, 38); ctx.fillRect(x - 26, y - 28, 12, 40);
            ctx.restore(); ctx.fillStyle = '#6b6560';
            for (let i = 0; i < 7; i++) ctx.fillRect(x - 30 + i * 9, y + 9 - i % 2 * 5, 8, 8);
            ctx.fillStyle = '#573d43'; ctx.fillRect(x + 5, y - 38, 3, 50);
            ctx.fillStyle = '#e64257'; ctx.fillRect(x + 8, y - 38, 23, 14); ctx.fillRect(x + 27, y - 36, 5, 10);
            return;
        }
        ctx.fillStyle = unlocked ? '#704368' : '#6f6d6a';
        ctx.fillRect(x - 16, y - 12, 32, 28); ctx.fillRect(x - 22, y - 22, 10, 18); ctx.fillRect(x + 12, y - 22, 10, 18);
        ctx.fillStyle = '#f3cf69'; ctx.fillRect(x - 5, y + 2, 10, 14);
        ctx.fillStyle = '#d77a9d'; ctx.fillRect(x - 20, y - 25, 7, 5); ctx.fillRect(x + 13, y - 25, 7, 5);
    }
}
