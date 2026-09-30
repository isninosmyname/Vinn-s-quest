import type { Vinn } from './Vinn';

export type VineAnchor = { x: number; y: number; length: number };
// These are real foreground trees. Other trees do not automatically receive vines.
export const FOREST_VINES: VineAnchor[][] = [
    [],
    [{ x: 2200, y: 105, length: 310 }],
    [{ x: 3620, y: 95, length: 305 }],
    [], [],
    [{ x: 2600, y: 100, length: 310 }, { x: 5220, y: 85, length: 300 }],
    [{ x: 5480, y: 105, length: 310 }],
    []
];

export class SwingVine {
    readonly anchor: VineAnchor;
    time = 0;
    private riders = new Set<Vinn>();
    constructor(anchor: VineAnchor) { this.anchor = anchor; }
    get idleAngle() { return -0.65 + Math.sin(this.time * 1.3) * 0.06; }
    tip(angle = this.idleAngle) {
        return { x: this.anchor.x + Math.sin(angle) * this.anchor.length, y: this.anchor.y + Math.cos(angle) * this.anchor.length };
    }
    canGrab(p: Vinn) {
        const rider = [...this.riders].find(r => r.vine === this);
        const tip = this.tip(rider?.swingAngle);
        return !p.vine && p.health > 0 && !p.isHit && !p.isSlipping && p.vineCooldown <= 0 && Math.hypot(p.x - tip.x, p.y - 36 - tip.y) < 85;
    }
    grab(p: Vinn) {
        if (!this.canGrab(p)) return false;
        const rider = [...this.riders].find(r => r.vine === this);
        p.vine = this; p.swingAngle = rider?.swingAngle ?? this.idleAngle; p.swingSpeed = rider?.swingSpeed ?? 0.6;
        this.riders.add(p);
        p.onGround = false; p.isCrouching = false; p.vx = 0; p.vy = 0;
        p.state = 'JUMPING'; p.restTimer = 0;
        this.position(p);
        return true;
    }
    private position(p: Vinn) {
        const tip = this.tip(p.swingAngle);
        p.x = tip.x; p.y = tip.y + 36;
    }
    swing(p: Vinn, dt: number, direction: number) {
        // Substeps keep the pendulum stable even when the game drops a frame.
        const steps = Math.max(1, Math.ceil(dt * 120)), step = dt / steps;
        for (let i = 0; i < steps; i++) {
            p.swingSpeed += (-700 / this.anchor.length * Math.sin(p.swingAngle) + direction * 1.8 - p.swingSpeed * 0.16) * step;
            p.swingAngle += p.swingSpeed * step;
            if (Math.abs(p.swingAngle) > 1.03) {
                p.swingAngle = Math.sign(p.swingAngle) * 1.03; p.swingSpeed *= -0.25;
            }
        }
        if (direction) p.direction = direction;
        this.position(p);
    }
    release(p: Vinn, leap = true) {
        this.riders.delete(p);
        const dir = Math.abs(p.swingSpeed) > 0.1 ? Math.sign(p.swingSpeed) : p.direction;
        p.vine = null; p.vineCooldown = 0.35;
        p.vineBoostX = dir * Math.max(6, Math.min(9, Math.abs(Math.cos(p.swingAngle) * p.swingSpeed * this.anchor.length / 60)));
        p.vineBoostTime = leap ? 0.9 : 0;
        p.vx = leap ? p.vineBoostX : 0; p.vy = leap ? -11 : 0;
        p.onGround = false; p.state = 'JUMPING'; p.canDoubleJump = true;
    }
    draw(ctx: CanvasRenderingContext2D, camera: number, players: Vinn[], language: 'en' | 'es') {
        const a = this.anchor, x = a.x - camera;
        if (x < -400 || x > 1400) return;
        ctx.save();
        ctx.fillStyle = '#4c4732'; ctx.fillRect(x - 210, a.y - 50, 26, 460 - a.y + 50);
        ctx.fillStyle = '#77613d'; ctx.fillRect(x - 210, a.y - 12, 230, 18);
        ctx.fillStyle = '#316747'; ctx.fillRect(x - 245, a.y - 58, 280, 38);
        ctx.fillStyle = '#6a984e'; ctx.fillRect(x - 222, a.y - 72, 200, 20);
        const riders = players.filter(p => p.vine === this);
        const angles = riders.length ? riders.map(p => p.swingAngle) : [this.idleAngle];
        for (const angle of angles) {
            const tip = this.tip(angle);
            for (let d = 0; d <= a.length; d += 7) {
                const px = Math.round(x + Math.sin(angle) * d), py = Math.round(a.y + Math.cos(angle) * d);
                ctx.fillStyle = '#304d2c'; ctx.fillRect(px - 3, py, 6, 9);
                ctx.fillStyle = '#91b659'; ctx.fillRect(px - 1, py, 2, 7);
                if (d % 35 === 0) { ctx.fillStyle = '#609845'; ctx.fillRect(px + (d % 70 ? -11 : 3), py + 2, 10, 5); }
            }
            ctx.fillStyle = '#e6cb77'; ctx.fillRect(tip.x - camera - 6, tip.y - 3, 12, 6);
        }
        const nearby = players.find(p => p.vine === this || this.canGrab(p));
        if (nearby) {
            ctx.fillStyle = '#203f31'; ctx.fillRect(x - 260, 26, 480, 34);
            ctx.fillStyle = '#fff0b1'; ctx.font = '13px monospace'; ctx.textAlign = 'center';
            ctx.fillText(language === 'en' ? 'E: GRAB • A/D: SWING • W: LEAP  (P2: ↑)' : 'E: AGARRAR • A/D: BALANCEO • W: SALTAR (J2: ↑)', x - 20, 48);
        }
        ctx.restore();
    }
}
