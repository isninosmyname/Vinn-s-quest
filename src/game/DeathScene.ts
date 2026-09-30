import { Vinn } from './Vinn';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { n = clamp(n); return n * n * (3 - 2 * n); };

/** A one-shot performance; the final pose stays still while the player chooses. */
export class DeathScene {
  time = 0;
  readonly actor: Vinn;
  readonly gameOver: boolean;
  readonly startX: number;
  readonly startY: number;
  readonly cause: 'NORMAL' | 'LAVA';
  constructor(gameOver: boolean, player: Vinn, startX: number, startY: number, cause: 'NORMAL' | 'LAVA' = 'NORMAL') {
    this.gameOver = gameOver; this.startX = startX; this.startY = startY; this.cause = cause;
    this.actor = new Vinn(0, -30, player.color, player.visualType, player.playerName);
  }
  get duration() { return this.cause === 'LAVA' ? 1.4 : this.gameOver ? 4.3 : 3.1; }
  get ready() { return this.time >= this.duration; }
  update(dt: number) { this.time = Math.min(this.duration, this.time + Math.max(0, dt)); }
  get pose() {
    const t = this.cause === 'LAVA' ? this.time + 3.1 : this.time;
    return {
      zoom: (1 + ease(t / .8)) * (1 - .58 * ease((t - 3.1) / 1.2) * Number(this.gameOver)),
      spin: this.cause === 'LAVA' ? 0 : Math.PI * 6 * ease(t / 1.45),
      fall: Math.PI / 2 * ease((t - 2.15) / .7),
      alpha: this.cause === 'LAVA' ? 0 : this.gameOver ? 1 - ease((t - 3.25) / 1.05) : 1,
    };
  }
  draw(ctx: CanvasRenderingContext2D, language: 'en' | 'es', lives: number) {
    const t = this.time, pose = this.pose;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1000, 500);
    const move = ease(t / .8);
    const x = this.startX + (500 - this.startX) * move;
    const y = this.startY + (325 - this.startY) * move;
    // Visible cone and pool of light leave every enemy and prop in darkness.
    const light = ctx.createLinearGradient(x, 0, x, y + 20);
    light.addColorStop(0, '#fff3bf08'); light.addColorStop(1, '#fff3bf32');
    ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(x - 22, 0); ctx.lineTo(x + 22, 0);
    ctx.lineTo(x + 165 * pose.zoom, y + 16); ctx.lineTo(x - 110 * pose.zoom, y + 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff1bd24'; ctx.beginPath(); ctx.ellipse(x + 25, y + 10, 110 * pose.zoom, 12, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save(); ctx.translate(x, y); ctx.scale(pose.zoom, pose.zoom); ctx.globalAlpha = pose.alpha;
    ctx.rotate(pose.fall + (t > 1.45 && t < 2.15 ? Math.sin((t - 1.45) * 19) * .1 : 0));
    ctx.scale(t < 1.45 ? Math.cos(pose.spin) : 1, 1);
    this.actor.animTimer = t; this.actor.state = t < 1.45 ? 'WALKING' : 'IDLE';
    this.actor.draw(ctx, 0);
    ctx.restore();

    if (this.cause !== 'LAVA' && t >= 1.45 && t < 2.85) {
      ctx.save(); ctx.fillStyle = '#ffe075';
      for (let i = 0; i < 3; i++) {
        const a = t * 7 + i * Math.PI * 2 / 3;
        const sx = x + Math.cos(a) * 35, sy = y - 170 + Math.sin(a) * 10;
        ctx.fillRect(sx - 5, sy - 2, 10, 4); ctx.fillRect(sx - 2, sy - 5, 4, 10);
      }
      ctx.restore();
    }
    const drop = clamp((t - .2) / .6);
    const bounce = drop < 1 ? 0 : Math.sin((t - .8) * 16) * Math.max(0, 1 - (t - .8) / .5) * 14;
    ctx.textAlign = 'center'; ctx.font = 'bold 48px monospace';
    const title = this.gameOver ? (language === 'es' ? 'FIN DEL JUEGO' : 'GAME OVER') : (language === 'es' ? '¡HAS MUERTO!' : 'YOU DIED!');
    ctx.fillStyle = '#652336'; ctx.fillText(title, 504, -65 + 153 * drop * drop + bounce + 4);
    ctx.fillStyle = this.gameOver ? '#ff687c' : '#fff0cf'; ctx.fillText(title, 500, -65 + 153 * drop * drop + bounce);
    ctx.font = 'bold 17px monospace'; ctx.fillStyle = '#d1c7b3';
    ctx.fillText(language === 'es' ? `VIDAS: ${lives}` : `LIVES: ${lives}`, 500, 122);
    ctx.restore();
  }
}
