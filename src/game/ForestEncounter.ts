import { Enemy } from './Enemy';
import { Boss } from './Boss';
import type { Vinn } from './Vinn';

export type RoomPhase = 'OUTSIDE' | 'ENTERING' | 'ARRIVAL' | 'DIALOGUE' | 'FIGHT' | 'CLEAR';
export type ArenaHazard = { kind: 'WAVE' | 'SWORD'; x: number; y: number; vx: number; vy: number; life: number; hit: Set<Vinn> };

export class ForestEncounter {
    phase: RoomPhase = 'OUTSIDE';
    timer = 0;
    animationTime = 0;
    dialogueIndex = 0;
    bear: Enemy | null = null;
    boss: Boss | null = null;
    hazards: ArenaHazard[] = [];
    swordTimer = 0;
    duffX: number;
    duffY = -230;
    entryReady = false;
    private entered = false;
    readonly start: number;
    readonly doorX: number;
    readonly kind: 'BEAR' | 'GOLEM';
    readonly levelLength: number;
    constructor(kind: 'BEAR' | 'GOLEM', levelLength: number) {
        this.kind = kind; this.levelLength = levelLength;
        this.start = levelLength - 1000;
        this.doorX = this.start;
        this.duffX = this.start + 760;
    }
    get inside() { return this.entered; }
    get frozen() { return ['ENTERING', 'ARRIVAL', 'DIALOGUE'].includes(this.phase); }
    get cleared() { return this.phase === 'CLEAR'; }
    get platforms() { return [{ x: this.start, y: 460, w: 1000, h: 40, type: 'NORMAL' as const }]; }
    canEnter(players: Vinn[]) {
        return this.phase === 'OUTSIDE' && players.some(p => p.health > 0 && Math.abs(p.x - this.doorX) < 85 && p.onGround);
    }
    enter() {
        if (this.phase !== 'OUTSIDE') return;
        this.phase = 'ENTERING'; this.timer = 0;
    }
    private arrive() {
        if (this.entered) return;
        this.entered = true; this.entryReady = true;
        if (this.kind === 'BEAR') this.bear = new Enemy(this.start + 700, 430, 'BEAR');
        else {
            this.boss = new Boss(this.start + 700, -220, 'GOLEM');
            this.boss.introPlayed = true;
            this.boss.isInvulnerable = true;
        }
    }
    updateScene(dt: number) {
        this.timer += dt; this.animationTime += dt;
        if (this.phase === 'ENTERING') {
            if (this.timer >= 0.45) this.arrive();
            if (this.timer >= 0.9) { this.phase = this.kind === 'BEAR' ? 'FIGHT' : 'ARRIVAL'; this.timer = 0; }
        } else if (this.phase === 'ARRIVAL' && this.boss) {
            const p = Math.min(1, this.timer / 1.5);
            this.boss.y = -220 + 680 * p * p;
            this.duffY = this.boss.y - 160;
            if (p === 1) { this.phase = 'DIALOGUE'; this.timer = 0; }
        }
    }
    advanceDialogue() {
        if (this.phase === 'ARRIVAL' && this.boss) {
            this.boss.y = 460; this.duffY = 300;
            this.phase = 'DIALOGUE'; this.timer = 0;
            return;
        }
        if (this.phase !== 'DIALOGUE') return;
        this.dialogueIndex++;
        if (this.dialogueIndex >= 3 && this.boss) {
            this.phase = 'FIGHT'; this.timer = 0;
            this.boss.state = 'FLY_UP'; this.boss.attackTimer = 0;
            this.swordTimer = 0;
        }
    }
    get dialogue() {
        return [
            { speaker: 'Golem', en: 'This the knight that crushed you?', es: '¿Este es el caballero que te aplastó?' },
            { speaker: 'Duff', en: 'Yes.', es: 'Sí.' },
            { speaker: 'Golem', en: 'Well we have the knight. you ready?', es: 'Bueno, ya tenemos al caballero. ¿Estás listo?' }
        ][this.dialogueIndex];
    }
    addWaves(x: number, both: boolean, direction = -1) {
        for (const dir of both ? [-1, 1] : [direction]) this.hazards.push({ kind: 'WAVE', x, y: 448, vx: dir * 280, vy: 0, life: 4, hit: new Set() });
    }
    updateFight(dt: number, players: Vinn[]) {
        if (this.phase !== 'FIGHT') return;
        if ((this.bear && this.bear.health <= 0) || (this.boss && this.boss.health <= 0)) {
            this.phase = 'CLEAR'; this.timer = 0; this.hazards = []; return;
        }
        if (this.bear?.stompReady) {
            this.bear.stompReady = false;
            this.addWaves(this.bear.x + this.bear.direction * 45, false, this.bear.direction);
        }
        if (this.boss?.landingReady) {
            this.boss.landingReady = false;
            this.addWaves(this.boss.x, true);
        }
        if (this.boss) {
            // Duff climbs onto the gallery; the first throw has a long tell.
            const p = Math.min(1, this.timer / 1.2);
            this.duffX = this.start + 760 + p * 110;
            this.duffY = 300 - p * 90 - Math.sin(p * Math.PI) * 65;
            this.swordTimer += dt;
            if (this.swordTimer >= 3.2) {
                const target = players.filter(p => p.health > 0).sort((a, b) => Math.abs(a.x - this.duffX) - Math.abs(b.x - this.duffX))[0];
                if (target) this.hazards.push({ kind: 'SWORD', x: this.duffX - 24, y: this.duffY - 55,
                    vx: (target.x - (this.duffX - 24)) / 1.25, vy: (target.y - 22 - (this.duffY - 55)) / 1.25, life: 3, hit: new Set() });
                this.swordTimer = 0;
            }
        }
        this.hazards = this.hazards.filter(h => {
            const oldX = h.x, oldY = h.y;
            h.x += h.vx * dt; h.y += h.vy * dt; h.life -= dt;
            const halfW = h.kind === 'WAVE' ? 24 : 17, halfH = h.kind === 'WAVE' ? 12 : 6;
            for (const p of players) {
                if (p.health <= 0 || h.hit.has(p)) continue;
                const b = p.bounds;
                // Swept bounds prevent a fast wave from tunnelling past Vinn.
                if (b.right >= Math.min(oldX, h.x) - halfW && b.left <= Math.max(oldX, h.x) + halfW &&
                    b.bottom > Math.min(oldY, h.y) - halfH && b.top < Math.max(oldY, h.y) + halfH) {
                    p.takeDamage(h.kind === 'WAVE' ? 2 : 1); h.hit.add(p);
                }
            }
            return h.life > 0 && h.x > this.start && h.x < this.levelLength && h.y < 480;
        });
    }
    drawDoor(ctx: CanvasRenderingContext2D, camera: number, language: 'en' | 'es', near: boolean) {
        if (this.inside) return;
        const x = this.doorX - camera;
        ctx.save();
        ctx.fillStyle = this.kind === 'BEAR' ? '#55494f' : '#576168';
        ctx.fillRect(x - 96, 240, 192, 220); ctx.fillRect(x - 70, 210, 140, 30);
        ctx.fillStyle = '#141523'; ctx.fillRect(x - 65, 280, 130, 180);
        ctx.fillStyle = '#72543c';
        for (let i = 0; i < 6; i++) ctx.fillRect(x - 60 + i * 20, 285, 17, 175);
        ctx.fillStyle = '#aaa78c'; ctx.fillRect(x - 62, 322, 124, 8); ctx.fillRect(x - 62, 418, 124, 8);
        ctx.fillStyle = '#ffd77a'; ctx.fillRect(x + 32, 370, 9, 15);
        ctx.textAlign = 'center'; ctx.font = '16px monospace'; ctx.fillStyle = '#ffedb0';
        ctx.fillText(this.kind === 'BEAR' ? (language === 'en' ? 'BEAR CAVE' : 'CUEVA DEL OSO') : (language === 'en' ? 'GOLEM’S FORTRESS' : 'FORTALEZA DEL GOLEM'), x, 195);
        if (near) ctx.fillText(language === 'en' ? 'E: ENTER' : 'E: ENTRAR', x, 265);
        ctx.restore();
    }
    drawInterior(ctx: CanvasRenderingContext2D) {
        ctx.save(); ctx.imageSmoothingEnabled = false;
        const cave = this.kind === 'BEAR';
        ctx.fillStyle = cave ? '#191926' : '#19242f'; ctx.fillRect(0, 0, 1000, 500);
        if (cave) {
            for (let i = 0; i < 15; i++) {
                const x = i * 73, depth = 40 + i * 43 % 115;
                ctx.fillStyle = i % 2 ? '#38303d' : '#2b2838';
                ctx.fillRect(x, 0, 72, depth); ctx.fillRect(x + 16, depth, 40, 25); ctx.fillRect(x + 26, depth + 25, 16, 24);
            }
            ctx.fillStyle = '#292b3a'; ctx.fillRect(15, 190, 120, 270); ctx.fillRect(910, 140, 90, 320);
            ctx.fillStyle = '#417e88';
            for (const x of [60, 230, 820, 935]) { ctx.fillRect(x, 397, 12, 63); ctx.fillRect(x + 14, 420, 9, 40); }
            ctx.fillStyle = '#7a6856'; ctx.fillRect(650, 446, 130, 14);
        } else {
            for (let row = 0; row < 8; row++) for (let col = 0; col < 12; col++) {
                ctx.fillStyle = (row + col) % 3 ? '#2d3a43' : '#35424b';
                ctx.fillRect(col * 90 - row % 2 * 45, row * 57, 85, 52);
            }
            for (const x of [90, 400, 740]) {
                ctx.fillStyle = '#151d2b'; ctx.fillRect(x, 45, 100, 145);
                ctx.fillStyle = '#83acbb'; ctx.fillRect(x + 14, 57, 72, 120);
                ctx.fillStyle = '#374650'; ctx.fillRect(x + 46, 57, 9, 120); ctx.fillRect(x + 14, 110, 72, 9);
            }
            ctx.fillStyle = '#17222a'; ctx.fillRect(795, 210, 185, 32);
            ctx.fillStyle = '#899285'; ctx.fillRect(790, 206, 190, 9);
            ctx.fillStyle = '#793e48'; ctx.fillRect(305, 75, 45, 125); ctx.fillRect(620, 75, 45, 125);
        }
        ctx.fillStyle = cave ? '#4e4445' : '#69716b'; ctx.fillRect(0, 460, 1000, 40);
        ctx.fillStyle = '#b7a185'; ctx.fillRect(0, 460, 1000, 5);
        for (const x of [155, 765]) {
            const flame = Math.floor(this.animationTime * 9 + x) % 3;
            ctx.fillStyle = '#7d5a41'; ctx.fillRect(x, 280, 8, 43);
            ctx.fillStyle = '#ef7139'; ctx.fillRect(x - 5, 257 - flame * 3, 18, 27 + flame * 3);
            ctx.fillStyle = '#ffe488'; ctx.fillRect(x, 263 - flame * 2, 8, 18);
        }
        ctx.fillStyle = this.cleared ? '#d9cd96' : '#151b24'; ctx.fillRect(926, 306, 66, 154);
        if (!this.cleared) { ctx.fillStyle = '#8a8d84'; for (let i = 0; i < 5; i++) ctx.fillRect(930 + i * 13, 307, 5, 153); }
        ctx.restore();
    }
    drawOverlay(ctx: CanvasRenderingContext2D, camera: number, language: 'en' | 'es') {
        ctx.save();
        if (this.inside && this.kind === 'GOLEM') {
            const x = this.duffX - camera + (this.cleared ? Math.min(200, this.timer * 140) : 0), y = this.duffY;
            const ready = this.swordTimer > 2.45;
            ctx.fillStyle = '#bd5556'; ctx.fillRect(x - 8, y - 52, 16, 32); ctx.fillRect(x - 17, y - 86, 34, 27);
            ctx.fillRect(x - 17, y - 20, 10, 20); ctx.fillRect(x + 7, y - 20, 10, 20);
            ctx.fillStyle = '#9eabb2'; ctx.fillRect(x - 22, y - 97, 44, 14);
            ctx.fillStyle = '#efdcab'; ctx.fillRect(x - 30, y - 109, 8, 24); ctx.fillRect(x + 22, y - 109, 8, 24);
            ctx.fillStyle = '#86e5d9'; ctx.fillRect(x - 10, y - 77, 5, 5); ctx.fillRect(x + 5, y - 77, 5, 5);
            if (ready) { ctx.fillStyle = '#fff0b0'; ctx.fillRect(x - 58, y - 65, 40, 5); ctx.font = '24px monospace'; ctx.fillText('!', x - 8, y - 118); }
        }
        for (const h of this.hazards) {
            const x = h.x - camera;
            if (h.kind === 'WAVE') {
                ctx.fillStyle = '#f8d08c'; ctx.fillRect(x - 24, h.y - 6, 48, 12); ctx.fillRect(x - 12, h.y - 16, 24, 10);
                ctx.fillStyle = '#ac765a'; ctx.fillRect(x - 30, h.y + 5, 60, 6);
            } else {
                ctx.save(); ctx.translate(x, h.y); ctx.rotate(Math.atan2(h.vy, h.vx));
                ctx.fillStyle = '#eff7ee'; ctx.fillRect(-17, -3, 34, 6); ctx.fillStyle = '#e7ae59'; ctx.fillRect(-12, -10, 5, 20); ctx.restore();
            }
        }
        if (this.phase === 'DIALOGUE' && this.dialogue) {
            const d = this.dialogue;
            ctx.fillStyle = '#111c27'; ctx.fillRect(95, 25, 810, 113);
            ctx.strokeStyle = '#e1c18d'; ctx.strokeRect(95, 25, 810, 113);
            ctx.textAlign = 'left'; ctx.fillStyle = '#ffdf9d'; ctx.font = 'bold 20px monospace'; ctx.fillText(d.speaker + ':', 115, 54);
            ctx.fillStyle = '#fff'; ctx.font = '20px monospace'; ctx.fillText(language === 'en' ? d.en : d.es, 115, 84);
            ctx.font = '14px monospace'; ctx.fillText(language === 'en' ? 'SPACE / E: next' : 'ESPACIO / E: siguiente', 115, 117);
        }
        if (this.inside && !this.frozen) {
            ctx.textAlign = 'center'; ctx.fillStyle = '#ffe3a2'; ctx.font = '16px monospace';
            ctx.fillText(this.cleared ? (language === 'en' ? 'Exit open →' : 'Salida abierta →') : this.kind === 'BEAR'
                ? (language === 'en' ? 'Raised paws? Jump the shockwave!' : '¿Patas levantadas? ¡Salta la onda!')
                : (language === 'en' ? 'Jump the landing waves. Watch Duff’s swords above!' : 'Salta las ondas del aterrizaje. ¡Cuidado con las espadas de Duff!'), 500, 90);
        }
        if (this.phase === 'ENTERING') {
            ctx.fillStyle = `rgba(0,0,0,${Math.max(0, 1 - Math.abs(this.timer - 0.45) / 0.45)})`; ctx.fillRect(0, 0, 1000, 500);
        }
        ctx.restore();
    }
}
