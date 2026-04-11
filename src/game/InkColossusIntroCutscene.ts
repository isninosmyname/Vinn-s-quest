export type InkIntroPhase = 'IDLE' | 'EMERGE' | 'AWARENESS' | 'DOOR_ENTER' | 'CHASE_START' | 'RUNNING' | 'FINISHED';

export class InkColossusIntroCutscene {
    phase: InkIntroPhase = 'IDLE';
    timer: number = 0;
    
    vinnX: number = 100;
    vinnY: number = 420;
    bossX: number = -200;
    bossY: number = 420;
    doorX: number = 400;
    doorOpen: boolean = false;
    
    rockParticles: { x: number, y: number, vx: number, vy: number, life: number }[] = [];
    vinnAwareness: number = 0; // 0-1, for ! icon appearance
    vinnRunSpeed: number = 0;
    bossChaseSpeed: number = 0;
    
    constructor() {}

    update(dt: number): InkIntroPhase {
        this.timer += dt;

        switch (this.phase) {
            case 'IDLE':
                this.phase = 'EMERGE';
                this.timer = 0;
                break;

            case 'EMERGE':
                // Ink Colossus rises from ground for 2 seconds
                this.bossY = 420 - Math.min(100, this.timer * 100);
                
                // Generate rock particles
                if (Math.random() < 0.3) {
                    this.rockParticles.push({
                        x: this.bossX + 50 + (Math.random() - 0.5) * 100,
                        y: 420,
                        vx: (Math.random() - 0.5) * 8,
                        vy: -Math.random() * 10,
                        life: 1
                    });
                }
                
                if (this.timer > 2.0) {
                    this.phase = 'AWARENESS';
                    this.timer = 0;
                }
                break;

            case 'AWARENESS':
                // Vinn becomes aware (! appears) for 1 second
                this.vinnAwareness = Math.min(1, this.timer / 0.5);
                
                if (this.timer > 1.5) {
                    this.phase = 'DOOR_ENTER';
                    this.timer = 0;
                    this.doorOpen = true;
                }
                break;

            case 'DOOR_ENTER':
                // Vinn runs toward and enters door (1 second)
                const doorProgress = Math.min(1, this.timer / 1.0);
                this.vinnX = 100 + (this.doorX - 100) * doorProgress;
                
                if (this.timer > 1.0) {
                    this.phase = 'CHASE_START';
                    this.timer = 0;
                    this.vinnX = this.doorX;
                }
                break;

            case 'CHASE_START':
                // Ink Colossus starts chasing (0.5 second buildup)
                this.bossChaseSpeed = Math.min(300, this.timer * 600);
                
                if (this.timer > 0.5) {
                    this.phase = 'RUNNING';
                    this.timer = 0;
                }
                break;

            case 'RUNNING':
                // Both run to right (2 seconds)
                this.bossChaseSpeed = 300;
                this.vinnRunSpeed = 250;
                
                this.vinnX += this.vinnRunSpeed * dt;
                this.bossX += this.bossChaseSpeed * dt;
                
                if (this.timer > 2.0) {
                    this.phase = 'FINISHED';
                    this.vinnRunSpeed = 0;
                }
                break;

            case 'FINISHED':
                return 'FINISHED';
        }

        // Update rock particles
        this.rockParticles = this.rockParticles.filter(rock => {
            rock.x += rock.vx;
            rock.y += rock.vy;
            rock.vy += 0.5;
            rock.life -= dt;
            return rock.life > 0 && rock.y < 500;
        });

        return this.phase;
    }

    draw(ctx: CanvasRenderingContext2D, camX: number) {
        // Screen fill with dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, 800, 500);

        // Draw rocks
        ctx.fillStyle = '#666';
        this.rockParticles.forEach(rock => {
            ctx.beginPath();
            ctx.arc(rock.x - camX, rock.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw door (simple rectangle)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.doorX - 25 - camX, 380, 50, 80);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.doorX - 25 - camX, 380, 50, 80);

        // Draw door handle
        if (this.doorOpen) {
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(this.doorX + 20 - camX, 420, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Vinn (small sprite)
        ctx.fillStyle = '#00f2ff';
        ctx.beginPath();
        ctx.arc(this.vinnX - camX, this.vinnY - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Vinn body
        ctx.fillRect(this.vinnX - 6 - camX, this.vinnY - 8, 12, 18);

        // ! icon above Vinn
        if (this.vinnAwareness > 0) {
            ctx.save();
            ctx.globalAlpha = this.vinnAwareness;
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.vinnX - camX, this.vinnY - 35);
            ctx.restore();
        }

        // Draw Ink Colossus (large blob shape)
        ctx.fillStyle = '#1a1a3e';
        ctx.beginPath();
        ctx.ellipse(this.bossX - camX, this.bossY, 60, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss outline with glow
        ctx.strokeStyle = '#9900ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.shadowColor = '#9900ff';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#9900ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Eyes (yellow/angry)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.bossX - 20 - camX, this.bossY - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.bossX + 20 - camX, this.bossY - 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // If in RUNNING phase, show "CHASE!" text
        if (this.phase === 'RUNNING' || this.phase === 'CHASE_START') {
            ctx.fillStyle = '#ff2d55';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CHASE!', 400, 80);
        }
    }
}
