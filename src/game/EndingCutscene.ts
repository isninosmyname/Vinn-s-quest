export type EndingPhase = 'REUNION' | 'PORTAL_EXIT' | 'CASTLE_ARRIVAL' | 'THE_REWARD' | 'THE_KISS' | 'QUEEN_EXIT' | 'VINN_STUNNED' | 'BANQUET_CALL' | 'FOLLOW_QUEEN' | 'BUT_SCREEN' | 'BOSS_REGEN' | 'BOSS_FUSION' | 'FIN_BAIT';

export class EndingCutscene {
    vinnX: number = 200;
    vinnY: number = 420;
    queenX: number = 400;
    queenY: number = 420;
    
    phase: EndingPhase = 'REUNION';
    timer: number = 0;
    dialogueIndex: number = 0;
    portalSize: number = 0;
    portalAngle: number = 0;
    language: 'en' | 'es' = 'en';
    isTwoPlayer: boolean = false;
    p1Color: string = '#00f2ff';
    p2Color: string = '#ff00ff';
    dialogues: { speaker: string, text: string }[] = [];
    currentDialogue: { speaker: string, text: string } | null = null;
    hearts: {x: number, y: number, life: number}[] = [];
    isBowing: boolean = false;
    vinnStunned: boolean = false;
    vinnSpeed: number = 0;
    
    dialogues_en = [
        { speaker: 'Queen', text: 'Vinn! You did it! The Ink Colossus is gone!' },
        { speaker: 'Vinn', text: 'I would cross a thousand worlds to save you, my Queen.' },
        { speaker: 'Queen', text: 'Look, the portal is stabilizing! We can go home!' },
        { speaker: 'Vinn', text: 'Together? Forever?' },
        { speaker: 'Queen', text: 'Yes, Vinn. Together.' },
        { speaker: 'Queen', text: 'We are back!' },
        { speaker: 'Vinn', text: 'The kingdom is safe once more.' },
        { speaker: 'Queen', text: 'Sir Vinn... you are more than a knight to me.' },
        { speaker: 'Queen', text: 'You deserve a reward, Vinn.' },
        { speaker: 'Queen', text: 'Come over! Have a banquet to celebrate!' }
    ];

    dialogues_es = [
        { speaker: 'Queen', text: '¡Vinn! ¡Lo lograste! ¡El Coloso de Tinta ha desaparecido!' },
        { speaker: 'Vinn', text: 'Cruzaría mil mundos para salvaros, mi Reina.' },
        { speaker: 'Queen', text: '¡Mira, el portal se está estabilizando! ¡Podemos volver a casa!' },
        { speaker: 'Vinn', text: '¿Juntos? ¿Para siempre?' },
        { speaker: 'Queen', text: 'Sí, Vinn. Juntos.' },
        { speaker: 'Queen', text: '¡Estamos de vuelta!' },
        { speaker: 'Vinn', text: 'El reino está a salvo una vez más.' },
        { speaker: 'Queen', text: 'Sir Vinn... eres más que un caballero para mí.' },
        { speaker: 'Queen', text: 'Te mereces una recompensa, Vinn.' },
        { speaker: 'Queen', text: '¡Ven aquí! ¡Haremos un banquete para celebrar!' }
    ];

    constructor() {
        this.setLanguage('en');
    }

    setLanguage(lang: 'en' | 'es', is2P: boolean = false, c1: string = '#00f2ff', c2: string = '#ff00ff') {
        this.language = lang;
        this.isTwoPlayer = is2P;
        this.p1Color = c1;
        this.p2Color = c2;
        
        const duo_en = [
            { speaker: 'Queen', text: 'Vinn! Jhon! You did it together!' },
            { speaker: 'The Duo', text: 'We would cross a thousand worlds to save you, my Queen.' },
            { speaker: 'Queen', text: 'Look, the portal is stabilizing! We can go home!' },
            { speaker: 'Vinn', text: 'Together? Forever?' },
            { speaker: 'Queen', text: 'Yes, Vinn. Together.' },
            { speaker: 'Queen', text: 'We are back!' },
            { speaker: 'The Duo', text: 'The kingdom is safe once more.' },
            { speaker: 'Queen', text: 'Sir Vinn, Sir Zinn... you are legends.' },
            { speaker: 'Queen', text: 'You both deserve a reward.' },
            { speaker: 'Queen', text: 'Come over! Have a banquet to celebrate!' }
        ];

        const duo_es = [
            { speaker: 'Queen', text: '¡Vinn! ¡Jhon! ¡Lo lograron juntos!' },
            { speaker: 'El Dúo', text: 'Cruzaríamos mil mundos para salvarte, mi Reina.' },
            { speaker: 'Queen', text: '¡Mira, el portal se está estabilizando! ¡Volvamos a casa!' },
            { speaker: 'Vinn', text: '¿Juntos? ¿Para siempre?' },
            { speaker: 'Queen', text: 'Sí, Vinn. Juntos.' },
            { speaker: 'Queen', text: '¡Estamos de vuelta!' },
            { speaker: 'El Dúo', text: 'El reino está a salvo una vez más.' },
            { speaker: 'Queen', text: 'Sir Vinn, Sir Jhon... son leyendas.' },
            { speaker: 'Queen', text: 'Ambos merecen una recompensa.' },
            { speaker: 'Queen', text: '¡Vengan! ¡Hagamos un banquete para celebrar!' }
        ];

        if (is2P) {
            this.dialogues = lang === 'en' ? duo_en : duo_es;
        } else {
            this.dialogues = lang === 'en' ? this.dialogues_en : this.dialogues_es;
        }
    }

    update(dt: number): boolean | { speaker: string, text: string } | null {
        this.timer += dt;
        
        switch (this.phase) {
            case 'REUNION':
                if (this.dialogueIndex > 4) { this.phase = 'PORTAL_EXIT'; this.timer = 0; }
                break;
            case 'PORTAL_EXIT':
                this.portalSize += (200 - this.portalSize) * 0.05;
                this.portalAngle += 0.2;
                this.vinnX += (400 - this.vinnX) * 0.05;
                this.queenX += (400 - this.queenX) * 0.05;
                if (this.timer > 2) {
                    this.phase = 'CASTLE_ARRIVAL';
                    this.timer = 0;
                    this.dialogueIndex = 5;
                    this.vinnX = 400;
                    this.queenX = 500;
                }
                break;
            case 'CASTLE_ARRIVAL':
                if (this.dialogueIndex === 8) { this.phase = 'THE_REWARD'; this.timer = 0; }
                break;
            case 'THE_REWARD':
                this.isBowing = true;
                if (this.timer > 2) {
                    this.phase = 'THE_KISS';
                    this.timer = 0;
                    this.hearts = [{ x: 450, y: 380, life: 1 }];
                }
                break;
            case 'THE_KISS':
                if (this.queenX > 450) this.queenX -= 2;
                this.hearts.forEach(h => { h.y -= 1.5; h.life -= 0.01; });
                if (this.timer > 1.5) { this.phase = 'QUEEN_EXIT'; this.timer = 0; this.isBowing = false; }
                break;
            case 'QUEEN_EXIT':
                this.queenX += 4;
                if (this.queenX > 900) { this.phase = 'VINN_STUNNED'; this.timer = 0; this.vinnStunned = true; }
                break;
            case 'VINN_STUNNED':
                if (this.timer > 2) { this.phase = 'BANQUET_CALL'; this.timer = 0; this.dialogueIndex = 9; }
                break;
            case 'BANQUET_CALL':
                if (this.timer > 3) { this.phase = 'FOLLOW_QUEEN'; this.timer = 0; this.vinnStunned = false; }
                break;
            case 'FOLLOW_QUEEN':
                this.vinnX += 6;
                if (this.vinnX > 900) { this.phase = 'BUT_SCREEN'; this.timer = 0; }
                break;
            case 'BUT_SCREEN':
                if (this.timer > 3) { this.phase = 'BOSS_REGEN'; this.timer = 0; }
                break;
            case 'BOSS_REGEN':
                if (this.timer > 5) { this.phase = 'BOSS_FUSION'; this.timer = 0; }
                break;
            case 'BOSS_FUSION':
                if (this.timer > 5) { this.phase = 'FIN_BAIT'; this.timer = 0; }
                break;
            case 'FIN_BAIT':
                if (this.timer > 5) return true;
                break;
        }

        this.currentDialogue = null;
        if (this.dialogueIndex < this.dialogues.length) {
             if (['THE_KISS', 'QUEEN_EXIT', 'VINN_STUNNED', 'FOLLOW_QUEEN', 'BUT_SCREEN', 'BOSS_REGEN', 'BOSS_FUSION', 'FIN_BAIT'].includes(this.phase)) return null;
             this.currentDialogue = this.dialogues[this.dialogueIndex];
             return this.currentDialogue;
        }
        return null;
    }

    advanceDialogue() {
        if (['REUNION', 'CASTLE_ARRIVAL', 'BANQUET_CALL'].includes(this.phase)) {
            if (this.dialogueIndex < this.dialogues.length) {
                this.dialogueIndex++;
                this.timer = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        const castlePhases = ['CASTLE_ARRIVAL', 'THE_REWARD', 'THE_KISS', 'QUEEN_EXIT', 'VINN_STUNNED', 'BANQUET_CALL', 'FOLLOW_QUEEN'];
        const isCastle = castlePhases.includes(this.phase);

        if (this.phase === 'BUT_SCREEN') {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 500);
            ctx.fillStyle = '#ff2d55'; ctx.font = '40px "Press Start 2P"'; ctx.textAlign = 'center';
            ctx.fillText(this.language === 'en' ? 'BUT...' : 'PERO...', 400, 250);
        } else if (this.phase === 'BOSS_REGEN' || this.phase === 'BOSS_FUSION' || this.phase === 'FIN_BAIT') {
            this.drawStinger(ctx);
        } else if (!isCastle) {
            ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, 800, 500);
            ctx.fillStyle = '#10101a'; ctx.fillRect(0, 420, 800, 80);
            if (this.phase === 'PORTAL_EXIT' && this.portalSize > 0) {
                ctx.save(); ctx.translate(400, 300); ctx.rotate(this.portalAngle);
                const g = ctx.createRadialGradient(0,0,10,0,0,this.portalSize);
                g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ff00ff'); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,this.portalSize,0,Math.PI*2); ctx.fill();
                ctx.restore();
            }
        } else {
            ctx.fillStyle = '#3d2c1e'; ctx.fillRect(0, 0, 800, 500);
            ctx.fillStyle = '#4a0b2e'; ctx.fillRect(0, 420, 800, 80);
            ctx.fillStyle = '#776633'; ctx.fillRect(600, 50, 180, 300);
            ctx.strokeStyle = '#555'; ctx.lineWidth = 10; ctx.strokeRect(600, 50, 180, 300);
            ctx.fillStyle = '#b8860b'; ctx.fillRect(570, 370, 60, 80);
        }

        if (isCastle || (!['BUT_SCREEN','BOSS_REGEN','BOSS_FUSION','FIN_BAIT'].includes(this.phase))) {
            if (this.phase !== 'BANQUET_CALL' || this.queenX < 850) this.drawQueen(ctx, this.queenX, this.queenY);
            
            this.drawHero(ctx, this.vinnX, this.vinnY, this.p1Color, 'NORMAL');
            if (this.isTwoPlayer) {
                this.drawHero(ctx, this.vinnX - 40, this.vinnY, this.p2Color, 'SPIKY');
            }

            if (this.vinnStunned) {
                ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText('!', this.vinnX, this.vinnY - 80);
            }
            this.hearts.forEach(h => { ctx.fillStyle = `rgba(255, 105, 180, ${h.life})`; ctx.font = '30px Arial'; ctx.fillText('❤', h.x, h.y); });
        }

        if (this.currentDialogue && !['BUT_SCREEN','BOSS_REGEN','BOSS_FUSION','FIN_BAIT'].includes(this.phase)) {
            ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; ctx.fillRect(100, 30, 600, 120);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(100, 30, 600, 120);
            const sc = this.currentDialogue.speaker === 'Vinn' ? '#00f2ff' : '#ff69b4';
            ctx.fillStyle = sc; ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', 120, 45);
            ctx.fillStyle = '#fff'; ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 75;
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > 560 && n > 0) { ctx.fillText(line, 120, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, 120, lineY);
        }
        ctx.restore();
    }

    drawStinger(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 800, 500);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'; ctx.lineWidth = 1;
        for(let i=0; i<10; i++) { ctx.beginPath(); ctx.moveTo(i*80, 0); ctx.lineTo(i*80, 500); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i*50); ctx.lineTo(800, i*50); ctx.stroke(); }
        
        if (this.phase === 'BOSS_REGEN') {
            this.drawFragment(ctx, 200, 300, 'GOLEM', Math.sin(this.timer*5)*5);
            this.drawFragment(ctx, 400, 300, 'BLAZE', Math.cos(this.timer*4)*5);
            this.drawFragment(ctx, 600, 300, 'INK', Math.sin(this.timer*6)*5);
            this.drawSkeleton(ctx, 150 + Math.sin(this.timer*2)*20, 350);
            this.drawSkeleton(ctx, 450 + Math.cos(this.timer*2)*20, 350);
            this.drawSkeleton(ctx, 700 + Math.sin(this.timer*3)*20, 350);
            if (Math.random() > 0.5) {
                ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(Math.random()*800, Math.random()*500, 2, 0, Math.PI*2); ctx.fill();
            }
        } else if (this.phase === 'BOSS_FUSION') {
            const progress = Math.min(1, this.timer / 4);
            const fusionX = 400;
            const fusionY = 300;
            this.drawFragment(ctx, 200 + (fusionX-200)*progress, 300, 'GOLEM', 0, 1-progress);
            this.drawFragment(ctx, 400, 300, 'BLAZE', 0, 1-progress);
            this.drawFragment(ctx, 600 - (600-fusionX)*progress, 300, 'INK', 0, 1-progress);
            
            if (progress > 0.8) {
                this.drawBurningInkGolem(ctx, fusionX, fusionY, (progress-0.8)*5);
            }
        } else if (this.phase === 'FIN_BAIT') {
             this.drawBurningInkGolem(ctx, 400, 300, 1);
             ctx.fillStyle = '#fff'; ctx.font = '20px "Press Start 2P"'; ctx.textAlign = 'center';
             ctx.fillText("VINN'S QUEST 2", 400, 100);
             ctx.fillStyle = '#ff2d55'; ctx.font = '14px "Press Start 2P"';
             ctx.fillText("TO BE CONTINUED...", 400, 450);
        }
    }

    drawFragment(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, bounce: number, alpha: number = 1) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = type === 'GOLEM' ? '#4a5d23' : (type === 'BLAZE' ? '#ff4500' : '#000');
        ctx.beginPath(); ctx.arc(x, y + bounce, 30, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y-40, 8, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y-32); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x+3, y-40, 2, 0, Math.PI*2); ctx.fill();
    }

    drawBurningInkGolem(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
        ctx.save();
        ctx.translate(x, y); ctx.scale(scale, scale);
        ctx.fillStyle = '#2d3e12'; ctx.shadowBlur = 40; ctx.shadowColor = '#ff4500';
        ctx.beginPath(); ctx.rect(-60, -60, 120, 120); ctx.fill();
        ctx.fillStyle = '#000';
        for(let i=0; i<5; i++) { ctx.fillRect(-50 + i*25, 40, 10, 40 + Math.sin(Date.now()/200 + i)*20); }
        const flicker = Math.random()*20;
        ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 10;
        ctx.strokeRect(-70-flicker/2, -70-flicker/2, 140+flicker, 140+flicker);
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(-20, -20, 10, 0, Math.PI*2); ctx.arc(20, -20, 10, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 50, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(x-10, y-62); ctx.lineTo(x-15, y-75); ctx.lineTo(x, y-80); ctx.lineTo(x+15,y-75); ctx.lineTo(x+10,y-62); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y-38); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#800080'; ctx.beginPath(); ctx.moveTo(x, y-30); ctx.lineTo(x-20, y+25); ctx.lineTo(x+20, y+25); ctx.fill(); ctx.restore();
    }

    drawHero(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, visual: 'NORMAL' | 'SPIKY') {
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.shadowBlur = 10; ctx.shadowColor = color;
        if (this.isBowing) { ctx.translate(x, y); ctx.rotate(0.4); ctx.translate(-x, -y); }
        
        ctx.beginPath(); ctx.arc(x, y - 50, 12, 0, Math.PI * 2); ctx.stroke();
        
        if (visual === 'SPIKY') {
            ctx.beginPath(); ctx.moveTo(x-15, y-60); ctx.lineTo(x-5, y-75); ctx.lineTo(x, y-62); ctx.lineTo(x+5, y-75); ctx.lineTo(x+15, y-60); ctx.stroke();
        }

        ctx.beginPath(); ctx.moveTo(x, y - 38); ctx.lineTo(x, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x-10, y+30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+10, y+30); ctx.stroke(); ctx.restore();
    }
}
