import type { Vinn } from './Vinn';

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** A short, edge-triggered escape combination, followed by escape or submersion. */
export class LavaRescue {
  time = 0;
  step = 0;
  result: 'STRUGGLING' | 'ESCAPED' | 'SUNK' = 'STRUGGLING';
  resultTime = 0;
  mistakeTime = -10;
  readonly keys: string[];
  readonly player: Vinn;
  readonly secondPlayer: boolean;
  private resolved = false;
  constructor(player: Vinn, secondPlayer = false, pattern = Math.floor(Math.random() * 3)) {
    this.player = player; this.secondPlayer = secondPlayer;
    const patterns = [['a', 'w', 'd'], ['d', 'w', 'a'], ['w', 'd', 'a']];
    this.keys = patterns[pattern % patterns.length].map(k => secondPlayer ? ({ a: 'arrowleft', w: 'arrowup', d: 'arrowright' }[k]!) : k);
    player.vine?.release(player, false);
    player.vx = 0; player.vy = 0;
  }
  press(key: string) {
    if (this.result !== 'STRUGGLING' || !this.keys.includes(key)) return;
    if (key === this.keys[this.step]) {
      this.step++;
      if (this.step === this.keys.length) this.result = 'ESCAPED';
    } else {
      this.step = 0; this.time += .45; this.mistakeTime = this.time;
      if (this.time >= 3.5) this.result = 'SUNK';
    }
  }
  update(dt: number) {
    if (this.result === 'STRUGGLING') {
      this.time += Math.max(0, dt);
      if (this.time >= 3.5) this.result = 'SUNK';
    } else this.resultTime = Math.min(1.4, this.resultTime + Math.max(0, dt));
  }
  get finished() { return this.result !== 'STRUGGLING' && this.resultTime >= 1.4; }
  resolve() {
    if (!this.finished || this.resolved) return;
    this.resolved = true;
    if (this.result === 'SUNK') this.player.health = 0;
    else {
      // A successful rescue halves remaining health, but always leaves Vinn alive.
      const remainingHealth = Math.max(1, Math.ceil(this.player.health / 2));
      this.player.isHit = false;
      this.player.takeDamage(this.player.health - remainingHealth);
      this.player.health = remainingHealth;
      this.player.x = this.player.lastSafeX; this.player.y = this.player.lastSafeY - 40;
      this.player.vx = 0; this.player.vy = 0; this.player.onGround = false;
      this.player.state = 'JUMPING'; this.player.isSinking = false; this.player.isSlipping = false;
      this.player.vineBoostTime = 0;
    }
  }
  draw(ctx: CanvasRenderingContext2D, language: 'en' | 'es') {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1000, 500);
    const zoom = 1 + clamp(this.time / .65) * .65;
    const sink = this.result === 'SUNK' ? clamp(this.resultTime / 1.1) * 170 : 0;
    const leap = this.result === 'ESCAPED' ? Math.sin(clamp(this.resultTime / 1.4) * Math.PI) * 180 : 0;
    const light = ctx.createLinearGradient(500, 0, 500, 440);
    light.addColorStop(0, '#ffefc408'); light.addColorStop(1, '#ff89314a');
    ctx.fillStyle = light; ctx.beginPath(); ctx.moveTo(480, 0); ctx.lineTo(520, 0);
    ctx.lineTo(780, 440); ctx.lineTo(220, 440); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1000, 406); ctx.clip();
    ctx.translate(500 + (this.result === 'ESCAPED' ? -clamp(this.resultTime / 1.4) * 160 : 0), 400 + sink - leap);
    ctx.scale(zoom, zoom);
    const struggle = Math.sin(this.time * 18) * 5;
    ctx.strokeStyle = this.player.color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = this.player.color; ctx.shadowBlur = 9;
    ctx.beginPath(); ctx.arc(struggle / 2, -48, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0, 2);
    ctx.moveTo(0, -26); ctx.lineTo(-23, -35); ctx.lineTo(-31, -65 + struggle);
    ctx.moveTo(0, -26); ctx.lineTo(23, -35); ctx.lineTo(31, -65 - struggle);
    ctx.moveTo(0, 2); ctx.lineTo(-13, 26); ctx.moveTo(0, 2); ctx.lineTo(13, 26); ctx.stroke();
    // Open fingers grasping for the ledge, above the lava surface.
    for (const side of [-1, 1]) for (let finger = 0; finger < 3; finger++) {
      ctx.beginPath(); ctx.moveTo(side * 31, -65 - side * struggle);
      ctx.lineTo(side * (27 + finger * 4), -73 - side * struggle); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#63192b'; ctx.fillRect(220, 410, 560, 70);
    ctx.fillStyle = '#dd4025'; ctx.fillRect(235, 412, 530, 38);
    ctx.fillStyle = '#ffb43d';
    for (let i = 0; i < 24; i++) {
      const wave = Math.sin(this.time * 6 + this.resultTime * 5 + i * .9) * 4;
      ctx.fillRect(235 + i * 22, 405 + wave, 22, 7);
    }
    ctx.fillStyle = '#46374b'; ctx.fillRect(175, 403, 205, 64);
    ctx.fillStyle = '#aa8572'; ctx.fillRect(175, 398, 205, 9);
    ctx.fillStyle = '#735361'; ctx.fillRect(190, 422, 72, 7); ctx.fillRect(282, 443, 76, 7);
    ctx.textAlign = 'center'; ctx.font = 'bold 32px monospace'; ctx.fillStyle = '#ffe3a0';
    const text = this.result === 'STRUGGLING' ? (language === 'es' ? '¡SAL DE LA LAVA!' : 'ESCAPE THE LAVA!')
      : this.result === 'ESCAPED' ? (language === 'es' ? '¡A LA ORILLA!' : 'BACK TO THE LEDGE!')
      : (language === 'es' ? 'LA LAVA TE ATRAPA…' : 'THE LAVA PULLS YOU UNDER…');
    ctx.fillText(text, 500, 67);
    if (this.result === 'STRUGGLING') {
      ctx.font = 'bold 17px monospace'; ctx.fillStyle = this.time - this.mistakeTime < .3 ? '#ff5770' : '#fff0cc';
      ctx.fillText(language === 'es' ? `J${this.secondPlayer ? 2 : 1}: pulsa las teclas EN ORDEN` : `P${this.secondPlayer ? 2 : 1}: press the keys IN ORDER`, 500, 101);
      ctx.fillStyle = '#552331'; ctx.fillRect(350, 119, 300, 10);
      ctx.fillStyle = '#ffc463'; ctx.fillRect(350, 119, 300 * clamp(1 - this.time / 3.5), 10);
    }
    ctx.restore();
  }
}
