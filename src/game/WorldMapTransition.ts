import { World1Map } from './WorldMap';

export class WorldMapTransition {
    timer = 0;
    readonly forest = new World1Map(1);
    readonly volcano = new World1Map(2);
    constructor(completed: number[]) {
        this.forest.open(8, 8, completed);
        this.volcano.open(1, 1);
    }
    get phase() { return this.timer < 1 ? 'PLANT' : this.timer < 2.4 ? 'RUN' : this.timer < 3 ? 'FUSE' : this.timer < 4.2 ? 'EXPLODE' : 'REVEAL'; }
    get heroX() { return 885 + Math.max(0, Math.min(1, (this.timer - 1) / 1.4)) * 210; }
    update(dt: number) {
        this.timer += Math.max(0, dt);
        this.forest.update(dt); this.volcano.update(dt);
        return this.timer >= 5.8;
    }
    draw(ctx: CanvasRenderingContext2D, language: 'en' | 'es') {
        this.forest.draw(ctx, language, false);
        const bombX = 910, bombY = 195;
        ctx.save();
        if (this.timer < 2.4) {
            const bend = this.phase === 'PLANT' ? Math.sin(Math.min(1, this.timer) * Math.PI) * 8 : 0;
            const stride = this.phase === 'RUN' ? Math.sin(this.timer * 22) * 9 : 7;
            ctx.translate(this.heroX, 182);
            ctx.strokeStyle = '#00e1ee'; ctx.lineWidth = 3;
            ctx.strokeRect(-6 + bend, -28 + bend, 12, 12);
            ctx.beginPath(); ctx.moveTo(bend, -16 + bend); ctx.lineTo(0, 0);
            ctx.lineTo(-stride, 12); ctx.moveTo(0, 0); ctx.lineTo(stride, 12);
            ctx.moveTo(bend, -10 + bend); ctx.lineTo(17, bend); ctx.stroke();
            ctx.restore(); ctx.save();
        }
        if (this.timer >= 0.6 && this.timer < 3) {
            ctx.fillStyle = '#171d2a'; ctx.fillRect(bombX - 10, bombY - 16, 20, 19); ctx.fillRect(bombX - 6, bombY - 20, 12, 5);
            ctx.fillStyle = '#dad6b0'; ctx.fillRect(bombX + 1, bombY - 26, 3, 8);
            ctx.fillStyle = Math.floor(this.timer * 14) % 2 ? '#ffe36b' : '#ff673d'; ctx.fillRect(bombX - 2, bombY - 31, 8, 6);
        }
        if (this.timer >= 3 && this.timer < 4.2) {
            const p = (this.timer - 3) / 1.2;
            for (let i = 0; i < 32; i++) {
                const angle = i * Math.PI * 2 / 32, radius = p * 1150;
                ctx.fillStyle = i % 3 === 0 ? '#ffe8a0' : i % 3 === 1 ? '#ffb34e' : '#e65b46';
                const size = 35 + p * 190;
                ctx.fillRect(bombX + Math.cos(angle) * radius - size / 2, bombY + Math.sin(angle) * radius - size / 2, size, size);
            }
            ctx.fillStyle = `rgba(255,225,156,${Math.min(1, p * 1.8)})`; ctx.fillRect(0, 0, 1000, 500);
        }
        if (this.timer >= 4.2) {
            this.volcano.draw(ctx, language);
            ctx.fillStyle = `rgba(255,225,156,${Math.max(0, 1 - (this.timer - 4.2) / 1.3)})`; ctx.fillRect(0, 0, 1000, 500);
        }
        ctx.restore();
    }
}
