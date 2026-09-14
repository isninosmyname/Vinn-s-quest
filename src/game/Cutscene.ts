import { DialogueTimeline } from './DialogueTimeline';
import { introCheckpoints, world1Checkpoints, world2Checkpoints, world3Checkpoints, escapeCheckpoints } from './SceneCheckpoints';

export type CutscenePhase = 'WALK_IN' | 'KNEEL_AND_TALK' | 'STAIRCASE_CLIMB' | 'BALCONY_WALK' | 'BALCONY_TALK' | 'PORTAL_OPENS' | 'QUEEN_SUCKED_IN' | 'VINN_GRABS_BRICK' | 'VINN_JUMPS' | 'FOREST_DROP' | 'TECH_KIDNAP' | 'VINN_LANDING' | 'FOLLOW_TRAIL' | 'LATER_SCREEN' | 'CASTLE_APPROACH' | 'BOSS_LAB_INTRO' | 'BOSS_LAB_TALK' | 'GOLEM_LEAVE' | 'COLOSSUS_LEAVE' | 'FINISHED';

export class IntroCutscene {
    motionActive = false;
    phaseTime = 0;
    private timeline?: DialogueTimeline<IntroCutscene>;
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

    // Intro staging: the palace is wider than the camera, so the story can
    // move from the throne room to the balcony without teleporting anyone.
    readonly portalX: number = 805;
    readonly portalY: number = 115;
    readonly balconyFloorY: number = 320;
    readonly balconyBrickX: number = 645;
    vinnVy: number = 0;
    queenVy: number = 0;
    skeletonLeftX: number = 120;
    skeletonRightX: number = 760;
    trailProgress: number = 0;
    castleReveal: number = 0;
    stairProgress: number = 0;

    reset() {
        this.vinnX = -50;
        this.vinnY = 420;
        this.queenX = 650;
        this.queenY = 420;
        this.phase = 'WALK_IN';
        this.timeline = undefined;
        this.phaseTime = 0;
        this.boss1X = 850;
        this.boss2X = 150;
        this.colossusY = 550;
        this.timer = 0;
        this.dialogueIndex = 0;
        this.portalSize = 0;
        this.portalAngle = 0;
        this.vinnVy = 0;
        this.queenVy = 0;
        this.skeletonLeftX = 120;
        this.skeletonRightX = 760;
        this.trailProgress = 0;
        this.castleReveal = 0;
        this.stairProgress = 0;
        this.currentDialogue = null;
        this.setLanguage(this.language, this.isTwoPlayer, this.p1Color, this.p2Color);
    }

    dialogues_en = [
        { speaker: 'Vinn', text: 'My Queen, I have returned.' },
        { speaker: 'Vinn', text: 'I bring you this rare Crimson Rose from the Eastern Woods.' },
        { speaker: 'Queen', text: 'It is beautiful, sir Vinn. Your loyalty is unmatched.' },
        { speaker: 'Vinn', text: 'How about we go to the balcony?' },
        { speaker: 'Queen', text: 'Of course, sir Vinn.' },
        { speaker: 'Queen', text: 'Ahh' },
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
        { speaker: 'Vinn', text: '¿Qué tal si vamos al balcón?' },
        { speaker: 'Queen', text: 'Claro, sir Vinn.' },
        { speaker: 'Queen', text: 'Ahh' },
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
            { speaker: 'Vinn', text: 'How about we go to the balcony?' },
            { speaker: 'Queen', text: 'Of course, sir Vinn.' },
            { speaker: 'Queen', text: 'Ahh' },
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
            { speaker: 'Vinn', text: '¿Qué tal si vamos al balcón?' },
            { speaker: 'Queen', text: 'Claro, sir Vinn.' },
            { speaker: 'Queen', text: 'Ahh' },
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
        if (lang === 'es') this.dialogues = this.dialogues.map(line => ({ ...line, speaker: line.speaker === 'Queen' ? 'Reina' : line.speaker }));
    }

    findDialogueIndex(...fragments: string[]) {
        const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
        return this.dialogues.findIndex(dialogue => {
            const line = normalize(`${dialogue.speaker} ${dialogue.text}`);
            return fragments.some(fragment => line.includes(normalize(fragment)));
        });
    }

    update(dt: number): boolean | { speaker: string, text: string } | null {
        this.timeline ??= introCheckpoints(this);
        const finished = this.timeline.update(this, dt);
        this.portalAngle = this.timer * 5;
        if (['LATER_SCREEN', 'CASTLE_APPROACH'].includes(this.phase)) this.currentDialogue = null;
        if (finished) this.phase = 'FINISHED';
        return finished || this.currentDialogue;
    }

    advanceDialogue() {
        this.timeline ??= introCheckpoints(this);
        this.timeline.advance(this);
        this.update(0);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (this.phase === 'LATER_SCREEN') {
            const fade = Math.min(1, this.phaseTime / 0.8);
            ctx.fillStyle = '#020108'; ctx.fillRect(0, 0, 2000, 500);
            ctx.globalAlpha = fade;
            ctx.fillStyle = '#ffcc66'; ctx.font = '30px "Press Start 2P"'; ctx.textAlign = 'center';
            ctx.shadowColor = '#ff3366'; ctx.shadowBlur = 18;
            ctx.fillText(this.language === 'en' ? 'Later...' : 'Luego...', 500, 245);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff'; ctx.font = '10px "Press Start 2P"';
            ctx.fillText(this.language === 'en' ? 'THE INK COLOSSUS CASTLE' : 'EL CASTILLO DEL COLOSO DE TINTA', 500, 280);
            ctx.restore();
            return;
        }
        const isForest = ['FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING', 'FOLLOW_TRAIL'].includes(this.phase);
        const isBalcony = ['BALCONY_WALK', 'BALCONY_TALK', 'PORTAL_OPENS', 'QUEEN_SUCKED_IN', 'VINN_GRABS_BRICK', 'VINN_JUMPS'].includes(this.phase);
        const isCastleApproach = this.phase === 'CASTLE_APPROACH';
        const isLab = ['BOSS_LAB_INTRO', 'BOSS_LAB_TALK', 'GOLEM_LEAVE', 'COLOSSUS_LEAVE'].includes(this.phase);
        if (isLab) {
            this.drawInkCastleInterior(ctx);
            this.drawGolem(ctx, this.boss1X, 420);
            this.drawBlazeKing(ctx, this.boss2X, 420);
            this.drawInkColossus(ctx, this.colossusX, this.colossusY);
            if (this.phase !== 'COLOSSUS_LEAVE' || this.phaseTime < 3) this.drawQueen(ctx, this.queenX, this.queenY);
        } else if (isCastleApproach) {
            this.drawCastleApproach(ctx);
        } else if (!isForest) {
            this.drawPalace(ctx, isBalcony);
            if (this.portalSize > 0) this.drawPortal(ctx);
        } else {
            this.drawForest(ctx);
        }
        if (!isLab && !isCastleApproach) {
            if (this.phase !== 'FINISHED') this.drawQueen(ctx, this.queenX, this.queenY);
            if (this.phase !== 'FINISHED') {
                const isUnconscious = this.phase === 'TECH_KIDNAP' || (this.phase === 'VINN_LANDING' && this.dialogueIndex === 13 + (this.isTwoPlayer ? 1 : 0) && this.phaseTime < 1.2);
                if (isUnconscious) this.drawUnconsciousHero(ctx, this.vinnX, this.vinnY, this.p1Color);
                else this.drawHero(ctx, this.vinnX, this.vinnY, this.p1Color, 'NORMAL');
                if (this.isTwoPlayer) {
                    if (isUnconscious) this.drawUnconsciousHero(ctx, this.vinnX - 40, this.vinnY, this.p2Color);
                    else this.drawHero(ctx, this.vinnX - 40, this.vinnY, this.p2Color, 'SPIKY');
                }
            }
        }
        if (this.phase === 'TECH_KIDNAP') {
            this.drawTechSkeleton(ctx, this.skeletonLeftX, 390, this.motionActive);
            this.drawTechSkeleton(ctx, this.skeletonRightX, 390, this.motionActive);
            this.drawDustTrail(ctx, this.queenX - 80, 430, 1);
        }
        if (this.currentDialogue) {
            ctx.save();
            // Keep the sky rift and the Queen's flight visible above the text.
            if (['PORTAL_OPENS', 'QUEEN_SUCKED_IN', 'VINN_GRABS_BRICK', 'VINN_JUMPS'].includes(this.phase)) ctx.translate(0, 310);
            const boxW = 800; const boxX = (1000 - boxW) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(boxX, 30, boxW, 100);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(boxX, 30, boxW, 100);
            ctx.fillStyle = this.currentDialogue.speaker === 'Vinn' ? '#00f2ff' : (['Queen', 'Reina'].includes(this.currentDialogue.speaker) ? '#ff69b4' : '#ff3333');
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
            if (this.timer > 0.5 && !['PORTAL_OPENS', 'QUEEN_SUCKED_IN', 'VINN_JUMPS', 'FOREST_DROP', 'STAIRCASE_CLIMB', 'BALCONY_WALK', 'BOSS_LAB_INTRO'].includes(this.phase)) {
                ctx.fillStyle = '#ffcc00'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'right'; ctx.fillText(this.language === 'en' ? '[SPACE] to continue' : '[ESPACIO] continuar', boxX + 780, 110); ctx.textAlign = 'left';
            }
            ctx.restore();
        }
        ctx.restore();
    }

    drawPalace(ctx: CanvasRenderingContext2D, balcony: boolean) {
        if (balcony) {
            // This is genuinely outside: a bright daytime sky, not another dark room.
            ctx.fillStyle = '#69c5f4'; ctx.fillRect(0, 0, 2000, 500);
            ctx.fillStyle = '#9ce1fa'; ctx.fillRect(0, 95, 2000, 125);
            ctx.fillStyle = '#c9f0ff'; ctx.fillRect(0, 220, 2000, 100);
            // Square clouds give the Queen a clear visual reason to enjoy the air.
            this.drawPixelCloud(ctx, 150, 80, 1);
            this.drawPixelCloud(ctx, 470, 125, 0);
            this.drawPixelCloud(ctx, 860, 72, 2);
            // Pixel sun, kept simple so it reads as daytime at a glance.
            ctx.fillStyle = '#fff0a1'; ctx.fillRect(78, 42, 44, 8); ctx.fillRect(66, 50, 68, 42); ctx.fillRect(78, 92, 44, 8);
            ctx.fillStyle = '#ffe275'; ctx.fillRect(82, 58, 12, 12); ctx.fillRect(106, 76, 12, 10);

            // Distant castle silhouette below the upper balcony.
            ctx.fillStyle = '#090a20'; ctx.fillRect(0, 300, 1000, 200);
            ctx.fillRect(45, 205, 92, 160); ctx.fillRect(850, 190, 105, 175);
            ctx.fillStyle = '#11143b'; ctx.fillRect(62, 185, 58, 25); ctx.fillRect(870, 165, 65, 25);
            ctx.fillStyle = '#25276b'; ctx.fillRect(82, 220, 18, 36); ctx.fillRect(894, 205, 20, 40);

            // Open-air stone balcony, with the sky visible behind the characters.
            ctx.fillStyle = '#2c2341'; ctx.fillRect(500, 315, 500, 185);
            ctx.fillStyle = '#5c4160'; ctx.fillRect(500, 300, 500, 18);
            ctx.fillStyle = '#392b4d'; ctx.fillRect(520, 318, 460, 10);
            ctx.strokeStyle = '#87658d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(500, 300); ctx.lineTo(1000, 300); ctx.stroke();
            for (let x = 525; x < 1000; x += 42) {
                ctx.fillStyle = '#785276'; ctx.fillRect(x, 300, 7, 58);
                ctx.fillStyle = '#4b3155'; ctx.fillRect(x - 5, 355, 17, 7);
            }
            ctx.fillStyle = '#413052'; ctx.fillRect(500, 365, 500, 12);
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 9; col++) {
                    const brickX = 520 + col * 54 + (row % 2) * 25;
                    ctx.fillStyle = (row + col) % 2 ? '#4d3758' : '#684965';
                    ctx.fillRect(brickX, 382 + row * 27, 46, 21);
                }
            }
            if (this.phase === 'VINN_GRABS_BRICK' || this.phase === 'VINN_JUMPS') {
                ctx.fillStyle = '#9b6c83'; ctx.fillRect(this.balconyBrickX - 16, 292, 48, 12);
                ctx.strokeStyle = '#ffd35c'; ctx.lineWidth = 3;
                ctx.strokeRect(this.balconyBrickX - 16, 292, 48, 12);
            }
            this.drawTorch(ctx, 545, 273, 0);
            this.drawTorch(ctx, 950, 273, 1);
            if (this.phase === 'BALCONY_WALK' || this.phase === 'BALCONY_TALK') this.drawBreeze(ctx);
            return;
        }

        // Royal hall before the climb: flat colour bands and hard edges keep it 8-bit.
        ctx.fillStyle = '#17152f'; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = '#29204a'; ctx.fillRect(0, 80, 2000, 340);
        ctx.fillStyle = '#4b2b50'; ctx.fillRect(0, 420, 2000, 80);
        ctx.fillStyle = '#130d25'; ctx.fillRect(0, 435, 2000, 65);

        for (let i = 0; i < 3; i++) {
            const x = 95 + i * 220;
            ctx.fillStyle = '#090817'; ctx.fillRect(x, 70, 110, 250);
            ctx.strokeStyle = '#a35b9a'; ctx.lineWidth = 4; ctx.strokeRect(x, 70, 110, 250);
            ctx.fillStyle = i % 2 === 0 ? '#17465b' : '#652751'; ctx.fillRect(x + 10, 80, 90, 230);
            ctx.fillStyle = i % 2 === 0 ? '#1f7590' : '#a74475'; ctx.fillRect(x + 50, 80, 10, 230);
            ctx.fillRect(x + 10, 190, 90, 10);
        }

        this.drawStaircase(ctx);
        this.drawTorch(ctx, 420, 170, 0);
        this.drawTorch(ctx, 535, 240, 1);
        this.drawTorch(ctx, 965, 240, 2);
        this.drawThrone(ctx, 650, 420);
    }

    drawStaircase(ctx: CanvasRenderingContext2D) {
        // Wide visible steps make the climb readable instead of looking like a teleport.
        ctx.fillStyle = '#191326';
        ctx.beginPath(); ctx.moveTo(585, 420); ctx.lineTo(795, 315); ctx.lineTo(925, 315); ctx.lineTo(700, 420); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 8; i++) {
            const x = 610 + i * 24;
            const y = 410 - i * 13;
            ctx.fillStyle = i % 2 ? '#765172' : '#5a3c60'; ctx.fillRect(x, y, 128, 8);
            ctx.fillStyle = '#3a2848'; ctx.fillRect(x + 8, y + 8, 120, 8);
        }
        ctx.strokeStyle = '#be7ab4'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(620, 390); ctx.lineTo(805, 295); ctx.lineTo(920, 295); ctx.stroke();
        for (let i = 0; i < 7; i++) {
            const x = 650 + i * 36; const y = 375 - i * 15;
            ctx.fillStyle = '#8d5d85'; ctx.fillRect(x, y, 6, 35);
        }
    }

    drawPixelCloud(ctx: CanvasRenderingContext2D, x: number, y: number, tint: number) {
        ctx.save();
        ctx.fillStyle = tint === 1 ? '#e9fbff' : '#f4fdff';
        ctx.fillRect(x, y + 12, 92, 22); ctx.fillRect(x + 16, y, 38, 34); ctx.fillRect(x + 48, y + 7, 42, 27);
        ctx.fillStyle = 'rgba(91, 177, 221, 0.28)'; ctx.fillRect(x + 10, y + 29, 72, 7);
        ctx.restore();
    }

    drawBreeze(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.72)'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const travel = (this.timer * 70 + i * 92) % 220;
            const x = 545 + travel;
            const y = 230 + i * 22 + Math.sin(this.timer * 3 + i) * 3;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22, y); ctx.lineTo(x + 30, y - 5); ctx.stroke();
        }
        ctx.restore();
    }

    drawPortal(ctx: CanvasRenderingContext2D) {
        const size = this.portalSize;
        const pulse = Math.floor((Math.sin(this.timer * 18) + 1) * 2);

        // A vertical energy column connects the rift in the sky to the balcony.
        ctx.fillStyle = 'rgba(118, 44, 232, 0.10)'; ctx.fillRect(this.portalX - 32, 0, 64, 300);
        ctx.fillStyle = 'rgba(255, 57, 226, 0.14)'; ctx.fillRect(this.portalX - 12, 0, 24, 300);
        for (let y = 25; y < 295; y += 34) {
            const drift = Math.floor(Math.sin(this.timer * 7 + y) * 10);
            ctx.fillStyle = y % 68 === 0 ? '#ff65ef' : '#7e5cff';
            ctx.fillRect(this.portalX - 5 + drift, y, 10, 6);
        }

        // Blocky storm clouds make the portal feel like it tears open overhead.
        ctx.fillStyle = '#1b174d';
        ctx.fillRect(this.portalX - 110, 25, 220, 18);
        ctx.fillRect(this.portalX - 80, 12, 55, 18); ctx.fillRect(this.portalX + 28, 8, 72, 24);
        ctx.fillStyle = '#30217a'; ctx.fillRect(this.portalX - 130, 44, 260, 12);
        ctx.fillStyle = '#ffdc71';
        ctx.fillRect(this.portalX - 72, 62, 6, 22); ctx.fillRect(this.portalX - 66, 84, 15, 6);
        ctx.fillRect(this.portalX - 51, 90, 6, 17); ctx.fillRect(this.portalX - 45, 107, 18, 6);

        ctx.save(); ctx.translate(this.portalX, this.portalY); ctx.rotate(this.portalAngle * 0.12);
        // Pixel halo layers: squares read crisply when the canvas is scaled.
        ctx.fillStyle = `rgba(255, 52, 225, ${0.10 + pulse * 0.015})`;
        ctx.fillRect(-size - 12, -size - 12, (size + 12) * 2, (size + 12) * 2);
        ctx.fillStyle = '#7d29b8';
        ctx.beginPath();
        ctx.moveTo(-size * 0.40, -size); ctx.lineTo(size * 0.42, -size); ctx.lineTo(size * 0.68, -size * 0.70);
        ctx.lineTo(size * 0.54, -size * 0.28); ctx.lineTo(size * 0.78, 0); ctx.lineTo(size * 0.52, size * 0.32);
        ctx.lineTo(size * 0.66, size * 0.72); ctx.lineTo(size * 0.30, size); ctx.lineTo(-size * 0.38, size);
        ctx.lineTo(-size * 0.64, size * 0.64); ctx.lineTo(-size * 0.50, size * 0.26); ctx.lineTo(-size * 0.78, 0);
        ctx.lineTo(-size * 0.53, -size * 0.32); ctx.lineTo(-size * 0.67, -size * 0.70); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#12051f';
        ctx.fillRect(-size * 0.45, -size * 0.72, size * 0.9, size * 1.44);
        ctx.fillStyle = '#24083c';
        ctx.fillRect(-size * 0.32, -size * 0.62, size * 0.64, size * 1.24);

        // Two rotating square rings create the portal's depth without smooth vector art.
        ctx.strokeStyle = '#ff7bff'; ctx.lineWidth = 5;
        ctx.strokeRect(-size * 0.60, -size * 0.82, size * 1.2, size * 1.64);
        ctx.strokeStyle = '#00eaff'; ctx.lineWidth = 3;
        ctx.strokeRect(-size * 0.42, -size * 0.68, size * 0.84, size * 1.36);
        for (let i = 0; i < 14; i++) {
            const angle = i * 0.45 + this.portalAngle;
            const radiusX = size * (0.55 + (i % 3) * 0.10);
            const radiusY = size * (0.72 + (i % 2) * 0.08);
            ctx.fillStyle = i % 2 ? '#ff79ff' : '#00f2ff';
            ctx.fillRect(Math.floor(Math.cos(angle) * radiusX), Math.floor(Math.sin(angle) * radiusY), 6, 6);
        }
        ctx.restore();

        // Falling pixels and lightning sell the portal's arrival from above.
        for (let i = 0; i < 8; i++) {
            const x = this.portalX - 120 + ((i * 53 + Math.floor(this.timer * 90)) % 240);
            const y = 20 + ((i * 37 + Math.floor(this.timer * 125)) % 260);
            ctx.fillStyle = i % 2 ? '#ff4ee6' : '#54dfff'; ctx.fillRect(x, y, 5, 5);
        }
        if (this.phase === 'PORTAL_OPENS' || this.phase === 'QUEEN_SUCKED_IN') {
            ctx.fillStyle = `rgba(110, 25, 170, ${Math.min(0.24, this.portalSize / 800)})`;
            ctx.fillRect(0, 0, 1000, 500);
        }
    }

    drawForest(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#0b1730'); gradient.addColorStop(0.55, '#173c35'); gradient.addColorStop(1, '#08130f');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = 'rgba(210,235,255,0.65)'; ctx.beginPath(); ctx.arc(820, 82, 42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b211c';
        for (let i = 0; i < 18; i++) {
            const x = i * 80 + 20;
            ctx.fillRect(x, 110, 24, 310);
            ctx.beginPath(); ctx.moveTo(x - 45, 220); ctx.lineTo(x + 12, 60); ctx.lineTo(x + 70, 220); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - 35, 300); ctx.lineTo(x + 12, 140); ctx.lineTo(x + 60, 300); ctx.fill();
        }
        ctx.fillStyle = '#08130f'; ctx.fillRect(0, 420, 2000, 80);
        if (this.phase === 'FOLLOW_TRAIL') this.drawFootsteps(ctx);
    }

    drawFootsteps(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.shadowColor = '#ffcc55'; ctx.shadowBlur = 12;
        for (let i = 0; i < 13; i++) {
            const x = 565 + i * 38;
            const y = 414 + Math.sin(i * 1.7) * 5;
            const discovered = this.trailProgress > i * 34;
            ctx.globalAlpha = discovered ? 0.9 : 0.28;
            ctx.fillStyle = discovered ? '#ffd36a' : '#9a7544';
            ctx.save(); ctx.translate(x, y); ctx.rotate(i % 2 ? -0.22 : 0.22);
            ctx.fillRect(-8, -3, 16, 7); ctx.fillRect(-5, -9, 10, 5); ctx.restore();
        }
        ctx.restore();
    }

    drawDustTrail(ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number) {
        ctx.save(); ctx.fillStyle = 'rgba(214, 206, 174, 0.55)';
        for (let i = 0; i < 12; i++) {
            const drift = Math.sin(this.timer * 5 + i) * 12;
            ctx.globalAlpha = Math.max(0, 0.55 - i * 0.035) * intensity;
            ctx.beginPath(); ctx.arc(x - i * 18 + drift, y - (i % 3) * 5, 3 + (i % 3), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
        // Keep the bracket and flame base locked to the wall. Only the tiny
        // top pixels change, so the fire flickers instead of jumping.
        const frame = Math.floor(this.timer * 12 + seed) % 4;
        const lean = [0, 1, 1, 0][frame];
        const snapX = Math.round(x); const snapY = Math.round(y);
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Small square halo: a pixel-art torch can glow without a soft blur.
        ctx.fillStyle = 'rgba(255, 106, 25, 0.08)'; ctx.fillRect(snapX - 22, snapY - 34, 44, 44);
        ctx.fillStyle = 'rgba(255, 183, 49, 0.10)'; ctx.fillRect(snapX - 14, snapY - 28, 28, 32);

        // Iron bracket and wooden handle.
        ctx.fillStyle = '#20152b'; ctx.fillRect(snapX - 7, snapY + 2, 14, 32);
        ctx.fillStyle = '#75402c'; ctx.fillRect(snapX - 4, snapY + 2, 8, 32);
        ctx.fillStyle = '#b2713b'; ctx.fillRect(snapX - 10, snapY + 27, 20, 6);
        ctx.fillStyle = '#35223b'; ctx.fillRect(snapX - 13, snapY + 30, 26, 5);

        // Three hard-edged flame colours, animated by changing the pixel steps.
        ctx.fillStyle = '#ff3d1f';
        ctx.fillRect(snapX - 9, snapY - 17, 18, 20);
        ctx.fillRect(snapX - 5 + lean, snapY - 25, 10, 8);
        ctx.fillStyle = '#ff9d25';
        ctx.fillRect(snapX - 6 + lean, snapY - 18, 12, 16);
        ctx.fillRect(snapX - 3 + lean, snapY - 28, 6, 10);
        ctx.fillStyle = '#fff0a0';
        ctx.fillRect(snapX - 3 + lean, snapY - 15, 6, 12);
        ctx.fillRect(snapX - 1 + lean, snapY - 22, 3, 7);

        // Floating embers are also square and blink at different rates.
        if (Math.floor(this.timer * 14 + seed) % 3 !== 0) {
            ctx.fillStyle = '#ffd45a'; ctx.fillRect(snapX + 14 + lean, snapY - 29, 4, 4);
        }
        if (Math.floor(this.timer * 11 + seed) % 4 === 0) {
            ctx.fillStyle = '#ff6b2d'; ctx.fillRect(snapX - 18, snapY - 42, 3, 3);
        }
        ctx.restore();
    }

    drawCastleApproach(ctx: CanvasRenderingContext2D) {
        const reveal = this.castleReveal;
        const gradient = ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#03020b'); gradient.addColorStop(1, '#1b0730');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = '#090713'; ctx.fillRect(130, 80, 740, 420);
        ctx.fillStyle = '#160d23'; ctx.fillRect(190, 40, 120, 460); ctx.fillRect(690, 40, 120, 460);
        ctx.fillStyle = '#29133a'; ctx.fillRect(225, 20, 50, 100); ctx.fillRect(725, 20, 50, 100);
        ctx.fillStyle = '#05030b'; ctx.beginPath(); ctx.arc(500, 390, 185, Math.PI, 0); ctx.lineTo(685, 500); ctx.lineTo(315, 500); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ff2bd6'; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = '#250d38'; ctx.fillRect(390, 300, 220, 200);
        ctx.save(); ctx.globalAlpha = reveal; ctx.fillStyle = '#ff00c8'; ctx.shadowColor = '#ff00c8'; ctx.shadowBlur = 25;
        ctx.fillRect(470, 305, 60, 195); ctx.restore();
        this.drawTorch(ctx, 210, 220, 4); this.drawTorch(ctx, 790, 220, 5);
        ctx.fillStyle = '#fff'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.globalAlpha = reveal; ctx.fillText(this.language === 'en' ? 'INK COLOSSUS CASTLE' : 'CASTILLO DEL COLOSO DE TINTA', 500, 265);
        ctx.globalAlpha = 1;
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

    drawUnconsciousHero(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
        ctx.save();
        ctx.translate(x, y - 12);
        ctx.rotate(-0.08);
        ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(30, -4, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(17, -4); ctx.lineTo(-22, -4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-28, -24); ctx.moveTo(-8, -4); ctx.lineTo(-28, 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(-42, -20); ctx.moveTo(-18, -4); ctx.lineTo(-42, 12); ctx.stroke();
        ctx.fillStyle = '#ffe875'; ctx.shadowColor = '#ffe875'; ctx.shadowBlur = 8; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
        const symbols = ['Z', 'z', '·'];
        for (let i = 0; i < symbols.length; i++) ctx.fillText(symbols[i], 50 + i * 14, -28 - Math.sin(this.timer * 2 + i) * 8 - i * 12);
        ctx.restore();
    }

    drawQueen(ctx: CanvasRenderingContext2D, x: number, y: number) {
        y -= 25; // Scene positions are feet, not the bottom of the torso.
        ctx.save(); ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        const sittingY = (this.phase === 'WALK_IN' || this.phase === 'KNEEL_AND_TALK') ? y + 10 : y;
        const isWalking = this.motionActive && (this.phase === 'STAIRCASE_CLIMB' || this.phase === 'BALCONY_WALK');
        const step = isWalking ? Math.sin(this.timer * 12) * 6 : 0;
        ctx.beginPath(); ctx.arc(x, sittingY - 50, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.moveTo(x - 10, sittingY - 62); ctx.lineTo(x - 15, sittingY - 75); ctx.lineTo(x - 5, sittingY - 65); ctx.lineTo(x, sittingY - 80); ctx.lineTo(x + 5, sittingY - 65); ctx.lineTo(x + 15, sittingY - 75); ctx.lineTo(x + 10, sittingY - 62); ctx.fill();
        ctx.strokeStyle = '#ff69b4'; ctx.beginPath(); ctx.moveTo(x, sittingY - 38); ctx.lineTo(x, sittingY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 3, sittingY - 30); ctx.lineTo(x - 15, sittingY - 15 + step); ctx.moveTo(x + 3, sittingY - 30); ctx.lineTo(x + 15, sittingY - 15 - step); ctx.stroke();
        ctx.fillStyle = '#800080'; ctx.beginPath(); ctx.moveTo(x, sittingY - 30);
        if (this.phase === 'QUEEN_SUCKED_IN' || this.phase === 'VINN_JUMPS' || this.phase === 'FOREST_DROP' || this.phase === 'TECH_KIDNAP') {
            ctx.lineTo(x - 20, sittingY + 25); ctx.lineTo(x + 20, sittingY + 25);
        } else { ctx.lineTo(x - 25, sittingY + 20); ctx.lineTo(x + 25, sittingY + 20); }
        ctx.fill(); ctx.restore();
    }

    drawHero(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, visual: 'NORMAL' | 'SPIKY') {
        y -= 30; // Keep planted feet on the hall, steps, balcony and forest floor.
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = color;
        const headY = (['WALK_IN', 'STAIRCASE_CLIMB', 'FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING', 'FOLLOW_TRAIL'].includes(this.phase)) ? y - 50 : y - 35;
        ctx.beginPath(); ctx.arc(x, headY, 12, 0, Math.PI * 2); ctx.stroke();
        if (visual === 'SPIKY') { ctx.beginPath(); ctx.moveTo(x - 15, headY - 10); ctx.lineTo(x - 5, headY - 25); ctx.lineTo(x, headY - 12); ctx.lineTo(x + 5, headY - 25); ctx.lineTo(x + 15, headY - 10); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(x, headY + 12); ctx.lineTo(x, y); ctx.stroke();
        const isWalking = this.motionActive && ['WALK_IN', 'STAIRCASE_CLIMB', 'BALCONY_WALK', 'FOLLOW_TRAIL'].includes(this.phase);
        const s = isWalking ? Math.sin(this.timer * 12) * 15 : 10;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s, y + 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y + 30); ctx.stroke();
        const carryingRose = this.dialogueIndex < 3 || this.phase === 'BALCONY_WALK' || this.phase === 'BALCONY_TALK';
        const speaking = this.currentDialogue?.speaker === 'Vinn' || this.currentDialogue?.speaker.includes('Duo') || this.currentDialogue?.speaker.includes('Dúo');
        const gesture = speaking ? Math.sin(this.phaseTime * 5) * 5 : 0;
        ctx.beginPath(); ctx.moveTo(x, headY + 22);
        if (this.phase === 'VINN_GRABS_BRICK') ctx.lineTo(this.balconyBrickX + 8, 296);
        else if (this.phase === 'VINN_JUMPS') ctx.lineTo(x + 22, headY - 8);
        else ctx.lineTo(x + 18, carryingRose ? headY + 30 : y - 10 - gesture);
        ctx.moveTo(x, headY + 22); ctx.lineTo(x - 18, y - 8 + (isWalking ? s * 0.5 : 0)); ctx.stroke();
        if (carryingRose) {
            ctx.beginPath(); ctx.moveTo(x, headY + 22); // Note: Simplified
            if (visual === 'NORMAL') this.drawRose(ctx, x + 15, headY + 30);
            else { ctx.fillStyle = '#ffcc00'; ctx.fillRect(x + 10, headY + 25, 10, 10); }
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

    drawInkCastleInterior(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#03030d'); gradient.addColorStop(0.55, '#12051f'); gradient.addColorStop(1, '#26052b');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 2000, 500);
        ctx.fillStyle = '#0a0712'; ctx.fillRect(0, 420, 2000, 80);

        // Cathedral-like arches make the castle feel larger than the screen.
        for (let i = 0; i < 5; i++) {
            const x = 40 + i * 230;
            ctx.fillStyle = '#100b1d'; ctx.fillRect(x, 60, 135, 360);
            ctx.strokeStyle = i % 2 ? '#4d145e' : '#721f79'; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.arc(x + 67, 150, 67, Math.PI, 0); ctx.stroke();
            ctx.fillStyle = i % 2 ? 'rgba(255,0,200,0.10)' : 'rgba(0,242,255,0.08)';
            ctx.beginPath(); ctx.arc(x + 67, 150, 52, Math.PI, 0); ctx.lineTo(x + 119, 300); ctx.lineTo(x + 15, 300); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = '#080510'; ctx.fillRect(315, 280, 370, 220);
        ctx.fillStyle = '#351144'; ctx.fillRect(370, 320, 260, 180);
        ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.arc(500, 330, 128, Math.PI, 0); ctx.lineTo(628, 500); ctx.lineTo(372, 500); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ff20d8'; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = 'rgba(255,0,200,0.14)'; ctx.fillRect(480, 330, 40, 170);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
        for (let x = 0; x < 1000; x += 100) { ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x + 40, 500); ctx.stroke(); }

        this.drawTorch(ctx, 80, 235, 6); this.drawTorch(ctx, 270, 190, 7);
        this.drawTorch(ctx, 730, 190, 8); this.drawTorch(ctx, 920, 235, 9);
        ctx.fillStyle = '#ff2bd6'; ctx.shadowColor = '#ff2bd6'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(500, 85, 13, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
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
    phaseTime = 0;
    private timeline?: DialogueTimeline<World1ClearCutscene>;
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
        this.timeline ??= world1Checkpoints();
        const finished = this.timeline.update(this, dt);
        return finished || this.currentDialogue;
    }

    advanceDialogue() {
        this.timeline ??= world1Checkpoints();
        this.timeline.advance(this);
        this.update(0);
    }

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
    phaseTime = 0;
    private timeline?: DialogueTimeline<World2ClearCutscene>;
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
            { speaker: 'Ink Colossus', text: 'I will not recycle you yet.. because youre gonna marry us! i will only Unclare you king! youre priest.' },
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
        this.timeline ??= world2Checkpoints();
        const finished = this.timeline.update(this, dt);
        return finished || this.currentDialogue;
    }

    advanceDialogue() {
        this.timeline ??= world2Checkpoints();
        this.timeline.advance(this);
        this.update(0);
    }

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
    phaseTime = 0;
    private timeline?: DialogueTimeline<World3BossCutscene>;
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
        this.timeline ??= world3Checkpoints();
        const finished = this.timeline.update(this, dt);
        return finished;
    }

    advanceDialogue() {
        this.timeline ??= world3Checkpoints();
        this.timeline.advance(this);
        this.update(0);
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
    phaseTime = 0;
    private timeline?: DialogueTimeline<World3EscapeCutscene>;
    vinnX: number = 0;
    vinnY: number = 600; // Below edge
    queenX: number = 350;
    queenY: number = 325; // Feet at 325 + 25 = 350
    inkX: number = 500;
    inkY: number = 700; // Flying up
    
    phase: 'ENTRANCE' | 'DIALOGUE' = 'ENTRANCE';
    timer: number = 0;
    dialogueIndex: number = 0;
    currentDialogue: any = null;
    dialogues: any[] = [];
    language: 'en' | 'es' = 'en';

    dialogues_en = [
        { speaker: 'Vinn', text: 'Huff... Huff... I made it back up!' },
        { speaker: 'Queen', text: 'VINN! You survived that fall!' },
        { speaker: 'Ink Colossus', text: '...Grr... you think you\'ve won?' },
        { speaker: 'Ink Colossus', text: 'I\'ve demolished the main towers! I closed the high exits!' },
        { speaker: 'Ink Colossus', text: 'The only way out is through the gate far below...' },
        { speaker: 'Ink Colossus', text: '...and you\'ll never get there before the ink explosion!' },
        { speaker: 'Queen', text: 'We have to run, NOW!' }
    ];

    dialogues_es = [
        { speaker: 'Vinn', text: 'Uf... Uf... ¡Logré subir de nuevo!' },
        { speaker: 'Reina', text: '¡VINN! ¡Sobreviviste a esa caída!' },
        { speaker: 'Coloso de Tinta', text: '...Grr... ¿Crees que has ganado?' },
        { speaker: 'Coloso de Tinta', text: '¡He demolido las torres! ¡He cerrado las salidas altas!' },
        { speaker: 'Coloso de Tinta', text: 'La única salida es por la puerta de abajo...' },
        { speaker: 'Coloso de Tinta', text: '...¡y nunca llegarán antes de la explosión de tinta!' },
        { speaker: 'Reina', text: '¡Tenemos que correr, AHORA!' }
    ];

    setLanguage(lang: 'en' | 'es') {
        this.language = lang;
        this.dialogues = lang === 'en' ? this.dialogues_en : this.dialogues_es;
    }

    update(dt: number): boolean {
        this.timeline ??= escapeCheckpoints(this);
        const finished = this.timeline.update(this, dt);
        return finished;
    }

    advanceDialogue() {
        this.timeline ??= escapeCheckpoints(this);
        this.timeline.advance(this);
        this.update(0);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Background - Same as World 3 Intro
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 500);
        skyGrad.addColorStop(0, '#00ffff');
        skyGrad.addColorStop(1, '#ff66b2');
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, 1000, 500);

        // Altar Platform (Same as Intro)
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(0, 500); ctx.lineTo(0, 350); 
        ctx.lineTo(400, 350); ctx.lineTo(550, 460); ctx.lineTo(1000, 460); ctx.lineTo(1000, 500);
        ctx.fill();

        // Neon Trim
        ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, 350); ctx.lineTo(400, 350); 
        ctx.lineTo(550, 460); ctx.lineTo(1000, 460); ctx.stroke();

        // Protective Bricks / Parapets on the edges (so we don't fall)
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
        // Left Edge
        ctx.fillRect(0, 310, 20, 40); ctx.strokeRect(0, 310, 20, 40);
        // Middle Edge (before ramp)
        ctx.fillRect(380, 310, 20, 40); ctx.strokeRect(380, 310, 20, 40);

        // Draw SkeletBot Watchers sitting in chairs (Right side, ground level)
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

        // Draw Blaze Priest (Suit, No Crown, Bandage)
        this.drawBlaze(ctx, 300, 320, false, true, true);

        // Draw Golem Watcher (Blocking the Queen or nearby)
        this.drawGolem(ctx, 420, 460, false);

        // Assets
        this.drawQueen(ctx, this.queenX, this.queenY);
        this.drawHero(ctx, this.vinnX, this.vinnY, '#00f2ff');
        
        if (this.inkY < 500) {
            this.drawInjuredInkColossus(ctx, this.inkX, this.inkY);
        }

        // Dialogue Box
        if (this.phase === 'DIALOGUE' && this.currentDialogue) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(100, 30, 800, 110);
            ctx.strokeStyle = this.currentDialogue.speaker === 'Ink Colossus' ? '#ff00ff' : '#00f2ff';
            ctx.lineWidth = 4;
            ctx.strokeRect(100, 30, 800, 110);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(this.currentDialogue.speaker, 120, 55);

            ctx.font = '12px "Press Start 2P"';
            const words = this.currentDialogue.text.split(' ');
            let line = ''; let lineY = 85;
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
        // Wedding Dress (Veil/Outer)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.beginPath();
        ctx.moveTo(x - 5, y - 55); ctx.quadraticCurveTo(x - 30, y - 20, x - 25, y + 25); ctx.lineTo(x + 25, y + 25); ctx.quadraticCurveTo(x + 30, y - 20, x + 5, y - 55); ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 10, y - 40); ctx.lineTo(x - 15, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 10, y - 40); ctx.lineTo(x + 15, y + 10); ctx.stroke();
        
        // Inner Figure Outline
        ctx.strokeStyle = '#ff69b4'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - 40, 12, 0, Math.PI * 2); ctx.stroke();
        
        // Main Dress (Inner)
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x - 22, y + 25); ctx.lineTo(x + 22, y + 25); ctx.fill();
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; ctx.stroke();
        
        // Detailed Gold Crown
        ctx.fillStyle = '#ffd700'; ctx.shadowBlur = 5; ctx.shadowColor = '#ffd700'; ctx.beginPath();
        ctx.moveTo(x - 15, y - 50); ctx.lineTo(x - 12, y - 65); ctx.lineTo(x - 6, y - 55); ctx.lineTo(x, y - 70); ctx.lineTo(x + 6, y - 55); ctx.lineTo(x + 12, y - 65); ctx.lineTo(x + 15, y - 50); ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    drawSkeletBot(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save(); ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 3;
        const bounce = Math.sin(Date.now() / 200 + x) * 5;
        ctx.beginPath(); ctx.arc(x, y - 30 + bounce, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(x + 4, y - 30 + bounce, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - 20 + bounce); ctx.lineTo(x, y + 10 + bounce); ctx.stroke(); ctx.restore();
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
}
