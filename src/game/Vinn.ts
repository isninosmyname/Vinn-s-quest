export type GameState = 'IDLE' | 'WALKING' | 'ATTACKING' | 'DAMAGED' | 'JUMPING' | 'SINKING';

export class Vinn {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  state: GameState = 'IDLE';
  direction: number = 1;
  animTimer: number = 0;
  attackTimer: number = 0;
  groundY: number;
  onGround: boolean = true;
  
  hasDoubleJump: boolean = false;
  canDoubleJump: boolean = false;
  
  isSinking: boolean = false;
  sinkTimer: number = 0;
  currentSpeedScale: number = 1.0;

  lastSafeX: number = 100;
  lastSafeY: number = 400;

  headRadius = 12;
  spineLength = 35;
  limbLength = 30;
  shoulderWidth = 20;
  hipWidth = 15;

  health: number = 20;
  maxHealth: number = 20;
  isHit: boolean = false;
  hitTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.groundY = y;
    this.lastSafeX = x;
    this.lastSafeY = y;
  }

  takeDamage(amount: number, knockbackDir?: number, knockbackForce: number = 10) {
    if (this.isHit) return;
    this.health -= amount;
    this.isHit = true;
    this.hitTimer = 0;
    
    if (knockbackDir !== undefined) {
        this.vx = knockbackDir * knockbackForce;
        this.vy = -5;
        this.onGround = false;
    }
  }

  knockback(dir: number, force: number) {
      this.vx = dir * force;
      this.vy = -3;
      this.onGround = false;
  }

  jump() {
    if (this.onGround || this.isSinking) {
      this.vy = -12;
      this.onGround = false;
      this.isSinking = false;
      this.canDoubleJump = this.hasDoubleJump;
      this.state = 'JUMPING';
    } else if (this.canDoubleJump) {
      this.vy = -10;
      this.canDoubleJump = false;
      this.state = 'JUMPING';
    }
  }

  update(dt: number, keys: Record<string, boolean>, maxX: number = 2350, platforms: {x: number, y: number, w: number, h: number, type?: 'MUSHROOM' | 'PAINT' | 'NORMAL'}[] = [], speedMult: number = 1.0) {
    this.animTimer += dt;
    this.currentSpeedScale = speedMult;

    if (this.isHit) {
      this.hitTimer += dt;
      if (this.hitTimer > 0.4) {
        this.isHit = false;
        this.hitTimer = 0;
      }
    }

    const gravity = this.isSinking ? 0.1 : 0.5;
    this.vy += gravity;
    
    if (this.isSinking) {
        this.vy = Math.min(this.vy, 1);
        this.y += this.vy;
        this.vx *= 0.5;
        this.sinkTimer += dt;
        if (this.sinkTimer > 2) {
            this.takeDamage(5);
            this.sinkTimer = 0;
        }
    } else {
        this.y += this.vy;
    }

    if (this.y + this.limbLength > this.groundY && this.groundY > 0) {
      this.y = this.groundY - this.limbLength;
      this.vy = 0;
      if (!this.onGround) {
          this.onGround = true;
          this.lastSafeX = this.x;
          this.lastSafeY = this.y;
      }
    }

    this.isSinking = false; 
    platforms.forEach(p => {
      if (this.x > p.x && this.x < p.x + p.w) {
        if (p.type === 'PAINT') {
            if (this.y >= p.y && this.y <= p.y + p.h) {
                this.isSinking = true;
                this.state = 'SINKING';
            }
        } else if (p.type === 'MUSHROOM') {
            if (this.vy > 0 && this.y + this.limbLength >= p.y - 10 && this.y + this.limbLength <= p.y + 10) {
                this.y = p.y - this.limbLength;
                this.vy = -18;
                this.onGround = false;
                this.state = 'JUMPING';
            }
        } else {
            if (this.vy > 0 && this.y + this.limbLength >= p.y && this.y + this.limbLength <= p.y + 10) {
                this.y = p.y - this.limbLength;
                this.vy = 0;
                this.onGround = true;
                this.lastSafeX = this.x;
                this.lastSafeY = this.y;
            }
        }
      }
    });

    if (this.state === 'ATTACKING') {
      this.attackTimer += dt;
      if (this.attackTimer > 0.4) {
        this.state = this.onGround ? 'IDLE' : 'JUMPING';
        this.attackTimer = 0;
      }
      return; 
    }

    if (keys['a'] || keys['ArrowLeft']) {
      this.vx = (this.isSinking ? -1.5 : -4.5 * speedMult);
      this.direction = -1;
    } else if (keys['d'] || keys['ArrowRight']) {
      this.vx = (this.isSinking ? 1.5 : 4.5 * speedMult);
      this.direction = 1;
    } else {
      this.vx *= 0.8;
    }

    if (keys[' ']) {
      this.state = 'ATTACKING';
      this.attackTimer = 0;
    }

    this.x += this.vx;
    
    if (this.state !== 'ATTACKING' && !this.isSinking) {
      if (this.onGround) {
          if (Math.abs(this.vx) > 0.5) {
              this.state = 'WALKING';
          } else {
              this.state = 'IDLE';
          }
      } else {
          this.state = 'JUMPING';
      }
    }

    if (this.x < 50) this.x = 50;
    if (this.x > maxX) this.x = maxX;
    
    if (this.y > 600) {
        this.takeDamage(2);
        this.x = this.lastSafeX;
        this.y = this.lastSafeY - 50;
        this.vy = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const { x, y, direction, animTimer, state, attackTimer, isHit, isSinking } = this;
    const relX = x - cameraX;
    
    const walkCycle = (state === 'WALKING') ? Math.sin(animTimer * (12 * this.currentSpeedScale)) * 20 : 0;
    const idleCycle = (state === 'IDLE') ? Math.sin(animTimer * 3) * 5 : 0;

    ctx.save();
    ctx.strokeStyle = isHit ? '#fff' : '#00f2ff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = isHit ? '#fff' : '#00f2ff';

    ctx.beginPath();
    let headYOffset = this.spineLength + this.headRadius + idleCycle;
    if (isSinking) headYOffset -= Math.sin(animTimer * 2) * 2;
    ctx.arc(relX, y - headYOffset, this.headRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    const neckY = y - this.spineLength - (isSinking ? 0 : idleCycle);
    const hipY = y;
    ctx.beginPath();
    ctx.moveTo(relX, neckY);
    ctx.lineTo(relX, hipY);
    ctx.stroke();

    let legOffset = walkCycle;
    if (state === 'JUMPING') legOffset = 15;
    if (isSinking) legOffset = Math.sin(animTimer * 15) * 10;
    
    ctx.beginPath();
    ctx.moveTo(relX, hipY);
    ctx.lineTo(relX - (direction * legOffset), hipY + (state === 'JUMPING' ? 15 : this.limbLength));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(relX, hipY);
    ctx.lineTo(relX + (direction * legOffset), hipY + (state === 'JUMPING' ? 15 : this.limbLength));
    ctx.stroke();

    let armAngle = 0;
    if (state === 'ATTACKING') {
      armAngle = -Math.PI / 2 + (attackTimer * 10) * direction;
    } else if (state === 'JUMPING') {
      armAngle = -Math.PI / 4 * direction;
    } else if (isSinking) {
      armAngle = -Math.PI/2 + Math.sin(animTimer * 10) * 0.5;
    }

    const shoulderY = neckY + 10;
    ctx.beginPath();
    ctx.moveTo(relX, shoulderY);
    ctx.lineTo(relX - 15 * direction, shoulderY + 15);
    ctx.stroke();

    const elbowX = relX + Math.cos(armAngle) * this.limbLength * direction;
    const elbowY = shoulderY + Math.sin(armAngle) * this.limbLength;
    ctx.beginPath();
    ctx.moveTo(relX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.stroke();

    if (state !== 'DAMAGED') {
        const swordLen = 50;
        const sAngle = armAngle - 0.5 * direction;
        const sx = elbowX + Math.cos(sAngle) * swordLen * direction;
        const sy = elbowY + Math.sin(sAngle) * swordLen;
        
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(elbowX, elbowY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    ctx.restore();
  }
}
