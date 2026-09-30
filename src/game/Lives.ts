export const LIFE_WAIT_MS = 5 * 60 * 1000;
export const LIVES_SESSION_KEY = 'vinns_quest_lives_v1';

/** Tab-session economy: survives refresh, but never persists after closing the tab. */
export class Lives {
  lives = 3;
  coins = 0;
  purchases = 0;
  priceResetAt = 0;
  refillAt = 0;
  collected = new Set<string>();

  constructor(saved?: string | null, now = Date.now()) {
    try {
      const data = JSON.parse(saved || 'null');
      if (data && Number.isInteger(data.lives) && data.lives >= 0 && data.lives <= 3 &&
          Number.isInteger(data.coins) && data.coins >= 0 && Number.isInteger(data.purchases) && data.purchases >= 0 &&
          Number.isFinite(data.priceResetAt) && Number.isFinite(data.refillAt) && Array.isArray(data.collected)) {
        this.lives = data.lives; this.coins = data.coins; this.purchases = data.purchases;
        this.priceResetAt = data.priceResetAt; this.refillAt = data.refillAt;
        this.collected = new Set(data.collected.filter((id: unknown) => typeof id === 'string'));
        // Migrate a bought-life session from the old save format, which cleared
        // the recovery deadline on purchase. Keep its remaining wait if possible.
        if (!this.refillAt && (!this.lives || this.purchases > 0)) this.refillAt = this.priceResetAt || now + LIFE_WAIT_MS;
        this.priceResetAt = this.refillAt;
      }
    } catch { /* A damaged save starts a fresh session. */ }
    this.tick(now);
  }

  get price() { return 5 * (this.purchases + 1); }
  secondsLeft(now = Date.now()) { return Math.max(0, Math.ceil((this.refillAt - now) / 1000)); }
  tick(now = Date.now()) {
    if (this.refillAt && now >= this.refillAt) {
      this.lives = 3; this.refillAt = 0; this.purchases = 0; this.priceResetAt = 0;
    }
  }
  lose(now = Date.now()) {
    // Losing a life must not accidentally refill a just-expired timer first.
    if (this.lives === 0) return false;
    this.lives--;
    // Only exhausting a fresh set of three starts a recovery cycle. Bought
    // lives use that same deadline, even if several are bought and lost.
    if (!this.lives && !this.refillAt) {
      this.refillAt = now + LIFE_WAIT_MS;
      this.priceResetAt = this.refillAt;
    }
    return true;
  }
  buy(now = Date.now()) {
    this.tick(now);
    if (this.lives !== 0 || this.coins < this.price) return false;
    this.coins -= this.price;
    this.purchases++;
    this.lives = 1;
    return true;
  }
  collect(id: string) {
    if (this.collected.has(id)) return false;
    this.collected.add(id); this.coins++; return true;
  }
  save() {
    return JSON.stringify({ lives: this.lives, coins: this.coins, purchases: this.purchases,
      priceResetAt: this.priceResetAt, refillAt: this.refillAt, collected: [...this.collected] });
  }
}

export interface Coin { id: string; x: number; y: number }

/** Small groups on actual ledges, never over a pit or inside a boss arena. */
export function makeCoins(world: number, level: number, platforms: { x: number; y: number; w: number }[], end: number): Coin[] {
  const coins: Coin[] = [];
  for (const [index, platform] of platforms.entries()) {
    if (platform.w < 100 || platform.y < 100) continue;
    for (let x = platform.x + 80; x < Math.min(platform.x + platform.w - 30, end - 1100); x += 650) {
      if (x < 250) continue;
      for (let j = 0; j < 3 && x + j * 30 < platform.x + platform.w - 25; j++) {
        coins.push({ id: `${world}:${level}:${index}:${x}:${j}`, x: x + j * 30, y: platform.y - 55 });
      }
    }
  }
  return coins;
}

export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const width = Math.max(2, Math.round(Math.abs(Math.cos(time * 3)) * 8));
  y = Math.round(y + Math.sin(time * 4) * 3);
  ctx.save(); ctx.translate(Math.round(x), y);
  ctx.fillStyle = '#8e4c12'; ctx.fillRect(-width, -9, width * 2, 18);
  ctx.fillStyle = '#ffe276'; ctx.fillRect(-width + 1, -7, Math.max(2, width * 2 - 2), 14);
  ctx.fillStyle = '#dc9b24'; ctx.fillRect(-2, -5, 3, 10);
  ctx.fillStyle = '#fff8d1'; ctx.fillRect(-width + 1, -6, 2, 5);
  ctx.restore();
}
