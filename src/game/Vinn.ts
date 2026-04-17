export type GameState = 'IDLE' | 'WALKING' | 'ATTACKING' | 'DAMAGED' | 'JUMPING' | 'SINKING' | 'AIMING';

export class Vinn {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  state: GameState = 'IDLE';
  direction: number = 1;
  animTimer: number = 0;
  attackTimer: number = 0;
  onGround: boolean = true;
  
  hasDoubleJump: boolean = false;
  canDoubleJump: boolean = false;
  
  isSinking: boolean = false;
  sinkTimer: number = 0;
  isSlipping: boolean = false;
  slipTimer: number = 0;
  slipVx: number = 0;
  slipCooldown: number = 0;
  currentSpeedScale: number = 1.0;
  visualType: 'NORMAL' | 'SPIKY' = 'NORMAL';
  weapon: 'SWORD' | 'HAND' = 'SWORD';
  playerName: string = 'P1';
  isAiming: boolean = false;
  aimAngle: number = 0;
  aimTimer: number = 0;
  lastSafeX: number = 100;
  lastSafeY: number = 400;

  jumpCharges: number = 0;
  maxJumpCharges: number = 3;
  rechargeTimer: number = 0;

  headRadius = 12;
  spineLength = 35;
  limbLength = 30;
  shoulderWidth = 20;
  hipWidth = 15;

  health: number = 20;
  maxHealth: number = 20;
  isHit: boolean = false;
  hitTimer: number = 0;
  color: string = '#00f2ff';

  constructor(x: number, y: number, color: string = '#00f2ff', visualType: 'NORMAL' | 'SPIKY' = 'NORMAL', name: string = 'P1') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.visualType = visualType;
    this.playerName = name;
    this.lastSafeX = x;
    this.lastSafeY = y;
  }

  reset(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.health = this.maxHealth;
      this.state = 'IDLE';
      this.onGround = true;
      this.isHit = false;
      this.hitTimer = 0;
      this.isSinking = false;
      this.isSlipping = false;
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

  startSlip(direction: number = 1) {
    if (this.slipCooldown > 0 || this.isSlipping) return;
    this.isSlipping = true;
    this.slipTimer = 0;
    this.vx = direction * 5; // Initial tumble velocity
  }

  jump() {
    if (this.onGround || this.isSinking) {
      this.vy = -12;
      this.onGround = false;
      this.isSinking = false;
      this.state = 'JUMPING';
    } else if (this.jumpCharges > 0) {
      this.vy = -10;
      this.jumpCharges--;
      this.state = 'JUMPING';
    }
  }

  update(dt: number, keys: Record<string, boolean>, maxX: number = 2350, platforms: {x: number, y: number, w: number, h: number, type?: 'MUSHROOM' | 'PAINT' | 'NORMAL'}[] = [], speedMult: number = 1.0, minX: number = 50) {
    this.animTimer += dt;
    
    if (this.speedBoostTimer > 0) {
        this.speedBoostTimer -= dt;
        speedMult *= 1.5;
    }
    this.currentSpeedScale = speedMult;

    // Recharge logic: 1 charge every 4 seconds
    if (this.jumpCharges < this.maxJumpCharges) {
        this.rechargeTimer += dt;
        if (this.rechargeTimer >= 4.0) {
            this.jumpCharges++;
            this.rechargeTimer = 0;
        }
    } else {
        this.rechargeTimer = 0;
    }

    if (this.health <= 0) {
        if (keys[' ']) {
            this.health = this.maxHealth;
            this.x = this.lastSafeX;
            this.y = this.lastSafeY;
        }
        return;
    }

    if (this.state === 'AIMING') {
      this.vx = 0;
      this.vy = 0;
      this.aimTimer += dt;
      // Allow turning while aiming
      if (keys['a'] || keys['ArrowLeft']) this.direction = -1;
      else if (keys['d'] || keys['ArrowRight']) this.direction = 1;

      // Oscillate angle between 0 (horizontal) and -PI/2 (vertical up)
      const oscillation = (Math.sin(this.aimTimer * 3.5) + 1) / 2;
      this.aimAngle = -oscillation * (Math.PI / 2);
      return; 
    }

    if (this.isHit) {
      this.hitTimer += dt;
      if (this.hitTimer > 0.4) {
        this.isHit = false;
        this.hitTimer = 0;
      }
    }

    const gravity = this.isSinking ? 0.1 : 0.5;
    this.vy += gravity;
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

      if (p.type === 'PAINT' || p.type === 'NORMAL' || (!p.type)) {
          if (this.vy > 0 && prevBottom <= p.y && bottom >= p.y) {
              this.y = p.y - this.limbLength;
              this.vy = 0;
              this.onGround = true;
              this.lastSafeX = this.x;
              this.lastSafeY = this.y;
          }
      } else if (p.type === 'MUSHROOM') {
          if (this.vy > 0 && prevBottom <= p.y + 5 && bottom >= p.y - 5) {
              this.y = p.y - this.limbLength;
              this.vy = -18;
              this.onGround = false;
              this.state = 'JUMPING';
          }
      } else {
          if (this.vy > 0 && prevBottom <= p.y && bottom >= p.y) {
              this.y = p.y - this.limbLength;
              this.vy = 0;
              this.onGround = true;
              this.lastSafeX = this.x;
              this.lastSafeY = this.y;
          }
      }
    });

    if (this.isSinking) {
        this.vy = Math.min(this.vy, 1);
        this.vx *= 0.5;
        this.sinkTimer += dt;
        if (this.sinkTimer > 2) {
            this.takeDamage(5);
            this.sinkTimer = 0;
        }
    }

    if (this.state === 'ATTACKING') {
      this.attackTimer += dt;
      if (this.attackTimer > 0.4) {
        this.state = this.onGround ? 'IDLE' : 'JUMPING';
        this.attackTimer = 0;
      }
      return; 
    }

    // Cooldown after getting up
    if (this.slipCooldown > 0) this.slipCooldown -= dt;

    // FALLEN state — player is flat on the ground, can't move or attack
    if (this.isSlipping) {
      this.slipTimer += dt;
      this.vx = 0;
      this.vy = 0;
      this.onGround = true;
      if (this.slipTimer > 1.0) {
        this.isSlipping = false;
        this.slipTimer = 0;
        this.slipCooldown = 1.5; // immune for 1.5s after standing up
      }
      // Can't do anything while fallen — skip the rest of movement
      return;
    } else {
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


    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    
    if (this.y > 600) {
        this.takeDamage(2);
        this.x = this.lastSafeX;
        this.y = this.lastSafeY - 50;
        this.vy = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number = 0) {
    const { x, y, direction, animTimer, state, attackTimer, isHit, isSinking, color, visualType, health, speedBoostTimer } = this;
    const relX = x - cameraX;
    const relY = y - cameraY;

    if (speedBoostTimer > 0) {
        ctx.shadowColor = `hsl(${(animTimer * 500) % 360}, 100%, 50%)`;
        ctx.shadowBlur = 15;
    }
     if (health <= 0) {
        ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(relX, relY, 10, 0, Math.PI*2); ctx.stroke();
        ctx.strokeRect(relX - 10, relY + 15, 20, 2);
        ctx.restore(); return;
    }

    const walkCycle = (state === 'WALKING') ? Math.sin(animTimer * (12 * this.currentSpeedScale)) * 20 : 0;
    const idleCycle = (state === 'IDLE') ? Math.sin(animTimer * 3) * 5 : 0;

    // Draw player fallen flat on the floor
    if (this.isSlipping) {
        ctx.save();
        ctx.strokeStyle = isHit ? '#fff' : color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;

        const dir = this.direction;
        const fy = relY + 28; // ground level for the horizontal body

        // Head (circle on the side)
        ctx.beginPath();
        ctx.arc(relX + dir * 32, fy, this.headRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Body (horizontal spine)
        ctx.beginPath();
        ctx.moveTo(relX + dir * 18, fy);
        ctx.lineTo(relX - dir * 18, fy);
        ctx.stroke();

        // Legs (angled up slightly)
        ctx.beginPath();
        ctx.moveTo(relX - dir * 10, fy);
        ctx.lineTo(relX - dir * 10, fy - 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(relX - dir * 22, fy);
        ctx.lineTo(relX - dir * 22, fy - 18);
        ctx.stroke();

        // Arms (limp)
        ctx.beginPath();
        ctx.moveTo(relX, fy - 4);
        ctx.lineTo(relX + dir * 10, fy - 18);
        ctx.stroke();

        // Stars / daze above head
        const daze = ['*', '✦', '*'];
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        for (let i = 0; i < 3; i++) {
            const angle = (Date.now() / 300 + i * 2.1);
            const sx = relX + dir * 32 + Math.cos(angle) * 16;
            const sy = fy - 22 + Math.sin(angle) * 6;
            ctx.fillText(daze[i], sx, sy);
        }

        ctx.restore();
        return; // skip normal draw
    }
 
    ctx.save();
    ctx.strokeStyle = isHit ? '#fff' : color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = isHit ? '#fff' : color;

    ctx.beginPath();
    let headYOffset = this.spineLength + this.headRadius + idleCycle;
    const headY = relY - headYOffset;
    if (isSinking) headYOffset -= Math.sin(animTimer * 2) * 2;
    ctx.arc(relX, headY, this.headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Spiky Hair/Hat for Player 2
    if (visualType === 'SPIKY') {
        ctx.beginPath();
        ctx.moveTo(relX - 15, headY - 10);
        ctx.lineTo(relX - 5, headY - 25);
        ctx.lineTo(relX, headY - 12);
        ctx.lineTo(relX + 5, headY - 25);
        ctx.lineTo(relX + 15, headY - 10);
        ctx.stroke();
    }

    ctx.lineWidth = 4;
    const neckY = relY - this.spineLength - (isSinking ? 0 : idleCycle);
    const hipY = relY;
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
        if (this.weapon === 'SWORD') {
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
        } else if (this.weapon === 'HAND') {
            const punchExt = state === 'ATTACKING' ? 25 : 5;
            const hx = elbowX + Math.cos(armAngle) * punchExt * direction;
            const hy = elbowY + Math.sin(armAngle) * punchExt;
            
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(hx, hy + 2, 8, 0, Math.PI * 2);
            ctx.fill();

            if (state === 'ATTACKING') {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(elbowX, elbowY);
                ctx.lineTo(hx - 5 * direction, hy);
                ctx.stroke();
            }
        }
    }

    if (this.state === 'AIMING') {
        const retDistance = 140;
        const retX = relX + Math.cos(this.aimAngle) * retDistance * this.direction;
        const retY = relY - 30 + Math.sin(this.aimAngle) * retDistance;
        
        // Draw dotted guide line
        ctx.save();
        ctx.setLineDash([5, 8]);
        ctx.strokeStyle = 'rgba(255, 204, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(relX, relY - 30);
        ctx.lineTo(retX, retY);
        ctx.stroke();
        ctx.restore();

        // Draw Yellow "X" (reticle)
        ctx.save();
        ctx.translate(retX, retY);
        ctx.rotate(Math.PI / 4); // Rotate 45deg to make + into X
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
        ctx.moveTo(0, -15); ctx.lineTo(0, 15);
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore();
  }
}
