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

        if (this.dialogueIndex >= 23) {
            this.phase = 'FINISHED';
        } else if (this.dialogueIndex >= 21) {
            if (this.phase !== 'GOLEM_LEAVE' && this.phase !== 'COLOSSUS_LEAVE') this.phase = 'GOLEM_LEAVE';
        } else if (this.dialogueIndex >= 16) {
            this.phase = 'BOSS_LAB_TALK';
            this.colossusY = 350;
            this.queenX = 500; this.queenY = 420;
        } else if (this.dialogueIndex >= 15) {
            if (this.phase !== 'BOSS_LAB_INTRO' && this.phase !== 'BOSS_LAB_TALK' && this.phase !== 'GOLEM_LEAVE' && this.phase !== 'COLOSSUS_LEAVE') {
                this.phase = 'LATER_SCREEN';
            }
        } else if (this.dialogueIndex >= 10) {
            this.phase = 'VINN_LANDING';
            this.vinnY = 420;
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
                if (this.dialogueIndex >= 23) { this.phase = 'COLOSSUS_LEAVE'; this.timer = 0; }
                break;
            case 'COLOSSUS_LEAVE':
                this.colossusY += 2;
                this.queenY += 2;
                if (this.timer > 3) this.phase = 'FINISHED';
                break;
        }

        if (this.phase === 'FINISHED') return true;

        this.currentDialogue = null;
        if (this.dialogueIndex < this.dialogues.length) {
            const currentD = this.dialogues[this.dialogueIndex];
            this.currentDialogue = currentD;
            if (this.phase === 'LATER_SCREEN') this.currentDialogue = null;
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
            if (this.phase !== 'COLOSSUS_LEAVE' || this.timer < 3) this.drawQueen(ctx, this.queenX, this.queenY);
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
                ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(650, 100, 20, 0, Math.PI * 2); ctx.fill();
            }
            this.drawThrone(ctx, 600, 420);
        } else {
            ctx.fillStyle = '#1a2e1a'; ctx.fillRect(0, 0, 2000, 500);
            ctx.fillStyle = '#0f1a0f'; ctx.fillRect(0, 420, 2000, 80);
            ctx.fillStyle = '#0a140a';
            for (let i = 0; i < 15; i++) {
                ctx.fillRect(i * 120 + 20, 100, 30, 320);
                ctx.beginPath(); ctx.moveTo(i * 120, 150); ctx.lineTo(i * 120 + 35, 50); ctx.lineTo(i * 120 + 70, 150); ctx.fill();
            }
        }
        if (this.phase !== 'FINISHED' && this.phase !== 'VINN_JUMPS' && !isLab) this.drawQueen(ctx, this.queenX, this.queenY);
        if (this.phase !== 'FINISHED' && !isLab) {
            this.drawHero(ctx, this.vinnX, this.vinnY, this.p1Color, 'NORMAL');
            if (this.isTwoPlayer) this.drawHero(ctx, this.vinnX - 40, this.vinnY, this.p2Color, 'SPIKY');
        }
        if (this.phase === 'TECH_KIDNAP' && this.dialogueIndex >= 9) {
            this.drawTechSkeleton(ctx, this.queenX - 30, 420, true);
            this.drawTechSkeleton(ctx, this.queenX + 30, 420, true);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            for (let i = 0; i < 10; i++) ctx.fillRect(this.queenX - 50 - Math.random() * 100, 440 + Math.random() * 20, 10, 5);
        }
        if (this.currentDialogue) {
            const boxW = 800; const boxX = (1000 - boxW) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(boxX, 30, boxW, 100);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 100);
            ctx.fillStyle = this.currentDialogue.speaker === 'Vinn' ? '#00f2ff' : (this.currentDialogue.speaker === 'Queen' ? '#ff69b4' : '#ff3333');
            ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', boxX + 20, 50);
            ctx.fillStyle = '#fff'; ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > 760 && n > 0) { ctx.fillText(line, boxX + 20, lineY); line = words[n] + ' '; lineY += 20; }
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
        ctx.save(); ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3;
        const bounce = running ? Math.sin(Date.now() / 100) * 10 : 0;
        ctx.beginPath(); ctx.arc(x, y - 50 + bounce, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x + 4, y - 50 + bounce, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - 40 + bounce); ctx.lineTo(x, y + bounce); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 30 + bounce); ctx.lineTo(x + 15, y - 20 + bounce); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 30 + bounce); ctx.lineTo(x - 15, y - 20 + bounce); ctx.stroke();
        const legS = running ? Math.sin(Date.now() / 50) * 20 : 0;
        ctx.beginPath(); ctx.moveTo(x, y + bounce); ctx.lineTo(x - legS, y + 30 + bounce); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + bounce); ctx.lineTo(x + legS, y + 30 + bounce); ctx.stroke();
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        const sittingY = (this.phase === 'WALK_IN' || this.phase === 'KNEEL_AND_TALK' || this.phase === 'PORTAL_OPENS') ? y + 10 : y;
        ctx.beginPath(); ctx.arc(x, sittingY - 50, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(x - 10, sittingY - 62); ctx.lineTo(x - 15, sittingY - 75); ctx.lineTo(x - 5, sittingY - 65); ctx.lineTo(x, sittingY - 80); ctx.lineTo(x + 5, sittingY - 65); ctx.lineTo(x + 15, sittingY - 75); ctx.lineTo(x + 10, sittingY - 62); ctx.fill();
        ctx.strokeStyle = '#ff69b4'; ctx.beginPath(); ctx.moveTo(x, sittingY - 38); ctx.lineTo(x, sittingY); ctx.stroke();
        ctx.fillStyle = '#800080'; ctx.beginPath(); ctx.moveTo(x, sittingY - 30);
        if (this.phase === 'QUEEN_SUCKED_IN' || this.phase === 'VINN_JUMPS' || this.phase === 'FOREST_DROP' || this.phase === 'TECH_KIDNAP') {
            ctx.lineTo(x - 20, sittingY + 25); ctx.lineTo(x + 20, sittingY + 25);
        } else { ctx.lineTo(x - 25, sittingY + 20); ctx.lineTo(x + 25, sittingY + 20); }
        ctx.fill(); ctx.restore();
    }

    drawHero(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, visual: 'NORMAL' | 'SPIKY') {
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = color;
        const headY = (['WALK_IN', 'FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING'].includes(this.phase)) ? y - 50 : y - 35;
        ctx.beginPath(); ctx.arc(x, headY, 12, 0, Math.PI * 2); ctx.stroke();
        if (visual === 'SPIKY') { ctx.beginPath(); ctx.moveTo(x - 15, headY - 10); ctx.lineTo(x - 5, headY - 25); ctx.lineTo(x, headY - 12); ctx.lineTo(x + 5, headY - 25); ctx.lineTo(x + 15, headY - 10); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(x, headY + 12); ctx.lineTo(x, y); ctx.stroke();
        const s = (this.phase === 'WALK_IN') ? Math.sin(this.timer * 12) * 15 : 0;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s, y + 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y + 30); ctx.stroke();
        if (this.phase === 'WALK_IN') {
            ctx.beginPath(); ctx.moveTo(x, headY + 22); // Note: Simplified
            if (visual === 'NORMAL') this.drawRose(ctx, x + 15, headY + 30);
            else { ctx.fillStyle = '#ffcc00'; ctx.fillRect(x + 10, headY + 25, 10, 10); }
        } else if (this.phase === 'KNEEL_AND_TALK' && this.dialogueIndex < 2) {
            if (visual === 'NORMAL') this.drawRose(ctx, x + 35, headY + 5);
        }
        ctx.restore();
    }

    drawRose(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.strokeStyle = '#008000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 15); ctx.stroke();
        ctx.fillStyle = '#ff0000'; ctx.shadowBlur = 5; ctx.shadowColor = '#ff0000'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    drawThrone(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#b8860b'; ctx.fillRect(x - 30, y - 50, 60, 80); ctx.fillStyle = '#daa520'; ctx.fillRect(x - 35, y + 10, 70, 20); ctx.restore();
    }

    drawLab(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = '#101020'; ctx.fillRect(0, 420, 2000, 80);
        ctx.strokeStyle = '#330066'; ctx.lineWidth = 4;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath(); ctx.moveTo(i * 200, 0); ctx.lineTo(i * 200 + 50, 420); ctx.stroke();
            ctx.strokeStyle = i % 2 === 0 ? '#ff00ff' : '#00ffff';
            ctx.beginPath(); ctx.arc(i * 200 + 50, 100, 5, 0, Math.PI * 2); ctx.stroke();
        }
    }

    drawGolem(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#4a5d23'; ctx.strokeStyle = '#2d3e12'; ctx.lineWidth = 4;
        const bounce = Math.sin(Date.now() / 400) * 5;
        ctx.fillRect(x - 40, y - 80 + bounce, 80, 80); ctx.fillRect(x - 20, y - 105 + bounce, 40, 40);
        ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(x - 10, y - 90 + bounce, 3, 0, Math.PI * 2); ctx.arc(x + 10, y - 90 + bounce, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    drawBlazeKing(ctx: CanvasRenderingContext2D, x: number, y: number) {
        const helper = new World1ClearCutscene();
        helper.drawBlazeKing(ctx, x, y, true, false, false);
    }

    drawInkColossus(ctx: CanvasRenderingContext2D, x: number, y: number) {
        const helper = new World1ClearCutscene();
        helper.drawInkColossus(ctx, x, y);
    }
}

export class World1ClearCutscene {
    phase: string = 'TALK_WEDDING';
    timer: number = 0;
    dialogueIndex: number = 0;
    language: 'en' | 'es' = 'en';
    queenX: number = 500; queenY: number = 420;
    colossusX: number = 500; colossusY: number = 350;
    boss1X: number = 1100; boss2X: number = 150;
    botX: number = 1100;
    hasCrown: boolean = false;
    currentDialogue: { speaker: string, text: string } | null = null;
    dialogues: { speaker: string, text: string }[] = [];

    setLanguage(lang: 'en' | 'es') {
        this.language = lang;
        const d_en = [
            { speaker: 'Ink Colossus', text: 'Our wedding is in just a few days, beautiful. It will be the grandest event these lands have ever seen.' },
            { speaker: 'Queen', text: '... (Please Vinn, please come far for help...)' },
            { speaker: 'Skelet-bot', text: 'Lord Colossus! The Golem has returned from the forest.' },
            { speaker: 'Golem', text: 'i... i couldt... commmmmmplete... the ee miiission...' },
            { speaker: 'Ink Colossus', text: 'Useless scrap! Skelet-bots! Grab this pathetic golem and take him for recycling!' },
            { speaker: 'Ink Colossus', text: 'Blaze! I declare you King of the Volcano Lands. Go now, and defeat that knight Vinn!' },
            { speaker: 'Blaze King', text: 'Thank you, my lord! Truly, an honor! I shall not fail you!' },
            { speaker: 'Ink Colossus', text: 'Right. Let\'s go, beautiful. It\'s lunch time.' }
        ];
        const d_es = [
            { speaker: 'Coloso de Tinta', text: 'Nuestra boda es en solo unos días, hermosa. Será el evento más grande que estas tierras hayan visto jamás.' },
            { speaker: 'Reina', text: '... (Por favor Vinn, ven pronto a ayudar...)' },
            { speaker: 'Skelet-bot', text: '¡Lord Coloso! El Golem ha regresado del bosque.' },
            { speaker: 'Golem', text: 'No... no pude... com-completar... la miiii-misión...' },
            { speaker: 'Coloso de Tinta', text: '¡Chatarra inútil! ¡Skelet-bots! ¡Agarren a este patético golem y llévenlo a reciclar!' },
            { speaker: 'Coloso de Tinta', text: '¡Blaze! Te declaro Rey de las Tierras Volcánicas. ¡Ve ahora y derrota a ese caballero Vinn!' },
            { speaker: 'Rey de Fuego', text: '¡Gracias, mi señor! ¡Realmente un honor! ¡No le fallaré!' },
            { speaker: 'Coloso de Tinta', text: 'Bien. Vámonos, hermosa. Es la hora del almuerzo.' }
        ];
        this.dialogues = lang === 'en' ? d_en : d_es;
    }

    update(dt: number): boolean | { speaker: string, text: string } | null {
        this.timer += dt;
        switch (this.phase) {
            case 'TALK_WEDDING':
                if (this.dialogueIndex >= 2) { this.phase = 'BOT_NOTICE'; this.timer = 0; }
                if (this.dialogueIndex >= 5) this.hasCrown = true;
                break;
            case 'BOT_NOTICE':
                this.botX += (850 - this.botX) * 0.1;
                if (this.dialogueIndex >= 3) { this.phase = 'GOLEM_ENTERS'; this.timer = 0; }
                if (this.dialogueIndex >= 5) this.hasCrown = true;
                break;
            case 'GOLEM_ENTERS':
                this.botX += (1200 - this.botX) * 0.1;
                this.boss1X += (800 - this.boss1X) * 0.05;
                if (this.dialogueIndex >= 5) { this.hasCrown = true; this.phase = 'REPAIR_ORDER'; this.timer = 0; }
                break;
            case 'REPAIR_ORDER':
                this.botX += (750 - this.botX) * 0.1;
                if (this.timer > 1.5) {
                    this.boss1X += 5; this.botX += 5;
                    if (this.boss1X > 1100) { this.phase = 'BLAZE_PROMOTION'; this.timer = 0; }
                }
                break;
            case 'BLAZE_PROMOTION':
                if (this.dialogueIndex >= 7) this.advanceDialogue();
                if (this.dialogueIndex >= 8) { this.phase = 'LUNCH_EXIT'; this.timer = 0; }
                break;
            case 'LUNCH_EXIT':
                if (this.dialogueIndex >= 8) {
                    this.colossusY += 2; this.queenY += 2;
                    if (this.timer > 3) return true;
                }
                break;
        }
        this.currentDialogue = null;
        if (this.dialogueIndex < this.dialogues.length) { this.currentDialogue = this.dialogues[this.dialogueIndex]; return this.currentDialogue; }
        return null;
    }

    advanceDialogue() { if (this.dialogueIndex < this.dialogues.length) { this.dialogueIndex++; this.timer = 0; } }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const introHelper = new IntroCutscene();
        introHelper.drawLab(ctx);
        if (this.phase === 'BOT_NOTICE' || this.phase === 'GOLEM_ENTERS' || this.phase === 'REPAIR_ORDER') {
            this.drawSkeletBot(ctx, this.botX, 420, this.botX < 1100);
            if (this.phase === 'REPAIR_ORDER') this.drawSkeletBot(ctx, this.botX + 60, 420, true);
        }
        this.drawDamagedGolem(ctx, this.boss1X, 420);
        this.drawBlazeKing(ctx, this.boss2X, 420, this.hasCrown);
        this.drawInkColossus(ctx, this.colossusX, this.colossusY);
        this.drawQueen(ctx, this.queenX, this.queenY);
        if (this.currentDialogue) {
            const boxW = 800; const boxX = (1000 - boxW) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(boxX, 30, boxW, 100);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 100);
            let color = '#fff';
            if (this.currentDialogue.speaker.includes('Colossus') || this.currentDialogue.speaker.includes('Coloso')) color = '#ff3333';
            else if (this.currentDialogue.speaker === 'Queen' || this.currentDialogue.speaker === 'Reina') color = '#ff69b4';
            else if (this.currentDialogue.speaker === 'Golem') color = '#4a5d23';
            else if (this.currentDialogue.speaker.includes('Blaze')) color = '#ffcc00';
            ctx.fillStyle = color; ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', boxX + 20, 50);
            ctx.fillStyle = (this.currentDialogue.text.includes('(')) ? '#ff99cc' : '#fff';
            ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > 760 && n > 0) { ctx.fillText(line, boxX + 20, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, boxX + 20, lineY);
        }
        ctx.restore();
    }

    drawDamagedGolem(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#4a5d23'; ctx.strokeStyle = '#2d3e12'; ctx.lineWidth = 4;
        const bounce = Math.sin(Date.now() / 600) * 3;
        ctx.fillRect(x - 40, y - 80 + bounce, 80, 80); ctx.fillRect(x - 20, y - 105 + bounce, 40, 40);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, y - 70); ctx.lineTo(x - 10, y - 50); ctx.lineTo(x - 20, y - 30); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 42, y - 50, 84, 10); ctx.fillRect(x - 10, y - 108, 10, 25);
        ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(x - 10, y - 90 + bounce, 3, 0, Math.PI * 2); ctx.arc(x + 10, y - 90 + bounce, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    drawBlazeKing(ctx: CanvasRenderingContext2D, x: number, y: number, hasCrown: boolean = true, hasSuit: boolean = false, hasBandage: boolean = false) {
        ctx.save();
        const flicker = Math.random() * 10;
        const grad = ctx.createRadialGradient(x, y - 50, 5, x, y - 50, 40 + flicker);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, '#ffcc00'); grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y - 50, 40 + flicker, 0, Math.PI * 2); ctx.fill();
        if (hasCrown) {
            ctx.fillStyle = '#ff2200';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath(); ctx.moveTo(x - 40 + i * 20, y - 80); ctx.lineTo(x - 30 + i * 20, y - 110 - Math.random() * 15); ctx.lineTo(x - 20 + i * 20, y - 80); ctx.fill();
            }
        }
        if (hasBandage) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 60, 20, 6); }
        if (hasSuit) {
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 30, y - 30); ctx.lineTo(x + 30, y - 30); ctx.lineTo(x + 40, y + 10); ctx.lineTo(x - 40, y + 10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 12, y - 30); ctx.lineTo(x, y - 5); ctx.lineTo(x - 12, y - 30); ctx.fill();
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.moveTo(x - 8, y - 28); ctx.lineTo(x + 8, y - 22); ctx.lineTo(x - 8, y - 16); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + 8, y - 28); ctx.lineTo(x - 8, y - 22); ctx.lineTo(x + 8, y - 16); ctx.fill();
        }
        ctx.restore();
    }

    drawSkeletBot(ctx: CanvasRenderingContext2D, x: number, y: number, running: boolean) {
        ctx.save(); ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3;
        const bounce = running ? Math.sin(Date.now() / 100) * 10 : 0;
        ctx.beginPath(); ctx.arc(x, y - 50 + bounce, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x + 4, y - 50 + bounce, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - 40 + bounce); ctx.lineTo(x, y + bounce); ctx.stroke(); ctx.restore();
    }

    drawInkColossus(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#000'; ctx.shadowBlur = 30; ctx.shadowColor = '#000';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2; const r = 120 + Math.sin(Date.now() / 200 + i) * 20;
            const tx = x + Math.cos(angle) * r; const ty = y - 100 + Math.sin(angle) * r * 0.6;
            if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.fill();
        for (let i = 0; i < 5; i++) { ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(x - 40 + i * 20, y - 100 + Math.sin(Date.now() / 500 + i) * 15, 8, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.beginPath();
        ctx.moveTo(x - 5, y - 55); ctx.quadraticCurveTo(x - 30, y - 20, x - 25, y + 25); ctx.lineTo(x + 25, y + 25); ctx.quadraticCurveTo(x + 30, y - 20, x + 5, y - 55); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 10, y - 40); ctx.lineTo(x - 15, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, y - 40); ctx.lineTo(x + 15, y + 10); ctx.stroke();
        ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - 40, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x - 22, y + 25); ctx.lineTo(x + 22, y + 25); ctx.fill();
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.shadowBlur = 5; ctx.shadowColor = '#ffd700'; ctx.beginPath();
        ctx.moveTo(x - 15, y - 50); ctx.lineTo(x - 12, y - 65); ctx.lineTo(x - 6, y - 55); ctx.lineTo(x, y - 70); ctx.lineTo(x + 6, y - 55); ctx.lineTo(x + 12, y - 65); ctx.lineTo(x + 15, y - 50); ctx.closePath(); ctx.fill();
        ctx.restore();
    }
}

export class World2ClearCutscene {
    phase: string = 'TALK_WEDDING';
    timer: number = 0;
    dialogueIndex: number = 0;
    language: 'en' | 'es' = 'en';
    queenX: number = 500; queenY: number = 420;
    colossusX: number = 500; colossusY: number = 350;
    boss2X: number = 1100;
    botX: number = 1100;
    hasSuit: boolean = false;
    currentDialogue: { speaker: string, text: string } | null = null;
    dialogues: { speaker: string, text: string }[] = [];

    setLanguage(lang: 'en' | 'es') {
        this.language = lang;
        const d_en = [
            { speaker: 'Ink Colossus', text: 'Our wedding is today, my dear. It is a glorious day for our kingdom!' },
            { speaker: 'Queen', text: 'NO! Let me go! Vinn has already defeated your Golem. He is coming for you!' },
            { speaker: 'Ink Colossus', text: 'Hmph. Look who has returned from the volcano.' },
            { speaker: 'Blaze King', text: '...I failed you, lord. That knight... he is too strong.' },
            { speaker: 'Ink Colossus', text: 'YOU TOO? Ugh! Pathetic fire-pit!' },
            { speaker: 'Ink Colossus', text: 'I won\'t recycle you yet... because you\'re going to marry us! I will only declare you King (Priest).' },
            { speaker: 'Blaze King', text: '(I\'LL WEAR MY BEST SUIT, SIR! AN HONOR!)' },
            { speaker: 'Ink Colossus', text: 'Right. Now let\'s go, beautiful. The altar is waiting.' },
            { speaker: 'Queen', text: 'NEVER! I will not go!' }
        ];
        const d_es = [
            { speaker: 'Coloso de Tinta', text: 'Nuestra boda es hoy, querida. ¡Es un día glorioso para nuestro reino!' },
            { speaker: 'Reina', text: '¡NO! ¡Suéltame! Vinn ya derrotó a tu Golem. ¡Él vendrá por ti!' },
            { speaker: 'Coloso de Tinta', text: 'Hmph. Mira quién ha vuelto del volcán.' },
            { speaker: 'Rey de Fuego', text: '...Le fallé, señor. Ese caballero... es demasiado fuerte.' },
            { speaker: 'Coloso de Tinta', text: '¿TÚ TAMBIÉN? ¡Puaj! ¡Patético pozo de fuego!' },
            { speaker: 'Coloso de Tinta', text: 'No te reciclaré todavía... ¡porque vas a casarnos! Solo te declararé Rey (Sacerdote).' },
            { speaker: 'Rey de Fuego', text: '(¡USARÉ MI MEJOR TRAJE, SEÑOR! ¡UN HONOR!)' },
            { speaker: 'Coloso de Tinta', text: 'Bien. Ahora vámonos, hermosa. El altar está esperando.' },
            { speaker: 'Reina', text: '¡JAMÁS! ¡No iré!' }
        ];
        this.dialogues = lang === 'en' ? d_en : d_es;
    }

    update(dt: number): boolean | { speaker: string, text: string } | null {
        this.timer += dt;
        switch (this.phase) {
            case 'TALK_WEDDING': if (this.dialogueIndex >= 2) { this.phase = 'BLAZE_ENTERS'; this.timer = 0; } break;
            case 'BLAZE_ENTERS': this.boss2X += (800 - this.boss2X) * 0.05; if (this.dialogueIndex >= 5) { this.phase = 'SUIT_UP'; this.timer = 0; } break;
            case 'SUIT_UP': this.hasSuit = true; if (this.dialogueIndex >= 8) { this.phase = 'QUEEN_RESIST'; this.timer = 0; } break;
            case 'QUEEN_RESIST': this.botX += (650 - this.botX) * 0.1; if (this.timer > 2) { this.phase = 'FINAL_EXIT'; this.timer = 0; } break;
            case 'FINAL_EXIT': this.colossusY += 2; this.queenY += 2; this.boss2X += 2; this.botX += 2; if (this.timer > 3) return true; break;
        }
        this.currentDialogue = null;
        if (this.dialogueIndex < this.dialogues.length) { this.currentDialogue = this.dialogues[this.dialogueIndex]; return this.currentDialogue; }
        return null;
    }

    advanceDialogue() { if (this.dialogueIndex < this.dialogues.length) { this.dialogueIndex++; this.timer = 0; } }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const introHelper = new IntroCutscene();
        introHelper.drawLab(ctx);
        const w1Helper = new World1ClearCutscene();
        w1Helper.drawSkeletBot(ctx, this.botX, 420, this.botX < 1100);
        w1Helper.drawBlazeKing(ctx, this.boss2X, 420, true, this.hasSuit, true);
        w1Helper.drawInkColossus(ctx, this.colossusX, this.colossusY);
        w1Helper.drawQueen(ctx, this.queenX, this.queenY);
        if (this.currentDialogue) {
            const boxW = 800; const boxX = (1000 - boxW) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(boxX, 30, boxW, 100);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 100);
            let color = '#fff';
            if (this.currentDialogue.speaker.includes('Colossus') || this.currentDialogue.speaker.includes('Coloso')) color = '#ff3333';
            else if (this.currentDialogue.speaker === 'Queen' || this.currentDialogue.speaker === 'Reina') color = '#ff69b4';
            else if (this.currentDialogue.speaker.includes('Blaze')) color = '#ffcc00';
            ctx.fillStyle = color; ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', boxX + 20, 50);
            ctx.fillStyle = (this.currentDialogue.text.includes('(')) ? '#ff99cc' : '#fff';
            ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > 760 && n > 0) { ctx.fillText(line, boxX + 20, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, boxX + 20, lineY);
        }
        ctx.restore();
    }
}

export type World3IntroPhase = 'ALTAR_SCENE' | 'VINN_ARRIVES' | 'INK_ANGRY' | 'GOLEM_SWORD' | 'INK_CHASE_START' | 'RUN_CIRCLES' | 'JUMP_OFF' | 'QUEEN_REACTION';

export class World3BossCutscene {
    phase: World3IntroPhase = 'ALTAR_SCENE';
    timer: number = 0;
    dialogueIndex: number = 0;
    language: 'en' | 'es' = 'en';

    vinnX: number = 1100;
    vinnY: number = 430;
    queenX: number = 350;
    queenY: number = 325;
    blazeX: number = 200;
    blazeY: number = 330;
    golemX: number = 550;
    golemY: number = 460;
    inkX: number = 400;
    inkY: number = 220;

    circleTimer: number = 0;
    golemSwordDrawn: boolean = false;

    currentDialogue: { speaker: string, text: string } | null = null;
    dialogues: { speaker: string, text: string }[] = [];

    dialogues_en = [
        { speaker: 'Blaze Priest', text: 'Do you, Queen, take this Ink Colossus to be your lawfully wedded husband?' },
        { speaker: 'Queen', text: '...I do.' },
        { speaker: 'Blaze Priest', text: 'If anyone opposes this marriage, speak now or forever hold your peace!' },
        { speaker: 'Vinn', text: 'I OBJECT!' },
        { speaker: 'Ink Colossus', text: 'I CAN\'T RESIST IT!! NOOO!' },
        { speaker: 'Golem Watcher', text: '*takes sword* Good luck, Vinn.' },
        { speaker: 'Ink Colossus', text: 'I\'LL CHASE YOU UNTIL YOU\'RE DEFEATED!!!' },
        { speaker: 'Queen', text: 'VINN!' },
        { speaker: 'Golem Watcher', text: 'Wait! It is too dangerous. I know he will survive.' }
    ];

    dialogues_es = [
        { speaker: 'Sacerdote Blaze', text: '¿Aceptas, Reina, a este Coloso de Tinta como tu legítimo esposo?' },
        { speaker: 'Reina', text: '...Acepto.' },
        { speaker: 'Sacerdote Blaze', text: 'Si alguien se opone a este matrimonio, ¡hable ahora o calle para siempre!' },
        { speaker: 'Vinn', text: '¡ME OPONGO!' },
        { speaker: 'Coloso de Tinta', text: '¡¡NO PUEDO RESISTIRLO!! ¡NOOO!' },
        { speaker: 'Vigilante Golem', text: '*toma espada* Buena suerte, Vinn.' },
        { speaker: 'Coloso de Tinta', text: '¡¡TE PERSEGUIRÉ HASTA QUE ESTÉS DERROTADO!!!' },
        { speaker: 'Reina', text: '¡VINN!' },
        { speaker: 'Vigilante Golem', text: '¡Espera! Es muy peligroso. Sé que sobrevivirá.' }
    ];

    constructor() { }

    setLanguage(lang: 'en' | 'es') {
        this.language = lang;
        this.dialogues = lang === 'en' ? this.dialogues_en : this.dialogues_es;
    }

    update(dt: number): boolean {
        this.timer += dt;

        switch (this.phase) {
            case 'ALTAR_SCENE':
                if (this.dialogueIndex >= 3) {
                    this.phase = 'VINN_ARRIVES';
                    this.timer = 0;
                }
                break;
            case 'VINN_ARRIVES':
                this.vinnX += (480 - this.vinnX) * 0.1;
                this.vinnY = 430;
                if (this.timer > 2.0 && this.dialogueIndex > 3) {
                    this.phase = 'INK_ANGRY';
                    this.timer = 0;
                }
                break;
            case 'INK_ANGRY':
                this.inkX += Math.sin(this.timer * 20) * 5; // Shake
                if (this.timer > 2.0 && this.dialogueIndex > 4) {
                    this.phase = 'GOLEM_SWORD';
                    this.timer = 0;
                    this.golemSwordDrawn = true;
                }
                break;
            case 'GOLEM_SWORD':
                if (this.timer > 2.0 && this.dialogueIndex > 5) {
                    this.phase = 'INK_CHASE_START';
                    this.timer = 0;
                }
                break;
            case 'INK_CHASE_START':
                this.inkX += Math.sin(this.timer * 30) * 10; // Intense shake
                if (this.timer > 2.5 && this.dialogueIndex > 6) {
                    this.phase = 'RUN_CIRCLES';
                    this.timer = 0;
                    // Prepare chase start positions
                    this.vinnX = 400;
                    this.vinnY = 320;
                }
                break;
            case 'RUN_CIRCLES':
                this.circleTimer += dt * 8; // Faster chase
                // Chase back and forth on the platform/ramp area
                const chaseCenter = 300;
                const chaseWidth = 150;
                this.vinnX = chaseCenter + Math.sin(this.circleTimer) * chaseWidth;
                // Vinn stays on the high platform for now
                this.vinnY = 320; 
                this.inkX = chaseCenter + Math.sin(this.circleTimer - 0.4) * chaseWidth;
                this.inkY = 320;

                if (this.timer > 5.0) {
                    this.phase = 'JUMP_OFF';
                    this.timer = 0;
                }
                break;
            case 'JUMP_OFF':
                // Vinn runs to the LEFT edge and jumps
                this.vinnX -= 12;
                if (this.vinnX < 50) {
                    // Gravity jump arc off the left edge
                    this.vinnY = 320 - Math.sin(Math.min(1, this.timer) * Math.PI) * 50 + (this.timer * 500);
                }
                
                this.inkX -= 9; // Chasing behind
                if (this.timer > 2.0) {
                    this.phase = 'QUEEN_REACTION';
                    this.timer = 0;
                    this.dialogueIndex++; // Auto advance to Queen's cry
                }
                break;
            case 'QUEEN_REACTION':
                // Queen tries to follow
                if (this.dialogueIndex === 7) {
                    this.queenX += (50 - this.queenX) * 0.05;
                    // Golem moves to block her
                    this.golemX += (this.queenX - 60 - this.golemX) * 0.1;
                    this.golemY = 350; // Jumps up to the platform to stop her
                }
                
                if (this.timer > 4.0 && this.dialogueIndex >= 8) {
                    return true; // Sequence finished after Golem's line
                }
                break;
        }

        if (this.dialogueIndex < this.dialogues.length) {
            this.currentDialogue = this.dialogues[this.dialogueIndex];
        } else {
            this.currentDialogue = null;
        }

        return false;
    }

    advanceDialogue() {
        if (this.dialogueIndex < this.dialogues.length && this.phase !== 'RUN_CIRCLES' && this.phase !== 'JUMP_OFF') {
            const currentPhaseLimits = {
                'ALTAR_SCENE': 2,
                'VINN_ARRIVES': 3,
                'INK_ANGRY': 4,
                'GOLEM_SWORD': 5,
                'INK_CHASE_START': 6,
                'QUEEN_REACTION': 8
            };
            const limit = currentPhaseLimits[this.phase as keyof typeof currentPhaseLimits];
            if (this.dialogueIndex <= limit) {
                this.dialogueIndex++;
                this.timer = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Background - Imposing Paint Land Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 500);
        skyGrad.addColorStop(0, '#00ffff');
        skyGrad.addColorStop(1, '#ff66b2');
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, 1000, 500);

        // High Altar Platform (Left side) with ramp down to audience
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(0, 500);
        ctx.lineTo(0, 350); // Platform top-left (EDGE)
        ctx.lineTo(400, 350); // Platform top-right
        ctx.lineTo(550, 460); // Slanted ramp going down
        ctx.lineTo(1000, 460); // Ground extending right
        ctx.lineTo(1000, 500); // Ground bottom
        ctx.fill();

        // Protective Bricks / Parapets on the edges
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
        // Left Edge
        ctx.fillRect(0, 310, 20, 40); ctx.strokeRect(0, 310, 20, 40);
        // Middle Edge (before ramp)
        ctx.fillRect(380, 310, 20, 40); ctx.strokeRect(380, 310, 20, 40);

        // Platform Trim (Neon pink)
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 350);
        ctx.lineTo(400, 350);
        ctx.lineTo(550, 460);
        ctx.lineTo(1000, 460);
        ctx.stroke();

        // Draw Golem's Chair (Front row on the ground)
        ctx.fillStyle = '#5c3a21'; // Chair color
        ctx.fillRect(630, 430, 15, 30); // Backrest
        ctx.fillRect(580, 450, 50, 5);  // Seat

        // Draw SkeletBot Watchers sitting in chairs behind the Golem
        for (let i = 0; i < 3; i++) {
            const rX = 720 + i * 80;
            ctx.fillStyle = '#5c3a21'; // Chair color
            ctx.fillRect(rX + 30, 430, 15, 30); // Backrest
            ctx.fillRect(rX - 20, 450, 50, 5);  // Seat

            ctx.save();
            ctx.beginPath(); ctx.rect(rX - 10, 400, 40, 50); ctx.clip();
            this.drawSkeletBot(ctx, rX + 10, 460); // Sitting attendee facing left
            ctx.restore();
        }

        // Altar podium decoration on the high platform
        ctx.fillStyle = '#2d0045';
        ctx.fillRect(250, 320, 70, 30);
        ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2;
        ctx.strokeRect(250, 320, 70, 30);

        // Draw Blaze Priest (Suit, No Crown, Bandage)
        this.drawBlaze(ctx, this.blazeX, this.blazeY, false, true, true);

        // Draw Queen
        this.drawQueen(ctx, this.queenX, this.queenY);

        // Draw Golem Watcher
        this.drawGolem(ctx, this.golemX, this.golemY, this.golemSwordDrawn);

        // Draw Ink Colossus
        this.drawInk(ctx, this.inkX, this.inkY);

        // Draw Vinn if arrived
        if (this.phase !== 'ALTAR_SCENE') {
            this.drawHero(ctx, this.vinnX, this.vinnY, this.golemSwordDrawn);
        }

        // Draw Dialogue Box
        if (this.currentDialogue && this.phase !== 'RUN_CIRCLES' && this.phase !== 'JUMP_OFF') {
            const boxW = 800; const boxX = 100;
            ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; ctx.fillRect(boxX, 30, boxW, 120);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 120);

            let sc = '#fff';
            if (this.currentDialogue.speaker.includes('Blaze')) sc = '#ff4500';
            else if (this.currentDialogue.speaker === 'Queen') sc = '#ff69b4';
            else if (this.currentDialogue.speaker === 'Vinn') sc = '#00f2ff';
            else if (this.currentDialogue.speaker === 'Ink Colossus') sc = '#ff00ff';
            else if (this.currentDialogue.speaker.includes('Golem')) sc = '#7a8d53';

            ctx.fillStyle = sc; ctx.font = '16px "Press Start 2P"'; ctx.textBaseline = 'top'; ctx.fillText(this.currentDialogue.speaker + ':', boxX + 20, 45);
            ctx.fillStyle = '#fff'; ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > 760 && n > 0) { ctx.fillText(line, boxX + 20, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, boxX + 20, lineY);
        }

        ctx.restore();
    }

    drawBlaze(ctx: CanvasRenderingContext2D, x: number, y: number, hasCrown: boolean = true, hasSuit: boolean = false, hasBandage: boolean = false) {
        ctx.save();
        const flicker = Math.random() * 10;
        const grad = ctx.createRadialGradient(x, y - 50, 5, x, y - 50, 40 + flicker);
        grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, '#ffcc00'); grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y - 50, 40 + flicker, 0, Math.PI * 2); ctx.fill();
        if (hasCrown) {
            ctx.fillStyle = '#ff2200';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath(); ctx.moveTo(x - 40 + i * 20, y - 80); ctx.lineTo(x - 30 + i * 20, y - 110 - Math.random() * 15); ctx.lineTo(x - 20 + i * 20, y - 80); ctx.fill();
            }
        }
        if (hasBandage) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 60, 20, 6); }
        if (hasSuit) {
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 30, y - 20); ctx.lineTo(x + 30, y - 20); ctx.lineTo(x + 40, y + 20); ctx.lineTo(x - 40, y + 20); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x + 12, y - 20); ctx.lineTo(x, y + 5); ctx.lineTo(x - 12, y - 20); ctx.fill();
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.moveTo(x - 8, y - 18); ctx.lineTo(x + 8, y - 12); ctx.lineTo(x - 8, y - 6); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + 8, y - 18); ctx.lineTo(x - 8, y - 12); ctx.lineTo(x + 8, y - 6); ctx.fill();
        }
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.beginPath();
        ctx.moveTo(x - 5, y - 55); ctx.quadraticCurveTo(x - 30, y - 20, x - 25, y + 25); ctx.lineTo(x + 25, y + 25); ctx.quadraticCurveTo(x + 30, y - 20, x + 5, y - 55); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 10, y - 40); ctx.lineTo(x - 15, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, y - 40); ctx.lineTo(x + 15, y + 10); ctx.stroke();
        ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - 40, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x - 22, y + 25); ctx.lineTo(x + 22, y + 25); ctx.fill();
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.shadowBlur = 5; ctx.shadowColor = '#ffd700'; ctx.beginPath();
        ctx.moveTo(x - 15, y - 50); ctx.lineTo(x - 12, y - 65); ctx.lineTo(x - 6, y - 55); ctx.lineTo(x, y - 70); ctx.lineTo(x + 6, y - 55); ctx.lineTo(x + 12, y - 65); ctx.lineTo(x + 15, y - 50); ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    drawGolem(ctx: CanvasRenderingContext2D, x: number, y: number, hasSword: boolean) {
        ctx.save(); ctx.fillStyle = '#4a5d23'; ctx.strokeStyle = '#2d3e12'; ctx.lineWidth = 4;
        const bounce = Math.sin(Date.now() / 600) * 2;
        ctx.fillRect(x - 40, y - 80 + bounce, 80, 80); ctx.fillRect(x - 20, y - 105 + bounce, 40, 40);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, y - 70); ctx.lineTo(x - 10, y - 50); ctx.lineTo(x - 20, y - 30); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 42, y - 50, 84, 10); ctx.fillRect(x - 10, y - 108, 10, 25);
        ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(x - 10, y - 90 + bounce, 3, 0, Math.PI * 2); ctx.arc(x + 10, y - 90 + bounce, 3, 0, Math.PI * 2); ctx.fill();

        if (hasSword) {
            ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(x + 30, y - 30); ctx.lineTo(x + 70, y - 70); ctx.stroke();
        }
        ctx.restore();
    }

    drawSkeletBot(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3;
        const bounce = Math.sin(Date.now() / 200 + x) * 5;
        ctx.beginPath(); ctx.arc(x, y - 30 + bounce, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x + 4, y - 30 + bounce, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - 20 + bounce); ctx.lineTo(x, y + 10 + bounce); ctx.stroke(); ctx.restore();
    }

    drawInk(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#000'; ctx.shadowBlur = 30; ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2; const r = 120 + Math.sin(Date.now() / 200 + i) * 20;
            const tx = x + Math.cos(angle) * r; const ty = y - 100 + Math.sin(angle) * r * 0.6;
            if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.fill();
        for (let i = 0; i < 5; i++) { ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(x - 40 + i * 20, y - 100 + Math.sin(Date.now() / 500 + i) * 15, 8, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    }

    drawHero(ctx: CanvasRenderingContext2D, x: number, y: number, hasLostSword: boolean) {
        ctx.save(); ctx.translate(x, y);
        ctx.strokeStyle = '#00f2ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -50, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 30); ctx.stroke();

        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-15, -10); ctx.stroke(); // Left arm
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(15, -10); ctx.stroke(); // Right arm

        if (!hasLostSword) {
            ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(15, -10); ctx.lineTo(40, -30); ctx.stroke(); // Holding sword
        }
        ctx.restore();
    }
}

export class World3EscapeCutscene {
    timer: number = 0;
    dialogueIndex: number = 0;
    language: 'en' | 'es' = 'en';
    
    currentDialogue: { speaker: string, text: string } | null = null;
    dialogues: { speaker: string, text: string }[] = [];

    dialogues_en = [
        { speaker: 'Ink Colossus', text: '...Grr... you think you\'ve won?' },
        { speaker: 'Ink Colossus', text: 'I\'ve demolished the castle! I closed the jump-off exits!' },
        { speaker: 'Ink Colossus', text: 'The only way you can escape this castle is by the main entrance...' },
        { speaker: 'Ink Colossus', text: '...and you\'ll never get there in time!' },
        { speaker: 'Queen', text: 'We have to run, NOW!' }
    ];

    dialogues_es = [
        { speaker: 'Coloso de Tinta', text: '...Grr... ¿Crees que has ganado?' },
        { speaker: 'Coloso de Tinta', text: '¡He demolido el castillo! ¡He cerrado las salidas aéreas!' },
        { speaker: 'Coloso de Tinta', text: 'La única forma de escapar es por la entrada principal...' },
        { speaker: 'Coloso de Tinta', text: '...¡y nunca llegarán a tiempo!' },
        { speaker: 'Reina', text: '¡Tenemos que correr, AHORA!' }
    ];

    setLanguage(lang: 'en' | 'es') {
        this.language = lang;
        this.dialogues = lang === 'en' ? this.dialogues_en : this.dialogues_es;
    }

    update(dt: number): boolean {
        this.timer += dt;
        
        if (this.dialogueIndex < this.dialogues.length) {
            this.currentDialogue = this.dialogues[this.dialogueIndex];
        } else {
            return true; // Sequence finished
        }
        return false;
    }

    advanceDialogue() {
        if (this.dialogueIndex < this.dialogues.length) {
            this.dialogueIndex++;
            this.timer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        // Background - Dark crumbling castle
        ctx.fillStyle = '#0a0015';
        ctx.fillRect(0, 0, 1000, 500);

        // Ground
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 350, 1000, 150);
        
        // Vinn and Queen
        this.drawHero(ctx, 300, 350, '#00f2ff');
        this.drawQueen(ctx, 200, 310);

        // Ink Colossus (Beaten and Bandaged)
        this.drawInjuredInkColossus(ctx, 600, 300);

        // Dialogue Box
        if (this.currentDialogue) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(100, 30, 800, 100);
            ctx.strokeStyle = this.currentDialogue.speaker === 'Ink Colossus' ? '#ff00ff' : '#00f2ff';
            ctx.lineWidth = 4;
            ctx.strokeRect(100, 30, 800, 100);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(this.currentDialogue.speaker, 120, 55);

            ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 80;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > 760 && n > 0) { ctx.fillText(line, 120, lineY); line = words[n] + ' '; lineY += 20; }
                else line = testLine;
            }
            ctx.fillText(line, 120, lineY);
        }
        ctx.restore();
    }

    drawInjuredInkColossus(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.fillStyle = '#000'; ctx.shadowBlur = 30; ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2; const r = 100 + Math.sin(Date.now() / 200 + i) * 10;
            const tx = x + Math.cos(angle) * r; const ty = y + Math.sin(angle) * r * 0.6;
            if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Magenta dots, but one is missing and covered by a big bandage
        for (let i = 0; i < 4; i++) { 
            ctx.fillStyle = '#ff00ff'; ctx.beginPath(); 
            ctx.arc(x - 30 + i * 20, y + Math.sin(Date.now() / 500 + i) * 15, 8, 0, Math.PI * 2); 
            ctx.fill(); 
        }
        
        // Bandages
        ctx.fillStyle = '#eee';
        // Big bandage over missing dot
        ctx.fillRect(x + 40, y - 5, 25, 10);
        ctx.fillRect(x + 45, y - 10, 15, 20);
        
        // Other bandages
        ctx.save();
        ctx.translate(x - 50, y - 40);
        ctx.rotate(0.5);
        ctx.fillRect(0, 0, 40, 8);
        ctx.restore();
        
        ctx.save();
        ctx.translate(x + 20, y + 40);
        ctx.rotate(-0.3);
        ctx.fillRect(0, 0, 30, 8);
        ctx.restore();

        ctx.restore();
    }

    drawHero(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
        ctx.save(); ctx.translate(x, y);
        ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -50, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-15, -10); ctx.stroke(); 
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(15, -10); ctx.stroke();
        // Weapon
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(15, -10); ctx.lineTo(40, -30); ctx.stroke();
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath(); ctx.moveTo(x - 15, y + 40); ctx.lineTo(x + 15, y + 40); ctx.lineTo(x, y - 10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.arc(x, y - 15, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.beginPath();
        ctx.moveTo(x - 10, y - 25); ctx.lineTo(x - 5, y - 18); ctx.lineTo(x, y - 30); ctx.lineTo(x + 5, y - 18); ctx.lineTo(x + 10, y - 25);
        ctx.lineTo(x + 10, y - 10); ctx.lineTo(x - 10, y - 10); ctx.closePath(); ctx.fill();
        ctx.restore();
    }
}
