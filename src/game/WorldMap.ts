import { FOREST_NAMES } from './ForestWorld';
export type WorldMapLanguage = 'en' | 'es';

import { FOREST_NAMES_ES } from './ForestText';
type MapNode = { x: number; y: number; level: number };

export class World1Map {
    selectedLevel = 1;
    maxUnlocked = 1;
    timer = 0;
    completed: number[] = [];

    selectAt(x: number, y: number) {
        if (Math.abs(y - 250) < 38 && x < 70) { this.moveSelection(-1); return; }
        if (Math.abs(y - 250) < 38 && x > 930) { this.moveSelection(1); return; }
        if (y >= 68 && y <= 118 && x >= 110 && x < 894) {
            const level = Math.floor((x - 110) / 98) + 1;
            if (level <= this.maxUnlocked) this.selectedLevel = level;
            return;
        }
        const node = this.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 38);
        if (node && node.level <= this.maxUnlocked) this.selectedLevel = node.level;
    }

    private readonly nodes: MapNode[] = [
        { x: 95, y: 360, level: 1 },
        { x: 220, y: 260, level: 2 },
        { x: 350, y: 365, level: 3 },
        { x: 485, y: 225, level: 4 },
        { x: 620, y: 305, level: 5 },
        { x: 745, y: 200, level: 6 },
        { x: 855, y: 330, level: 7 },
        { x: 920, y: 190, level: 8 }
    ];

    open(selectedLevel: number, maxUnlocked: number, completed: number[] = []) {
        this.completed = completed;
        this.maxUnlocked = Math.max(1, Math.min(8, maxUnlocked));
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

    draw(ctx: CanvasRenderingContext2D, language: WorldMapLanguage) {
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

        ctx.fillStyle = '#452b58'; ctx.font = '18px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText(language === 'en' ? 'WORLD 1  •  THE GREEN TRAIL' : 'MUNDO 1  •  EL SENDERO VERDE', 500, 30);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText((language === 'en' ? FOREST_NAMES : FOREST_NAMES_ES)[this.selectedLevel - 1], 500, 52);
        for (let i = 0; i < 8; i++) {
            const x = 110 + i * 98;
            ctx.fillStyle = this.selectedLevel === i + 1 ? '#f9ecac' : '#c9e69c'; ctx.fillRect(x, 68, 88, 50);
            ctx.strokeStyle = '#537457'; ctx.lineWidth = 2; ctx.strokeRect(x, 68, 88, 50);
            ctx.fillStyle = this.completed.includes(i + 1) ? '#b34754' : '#345c49'; ctx.font = '12px monospace';
            ctx.fillText('1-' + (i + 1), x + 44, 85);
            ctx.fillText(this.completed.includes(i + 1) ? (language === 'en' ? 'CLEAR' : 'LISTO') : i === 3 ? (language === 'en' ? 'KEEP' : 'CASTILLO') : i === 7 ? 'GOLEM' : i + 1 <= this.maxUnlocked ? (language === 'en' ? 'OPEN' : 'ABIERTO') : (language === 'en' ? 'LOCKED' : 'CERRADO'), x + 44, 105);
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

            if (node.level === 4 || node.level === 8) this.drawCastleMarker(ctx, node.x, node.y, unlocked, this.completed.includes(node.level));
            else {
                ctx.fillStyle = unlocked ? '#3d8c49' : '#6f6d6a';
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
        ctx.save(); ctx.translate(selected.x - 35, selected.y - 8);
        ctx.strokeStyle = '#174e59'; ctx.lineWidth = 6; ctx.strokeRect(-6, -26, 12, 12);
        ctx.strokeStyle = '#00c9e8'; ctx.lineWidth = 3; ctx.strokeRect(-6, -26, 12, 12);
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 0); ctx.lineTo(-8, 12);
        ctx.moveTo(0, 0); ctx.lineTo(8, 12); ctx.moveTo(-9, -6); ctx.lineTo(9, -6); ctx.stroke();
        ctx.fillStyle = '#edac50'; ctx.fillRect(9, -23, 3, 24); ctx.restore();
        ctx.fillStyle = '#fff4a8'; ctx.strokeStyle = '#51365a'; ctx.lineWidth = 3;
        ctx.fillRect(selected.x - 30, selected.y - 63, 60, 20); ctx.strokeRect(selected.x - 30, selected.y - 63, 60, 20);
        ctx.fillStyle = '#302442'; ctx.font = '8px "Press Start 2P"';
        ctx.fillText(selected.level === 4 ? (language === 'en' ? 'CASTLE' : 'CASTILLO') : `${language === 'en' ? 'LEVEL' : 'NIVEL'} ${selected.level}`, selected.x, selected.y - 49);

        // Big pixel arrows are part of the map itself, not extra characters.
        this.drawArrow(ctx, 34, 250, -1, this.selectedLevel > 1);
        this.drawArrow(ctx, 966, 250, 1, this.selectedLevel < this.maxUnlocked);
        ctx.fillStyle = '#51365a'; ctx.font = '10px "Press Start 2P"';
        ctx.fillText(language === 'en' ? 'SPACE: ENTER' : 'ESPACIO: ENTRAR', 500, 480);
        ctx.restore();
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
