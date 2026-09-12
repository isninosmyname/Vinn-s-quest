import type { GameState } from './Vinn';

export type EnemyType = 'REGULAR' | 'TECH' | 'ELITE' | 'WOLF' | 'BEAR';

export class Enemy {
  x: number;
  y: number;
  health: number = 3;
  type: EnemyType;
  state: GameState = 'IDLE';
  animTimer: number = 0;
  isHit: boolean = false;
  hitTimer: number = 0;
  attackTimer: number = 0;
  vy: number = 0;
  onGround: boolean = true;
  limbLength: number = 30;
  hidden = false;
  direction = 1;
  homeX: number;
  maxHealth = 3;

  constructor(x: number, y: number, type: EnemyType = 'REGULAR') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.homeX = x;
    if (type === 'TECH') this.health = 4;
    if (type === 'WOLF') { this.health = 3; this.hidden = true; }
    if (type === 'BEAR') this.health = 16;
    this.maxHealth = this.health;
  }

  update(dt: number, playerX: number, platforms: {x: number, y: number, w: number, h?: number, type?: string}[] = []) {
    this.animTimer += dt;
    if (this.health <= 0) return;
    const animal = this.type === 'WOLF' || this.type === 'BEAR';
    if (this.hidden) {
      if (Math.abs(playerX - this.x) > 210) return;
      this.hidden = false;
      this.state = 'ATTACKING'; this.attackTimer = 0;
    }
    if (this.isHit) {
      this.hitTimer += dt;
      if (this.hitTimer > 0.2) {
        this.isHit = false;
        this.hitTimer = 0;
      }
    }

    // Apply gravity
    this.vy += 0.5;
    const prevY = this.y;
    this.y += this.vy;

    this.onGround = false;
    platforms.forEach(p => {
      const platformLeft = p.x;
      const platformRight = p.x + p.w;
      const bottom = this.y + this.limbLength;
      const prevBottom = prevY + this.limbLength;
      const isAbovePlatform = this.x >= platformLeft && this.x <= platformRight;

      if (!isAbovePlatform) return;

      if (this.vy > 0 && prevBottom <= p.y && bottom >= p.y) {
          this.y = p.y - this.limbLength;
          this.vy = 0;
          this.onGround = true;
      }
    });

    const distX = playerX - this.x;
    this.direction = distX > 0 ? 1 : -1;
    
    if (Math.abs(distX) < 400 && this.state !== 'ATTACKING') {
      if (Math.abs(distX) > 40) {
        this.state = 'WALKING';
        const speed = this.type === 'WOLF' ? 3.4 : this.type === 'BEAR' ? 1.6 : this.type === 'TECH' ? 2.5 : 2;
        const nextX = this.x + this.direction * speed * Math.min(2, dt * 60);
        if (!animal || platforms.some(p => nextX > p.x + 18 && nextX < p.x + p.w - 18 && Math.abs(p.y - (this.y + 30)) < 5)) this.x = nextX;
      } else {
        this.state = 'ATTACKING';
        this.attackTimer = 0;
      }
    } else {
        if (this.state !== 'ATTACKING') this.state = 'IDLE';
    }

    if (this.state === 'ATTACKING') {
        this.attackTimer += dt;
        if (this.attackTimer > (animal ? 1.5 : 0.6)) {
            this.state = 'IDLE';
            this.attackTimer = 0;
        }
    }

    // Kill enemy if they fall off-screen
    if (this.y > 600) {
        this.health = 0;
    }
  }

  takeDamage() {
    if (this.isHit || this.hidden || this.health <= 0) return false;
    this.health -= 1;
    this.isHit = true;
    this.hitTimer = 0;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const relX = this.x - cameraX;
    if (this.type === 'WOLF' || this.type === 'BEAR') {
      ctx.save(); ctx.translate(Math.round(relX), Math.round(this.y + 30)); ctx.scale(this.direction, 1);
      const bear = this.type === 'BEAR';
      if (this.hidden) {
        ctx.fillStyle = '#ffe68a'; ctx.fillRect(-10, -20, 4, 3); ctx.fillRect(2, -20, 4, 3);
        ctx.restore(); return;
      }
      const windup = this.state === 'ATTACKING' && this.attackTimer < 0.65;
      const swipe = this.state === 'ATTACKING' && this.attackTimer >= 0.65 && this.attackTimer < 0.95;
      const step = this.state === 'WALKING' ? Math.round(Math.sin(this.animTimer * 13) * 7) : 0;
      const fur = this.isHit ? '#fff1ce' : bear ? '#80533d' : '#9bacb2';
      ctx.fillStyle = fur; ctx.fillRect(bear ? -44 : -34, bear ? -72 : -40, bear ? 78 : 60, bear ? 58 : 24);
      ctx.fillRect(bear ? 12 : 18, bear ? -83 : -52, bear ? 42 : 29, bear ? 38 : 24);
      ctx.fillRect(bear ? 15 : 20, bear ? -92 : -62, 10, 14); ctx.fillRect(bear ? 40 : 36, bear ? -92 : -62, 9, 14);
      ctx.fillStyle = bear ? '#bc9471' : '#dae3d6'; ctx.fillRect(bear ? 35 : 35, bear ? -61 : -36, 25, 14);
      ctx.fillStyle = '#152b2c'; ctx.fillRect(bear ? 39 : 34, bear ? -76 : -48, 5, 5);
      ctx.fillRect(bear ? 55 : 55, bear ? -62 : -37, 7, 7);
      ctx.fillStyle = fur;
      ctx.fillRect(-30 + step, -20, 12, 20); ctx.fillRect(14 - step, -20, 12, 20);
      if (!bear) { ctx.fillRect(-48, -44, 19, 10); ctx.fillRect(-54, -50, 10, 12); }
      if (swipe) { ctx.fillStyle = '#fff2c5'; for (let i = 0; i < 3; i++) ctx.fillRect(48 + i * 8, -56 + i * 9, 32, 4); }
      ctx.restore(); ctx.save(); ctx.fillStyle = '#1c2030'; ctx.fillRect(relX - 40, this.y - 78, 80, 6);
      ctx.fillStyle = '#f17b68'; ctx.fillRect(relX - 40, this.y - 78, 80 * this.health / this.maxHealth, 6);
      if (windup) { ctx.fillStyle = '#ffdb70'; ctx.font = 'bold 22px monospace'; ctx.fillText('!', relX - 5, this.y - 86); }
      ctx.restore(); return;
    }
    ctx.save();
    
    const color = this.type === 'TECH' ? '#ff3333' : '#fff';
    ctx.strokeStyle = this.isHit ? '#f00' : color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    const walkCycle = this.state === 'WALKING' ? Math.sin(this.animTimer * 10) * 15 : 0;
    const bodyBounce = this.state === 'WALKING' ? Math.abs(Math.cos(this.animTimer * 10)) * 5 : 0;

    ctx.beginPath();
    ctx.arc(relX, this.y - 50 - bodyBounce, 10, 0, Math.PI * 2);
    ctx.stroke();

    if (this.type === 'TECH') {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(relX + 3, this.y - 52 - bodyBounce, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(relX, this.y - 40 - bodyBounce);
    ctx.lineTo(relX, this.y - bodyBounce);
    ctx.stroke();

    const armY = this.state === 'ATTACKING' ? (this.attackTimer < 0.3 ? -40 : -10) : -20;
    ctx.beginPath();
    ctx.moveTo(relX, this.y - 30 - bodyBounce);
    ctx.lineTo(relX - 15, this.y + armY - bodyBounce);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(relX, this.y - 30 - bodyBounce);
    ctx.lineTo(relX + 15, this.y + armY - bodyBounce);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(relX, this.y - bodyBounce);
    ctx.lineTo(relX - walkCycle, this.y + this.limbLength);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(relX, this.y - bodyBounce);
    ctx.lineTo(relX + walkCycle, this.y + this.limbLength);
    ctx.stroke();

    ctx.fillStyle = '#ff2d55';
    ctx.fillRect(relX - 15, this.y - 75, 30 * (this.health / (this.type === 'TECH' ? 4 : 3)), 4);

    ctx.restore();
  }
}
