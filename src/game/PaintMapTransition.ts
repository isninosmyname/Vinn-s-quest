import { World1Map } from './WorldMap';

export class PaintMapTransition {
  readonly destination = 3;
  timer = 0;
  readonly volcano = new World1Map(2);
  readonly paint = new World1Map(3);
  constructor(completed: number[]) { this.volcano.open(10, 10, completed); this.paint.open(1, 1); }
  update(dt: number) { this.timer += Math.max(0, dt); this.volcano.update(dt); this.paint.update(dt); return this.timer >= 7; }
  draw(ctx: CanvasRenderingContext2D, language: 'en' | 'es') {
    const t = this.timer;
    ctx.save();
    if (t >= 5.4) {
      this.paint.draw(ctx, language);
      ctx.fillStyle = `rgba(255,214,173,${Math.max(0, 1 - (t - 5.4) / 1.6)})`; ctx.fillRect(0, 0, 1000, 500);
      ctx.restore(); return;
    }
    this.volcano.draw(ctx, language, false);
    // The Living Volcano's own level-five icon grows out of the map.
    const grow = Math.min(1, t / 2.4), scale = 1 + grow * grow * 4;
    ctx.save(); ctx.translate(420 + grow * 70 + Math.sin(t * 35) * grow * 5, 175 + grow * 110); ctx.scale(scale, scale);
    for (let row = 0; row < 6; row++) {
      ctx.fillStyle = row % 2 ? '#75414a' : '#653641';
      ctx.fillRect(-8 - row * 4, -22 + row * 7, 16 + row * 8, 7);
    }
    ctx.fillStyle = '#ffa150'; ctx.fillRect(-8, -22, 16, 5);
    ctx.fillStyle = '#fff0a7'; ctx.fillRect(-14, -3, 8, 5); ctx.fillRect(6, -3, 8, 5);
    ctx.fillStyle = '#291824'; ctx.fillRect(-6, 7, 12, 6);
    ctx.restore();
    if (t < 3.1) {
      const run = Math.max(0, (t - 1) / 2.1), stride = Math.sin(t * 24) * (run ? 10 : 2);
      ctx.save(); ctx.translate(875 + run * 260, 180);
      ctx.strokeStyle = '#00edee'; ctx.lineWidth = 4; ctx.strokeRect(-7, -30, 14, 14);
      ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(5, 3); ctx.lineTo(-stride, 16);
      ctx.moveTo(5, 3); ctx.lineTo(stride + 6, 16); ctx.moveTo(0, -10); ctx.lineTo(20, -3 - stride); ctx.stroke(); ctx.restore();
    }
    if (t > 2) {
      for (let i = 0; i < 22; i++) {
        const age = t - 2 - i * .08;
        if (age < 0) continue;
        const a = i * 2.4, r = age * 190, size = Math.max(8, 68 - age * 9);
        ctx.fillStyle = ['#ffcb6b', '#ef723a', '#ffedb0', '#703d51'][i % 4];
        ctx.fillRect(490 + Math.cos(a) * r - size / 2, 285 + Math.sin(a) * r - size / 2, size, size);
      }
      ctx.fillStyle = `rgba(255,214,173,${Math.max(0, Math.min(1, (t - 4.3) / 1.1))})`; ctx.fillRect(0, 0, 1000, 500);
    }
    ctx.restore();
  }
}
