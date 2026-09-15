import { LivingVolcano } from './LivingVolcano';
export type BossType = 'GOLEM' | 'BLAZE_KING' | 'INK_COLOSSUS' | 'LIVING_VOLCANO';

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
  // Ink Colossus specific
  inkHits: number = 0;
  throwTimer: number = 0;
  bombStunTimer: number = 0;
  throwReady: boolean = false; // signals App.tsx to spawn a projectile
  // Blaze King Overhaul
  rainTimer: number = 0;
  rainReady: boolean = false;
  volcano: LivingVolcano | null = null;
  private assistCooldown = 0;
  private assistStarted = false;
  defeatedFired: boolean = false;
  landingReady = false;

  constructor(x: number, y: number, type: BossType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.health = type === 'LIVING_VOLCANO' ? 120 : type === 'GOLEM' ? 80 : (type === 'BLAZE_KING' ? 150 : 300);
    this.maxHealth = this.health;
    if (type === 'LIVING_VOLCANO' || type === 'BLAZE_KING') this.volcano = new LivingVolcano(x);
  }

  update(dt: number, playerX: number) {
    if (this.health <= 0 && this.type !== 'INK_COLOSSUS') {
        this.state = 'DEFEATED'; this.volcano?.stop(); this.rainReady = false; return;
    }
    // Volcano-world encounters stay dormant until their entrance guide is finished.
    if (this.volcano && this.state === 'IDLE') return;
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
            this.y -= 900 * dt;
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
            this.y += 720 * dt; // Slower slam: give the player time to dodge.
            if (this.y >= 460) {
                this.y = 460;
                this.state = 'STUNNED';
                this.landingReady = true;
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
    } else if (this.type === 'LIVING_VOLCANO' && this.volcano) {
        if (this.volcano.phase === 'SLEEP') this.volcano.start(true);
        this.volcano.update(dt, playerX);
        this.state = this.volcano.phase === 'EXPOSED' ? 'DIZZY' : 'VOLCANO_ATTACK';
        this.isInvulnerable = this.state !== 'DIZZY';
        if (this.volcano.phase === 'EXPOSED' && this.volcano.timer >= 5) {
            this.volcano.start(true); this.state = 'VOLCANO_ATTACK'; this.isInvulnerable = true;
        }
    } else if (this.type === 'BLAZE_KING' && this.volcano) {
        const assisting = ['VOLCANO_RISE', 'VOLCANO_BEAM', 'VOLCANO_RETURN'].includes(this.state);
        if (!assisting) this.assistCooldown = Math.max(0, this.assistCooldown - dt);
        // Replace the old rage boost. Repeat only after another full normal attack cycle.
        if (!assisting && this.health < this.maxHealth * 0.4 && this.assistCooldown === 0 && (!this.assistStarted || this.state === 'WALKING')) {
            this.state = 'VOLCANO_RISE'; this.attackTimer = 0; this.rainReady = false;
            this.assistStarted = true;
        }
        if (this.state === 'VOLCANO_RISE') {
            this.isInvulnerable = true;
            this.y = Math.max(-170, this.y - 360 * dt);
            if (this.y <= -170) { this.state = 'VOLCANO_BEAM'; this.volcano.start(false); }
        } else if (this.state === 'VOLCANO_BEAM') {
            this.isInvulnerable = true; this.volcano.update(dt, playerX);
            if (this.volcano.phase === 'EXPOSED') { this.state = 'VOLCANO_RETURN'; this.volcano.stop(); }
        } else if (this.state === 'VOLCANO_RETURN') {
            this.isInvulnerable = true; this.y = Math.min(460, this.y + 340 * dt);
            if (this.y >= 460) { this.state = 'DIZZY'; this.isInvulnerable = false; this.attackTimer = 0; this.assistCooldown = 14; }
        } else if (this.state === 'WALKING') {
            this.x += Math.sin(this.animTimer * 3) * 150 * dt;
            if (Math.abs(dist) < 400) {
                this.x += (dist > 0 ? 1 : -1) * 180 * dt;
            }
            this.x = Math.max(this.volcano.center - 570, Math.min(this.volcano.center + 180, this.x));
            this.attackTimer += dt;
            const cooldown = 3.0;
            if (this.attackTimer > cooldown) {
                this.attackTimer = 0;
                this.state = 'RAINING_FIRE';
                this.rainTimer = 0;
            }
        } else if (this.state === 'RAINING_FIRE') {
            this.isInvulnerable = true;
            this.rainTimer += dt;
            this.attackTimer += dt;
            
            // Pulse the rain signal
            const rainInterval = 0.4;
            if (this.rainTimer > rainInterval) {
                this.rainTimer = 0;
                this.rainReady = true; // Signal App.tsx
            }

            const rainDuration = 2.5;
            if (this.attackTimer > rainDuration) {
                this.attackTimer = 0;
                this.state = 'AERIAL_CHASE';
            }
        } else if (this.state === 'AERIAL_CHASE') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            // Float higher
            const targetY = 220;
            this.y += (targetY - this.y) * (1 - Math.exp(-3 * dt));
            // Chase player X
            this.x += (dist > 0 ? 1 : -1) * 360 * dt;
            this.x = Math.max(this.volcano.center - 570, Math.min(this.volcano.center + 180, this.x));
            
            if (this.attackTimer > 2.0) {
                this.attackTimer = 0;
                this.state = 'CRUSHING';
            }
        } else if (this.state === 'CRUSHING') {
            this.isInvulnerable = true;
            this.y += 720 * dt;
            if (this.y >= 460) {
                this.y = 460;
                this.state = 'DIZZY';
                this.isInvulnerable = false;
                this.attackTimer = 0;
            }
        } else if (this.state === 'DIZZY') {
            this.isInvulnerable = false;
            this.attackTimer += dt;
            const dizzyDuration = 4.0;
            if (this.attackTimer > dizzyDuration) {
                this.state = 'WAKING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'WAKING') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            this.y += (300 - this.y) * (1 - Math.exp(-3 * dt)); // Return to hover height
            if (this.attackTimer > 1.0) {
                this.state = 'WALKING';
                this.attackTimer = 0;
            }
        }
    } else if (this.type === 'INK_COLOSSUS') {
        if (this.state === 'IDLE' || this.state === 'WALKING') this.state = 'CHASING';
        if (this.state === 'CHASING') {
            this.isInvulnerable = true;
            this.y += (580 - this.y) * 0.1; // Snap to bottom edge
            this.x += (dist > 0 ? 1 : -1) * (this.inkHits >= 3 ? 8.5 : 7.0);
            this.throwTimer += dt;
            const throwInterval = this.inkHits >= 3 ? 1.4 : 2.2;
            if (this.throwTimer > throwInterval) {
                this.throwTimer = 0;
                this.throwReady = true;
                this.state = 'THROWING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'RISING') {
            this.isInvulnerable = true;
            // Rise towards elevator height (around 200)
            const targetY = 220;
            this.y += (targetY - this.y) * 0.02; // Slow rise
            // Wobble horizontally while rising
            this.x += Math.sin(this.animTimer * 2) * 2;
        } else if (this.state === 'FALLING') {
            this.isInvulnerable = true;
            this.y += 10; // Rapid fall
            if (this.y >= 460) {
                this.y = 460;
                this.state = 'CHASING';
            }
        } else if (this.state === 'ANGRY_CHASE') {
            this.isInvulnerable = true;
            this.y += (580 - this.y) * 0.1;
            // Ultra fast final chase
            this.x += (dist > 0 ? 1 : -1) * 11.0;
            this.throwTimer += dt * 2; // Double throw rate
            if (this.throwTimer > 0.8) {
                this.throwTimer = 0;
                this.throwReady = true;
                this.state = 'THROWING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'THROWING') {
            this.isInvulnerable = true;
            this.attackTimer += dt;
            if (this.attackTimer > 0.6) {
                this.state = this.inkHits >= 5 ? 'ANGRY_CHASE' : 'CHASING';
                this.attackTimer = 0;
            }
        } else if (this.state === 'DEFEATED') {
            this.isInvulnerable = true;
            this.y += 5; // Sink away
        }
    }
  }

  takeDamage(amount: number) {
    if (this.type === 'INK_COLOSSUS') return false; // Must use Weak Point system
    if (this.health <= 0 || this.isInvulnerable || this.isHit) return false;
    if (this.volcano && (this.state === 'IDLE' || (this.type === 'LIVING_VOLCANO' && this.state !== 'DIZZY'))) return false;
    this.health -= amount;
    this.isHit = true;
    this.hitTimer = 0;
    if (this.health <= 0) { this.health = 0; this.state = 'DEFEATED'; this.volcano?.stop(); this.rainReady = false; }
    return true;
  }

  takeBombHit(): boolean {
    if (this.type !== 'INK_COLOSSUS') return false;
    if (this.state !== 'BOMB_STUNNED') return false;
    if (this.isHit) return false;
    this.inkHits++;
    this.isHit = true;
    this.hitTimer = 0;
    if (this.inkHits >= 5) {
        this.state = 'DEFEATED';
        this.health = 0;
    }
    return true;
  }

  enterBombStun() {
    if (this.type !== 'INK_COLOSSUS') return;
    if (this.state === 'BOMB_STUNNED' || this.state === 'DEFEATED') return;
    this.state = 'BOMB_STUNNED';
    this.bombStunTimer = 0;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    if (this.type === 'LIVING_VOLCANO') { this.volcano?.drawCore(ctx, cameraX, this.isHit); return; }
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

      // Dizzy Effect
      if (state === 'DIZZY') {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          for(let i=0; i<3; i++) {
              const angle = animTimer * 10 + i * (Math.PI*2/3);
              const dx = Math.cos(angle) * 40;
              const dy = Math.sin(angle) * 15;
              ctx.beginPath();
              ctx.arc(relX + dx, this.y - 160 + dy, 4, 0, Math.PI*2);
              ctx.stroke();
          }
      }
    } else if (type === 'INK_COLOSSUS') {
      ctx.shadowColor = state === 'BOMB_STUNNED' ? '#ff00ff' : (state === 'DEFEATED' ? '#ff0000' : '#000');
      const isStunned = state === 'BOMB_STUNNED';
      const isDefeated = state === 'DEFEATED';
      const bodySize = isDefeated ? (100 - (this as any).bombStunTimer * 30) : 100;
      
      ctx.fillStyle = isHit ? '#fff' : (isDefeated ? '#ff0000' : (isStunned ? '#1a001a' : '#000'));
      
      // Main blob body
      ctx.beginPath();
      for(let i=0; i<12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const wobble = isDefeated ? 40 : (isStunned ? 15 : 30);
        const r = Math.max(10, bodySize) + Math.sin(animTimer * 5 + i) * wobble;
        const tx = relX + Math.cos(angle) * r;
        const ty = this.y - 100 + Math.sin(angle) * r * 0.7;
        if(i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.fill();

      // Dots — pulse when stunned
      const dotCount = 5;
      for(let i=0; i<dotCount; i++) {
        const dotX = relX - 40 + i * 20;
        const dotY = this.y - 100 + Math.sin(animTimer*3 + i)*20;
        const dotR = isStunned ? (10 + Math.sin(animTimer * 8 + i) * 4) : 8;
        ctx.save();
        ctx.shadowBlur = isStunned ? 20 : 5;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = isStunned ? '#ff00ff' : (isHit ? '#fff' : '#ff00ff');
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotR, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // "HIT THE DOTS!" label when stunned
      if (isStunned) {
        const pulse = 0.7 + 0.3 * Math.sin(animTimer * 10);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#ff00ff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText('HIT THE DOTS!', relX, this.y - 170);
        ctx.fillText('HIT THE DOTS!', relX, this.y - 170);
        // Remaining hits
        ctx.font = '11px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${5 - this.inkHits} hits left`, relX, this.y - 150);
        ctx.restore();
      }

      if (isDefeated) {
        const splats = 8;
        for(let i=0; i<splats; i++) {
          const a = (i/splats)*Math.PI*2;
          ctx.fillStyle = '#ff00ff';
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.ellipse(relX + Math.cos(a)*80, this.y - 80 + Math.sin(a)*50, 20, 10, a, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }
}
