export function reachedFinish(players: { x: number; y: number; health: number; onGround: boolean }[], length: number, unlocked: boolean) {
  return unlocked && players.some(p => p.health > 0 && p.onGround && Math.abs(p.y - 430) < 25 && p.x >= length - 145);
}

export function drawFinishFlag(ctx: CanvasRenderingContext2D, x: number, time: number, unlocked: boolean, world: number, floor = 460, raise = 1) {
  ctx.save();
  ctx.fillStyle = world === 2 ? '#51404c' : '#53654c'; ctx.fillRect(x - 21, floor - 10, 48, 10);
  ctx.fillStyle = '#ecc87e'; ctx.fillRect(x, floor - 165, 7, 155);
  ctx.fillStyle = '#fff0b9'; ctx.fillRect(x - 3, floor - 174, 13, 10);
  const y = floor - 65 - (unlocked ? Math.min(1, raise) * 90 : 0);
  for (let stripe = 0; stripe < 14; stripe++) {
    const wave = Math.round(Math.sin(time * 6 - stripe * .35) * stripe * .35);
    ctx.fillStyle = unlocked ? (stripe % 2 ? '#e66269' : '#f88479') : '#786976';
    ctx.fillRect(x + 7 + stripe * 4, y + wave, 4, 32);
  }
  ctx.fillStyle = unlocked ? '#ffe8a1' : '#b9abb4';
  ctx.fillRect(x + 25, y + 15, 19, 8); ctx.fillRect(x + 25, y + 10, 4, 7); ctx.fillRect(x + 33, y + 7, 4, 10); ctx.fillRect(x + 40, y + 10, 4, 7);
  ctx.restore();
}

export function drawVictory(ctx: CanvasRenderingContext2D, time: number, variant: number, color: string, language: 'en' | 'es' = 'en', world = 1) {
  ctx.save(); ctx.fillStyle = world === 2 ? '#281c36' : '#142d30'; ctx.fillRect(0, 0, 1000, 500);
  if (world === 3) {
    ctx.fillStyle = '#392447'; ctx.fillRect(0, 0, 1000, 500);
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = ['#875fb0', '#ce6fb3', '#50a9ba'][i % 3];
      ctx.fillRect(i * 90, 155 + i % 3 * 45, 50, 240);
      ctx.fillStyle = '#f4d9a1'; ctx.fillRect(i * 90 - 4, 145 + i % 3 * 45, 58, 12);
    }
  }
  if (world === 2) {
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#573440'; ctx.beginPath(); ctx.moveTo(i * 300 - 90, 390); ctx.lineTo(i * 300 + 100, 190); ctx.lineTo(i * 300 + 290, 390); ctx.fill(); ctx.fillStyle = '#ed9b58'; ctx.fillRect(i * 300 + 88, 211, 24, 8); }
  }
  ctx.fillStyle = world === 2 ? '#453240' : '#234841'; ctx.fillRect(0, 390, 1000, 110);
  ctx.fillStyle = world === 2 ? '#d18a60' : '#719b65'; ctx.fillRect(0, 390, 1000, 6);
  drawFinishFlag(ctx, 725, time, true, world, 390, time / 1.2);
  for (let i = 0; i < 36; i++) {
    ctx.fillStyle = ['#ffda78', '#f38aa1', '#83daca'][i % 3];
    ctx.fillRect((i * 137 + Math.sin(time + i) * 24) % 1000, (time * 45 + i * 31) % 385, 5, 9);
  }
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffe7a6'; ctx.font = '26px "Press Start 2P"'; ctx.fillText(language === 'en' ? 'LEVEL CLEAR!' : '¡NIVEL SUPERADO!', 500, 90);
  const t = time % 3.6;
  const flip = variant === 1 && t > 1 && t < 2.2 ? (t - 1) / 1.2 : 0;
  const toss = variant === 0 && t > 0.5 && t < 2.3 ? (t - 0.5) / 1.8 : 0;
  const crouch = variant === 2 ? 9 : 0;
  const handX = variant === 2 ? 26 : variant === 1 && t < 0.9 ? 35 + Math.sin(t / 0.9 * Math.PI) * 36 : 28;
  const handY = variant === 0 ? (t < 0.5 ? -16 - 34 * t / 0.5 : t <= 2.3 ? -50 : -50 + 34 * Math.min(1, (t - 2.3) / 0.5)) : variant === 2 ? -25 : -16;
  ctx.save(); ctx.translate(500 - Math.sin(flip * Math.PI) * 65, 354 - Math.sin(flip * Math.PI) * 145);
  ctx.rotate(-flip * Math.PI * 2); ctx.scale(1.65, 1.65);
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -44 + crouch, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -34 + crouch); ctx.lineTo(0, 0);
  ctx.lineTo(-18, 22); ctx.moveTo(0, 0); ctx.lineTo(variant === 2 ? 28 : 17, 22);
  ctx.moveTo(0, -24 + crouch); ctx.lineTo(-22, -8); ctx.moveTo(0, -24 + crouch); ctx.lineTo(handX, handY); ctx.stroke();
  if (!toss) sword(ctx, handX, handY, variant === 2 ? -0.8 : variant === 1 && t < 0.9 ? -1.4 + t * 3 : -0.6);
  ctx.restore();
  if (toss) {
    ctx.save(); ctx.translate(546, 272 - Math.sin(toss * Math.PI) * 108); ctx.scale(1.65, 1.65);
    sword(ctx, 0, 0, -0.6 + toss * Math.PI * 2); ctx.restore();
  }
  ctx.fillStyle = '#d8e8c9'; ctx.font = '12px monospace';
  ctx.fillText((language === 'en' ? ['SWORD TOSS', 'SLASH & BACKFLIP', 'READY FOR THE NEXT CHALLENGE'] : ['LANZAMIENTO DE ESPADA', 'TAJO Y MORTAL HACIA ATRÁS', 'LISTO PARA EL PRÓXIMO RETO'])[variant], 500, 435);
  ctx.restore();
}

function sword(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.fillStyle = '#fff4cd'; ctx.fillRect(0, -2, 34, 4);
  ctx.fillStyle = '#ffc562'; ctx.fillRect(-3, -8, 4, 16); ctx.fillRect(-12, -2, 10, 4); ctx.restore();
}
