import type { Vinn } from './Vinn';
import type { ForestPlatform } from './ForestWorld';

export type DuffPhase = 'WAITING' | 'INTRO' | 'MOUNT' | 'POLE_RUN' | 'RETURN_LEFT' | 'POLES_STOPPED' | 'STAIR_ASSAULT' | 'THROW_BACK' | 'DEFEATED';
export class DuffBoss {
    readonly maxHealth = 4;
    health = 4;
    phase: DuffPhase = 'WAITING';
    timer = 0;
    animTimer = 0;
    machineSpeed = 90;
    machineStart: number;
    readonly machineEnd: number;
    readonly rightButtonX: number;
    readonly leftButtonX: number;
    readonly x: number;
    readonly y = 235;
    private offset = 0;
    private switched = false;
    private throwStarts: { x: number; y: number }[] = [];
    private stoppedFrom: { x: number; y: number; w: number; h: number }[] = [];
    constructor(arenaStart: number) {
        this.machineStart = arenaStart;
        this.machineEnd = arenaStart + 1000;
        this.rightButtonX = arenaStart + 870;
        this.leftButtonX = arenaStart + 80;
        this.x = arenaStart + 900;
    }
    get isMachineMoving() { return this.phase === 'POLE_RUN' || this.phase === 'RETURN_LEFT'; }
    get active() { return this.phase !== 'WAITING'; }
    get frozen() { return ['INTRO', 'MOUNT', 'THROW_BACK'].includes(this.phase); }
    startBattle() { if (this.phase === 'INTRO') { this.phase = 'MOUNT'; this.timer = 0; } }
    get poles() {
        if (['POLES_STOPPED', 'STAIR_ASSAULT', 'THROW_BACK', 'DEFEATED'].includes(this.phase)) {
            const stairs = [{ x: this.machineStart + 270, y: 395, w: 240, h: 12 }, { x: this.machineStart + 550, y: 330, w: 240, h: 12 }];
            if (this.phase === 'POLES_STOPPED' && this.stoppedFrom.length) {
                const t = Math.min(1, this.timer / 0.8); const ease = t * t * (3 - 2 * t);
                return stairs.map((p, i) => ({ ...p,
                    x: this.stoppedFrom[i].x + (p.x - this.stoppedFrom[i].x) * ease,
                    y: this.stoppedFrom[i].y + (p.y - this.stoppedFrom[i].y) * ease,
                    w: this.stoppedFrom[i].w + (p.w - this.stoppedFrom[i].w) * ease }));
            }
            return stairs;
        }
        return [
            { x: this.machineStart + 220 + (this.offset % 530), y: 408, w: 130, h: 12 },
            { x: this.machineStart + 220 + ((this.offset + 270) % 530), y: 440, w: 130, h: 12 }
        ];
    }
    get platforms(): ForestPlatform[] {
        return ['STAIR_ASSAULT', 'DEFEATED'].includes(this.phase)
            ? [...this.poles, { x: this.machineStart + 815, y: 265, w: 150, h: 18 }] : [];
    }
    update(dt: number, players: Vinn[], interact: boolean) {
        this.timer += dt; this.animTimer += dt;
        const alive = players.filter(p => p.health > 0);
        if (this.phase === 'WAITING') {
            if (alive.some(p => p.x >= this.machineStart + 25)) { this.phase = 'INTRO'; this.timer = 0; }
            return;
        }
        if (this.phase === 'INTRO') return;
        if (this.phase === 'MOUNT') {
            if (this.timer > 1.4) { this.phase = 'POLE_RUN'; this.timer = 0; }
            return;
        }
        if (this.phase === 'THROW_BACK') {
            const progress = Math.min(1, this.timer / 1.2);
            players.forEach((p, i) => {
                const start = this.throwStarts[i] ?? { x: p.x, y: p.y };
                p.x = start.x + (this.machineStart + 150 + i * 38 - start.x) * progress;
                p.y = start.y + (430 - start.y) * progress - Math.sin(progress * Math.PI) * 150;
                p.vx = 0; p.vy = 0; p.onGround = progress === 1;
            });
            if (progress === 1) { this.phase = 'POLE_RUN'; this.timer = 0; this.offset = 0; this.machineSpeed = 90 + (4 - this.health) * 22; }
            return;
        }
        if (this.isMachineMoving) {
            this.machineSpeed = Math.min(195, this.machineSpeed + dt * 3);
            this.offset += dt * this.machineSpeed;
            for (const p of alive) {
                if (p.onGround && p.x > this.machineStart + 180 && p.x < this.machineStart + 810) {
                    p.x -= dt * (30 + this.machineSpeed * 0.18);
                }
                const b = p.bounds;
                for (const pole of this.poles) {
                    if (b.right > pole.x && b.left < pole.x + pole.w && b.bottom > pole.y && b.top < pole.y + pole.h) p.takeDamage(1);
                }
            }
            const target = this.phase === 'POLE_RUN' ? this.rightButtonX : this.leftButtonX;
            const pressing = alive.some(p => Math.abs(p.x - target) <  60 && Math.abs(p.y - 430) < 50 &&
                (interact || p.state === 'ATTACKING'));
            if (pressing && !this.switched) {
                this.stoppedFrom = this.poles;
                this.phase = this.phase === 'POLE_RUN' ? 'RETURN_LEFT' : 'POLES_STOPPED';
                this.timer = 0;
            }
            this.switched = pressing;
        } else if (this.phase === 'POLES_STOPPED' && this.timer > 0.8) {
            this.phase = 'STAIR_ASSAULT'; this.timer = 0;
        } else if (this.phase === 'STAIR_ASSAULT') {
            if (alive.some(p => Math.abs(p.x - this.x) < 85 && Math.abs(p.y - this.y) < 65 && p.state === 'ATTACKING')) {
                this.health--;
                this.throwStarts = players.map(p => ({ x: p.x, y: p.y }));
                this.phase = this.health === 0 ? 'DEFEATED' : 'THROW_BACK'; this.timer = 0;
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D, camera: number) {
        if (camera + 1000 < this.machineStart) return;
        const start = this.machineStart - camera;
        ctx.save(); ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#211c2d'; ctx.fillRect(start, 180, 1000, 280);
        ctx.fillStyle = '#564c55'; ctx.fillRect(start + 840, 240, 120, 220);
        ctx.fillStyle = '#a5a79a'; ctx.fillRect(start + 815, 265, 150, 16);
        for (let i = 0; i < 3; i++) {
            ctx.save(); ctx.translate(start + 855 + i % 2 * 65, 320 + i * 38);
            ctx.rotate(this.isMachineMoving ? this.animTimer * (i % 2 ? -2 : 2) : Math.sin(this.animTimer * 8) * 0.04);
            ctx.fillStyle = '#ac8b69'; ctx.fillRect(-22, -14, 44, 28); ctx.fillRect(-14, -22, 28, 44);
            ctx.fillStyle = '#45414c'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#d8be86'; ctx.fillRect(-4, -4, 8, 8);
            ctx.restore();
        }
        ctx.fillStyle = '#8b6342'; ctx.fillRect(start + 180, 460, 630, 24);
        const travel = this.isMachineMoving ? this.offset : 0;
        for (let i = 0; i < 27; i++) {
            ctx.fillStyle = i % 2 ? '#d7a870' : '#b88854';
            ctx.fillRect(start + 180 + (i * 24 - travel % 24), 461, 20, 12);
        }
        for (const pole of this.poles) {
            ctx.fillStyle = '#483743'; ctx.fillRect(pole.x - camera + 6, pole.y + 10, pole.w, 7);
            ctx.fillStyle = '#e3b976'; ctx.fillRect(pole.x - camera, pole.y, pole.w, pole.h);
            ctx.fillStyle = '#a56448'; ctx.fillRect(pole.x - camera + 9, pole.y + 4, pole.w - 18, 4);
            ctx.fillStyle = '#c5d3ce'; ctx.fillRect(pole.x - camera, pole.y - 2, 8, 16); ctx.fillRect(pole.x - camera + pole.w - 8, pole.y - 2, 8, 16);
        }
        for (const [x, label, lit] of [
            [this.rightButtonX, '1 RIGHT', this.phase !== 'POLE_RUN' && this.phase !== 'WAITING' && this.phase !== 'INTRO' && this.phase !== 'MOUNT'],
            [this.leftButtonX, '2 LEFT', ['POLES_STOPPED', 'STAIR_ASSAULT', 'DEFEATED'].includes(this.phase)]
        ] as const) {
            ctx.fillStyle = '#68706b'; ctx.fillRect(x - camera - 20, 401, 40, 59);
            ctx.fillStyle = lit ? '#91e886' : '#ef754d'; ctx.fillRect(x - camera - 16, 397, 32, 15);
            ctx.fillStyle = '#ffedbc'; ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillText(label, x - camera, 388);
        }
        let feet = this.phase === 'INTRO' || this.phase === 'WAITING' ? 460 : 265;
        if (this.phase === 'MOUNT') { const t = Math.min(1, this.timer / 1.4); feet = 460 - 195 * t - Math.sin(t * Math.PI) * 100; }
        const x = this.x - camera;
        const crank = this.isMachineMoving || this.phase === 'STAIR_ASSAULT' ? Math.sin(this.animTimer * 10) * 8 : 0;
        ctx.fillStyle = '#9d3e45'; ctx.fillRect(x - 7, feet - 55, 14, 35);
        ctx.fillStyle = '#e7675c'; ctx.fillRect(x - 18, feet - 88, 36, 29);
        ctx.fillStyle = '#87e7d7'; ctx.fillRect(x - 10, feet - 78, 5, 5); ctx.fillRect(x + 5, feet - 78, 5, 5);
        ctx.fillStyle = '#89969e'; ctx.fillRect(x - 22, feet - 98, 44, 14);
        ctx.fillStyle = '#f0d3a1'; ctx.fillRect(x - 30, feet - 110, 8, 21); ctx.fillRect(x + 22, feet - 110, 8, 21);
        ctx.fillStyle = '#dda369'; ctx.fillRect(x - 19, feet - 54, 38, 8);
        ctx.fillStyle = '#e7675c'; ctx.fillRect(x - 17, feet - 20, 10, 20); ctx.fillRect(x + 7, feet - 20, 10, 20);
        ctx.fillRect(x - 32, feet - 53 + crank, 26, 7); ctx.fillRect(x + 6, feet - 53 - crank, 26, 7);
        if (this.active) {
            ctx.fillStyle = '#192328'; ctx.fillRect(270, 14, 460, 26);
            ctx.fillStyle = '#ed7762'; ctx.fillRect(274, 18, 452 * this.health / 4, 18);
            ctx.fillStyle = '#ffe9bb'; ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.fillText('DUFF • ' + this.health + '/4', 500, 57);
            const message = this.phase === 'INTRO' ? 'Well the golem sent me to crush you first, be prepared!' :
                this.phase === 'MOUNT' ? 'Duff is climbing into his machine…' :
                this.phase === 'POLE_RUN' ? 'C: duck • W: jump • E / SPACE: press RIGHT switch →' :
                this.phase === 'RETURN_LEFT' ? '← Return to the LEFT switch • E / SPACE' :
                this.phase === 'STAIR_ASSAULT' ? 'Climb the stopped poles! Hit Duff on his perch!' :
                this.phase === 'THROW_BACK' ? 'Duff throws you back — the next round is faster!' :
                this.phase === 'DEFEATED' ? 'Machine destroyed! The exit is open →' : 'The machine has stopped…';
            ctx.fillStyle = '#17232b'; ctx.fillRect(70,  70, 860, 48);
            ctx.fillStyle = '#ffe9bb'; ctx.font = '16px monospace'; ctx.fillText(message, 500, 99);
            if (this.phase === 'INTRO') ctx.fillText('SPACE / E: continue', 500, 140);
        }
        ctx.restore();
    }
}
