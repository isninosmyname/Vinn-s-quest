import type { GameState } from './Vinn';

export type EnemyType = 'REGULAR' | 'TECH' | 'ELITE';

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
  limbLength: number = 30;

  constructor(x: number, y: number, type: EnemyType = 'REGULAR') {
    this.x = x;
    this.y = y;
    this.type = type;
    if (type === 'TECH') this.health = 4;
  }

  update(dt: number, playerX: number) {
    this.animTimer += dt;
    if (this.isHit) {
      this.hitTimer += dt;
      if (this.hitTimer > 0.2) {
        this.isHit = false;
        this.hitTimer = 0;
      }
    }

    const distX = playerX - this.x;
    
    if (Math.abs(distX) < 400 && this.state !== 'ATTACKING') {
      if (Math.abs(distX) > 40) {
        this.state = 'WALKING';
        this.x += (distX > 0 ? 1 : -1) * (this.type === 'TECH' ? 2.5 : 2);
      } else {
        this.state = 'ATTACKING';
        this.attackTimer = 0;
      }
    } else {
        if (this.state !== 'ATTACKING') this.state = 'IDLE';
    }

    if (this.state === 'ATTACKING') {
        this.attackTimer += dt;
        if (this.attackTimer > 0.6) {
            this.state = 'IDLE';
            this.attackTimer = 0;
        }
    }
  }

  takeDamage() {
    if (this.isHit) return false;
    this.health -= 1;
    this.isHit = true;
    this.hitTimer = 0;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const relX = this.x - cameraX;
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
