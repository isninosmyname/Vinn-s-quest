export type BossType = 'GOLEM' | 'BLAZE_KING' | 'INK_COLOSSUS';

export class Boss {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  type: BossType;
  state: string = 'IDLE';
  introPlayed: boolean = false;
  animTimer: number = 0;
  isHit: boolean = false;
  hitTimer: number = 0;
  attackTimer: number = 0;
  phase: number = 1;
  isInvulnerable: boolean = false;
  direction: number = -1;
  fireballDirection: number = 0;

  constructor(x: number, y: number, type: BossType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.health = type === 'GOLEM' ? 80 : (type === 'BLAZE_KING' ? 150 : 300);
    this.maxHealth = this.health;
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

    if (this.health < this.maxHealth * 0.5) this.phase = 2;

    const dist = playerX - this.x;
    this.direction = dist > 0 ? 1 : -1;
    this.isInvulnerable = false;
    
    if (this.type === 'GOLEM') {
        if (this.state === 'IDLE') {
            this.isInvulnerable = true;
        } else if (this.state === 'FLY_UP') {
            this.isInvulnerable = true;
            this.y -= 15;
            if (this.y < -300) {
                this.state = 'RAINING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'RAINING') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            if (this.attackTimer > 2.5) {
                this.state = 'FALLING';
                this.x = playerX;
                this.y = -200;
                this.attackTimer = 0;
            }
        } else if (this.state === 'FALLING') {
            this.isInvulnerable = true;
            this.y += 18;
            if (this.y >= 460) {
                this.y = 460;
                this.state = 'STUNNED';
                this.attackTimer = 0;
            }
        } else if (this.state === 'STUNNED') {
            this.isInvulnerable = false;
            this.attackTimer += dt;
            if (this.attackTimer > 4.0) {
                this.state = 'WAKING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'WAKING') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            if (this.attackTimer > 1.0) {
                this.state = 'FLY_UP';
            }
        }
    } else if (this.type === 'BLAZE_KING') {
        const lowHealth = this.health < this.maxHealth * 0.35;
        if (this.state === 'FLY_UP') {
            this.state = 'WALKING';
            this.attackTimer = 0;
        }

        if (this.state === 'WALKING' || this.state === 'IDLE') {
            this.x += Math.sin(this.animTimer * 3) * 5;
            if (Math.abs(dist) < 400) {
                this.x += (dist > 0 ? 1 : -1) * (this.phase === 2 ? 4 : 2);
            }
            this.state = 'WALKING';
            this.attackTimer += dt;
            const cooldown = lowHealth ? 2.5 : 3.8;
            if (this.attackTimer > cooldown) {
                this.attackTimer = 0;
                this.state = 'FIRE_SUMMON';
                this.isInvulnerable = true;
            }
        } else if (this.state === 'FIRE_SUMMON') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            if (this.attackTimer > (lowHealth ? 0.6 : 0.8)) {
                this.attackTimer = 0;
                this.state = lowHealth ? 'LAVA_THROW' : 'BACKING';
            }
        } else if (this.state === 'BACKING') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            this.x -= this.direction * 3;
            if (this.attackTimer > 1.2) {
                this.attackTimer = 0;
                this.fireballDirection = dist > 0 ? 1 : -1;
                this.state = 'FIREBALL';
            }
        } else if (this.state === 'FIREBALL') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            this.x += this.fireballDirection * (this.phase === 2 ? 4 : 2);
            if (this.attackTimer > 2.2) {
                this.attackTimer = 0;
                this.state = 'STUNNED';
            }
        } else if (this.state === 'LAVA_THROW') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            if (this.attackTimer > 0.9) {
                this.attackTimer = 0;
                this.state = 'STUNNED';
            }
        } else if (this.state === 'STUNNED') {
            this.isInvulnerable = false;
            this.attackTimer += dt;
            if (this.attackTimer > 4.0) {
                this.state = 'WAKING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'WAKING') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            if (this.attackTimer > 1.0) {
                this.state = 'WALKING';
                this.attackTimer = 0;
            }
        }
    } else if (this.type === 'INK_COLOSSUS') {
        this.x += (dist > 0 ? 0.8 : -0.8);
        this.state = 'ATTACKING';
        this.attackTimer += dt;
        if (Math.sin(this.animTimer * 2) > 0.5) {
            this.isInvulnerable = true;
        }
    }
  }

  takeDamage(amount: number) {
    if (this.isInvulnerable || this.isHit) return false;
    this.health -= amount;
    this.isHit = true;
    this.hitTimer = 0;
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const relX = this.x - cameraX;
    const { type, animTimer, isHit, state, attackTimer, isInvulnerable, direction } = this;

    ctx.save();
    ctx.shadowBlur = isInvulnerable ? 40 : 20;
    ctx.shadowColor = isInvulnerable ? '#fff' : (type === 'GOLEM' ? '#2d3e12' : '#ff4500');

    if (type === 'GOLEM') {
      ctx.fillStyle = isHit ? '#fff' : (isInvulnerable ? '#7a8d53' : '#4a5d23');
      ctx.strokeStyle = isInvulnerable ? '#fff' : '#2d3e12';
      ctx.lineWidth = 5;
      
      const bounce = Math.sin(animTimer * 2) * 10;
      ctx.beginPath(); ctx.rect(relX - 60, this.y - 120 + bounce, 120, 120); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(relX - 30, this.y - 160 + bounce, 60, 60); ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = isInvulnerable ? '#fff' : '#00ffcc';
      ctx.beginPath();
      ctx.arc(relX - 15, this.y - 135 + bounce, 5, 0, Math.PI*2);
      ctx.arc(relX + 15, this.y - 135 + bounce, 5, 0, Math.PI*2);
      ctx.fill();

      if (state === 'ATTACKING' || state === 'WAKING') {
          const swipeAngle = (attackTimer < 0.8) ? -0.5 : (attackTimer - 0.8) * 4;
          ctx.strokeStyle = isInvulnerable ? '#fff' : '#ffcc00';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(relX, this.y - 80);
          ctx.lineTo(relX + direction * Math.cos(swipeAngle) * 120, this.y - 80 + Math.sin(swipeAngle) * 100);
          ctx.stroke();
      }
    } else if (type === 'BLAZE_KING') {
      ctx.shadowColor = isInvulnerable ? '#fff' : '#ff4500';
      const flicker = Math.random() * 20;
      const gradient = ctx.createRadialGradient(relX, this.y - 60, 10, relX, this.y - 60, 80 + flicker);
      gradient.addColorStop(0, isInvulnerable ? '#fff' : '#fff');
      gradient.addColorStop(0.2, isInvulnerable ? '#00ffff' : '#ffcc00');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(relX, this.y - 60, 60 + flicker/2, 0, Math.PI * 2); ctx.fill();
      
      ctx.fillStyle = isInvulnerable ? '#fff' : '#ff2200';
      for(let i=0; i<5; i++) {
          ctx.beginPath();
          ctx.moveTo(relX - 40 + i*20, this.y - 110);
          ctx.lineTo(relX - 30 + i*20, this.y - 150 - Math.random()*20);
          ctx.lineTo(relX - 20 + i*20, this.y - 110);
          ctx.fill();
      }
    } else if (type === 'INK_COLOSSUS') {
      ctx.shadowColor = isInvulnerable ? '#fff' : '#ff00ff';
      ctx.fillStyle = isHit ? '#fff' : (isInvulnerable ? '#333' : '#000');
      
      ctx.beginPath();
      for(let i=0; i<12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = (isInvulnerable ? 130 : 100) + Math.sin(animTimer * 5 + i) * 30;
        const tx = relX + Math.cos(angle) * r;
        const ty = this.y - 100 + Math.sin(angle) * r;
        if(i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = isInvulnerable ? '#fff' : '#ff00ff';
      for(let i=0; i<5; i++) {
          ctx.beginPath(); ctx.arc(relX - 40 + i*20, this.y - 100 + Math.sin(animTimer*3 + i)*20, 8, 0, Math.PI*2); ctx.fill();
      }
    }

    ctx.restore();
  }
}
