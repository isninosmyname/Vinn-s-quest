export type CutscenePhase = 'WALK_IN' | 'KNEEL_AND_TALK' | 'PORTAL_OPENS' | 'QUEEN_SUCKED_IN' | 'VINN_JUMPS' | 'FOREST_DROP' | 'TECH_KIDNAP' | 'VINN_LANDING' | 'LATER_SCREEN' | 'BOSS_LAB_INTRO' | 'BOSS_LAB_TALK' | 'GOLEM_LEAVE' | 'COLOSSUS_LEAVE' | 'FINISHED';

export class IntroCutscene {
    vinnX: number = -50;
    vinnY: number = 420;
    queenX: number = 600;
    queenY: number = 420;
    
    phase: CutscenePhase = 'WALK_IN';
    timer: number = 0;
    dialogueIndex: number = 0;
    portalSize: number = 0;
    portalAngle: number = 0;
    language: 'en' | 'es' = 'en';
    isTwoPlayer: boolean = false;
    p1Color: string = '#00f2ff';
    p2Color: string = '#ff00ff';
    
    // Boss room positions
    boss1X: number = 850; // Golem
    boss2X: number = 150; // Blaze King
    colossusX: number = 500;
    colossusY: number = 550; // Starts below
    
    dialogues: { speaker: string, text: string }[] = [];
    currentDialogue: { speaker: string, text: string } | null = null;

    dialogues_en = [
        { speaker: 'Vinn', text: 'My Queen, I have returned.' },
        { speaker: 'Vinn', text: 'I bring you this rare Crimson Rose from the Eastern Woods.' },
        { speaker: 'Queen', text: 'It is beautiful, sir Vinn. Your loyalty is unmatched.' },
        { speaker: 'Queen', text: 'Wait... what is that noise?' },
        { speaker: 'Vinn', text: 'A portal! My Queen, get back!' },
        { speaker: 'Queen', text: 'VINN! HELP ME!' },
        { speaker: 'Vinn', text: 'NO!! I am coming for you!' },
        { speaker: 'Queen', text: 'Ouch... where are we?' },
        { speaker: 'Skelet-Bot', text: 'TARGET SECURED. INITIATING RETRIEVAL.' },
        { speaker: 'Queen', text: 'No! Let me go! VINN!!' },
        { speaker: 'Vinn', text: 'Ugh... my head...' },
        { speaker: 'Vinn', text: 'WAI... HEY! STOP!' },
        { speaker: 'Vinn', text: 'They are gone... but I can still see their dust trail.' },
        { speaker: 'Vinn', text: 'I must follow them. Hold on, my Queen!' },
        { speaker: 'System', text: 'Later...' },
        { speaker: 'Ink Colossus', text: 'You are a beautiful flower, my dear. I offer you my hand in marriage.' },
        { speaker: 'Queen', text: 'NO! Never!' },
        { speaker: 'Ink Colossus', text: 'And who is going to save you? These walls are thick, and the guards are many.' },
        { speaker: 'Queen', text: 'Vinn! He will find me and destroy you!' },
        { speaker: 'Ink Colossus', text: 'Hmph. I\'ll take care of that.' },
        { speaker: 'Ink Colossus', text: 'Golem! Go to the Forest. If you see a knight, crush him.' },
        { speaker: 'Golem', text: '...ACKNOWLEDGED. CRUSHING INITIATED.' },
        { speaker: 'Ink Colossus', text: 'Right... now let\'s take care of your dress. We have a wedding to prepare.' }
    ];

    dialogues_es = [
        { speaker: 'Vinn', text: 'Mi Reina, he vuelto.' },
        { speaker: 'Vinn', text: 'Le traigo esta rara Rosa Carmesí de los Bosques del Este.' },
        { speaker: 'Queen', text: 'Es hermosa, Sir Vinn. Tu lealtad no tiene igual.' },
        { speaker: 'Queen', text: 'Espera... ¿qué es ese ruido?' },
        { speaker: 'Vinn', text: '¡Un portal! ¡Mi Reina, retroceda!' },
        { speaker: 'Queen', text: '¡VINN! ¡AYÚDAME!' },
        { speaker: 'Vinn', text: '¡¡NO!! ¡Iré por ti!' },
        { speaker: 'Queen', text: 'Ay... ¿dónde estamos?' },
        { speaker: 'Skelet-Bot', text: 'OBJETIVO ASEGURADO. INICIANDO RECUPERACIÓN.' },
        { speaker: 'Queen', text: '¡No! ¡Suéltenme! ¡¡VINN!!' },
        { speaker: 'Vinn', text: 'Uf... mi cabeza...' },
        { speaker: 'Vinn', text: '¡ESPE... OYE! ¡DETENTE!' },
        { speaker: 'Vinn', text: 'Se han ido... pero aún puedo ver su rastro de polvo.' },
        { speaker: 'Vinn', text: 'Debo seguirlos. ¡Resiste, mi Reina!' },
        { speaker: 'Sistema', text: 'Luego...' },
        { speaker: 'Coloso de Tinta', text: 'Eres una flor hermosa, querida. Te ofrezco mi mano en matrimonio.' },
        { speaker: 'Reina', text: '¡NO! ¡Jamás!' },
        { speaker: 'Coloso de Tinta', text: '¿Y quién va a salvarte? Estos muros son gruesos y los guardias son muchos.' },
        { speaker: 'Reina', text: '¡Vinn! ¡Él me encontrará y te destruirá!' },
        { speaker: 'Coloso de Tinta', text: 'Hmph. Yo me encargaré de eso.' },
        { speaker: 'Coloso de Tinta', text: '¡Golem! Ve al Bosque. Si ves a un caballero, aplástalo.' },
        { speaker: 'Golem', text: '...ENTENDIDO. INICIANDO APLASTAMIENTO.' },
        { speaker: 'Coloso de Tinta', text: 'Bien... ahora ocupémonos de tu vestido. Tenemos una boda que preparar.' }
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
            { speaker: 'The Duo', text: 'My Queen, we have returned.' },
            { speaker: 'Vinn', text: 'I bring you this rare Crimson Rose...' },
            { speaker: 'Jhon', text: '...and I bring this leaf Amulet from the Eastern Woods.' },
            { speaker: 'Queen', text: 'Stunning! Our kingdom is truly protected by the best.' },
            { speaker: 'Queen', text: 'Wait... what is that noise?' },
            { speaker: 'The Duo', text: 'A portal! My Queen, get back!' },
            { speaker: 'Queen', text: 'HELP ME!' },
            { speaker: 'The Duo', text: 'NO!! We are coming for you!' },
            { speaker: 'Queen', text: 'Ouch... where are we?' },
            { speaker: 'Skelet-Bot', text: 'TARGET SECURED. INITIATING RETRIEVAL.' },
            { speaker: 'Queen', text: 'No! Let me go!' },
            { speaker: 'Vinn', text: 'Ugh... my head...' },
            { speaker: 'Jhon', text: 'Hey! Stop them!' },
            { speaker: 'The Duo', text: 'They are gone... but we can still see their trail.' },
            { speaker: 'The Duo', text: 'We must follow them. Hold on, my Queen!' },
            { speaker: 'System', text: 'Later...' },
            { speaker: 'Ink Colossus', text: 'You are a beautiful flower, my dear. I offer you my hand in marriage.' },
            { speaker: 'Queen', text: 'NO! Never!' },
            { speaker: 'Ink Colossus', text: 'And who is going to save you? These walls are thick, and the guards are many.' },
            { speaker: 'Queen', text: 'The Duo! They will find me and destroy you!' },
            { speaker: 'Ink Colossus', text: 'Hmph. I\'ll take care of that.' },
            { speaker: 'Ink Colossus', text: 'Golem! Go to the Forest. If you see them, crush them.' },
            { speaker: 'Golem', text: '...ACKNOWLEDGED. CRUSHING INITIATED.' },
            { speaker: 'Ink Colossus', text: 'Right... now let\'s take care of your dress. We have a wedding to prepare.' }
        ];

        const duo_es = [
            { speaker: 'El Dúo', text: 'Mi Reina, hemos vuelto.' },
            { speaker: 'Vinn', text: 'Te traemos esta rara Rosa Carmesí...' },
            { speaker: 'Jhon', text: '...y yo este Amuleto de hojas de los Bosques del Este.' },
            { speaker: 'Queen', text: '¡Increíble! Nuestro reino está protegido por los mejores.' },
            { speaker: 'Queen', text: 'Espera... ¿qué es ese ruido?' },
            { speaker: 'El Dúo', text: '¡Un portal! ¡Mi Reina, atrás!' },
            { speaker: 'Queen', text: '¡AYÚDENME!' },
            { speaker: 'El Dúo', text: '¡¡NO!! ¡Iremos por ti!' },
            { speaker: 'Queen', text: 'Ay... ¿dónde estamos?' },
            { speaker: 'Skelet-Bot', text: 'OBJETIVO ASEGURADO. INICIANDO RECUPERACIÓN.' },
            { speaker: 'Queen', text: '¡No! ¡Suéltenme!' },
            { speaker: 'Vinn', text: 'Uf... mi cabeza...' },
            { speaker: 'Jhon', text: '¡Oigan! ¡Deténganlos!' },
            { speaker: 'El Dúo', text: 'Se han ido... pero podemos ver su rastro.' },
            { speaker: 'El Dúo', text: 'Debemos seguirlos. ¡Resista, mi Reina!' },
            { speaker: 'Sistema', text: 'Luego...' },
            { speaker: 'Coloso de Tinta', text: 'Eres una flor hermosa, querida. Te ofrezco mi mano en matrimonio.' },
            { speaker: 'Reina', text: '¡NO! ¡Jamás!' },
            { speaker: 'Coloso de Tinta', text: '¿Y quién va a salvarte? Estos muros son gruesos y los guardias son muchos.' },
            { speaker: 'Reina', text: '¡El Dúo! ¡Ellos me encontrarán y te destruirán!' },
            { speaker: 'Coloso de Tinta', text: 'Hmph. Yo me encargaré de eso.' },
            { speaker: 'Coloso de Tinta', text: '¡Golem! Ve al Bosque. Si los ves, aplástalos.' },
            { speaker: 'Golem', text: '...ENTENDIDO. INICIANDO APLASTAMIENTO.' },
            { speaker: 'Coloso de Tinta', text: 'Bien... ahora ocupémonos de tu vestido. Tenemos una boda que preparar.' }
        ];

        if (is2P) {
            this.dialogues = lang === 'en' ? duo_en : duo_es;
        } else {
            this.dialogues = lang === 'en' ? this.dialogues_en : this.dialogues_es;
        }
    }

    update(dt: number): boolean | { speaker: string, text: string } | null {
        this.timer += dt;

        // --- Milestone-based phase synchronization ---
        // This ensures animations stay in parity with dialogue if user skips fast
        if (this.dialogueIndex >= 23) {
            this.phase = 'FINISHED';
        } else if (this.dialogueIndex >= 21) {
            if (this.phase !== 'GOLEM_LEAVE' && this.phase !== 'COLOSSUS_LEAVE') this.phase = 'GOLEM_LEAVE';
        } else if (this.dialogueIndex >= 16) {
            this.phase = 'BOSS_LAB_TALK';
            this.colossusY = 350; // Snap Colossus into position
            this.queenX = 500; this.queenY = 420;
        } else if (this.dialogueIndex >= 15) {
            if (this.phase !== 'BOSS_LAB_INTRO' && this.phase !== 'BOSS_LAB_TALK' && this.phase !== 'GOLEM_LEAVE' && this.phase !== 'COLOSSUS_LEAVE') {
                this.phase = 'LATER_SCREEN';
            }
        } else if (this.dialogueIndex >= 10) {
            this.phase = 'VINN_LANDING';
            this.vinnY = 420; // Snap to ground
        } else if (this.dialogueIndex >= 8) {
            this.phase = 'TECH_KIDNAP';
        } else if (this.dialogueIndex >= 7) {
            if (this.phase === 'VINN_JUMPS' || this.phase === 'QUEEN_SUCKED_IN' || this.phase === 'PORTAL_OPENS' || this.phase === 'KNEEL_AND_TALK' || this.phase === 'WALK_IN') {
                this.phase = 'FOREST_DROP';
                this.vinnX = 200; this.vinnY = 420; this.queenX = 400; this.queenY = 420;
            }
        } else if (this.dialogueIndex >= 5) {
            if (this.phase === 'WALK_IN' || this.phase === 'KNEEL_AND_TALK') {
                this.phase = 'PORTAL_OPENS';
                this.portalSize = 150;
            }
        }

        switch (this.phase) {
            case 'WALK_IN':
                if (this.vinnX < 550) this.vinnX += 2.5;
                else { this.phase = 'KNEEL_AND_TALK'; this.timer = 0; }
                break;
            case 'KNEEL_AND_TALK':
                if (this.dialogueIndex > 2) { this.phase = 'PORTAL_OPENS'; this.timer = 0; }
                break;
            case 'PORTAL_OPENS':
                if (this.portalSize < 150) this.portalSize += 1.5;
                this.portalAngle += 0.05;
                if (this.dialogueIndex >= 5 || this.timer > 5) { this.phase = 'QUEEN_SUCKED_IN'; this.timer = 0; }
                break;
            case 'QUEEN_SUCKED_IN':
                this.portalAngle += 0.1;
                this.queenX += (700 - this.queenX) * 0.1;
                this.queenY += (200 - this.queenY) * 0.1;
                if ((this.timer > 2 && this.dialogueIndex >= 6) || this.dialogueIndex >= 7) { 
                    this.phase = 'VINN_JUMPS'; this.timer = 0; 
                }
                break;
            case 'VINN_JUMPS':
                this.portalAngle += 0.2;
                this.vinnX += (700 - this.vinnX) * 0.05;
                this.vinnY += (200 - this.vinnY) * 0.05;
                if (this.timer > 2.5 || this.dialogueIndex >= 7) { 
                    this.phase = 'FOREST_DROP'; this.timer = 0; this.dialogueIndex = Math.max(7, this.dialogueIndex);
                    this.vinnX = 200; this.vinnY = -100; this.queenX = 400; this.queenY = -100;
                }
                break;
            case 'FOREST_DROP':
                if (this.queenY < 420) this.queenY += 5;
                if (this.vinnY < 420) this.vinnY += 5;
                if ((this.timer > 2 && this.dialogueIndex === 7) || this.dialogueIndex >= 8) { 
                    this.phase = 'TECH_KIDNAP'; this.timer = 0; this.dialogueIndex = Math.max(8, this.dialogueIndex);
                }
                break;
            case 'TECH_KIDNAP':
                if (this.timer > 1.5 && this.dialogueIndex === 8) this.advanceDialogue();
                if (this.dialogueIndex === 9) {
                    this.queenX += 4;
                    if (this.queenX > 1200) { this.phase = 'VINN_LANDING'; this.timer = 0; this.dialogueIndex = 10; }
                }
                break;
            case 'VINN_LANDING':
                if ((this.dialogueIndex === 14 && this.timer > 2) || this.dialogueIndex >= 15) {
                     this.phase = 'LATER_SCREEN'; this.timer = 0; this.dialogueIndex = Math.max(15, this.dialogueIndex);
                }
                break;
            case 'LATER_SCREEN':
                if (this.timer > 3 || this.dialogueIndex >= 16) {
                    this.phase = 'BOSS_LAB_INTRO'; this.timer = 0;
                    this.queenX = 500; this.queenY = 420;
                }
                break;
            case 'BOSS_LAB_INTRO':
                this.colossusY += (350 - this.colossusY) * 0.05;
                if (this.timer > 2 || this.dialogueIndex >= 16) { this.phase = 'BOSS_LAB_TALK'; this.timer = 0; }
                break;
            case 'BOSS_LAB_TALK':
                if (this.dialogueIndex >= 21) { this.phase = 'GOLEM_LEAVE'; this.timer = 0; }
                break;
            case 'GOLEM_LEAVE':
                this.boss1X += 5;
                if (this.timer > 2 || this.dialogueIndex >= 23) { this.phase = 'COLOSSUS_LEAVE'; this.timer = 0; this.dialogueIndex = Math.max(23, this.dialogueIndex); }
                break;
            case 'COLOSSUS_LEAVE':
                this.colossusY += 2;
                this.queenY += 2;
                if (this.timer > 3 || this.phase as any === 'FINISHED') this.phase = 'FINISHED';
                break;
        }

        if (this.phase === 'FINISHED') return true;
        
        this.currentDialogue = null;
        if (this.dialogueIndex < this.dialogues.length) {
             const currentD = this.dialogues[this.dialogueIndex];
             this.currentDialogue = currentD;
             
             if (this.phase === 'LATER_SCREEN') this.currentDialogue = null; // No box during transition
             
             if (this.phase === 'PORTAL_OPENS' && this.dialogueIndex === 3 && this.portalSize > 80) this.advanceDialogue();
             if (this.phase === 'PORTAL_OPENS' && this.dialogueIndex === 4 && this.timer > 4) this.advanceDialogue();
             if (this.phase === 'QUEEN_SUCKED_IN' && this.dialogueIndex === 5 && this.timer > 1.5) this.advanceDialogue();
             
             return currentD;
        }
        return null;
    }

    advanceDialogue() {
        if (this.dialogueIndex < this.dialogues.length) {
            this.dialogueIndex++;
            this.timer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        if (this.phase === 'LATER_SCREEN') {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 2000, 500);
            ctx.fillStyle = '#fff'; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center';
            ctx.fillText(this.language === 'en' ? 'Later...' : 'Luego...', 500, 250);
            ctx.restore();
            return;
        }

        const isForest = ['FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING'].includes(this.phase);
        const isLab = ['BOSS_LAB_INTRO', 'BOSS_LAB_TALK', 'GOLEM_LEAVE', 'COLOSSUS_LEAVE'].includes(this.phase);

        if (isLab) {
            this.drawLab(ctx);
            this.drawGolem(ctx, this.boss1X, 420);
            this.drawBlazeKing(ctx, this.boss2X, 420);
            this.drawInkColossus(ctx, this.colossusX, this.colossusY);
            if (this.phase !== 'COLOSSUS_LEAVE' || this.timer < 3) {
                this.drawQueen(ctx, this.queenX, this.queenY);
            }
        } else if (!isForest) {
            ctx.fillStyle = '#2c1e3d'; ctx.fillRect(0, 0, 2000, 500);
            ctx.fillStyle = '#4a0b2e'; ctx.fillRect(0, 420, 2000, 80);
            
            if (this.phase !== 'WALK_IN' && this.phase !== 'KNEEL_AND_TALK' || this.dialogueIndex >= 3) {
                ctx.fillStyle = '#0a0510'; ctx.fillRect(600, 50, 180, 300);
                if (this.portalSize > 0) {
                    ctx.save(); ctx.translate(690, 200); ctx.rotate(this.portalAngle);
                    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, this.portalSize);
                    gradient.addColorStop(0, '#000'); gradient.addColorStop(0.5, '#4b0082'); gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, this.portalSize, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = '#223344'; ctx.fillRect(600, 50, 180, 300);
                ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(650, 100, 20, 0, Math.PI*2); ctx.fill();
            }
            this.drawThrone(ctx, 600, 420);
        } else {
            ctx.fillStyle = '#1a2e1a'; ctx.fillRect(0, 0, 2000, 500);
            ctx.fillStyle = '#0f1a0f'; ctx.fillRect(0, 420, 2000, 80);
            
            ctx.fillStyle = '#0a140a';
            for(let i=0; i<15; i++) {
                ctx.fillRect(i*120 + 20, 100, 30, 320);
                ctx.beginPath(); ctx.moveTo(i*120, 150); ctx.lineTo(i*120+35, 50); ctx.lineTo(i*120+70, 150); ctx.fill();
            }
        }

        if (this.phase !== 'FINISHED' && this.phase !== 'VINN_JUMPS' && !isLab) {
            this.drawQueen(ctx, this.queenX, this.queenY);
        }
        if (this.phase !== 'FINISHED' && !isLab) {
            this.drawHero(ctx, this.vinnX, this.vinnY, this.p1Color, 'NORMAL');
            if (this.isTwoPlayer) {
                this.drawHero(ctx, this.vinnX - 40, this.vinnY, this.p2Color, 'SPIKY');
            }
        }

        if (this.phase === 'TECH_KIDNAP' && this.dialogueIndex >= 9) {
            this.drawTechSkeleton(ctx, this.queenX - 30, 420, true);
            this.drawTechSkeleton(ctx, this.queenX + 30, 420, true);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            for(let i=0; i<10; i++) ctx.fillRect(this.queenX - 50 - Math.random()*100, 440 + Math.random()*20, 10, 5);
        }

        if (this.currentDialogue) {
            const boxW = 800;
            const boxX = (1000 - boxW) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(boxX, 30, boxW, 100);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 100);
            ctx.fillStyle = this.currentDialogue.speaker === 'Vinn' ? '#00f2ff' : (this.currentDialogue.speaker === 'Queen' ? '#ff69b4' : '#ff3333');
            ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', boxX + 20, 50);
            ctx.fillStyle = '#fff'; ctx.font = '12px "Press Start 2P"';
            
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > 760 && n > 0) { ctx.fillText(line, boxX + 20, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, boxX + 20, lineY);
            if (this.timer > 0.5 && !['PORTAL_OPENS', 'QUEEN_SUCKED_IN', 'VINN_JUMPS', 'FOREST_DROP'].includes(this.phase)) {
                ctx.fillStyle = '#ffcc00'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'right'; ctx.fillText('[SPACE] to continue', boxX + 780, 110); ctx.textAlign = 'left';
            }
        }

        ctx.restore();
    }

    drawTechSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, running: boolean) {
        ctx.save();
        ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3;
        const bounce = running ? Math.sin(Date.now()/100)*10 : 0;
        ctx.beginPath(); ctx.arc(x, y-50+bounce, 10, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x+4, y-50+bounce, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y-40+bounce); ctx.lineTo(x, y+bounce); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y-30+bounce); ctx.lineTo(x+15, y-20+bounce); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y-30+bounce); ctx.lineTo(x-15, y-20+bounce); ctx.stroke();
        const legS = running ? Math.sin(Date.now()/50)*20 : 0;
        ctx.beginPath(); ctx.moveTo(x, y+bounce); ctx.lineTo(x-legS, y+30+bounce); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y+bounce); ctx.lineTo(x+legS, y+30+bounce); ctx.stroke();
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        const sittingY = (this.phase === 'WALK_IN' || this.phase === 'KNEEL_AND_TALK' || this.phase === 'PORTAL_OPENS') ? y + 10 : y;
        ctx.beginPath(); ctx.arc(x, sittingY - 50, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(x - 10, sittingY - 62); ctx.lineTo(x - 15, sittingY - 75); ctx.lineTo(x - 5, sittingY - 65); ctx.lineTo(x, sittingY - 80); ctx.lineTo(x + 5, sittingY - 65); ctx.lineTo(x + 15, sittingY - 75); ctx.lineTo(x + 10, sittingY - 62); ctx.fill();
        ctx.strokeStyle = '#ff69b4'; ctx.beginPath(); ctx.moveTo(x, sittingY - 38); ctx.lineTo(x, sittingY); ctx.stroke();
        ctx.fillStyle = '#800080'; ctx.beginPath(); ctx.moveTo(x, sittingY - 30);
        if (this.phase === 'QUEEN_SUCKED_IN' || this.phase === 'VINN_JUMPS' || this.phase === 'FOREST_DROP' || this.phase === 'TECH_KIDNAP') {
             ctx.lineTo(x - 20, sittingY + 25); ctx.lineTo(x + 20, sittingY + 25);
        } else {
             ctx.lineTo(x - 25, sittingY + 20); ctx.lineTo(x + 25, sittingY + 20);
        }
        ctx.fill();
        ctx.restore();
    }

    drawHero(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, visual: 'NORMAL' | 'SPIKY') {
        ctx.save();
        ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = color;
        const headY = (['WALK_IN', 'FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING'].includes(this.phase)) ? y - 50 : y - 35;
        
        ctx.beginPath(); ctx.arc(x, headY, 12, 0, Math.PI * 2); ctx.stroke();
        
        if (visual === 'SPIKY') {
            ctx.beginPath(); ctx.moveTo(x-15, headY-10); ctx.lineTo(x-5, headY-25); ctx.lineTo(x, headY-12); ctx.lineTo(x+5, headY-25); ctx.lineTo(x+15, headY-10); ctx.stroke();
        }

        ctx.beginPath(); ctx.moveTo(x, headY + 12); ctx.lineTo(x, y); ctx.stroke();
        
        const s = (this.phase === 'WALK_IN') ? Math.sin(this.timer*12)*15 : 0;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x-s, y+30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+s, y+30); ctx.stroke();

        if (this.phase === 'WALK_IN') {
            ctx.beginPath(); ctx.moveTo(x, headY + 22); ctx.lineTo(x + 15, headY + 40); ctx.stroke();
            if (visual === 'NORMAL') this.drawRose(ctx, x + 15, headY + 30);
            else {
                ctx.fillStyle = '#ffcc00'; ctx.fillRect(x+10, headY+25, 10, 10); // Gift box
            }
        } else if (this.phase === 'KNEEL_AND_TALK' && this.dialogueIndex < 2) {
            ctx.beginPath(); ctx.moveTo(x, headY + 22); ctx.lineTo(x + 30, headY + 15); ctx.stroke();
            if (visual === 'NORMAL') this.drawRose(ctx, x + 35, headY + 5);
        } else if (this.phase === 'PORTAL_OPENS' && this.dialogueIndex < 6) {
             ctx.beginPath(); ctx.moveTo(x, headY + 22); ctx.lineTo(x + 20, y + 30); ctx.stroke();
             ctx.lineWidth = 6; ctx.strokeStyle = '#ffcc00'; ctx.shadowColor = '#ffcc00';
             ctx.beginPath(); ctx.moveTo(x + 22, y + 10); ctx.lineTo(x + 22, y + 40); ctx.stroke();
             ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
        } else if (['QUEEN_SUCKED_IN', 'VINN_JUMPS', 'FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING'].includes(this.phase)) {
             ctx.beginPath(); ctx.moveTo(x, headY + 22); ctx.lineTo(x - 15, y + 15); ctx.stroke();
             ctx.lineWidth = 6; ctx.strokeStyle = '#ffcc00'; ctx.shadowColor = '#ffcc00';
             ctx.beginPath(); ctx.moveTo(x - 15, y + 15); ctx.lineTo(x - 40, y - 10); ctx.stroke();
             ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
        }

        ctx.restore();
    }

    drawRose(ctx: CanvasRenderingContext2D, x: number, y: number) {
         ctx.save();
         ctx.strokeStyle = '#008000'; ctx.lineWidth = 2; ctx.shadowColor = 'transparent';
         ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 15); ctx.stroke();
         ctx.fillStyle = '#ff0000'; ctx.shadowBlur = 5; ctx.shadowColor = '#ff0000';
         ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
         ctx.restore();
    }

    drawThrone(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#b8860b'; ctx.fillRect(x-30, y-50, 60, 80); ctx.fillStyle = '#daa520'; ctx.fillRect(x-35, y+10, 70, 20); ctx.restore();
    }

    drawLab(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = '#101020'; ctx.fillRect(0, 420, 2000, 80);
        
        // Neon pipes/wires
        ctx.strokeStyle = '#330066'; ctx.lineWidth = 4;
        for(let i=0; i<10; i++) {
            ctx.beginPath(); ctx.moveTo(i*200, 0); ctx.lineTo(i*200 + 50, 420); ctx.stroke();
            ctx.strokeStyle = i % 2 === 0 ? '#ff00ff' : '#00ffff';
            ctx.beginPath(); ctx.arc(i*200 + 50, 100, 5, 0, Math.PI*2); ctx.stroke();
        }
    }

    drawInkColossus(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#000'; ctx.shadowBlur = 30; ctx.shadowColor = '#000';
        ctx.beginPath();
        for(let i=0; i<12; i++) {
            const angle = (i/12) * Math.PI * 2;
            const r = 120 + Math.sin(Date.now()/200 + i)*20;
            const tx = x + Math.cos(angle)*r;
            const ty = y - 100 + Math.sin(angle)*r*0.6;
            if(i===0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.fill();
        // Dots
        for(let i=0; i<5; i++) {
            ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(x - 40 + i*20, y - 100 + Math.sin(Date.now()/500 + i)*15, 8, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }

    drawGolem(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#4a5d23'; ctx.strokeStyle = '#2d3e12'; ctx.lineWidth = 4;
        const bounce = Math.sin(Date.now()/400)*5;
        ctx.fillRect(x-40, y-80+bounce, 80, 80);
        ctx.fillRect(x-20, y-105+bounce, 40, 40);
        ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(x-10, y-90+bounce, 3, 0, Math.PI*2); ctx.arc(x+10, y-90+bounce, 3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    drawBlazeKing(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        const flicker = Math.random()*10;
        const grad = ctx.createRadialGradient(x, y-50, 5, x, y-50, 40+flicker);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, '#ffcc00'); grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y-50, 40+flicker, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

export class World1ClearCutscene {
    phase: string = 'TALK_WEDDING';
    timer: number = 0;
    dialogueIndex: number = 0;
    language: 'en' | 'es' = 'en';
    
    // Positions
    queenX: number = 500;
    queenY: number = 420;
    colossusX: number = 500;
    colossusY: number = 350;
    boss1X: number = 1100; // Golem (starts offscreen)
    boss2X: number = 150;  // Blaze King
    botX: number = 1100;   // Skelet-bot
    
    currentDialogue: { speaker: string, text: string } | null = null;
    dialogues: { speaker: string, text: string }[] = [];

    constructor() {}

    setLanguage(lang: 'en' | 'es') {
        this.language = lang;
        const dialogues_en = [
            { speaker: 'Ink Colossus', text: 'Our wedding is in just a few days, beautiful. It will be the grandest event these lands have ever seen.' },
            { speaker: 'Queen', text: '... (Please Vinn, please come far for help...)' },
            { speaker: 'Skelet-bot', text: 'Lord Colossus! The Golem has returned from the forest.' },
            { speaker: 'Golem', text: 'i... i couldt... commmmmmplete... the ee miiission...' },
            { speaker: 'Ink Colossus', text: 'Useless scrap! Skelet-bots! Grab this pathetic golem and take him for recycling!' },
            { speaker: 'Ink Colossus', text: 'Blaze! I declare you King of the Volcano Lands. Go now, and defeat that knight Vinn!' },
            { speaker: 'Blaze King', text: 'Thank you, my lord! Truly, an honor! I shall not fail you!' },
            { speaker: 'Ink Colossus', text: 'Right. Let\'s go, beautiful. It\'s lunch time.' }
        ];

        const dialogues_es = [
            { speaker: 'Coloso de Tinta', text: 'Nuestra boda es en solo unos días, hermosa. Será el evento más grande que estas tierras hayan visto jamás.' },
            { speaker: 'Reina', text: '... (Por favor Vinn, ven pronto a ayudar...)' },
            { speaker: 'Skelet-bot', text: '¡Lord Coloso! El Golem ha regresado del bosque.' },
            { speaker: 'Golem', text: 'No... no pude... com-completar... la miiii-misión...' },
            { speaker: 'Coloso de Tinta', text: '¡Chatarra inútil! ¡Skelet-bots! ¡Agarren a este patético golem y llévenlo a reciclar!' },
            { speaker: 'Coloso de Tinta', text: '¡Blaze! Te declaro Rey de las Tierras Volcánicas. ¡Ve ahora y derrota a ese caballero Vinn!' },
            { speaker: 'Rey de Fuego', text: '¡Gracias, mi señor! ¡Realmente un honor! ¡No le fallaré!' },
            { speaker: 'Coloso de Tinta', text: 'Bien. Vámonos, hermosa. Es la hora del almuerzo.' }
        ];

        this.dialogues = lang === 'en' ? dialogues_en : dialogues_es;
    }

    update(dt: number): boolean | { speaker: string, text: string } | null {
        this.timer += dt;

        switch (this.phase) {
            case 'TALK_WEDDING':
                if (this.dialogueIndex >= 2) { this.phase = 'BOT_NOTICE'; this.timer = 0; }
                break;
            case 'BOT_NOTICE':
                this.botX += (850 - this.botX) * 0.1;
                if (this.dialogueIndex >= 3) { this.phase = 'GOLEM_ENTERS'; this.timer = 0; }
                break;
            case 'GOLEM_ENTERS':
                this.botX += (1200 - this.botX) * 0.1; // Bot retires
                this.boss1X += (800 - this.boss1X) * 0.05; // Golem limps in
                if (this.dialogueIndex >= 5) { this.phase = 'REPAIR_ORDER'; this.timer = 0; }
                break;
            case 'REPAIR_ORDER':
                this.botX += (750 - this.botX) * 0.1; // Bots return to grab him
                if (this.timer > 1.5) {
                    this.boss1X += 5; // Dragging him out
                    this.botX += 5;
                    if (this.boss1X > 1100) { this.phase = 'BLAZE_PROMOTION'; this.timer = 0; }
                }
                break;
            case 'BLAZE_PROMOTION':
                if (this.dialogueIndex >= 7) this.advanceDialogue(); // Auto skip to Blaze response
                if (this.dialogueIndex >= 8) { this.phase = 'LUNCH_EXIT'; this.timer = 0; }
                break;
            case 'LUNCH_EXIT':
                if (this.dialogueIndex >= 8) {
                    this.colossusY += 2;
                    this.queenY += 2;
                    if (this.timer > 3) return true; // Finish
                }
                break;
        }

        this.currentDialogue = null;
        if (this.dialogueIndex < this.dialogues.length) {
            this.currentDialogue = this.dialogues[this.dialogueIndex];
            return this.currentDialogue;
        }
        return null;
    }

    advanceDialogue() {
        if (this.dialogueIndex < this.dialogues.length) {
            this.dialogueIndex++;
            this.timer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Lab background
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = '#101020'; ctx.fillRect(0, 420, 2000, 80);
        ctx.strokeStyle = '#330066'; ctx.lineWidth = 4;
        for(let i=0; i<10; i++) {
            ctx.beginPath(); ctx.moveTo(i*200, 0); ctx.lineTo(i*200 + 50, 420); ctx.stroke();
            ctx.strokeStyle = i % 2 === 0 ? '#ff00ff' : '#00ffff';
            ctx.beginPath(); ctx.arc(i*200 + 50, 100, 5, 0, Math.PI*2); ctx.stroke();
        }

        // Draw Actors
        if (this.phase === 'BOT_NOTICE' || this.phase === 'GOLEM_ENTERS' || this.phase === 'REPAIR_ORDER') {
            this.drawSkeletBot(ctx, this.botX, 420, this.botX < 1100);
            if (this.phase === 'REPAIR_ORDER') this.drawSkeletBot(ctx, this.botX + 60, 420, true);
        }

        this.drawDamagedGolem(ctx, this.boss1X, 420);
        this.drawBlazeKing(ctx, this.boss2X, 420);
        this.drawInkColossus(ctx, this.colossusX, this.colossusY);
        this.drawQueen(ctx, this.queenX, this.queenY);

        if (this.currentDialogue) {
            const boxW = 800;
            const boxX = (1000 - boxW) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(boxX, 30, boxW, 100);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 100);
            
            // Speaker colors
            let color = '#fff';
            if (this.currentDialogue.speaker.includes('Colossus') || this.currentDialogue.speaker.includes('Coloso')) color = '#ff3333';
            else if (this.currentDialogue.speaker === 'Queen' || this.currentDialogue.speaker === 'Reina') color = '#ff69b4';
            else if (this.currentDialogue.speaker === 'Golem') color = '#4a5d23';
            else if (this.currentDialogue.speaker.includes('Blaze')) color = '#ffcc00';

            ctx.fillStyle = color;
            ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', boxX + 20, 50);
            
            // Text color: Internal thoughts are pink/italic style (simulated with color)
            ctx.fillStyle = (this.currentDialogue.text.includes('(')) ? '#ff99cc' : '#fff';
            ctx.font = '12px "Press Start 2P"';
            
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > 760 && n > 0) { ctx.fillText(line, boxX + 20, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, boxX + 20, lineY);
        }

        ctx.restore();
    }

    // --- Helper Drawings (reusing/tweaking Cutscene logic) ---
    drawDamagedGolem(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#4a5d23'; ctx.strokeStyle = '#2d3e12'; ctx.lineWidth = 4;
        const bounce = Math.sin(Date.now()/600)*3; // Slower, weak bounce
        ctx.fillRect(x-40, y-80+bounce, 80, 80);
        ctx.fillRect(x-20, y-105+bounce, 40, 40);
        
        // Cracks
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x-30, y-70); ctx.lineTo(x-10, y-50); ctx.lineTo(x-20, y-30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+20, y-100); ctx.lineTo(x+30, y-85); ctx.stroke();
        
        // Bandages
        ctx.fillStyle = '#fff';
        ctx.fillRect(x-42, y-50, 84, 10);
        ctx.fillRect(x-10, y-108, 10, 25);

        ctx.fillStyle = '#ff3333'; // Red eyes for "hurt"
        ctx.beginPath(); ctx.arc(x-10, y-90+bounce, 3, 0, Math.PI*2); ctx.arc(x+10, y-90+bounce, 3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    drawBlazeKing(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        const flicker = Math.random()*10;
        const grad = ctx.createRadialGradient(x, y-50, 5, x, y-50, 40+flicker);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, '#ffcc00'); grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y-50, 40+flicker, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    drawSkeletBot(ctx: CanvasRenderingContext2D, x: number, y: number, running: boolean) {
        ctx.save();
        ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3;
        const bounce = running ? Math.sin(Date.now()/100)*10 : 0;
        ctx.beginPath(); ctx.arc(x, y-50+bounce, 10, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x+4, y-50+bounce, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y-40+bounce); ctx.lineTo(x, y+bounce); ctx.stroke();
        ctx.restore();
    }

    drawInkColossus(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#000'; ctx.shadowBlur = 30; ctx.shadowColor = '#000';
        ctx.beginPath();
        for(let i=0; i<12; i++) {
            const angle = (i/12) * Math.PI * 2;
            const r = 120 + Math.sin(Date.now()/200 + i)*20;
            const tx = x + Math.cos(angle)*r;
            const ty = y - 100 + Math.sin(angle)*r*0.6;
            if(i===0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.fill();
        for(let i=0; i<5; i++) {
            ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(x-40+i*20, y-100+Math.sin(Date.now()/500+i)*15, 8, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        ctx.beginPath(); ctx.arc(x, y - 40, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#ff69b4'; ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y + 10); ctx.stroke();
        ctx.fillStyle = '#800080'; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x - 20, y + 25); ctx.lineTo(x + 20, y + 25); ctx.fill();
        ctx.restore();
    }
}
