export class Dummy {
  x: number;
  y: number;
  health: number = 3;
  wobble: number = 0;
  isHit: boolean = false;
  hitTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number) {
    if (this.isHit) {
      this.hitTimer += dt;
      this.wobble = Math.sin(this.hitTimer * 30) * 10;
      if (this.hitTimer > 0.3) {
        this.isHit = false;
        this.hitTimer = 0;
        this.wobble = 0;
      }
    }
  }

  takeDamage() {
    this.health -= 1;
    this.isHit = true;
    this.hitTimer = 0;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number = 0) {
    const rx = this.x - cameraX;
    const { y, wobble } = this;
    
    ctx.save();
    ctx.strokeStyle = this.isHit ? '#ff2d55' : '#888';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.shadowBlur = this.isHit ? 20 : 5;
    ctx.shadowColor = this.isHit ? '#ff2d55' : '#333';

    ctx.beginPath();
    ctx.moveTo(rx - 20, y + 40);
    ctx.lineTo(rx + 20, y + 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rx, y + 40);
    ctx.lineTo(rx + wobble, y - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rx + wobble - 25, y + 5);
    ctx.lineTo(rx + wobble + 25, y + 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rx + wobble, y - 35, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
