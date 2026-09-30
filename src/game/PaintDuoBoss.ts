import type { Vinn } from './Vinn';
export type PaintPool = { x: number; w: number; color: string };

export class PaintDuoBoss {
  phase: 'WAITING' | 'FIGHT' | 'STUNNED' | 'DEFEATED' = 'WAITING';
  health = 4;
  duffHits = 0;
  stun = 0;
  time = 0;
  duffX: number;
  start: number;
  private hitCooldown = 0;
  private attackTime = 0;
  private direction = -1;
  private paintTime = 2;
  private splash: { x: number; time: number } | null = null;
  private climbers = new Set<Vinn>();
  constructor(start: number) { this.start = start; this.duffX = start + 520; }
  get active() { return this.phase !== 'WAITING' && this.phase !== 'DEFEATED'; }
  get ladderX() { return this.start + 680; }
  get inkX() { return this.start + 845; }
  get platforms() { return this.phase === 'STUNNED' ? [{ x: this.start + 655, y: 255, w: 270, h: 16 }] : []; }
  enter(players: Vinn[]) {
    if (this.phase !== 'WAITING') return false;
    if (!players.some(p => p.health > 0 && p.x >= this.start + 30)) return false;
    this.phase = 'FIGHT';
    players.forEach((p, i) => { p.reset(this.start + 110 + i * 50, 430); });
    return true;
  }
  onLadder(p: Vinn, keys: Record<string, boolean>, dt: number) {
    if (p.health <= 0 || this.phase !== 'STUNNED') { this.climbers.delete(p); return false; }
    if (!this.climbers.has(p) && keys.w && Math.abs(p.x - this.ladderX) < 35 && p.y > 225) this.climbers.add(p);
    if (!this.climbers.has(p)) return false;
    p.x = this.ladderX; p.vx = 0; p.vy = 0; p.isSlipping = false; p.isCrouching = false; p.onGround = false;
    p.state = 'JUMPING'; p.animTimer += dt;
    p.y += (keys.s ? 1 : keys.w ? -1 : 0) * dt * 135;
    if (p.y <= 225) { p.y = 225; p.x += 30; p.onGround = true; p.state = 'IDLE'; this.climbers.delete(p); }
    if (p.y >= 430) { p.y = 430; p.onGround = true; this.climbers.delete(p); }
    return true;
  }
  update(dt: number, players: Vinn[], pools: PaintPool[]) {
    this.time += dt;
    if (!this.active) return;
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    const alive = players.filter(p => p.health > 0);
    if (!alive.length) return;
    for (const p of alive) p.x = Math.max(this.start + 30, Math.min(this.start + 960, p.x));
    this.paintTime -= dt;
    if (this.paintTime <= 0 && !this.splash) {
      const target = alive[Math.floor(this.time) % alive.length];
      this.splash = { x: Math.max(this.start + 70, Math.min(this.start + 880, target.x)), time: 0 };
      this.paintTime = 3.5;
    }
    if (this.splash) {
      this.splash.time += dt;
      if (this.splash.time >= 1.2) {
        pools.push({ x: this.splash.x - 48, w: 96, color: ['#e746b9', '#32d6d3', '#ab68ff'][Math.floor(this.time) % 3] });
        if (pools.length > 6) pools.shift();
        this.splash = null;
      }
    }
    if (this.phase === 'STUNNED') {
      this.stun -= dt;
      for (const p of alive) {
        if (p.state === 'ATTACKING' && p.attackTimer < .1 && Math.abs(p.x - this.inkX) < 110 && Math.abs(p.y - 225) < 48 && p.direction > 0) {
          this.health--;
          this.phase = this.health <= 0 ? 'DEFEATED' : 'FIGHT';
          this.duffHits = 0; this.hitCooldown = .6; this.climbers.clear();
          players.forEach(hero => { if (hero.health > 0) { hero.x = this.start + 260; hero.y = 360; hero.vy = -4; hero.onGround = false; } });
          pools.splice(0, pools.length); this.splash = null;
          return;
        }
      }
      if (this.stun <= 0) { this.phase = 'FIGHT'; this.duffHits = 0; this.climbers.clear(); }
      return;
    }
    const target = alive.reduce((a, b) => Math.abs(a.x - this.duffX) < Math.abs(b.x - this.duffX) ? a : b);
    this.direction = Math.sign(target.x - this.duffX) || this.direction;
    this.attackTime = (this.attackTime + dt) % 1.65;
    if (this.attackTime < .8 && Math.abs(target.x - this.duffX) > 65) this.duffX += Math.sign(target.x - this.duffX) * dt * 95;
    this.duffX = Math.max(this.start + 85, Math.min(this.start + 620, this.duffX));
    for (const p of alive) {
      if (p.state === 'ATTACKING' && p.attackTimer < .1 && this.hitCooldown === 0 && Math.abs(p.x - this.duffX) < 88 && Math.abs(p.y - 430) < 55 && (this.duffX - p.x) * p.direction >= -12) {
        this.duffHits++; this.hitCooldown = .42;
        if (this.duffHits === 3) { this.phase = 'STUNNED'; this.stun = 8; this.attackTime = 0; return; }
      }
      if (this.attackTime > 1.1 && this.attackTime < 1.3 && Math.abs(p.x - this.duffX) < 108 && p.y > 385) p.takeDamage(2, Math.sign(p.x - this.duffX) || -1, 6);
    }
  }
  draw(ctx: CanvasRenderingContext2D, camera: number, language: 'en' | 'es') {
    if (this.phase === 'WAITING') return;
    ctx.save();
    const sx = this.start - camera, ladder = this.ladderX - camera, ink = this.inkX - camera;
    ctx.fillStyle = '#33203f'; ctx.fillRect(sx + 650, 255, 280, 25);
    ctx.fillStyle = this.phase === 'STUNNED' ? '#ffe7a3' : '#63545e';
    ctx.fillRect(ladder - 18, 255, 7, 205); ctx.fillRect(ladder + 12, 255, 7, 205);
    for (let y = 269; y < 450; y += 23) ctx.fillRect(ladder - 14, y, 30, 5);
    ctx.fillStyle = '#211529'; ctx.fillRect(ink - 65, 105, 130, 142);
    ctx.fillRect(ink - 94, 150, 32, 100); ctx.fillRect(ink + 63, 150, 32, 100);
    ctx.fillStyle = '#8b3cb5'; ctx.fillRect(ink - 58, 111, 116, 10);
    const defeated = this.phase === 'DEFEATED';
    ctx.fillStyle = defeated ? '#584064' : '#fca1f1';
    ctx.fillRect(ink - 38, 139, 27, defeated ? 3 : 12); ctx.fillRect(ink + 12, 139, 27, defeated ? 3 : 12);
    ctx.fillStyle = '#c346c4'; ctx.fillRect(ink - 32, 182, 64, 13);
    for (let i = 0; i < 7; i++) { ctx.fillStyle = ['#a345c8', '#e459bc', '#56d7d0'][i % 3]; ctx.fillRect(ink - 58 + i * 18, 230, 7, 14 + Math.sin(this.time * 3 + i) * 6); }
    const dx = this.duffX - camera;
    ctx.save(); ctx.translate(dx, defeated ? 457 : 430);
    if (defeated) ctx.rotate(Math.PI / 2);
    ctx.strokeStyle = this.hitCooldown > 0 ? '#fff' : '#b9c0d5'; ctx.lineWidth = 5;
    ctx.strokeRect(-12, -66, 24, 20);
    const stride = this.phase === 'FIGHT' && this.attackTime < .8 ? Math.sin(this.time * 13) * 9 : 0;
    ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(0, 0); ctx.lineTo(-17 + stride, 30); ctx.moveTo(0, 0); ctx.lineTo(17 - stride, 30);
    ctx.moveTo(0, -32); ctx.lineTo(-17, -18); ctx.moveTo(0, -32); ctx.lineTo(this.direction * 15, -29); ctx.stroke();
    ctx.fillStyle = '#965a58'; ctx.fillRect(-18, -72, 36, 9); ctx.fillStyle = '#f6dfa5'; ctx.fillRect(-24, -83, 7, 19); ctx.fillRect(17, -83, 7, 19);
    ctx.fillStyle = '#252239'; ctx.fillRect(-8, -61, 5, 5); ctx.fillRect(4, -61, 5, 5);
    ctx.save(); ctx.translate(this.direction * 15, -29); ctx.scale(this.direction, 1); ctx.rotate(this.phase === 'STUNNED' ? .9 : this.attackTime < 1.1 ? -1.5 : Math.sin((this.attackTime - 1.1) * 11) * 1.5);
    ctx.fillStyle = '#e4e9fc'; ctx.fillRect(0, -3, 74, 6); ctx.fillStyle = '#ffcc72'; ctx.fillRect(6, -12, 6, 24); ctx.restore();
    if (this.phase === 'STUNNED') { ctx.fillStyle = '#ffe890'; ctx.font = '22px monospace'; ctx.fillText('* * *', -28, -92 + Math.sin(this.time * 9) * 4); }
    ctx.restore();
    if (this.splash) {
      const x = this.splash.x - camera;
      ctx.fillStyle = '#ff7ee8'; ctx.fillRect(x - 48, 454, 96, 5);
      ctx.fillStyle = '#a755e9'; ctx.fillRect(x - 9, -20 + this.splash.time / 1.2 * 470, 18, 26);
    }
    ctx.textAlign = 'center'; ctx.font = 'bold 17px monospace'; ctx.fillStyle = '#ffe9b4';
    ctx.fillText(defeated ? (language === 'es' ? '¡GALERÍA LIBRE! SIGUE A LA BANDERA' : 'GALLERY CLEAR! REACH THE FLAG') : this.phase === 'STUNNED'
      ? (language === 'es' ? `¡SUBE! W / ↑ · ${Math.ceil(this.stun)} s` : `CLIMB! W / ↑ · ${Math.ceil(this.stun)} s`)
      : (language === 'es' ? `DUFF: ${this.duffHits}/3 GOLPES PARA ATURDIR` : `DUFF: ${this.duffHits}/3 HITS TO STUN`), 500, 66);
    ctx.fillStyle = '#33203f'; ctx.fillRect(345, 83, 310, 14);
    ctx.fillStyle = '#d64aa9'; ctx.fillRect(348, 86, 304 * this.health / 4, 8);
    ctx.restore();
  }
}
