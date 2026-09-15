import type { Vinn } from './Vinn';

type Phase = 'SLEEP' | 'ERUPT' | 'WARNING' | 'BEAM' | 'EXPOSED';
type Ember = { x: number; y: number; vx: number; vy: number; target: number };

/** Shared background creature for the mid-world boss and Blaze's assist. */
export class LivingVolcano {
    phase: Phase = 'SLEEP';
    timer = 0;
    animation = 0;
    embers: Ember[] = [];
    private volley = 0;
    private eyeOpenness = 0;
    readonly center: number;
    readonly beamTop = 390;
    readonly beamBottom = 413;

    constructor(center: number) { this.center = center; }

    start(withFireballs: boolean) {
        this.phase = withFireballs ? 'ERUPT' : 'WARNING';
        this.timer = 0; this.volley = 0; this.embers = [];
    }

    stop() { this.phase = 'SLEEP'; this.timer = 0; this.embers = []; this.eyeOpenness = 0; }

    update(dt: number, targetX: number) {
        this.animation += dt;
        if (this.phase === 'SLEEP') return;
        this.eyeOpenness = Math.min(1, this.eyeOpenness + dt * 1.8);
        this.timer += dt;
        if (this.phase === 'ERUPT') {
            // Visible arcs launch from the crater, then fall onto marked positions.
            if (this.volley < 5 && this.timer >= 0.25 + this.volley * 0.62) {
                const offsets = [-130, 110, 0, -190, 160];
                const target = Math.max(this.center - 570, Math.min(this.center + 200, targetX + offsets[this.volley]));
                const flight = 2.0;
                this.embers.push({ x: this.center, y: 126, vx: (target - this.center) / flight, vy: -360, target });
                this.volley++;
            }
            if (this.timer >= 5.5) { this.phase = 'WARNING'; this.timer = 0; this.embers = []; }
        } else if (this.phase === 'WARNING' && this.timer >= 1.8) {
            this.phase = 'BEAM'; this.timer = 0;
        } else if (this.phase === 'BEAM' && this.timer >= 1.5) {
            this.phase = 'EXPOSED'; this.timer = 0;
        }
        this.embers = this.embers.filter(e => {
            // Ballistic integration is independent of refresh rate (gravity 520 px/s²).
            e.x += e.vx * dt; e.y += e.vy * dt + 260 * dt * dt; e.vy += 520 * dt;
            return e.y < 475;
        });
    }

    hitPlayers(players: Vinn[]) {
        for (const p of players) {
            if (p.health <= 0) continue;
            const b = p.bounds;
            if (this.phase === 'BEAM' && b.right > this.center - 700 && b.left < this.center + 300 && b.top < this.beamBottom && b.bottom > this.beamTop) p.takeDamage(4);
            for (const e of this.embers) {
                if (e.x + 12 > b.left && e.x - 12 < b.right && e.y + 12 > b.top && e.y - 12 < b.bottom) p.takeDamage(3);
            }
        }
    }

    drawBackground(ctx: CanvasRenderingContext2D, camera: number, defeated = false) {
        const x = Math.round(this.center - camera);
        ctx.save(); ctx.imageSmoothingEnabled = false;
        // Stepped silhouette, basalt terraces, glowing cracks: no smooth vector face.
        for (let row = 0; row < 19; row++) {
            const w = 82 + row * 25;
            ctx.fillStyle = row % 3 === 0 ? '#512e39' : '#392b36';
            ctx.fillRect(x - w / 2, 125 + row * 17, w, 19);
            ctx.fillStyle = '#69404a'; ctx.fillRect(x - w / 2, 125 + row * 17, 12, 17);
        }
        ctx.fillStyle = defeated ? '#62515b' : '#fc713b'; ctx.fillRect(x - 45, 120, 90, 12);
        for (let i = 0; i < 9; i++) {
            ctx.fillStyle = defeated ? '#413441' : i % 2 ? '#b23c35' : '#e75b35';
            ctx.fillRect(x - 8 + (i % 3) * 9, 135 + i * 30, 9, 32);
        }
        const open = !defeated && this.phase !== 'SLEEP';
        const eyeHeight = open ? 4 + Math.floor(this.eyeOpenness * 6) * 3 : 4;
        for (const side of [-1, 1]) {
            ctx.fillStyle = '#1c1425'; ctx.fillRect(x + side * 62 - 22, 226, 44, 31);
            ctx.fillStyle = open ? '#ffce62' : '#895352'; ctx.fillRect(x + side * 62 - 18, 237, 36, eyeHeight);
            if (open) { ctx.fillStyle = '#fff5bd'; ctx.fillRect(x + side * 62 - 4, 239, 8, Math.max(2, eyeHeight - 4)); }
        }
        const charging = this.phase === 'WARNING' || this.phase === 'BEAM';
        ctx.fillStyle = '#1c1425'; ctx.fillRect(x - 50, 306, 100, charging ? 56 : 23);
        ctx.fillStyle = '#b06e57';
        for (let i = 0; i < 5; i++) ctx.fillRect(x - 46 + i * 20, 306, 12, 8);
        if (charging) {
            const size = this.phase === 'BEAM' ? 42 : 10 + Math.floor(this.timer / 1.8 * 8) * 4;
            ctx.fillStyle = '#ff7138'; ctx.fillRect(x - size, 337 - size / 2, size * 2, size);
            ctx.fillStyle = '#fff3ae'; ctx.fillRect(x - size / 2, 337 - size / 4, size, size / 2);
        }
        if (!defeated) for (let i = 0; i < 8; i++) {
            const t = (this.animation * 25 + i * 18) % 110;
            ctx.fillStyle = i % 2 ? '#71535c' : '#594451';
            ctx.fillRect(x - 32 + i % 3 * 24 + Math.floor(t / 20) * 4, 114 - t, 16 + i % 3 * 8, 12);
        }
        ctx.restore();
    }

    drawHazards(ctx: CanvasRenderingContext2D, camera: number, language: 'en' | 'es') {
        ctx.save(); ctx.imageSmoothingEnabled = false;
        for (const e of this.embers) {
            const x = Math.round(e.x - camera), y = Math.round(e.y);
            ctx.fillStyle = '#98343d'; ctx.fillRect(e.target - camera - 20, 454, 40, 6);
            ctx.fillStyle = '#ffbb55'; ctx.fillRect(e.target - camera - 4, 445, 8, 8);
            ctx.fillStyle = '#be3739'; ctx.fillRect(x - 8, y - Math.sign(e.vy) * 22, 16, 24);
            ctx.fillStyle = '#ff7839'; ctx.fillRect(x - 12, y - 12, 24, 24);
            ctx.fillStyle = '#ffe08a'; ctx.fillRect(x - 6, y - 6, 12, 12);
        }
        const x = this.center - camera;
        if (this.phase === 'WARNING' || this.phase === 'BEAM') {
            if (this.phase === 'BEAM') {
                // The mouth projects into the foreground, then spreads across the arena.
                ctx.fillStyle = '#ff7138'; ctx.beginPath(); ctx.moveTo(x - 35, 325); ctx.lineTo(x + 35, 350); ctx.lineTo(x + 110, 413); ctx.lineTo(x - 110, 390); ctx.fill();
                ctx.fillRect(x - 700, this.beamTop, 1000, this.beamBottom - this.beamTop);
                ctx.fillStyle = '#fff5b4'; ctx.fillRect(x - 700, 398, 1000, 7);
            } else {
                ctx.fillStyle = '#ec8b55';
                for (let i = 0; i < 50; i++) ctx.fillRect(x - 700 + i * 20, this.beamTop, 10, 3);
            }
            ctx.fillStyle = '#211727'; ctx.fillRect(200, 84, 600, 38);
            ctx.fillStyle = '#ffe4a2'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(language === 'en' ? 'MOUTH BEAM!  C: CROUCH  /  P2: ↓' : '¡RAYO!  C: AGÁCHATE  /  J2: ↓', 500, 109);
        } else if (this.phase === 'EXPOSED') {
            ctx.fillStyle = '#211727'; ctx.fillRect(240, 84, 520, 38);
            ctx.fillStyle = '#ffe4a2'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(language === 'en' ? 'CORE EXPOSED — STRIKE WITH YOUR SWORD!' : '¡NÚCLEO EXPUESTO — USA TU ESPADA!', 500, 109);
        }
        ctx.restore();
    }

    drawCore(ctx: CanvasRenderingContext2D, camera: number, hit: boolean) {
        const x = this.center - camera;
        ctx.save();
        ctx.fillStyle = '#563741'; ctx.fillRect(x - 42, 445, 84, 15);
        if (this.phase === 'EXPOSED') {
            const pulse = Math.floor(Math.sin(this.animation * 8) * 3);
            ctx.fillStyle = '#9a383c'; ctx.fillRect(x - 24, 410 + pulse, 48, 36);
            ctx.fillStyle = hit ? '#fff' : '#ffbc5a'; ctx.fillRect(x - 16, 414 + pulse, 32, 25);
            ctx.fillStyle = '#fff0b3'; ctx.fillRect(x - 6, 419 + pulse, 12, 15);
        }
        ctx.restore();
    }
}
