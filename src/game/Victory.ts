export function drawVictory(ctx: CanvasRenderingContext2D, time: number, variant: number, color: string, language: 'en' | 'es' = 'en') {
  ctx.save(); ctx.fillStyle = '#142d30'; ctx.fillRect(0, 0, 1000, 500);
  ctx.fillStyle = '#234841'; ctx.fillRect(0, 390, 1000, 110);
  ctx.fillStyle = '#719b65'; ctx.fillRect(0, 390, 1000, 6);
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
