import { DialogueTimeline, type AnimationBeat } from './DialogueTimeline';
import type { IntroCutscene, World1ClearCutscene, World2ClearCutscene, World3BossCutscene, World3EscapeCutscene } from './Cutscene';
import type { EndingCutscene } from './EndingCutscene';

function beat<S>(phase: string, seconds = 1, to?: Partial<S>): AnimationBeat<S>[] {
    return [{ phase, seconds, to }];
}

export function introCheckpoints(scene: IntroCutscene) {
    // The duo has one extra gift line. Both languages share these story cues.
    const at = (soloIndex: number) => soloIndex + (scene.isTwoPlayer ? 1 : 0);
    const line = beat<IntroCutscene>;
    const cues = scene.dialogues.map(() => line('KNEEL_AND_TALK'));
    cues[0] = [...line('WALK_IN', 2, { vinnX: 300 }), ...line('KNEEL_AND_TALK')];
    // Wait for the Queen's acceptance, approach the stairs, then climb them.
    cues[at(4)] = [
        ...line('STAIRCASE_CLIMB', 1.7, { vinnX: 610, queenX: 660 }),
        { phase: 'STAIRCASE_CLIMB', seconds: 2.4, to: { vinnX: 790, vinnY: 320, queenX: 835, queenY: 320 }, frame: (s, p) => { s.stairProgress = p; } },
        ...line('BALCONY_WALK', 1.4, { vinnX: 620, queenX: 735 })
    ];
    cues[at(5)] = line('BALCONY_TALK'); // Ahh means enjoying the daytime air.
    cues[at(6)] = line('BALCONY_TALK');
    cues[at(7)] = line('PORTAL_OPENS', 1.6, { portalSize: 145 });
    cues[at(8)] = line('QUEEN_SUCKED_IN', 1.6, { queenX: scene.portalX, queenY: scene.portalY, portalSize: 160 });
    cues[at(9)] = [
        ...line('VINN_GRABS_BRICK', 1.2, { vinnX: scene.balconyBrickX }),
        { phase: 'VINN_JUMPS', seconds: 1.5, frame: (s, p) => {
            s.vinnX = s.balconyBrickX + (s.portalX - s.balconyBrickX) * p;
            s.vinnY = 320 + (s.portalY - 320) * p - Math.sin(p * Math.PI) * 65;
        } }
    ];
    cues[at(10)] = [{ phase: 'FOREST_DROP', seconds: 1.5,
        enter: s => { s.vinnX = 300; s.queenX = 430; s.vinnY = -120; s.queenY = -180; },
        frame: (s, p) => { s.vinnY = Math.min(420, -120 + 640 * p * p); s.queenY = Math.min(420, -180 + 600 * p * p); } }];
    cues[at(11)] = line('TECH_KIDNAP', 1.4, { skeletonLeftX: 400, skeletonRightX: 460 });
    cues[at(12)] = line('TECH_KIDNAP', 3.4, { queenX: 1100, skeletonLeftX: 1070, skeletonRightX: 1130 });
    cues[at(13)] = line('VINN_LANDING', 1.5);
    cues[at(14)] = line('VINN_LANDING', 0.8, { vinnX: 350 });
    cues[at(15)] = line('FOLLOW_TRAIL', 1, { trailProgress: 80, vinnX: 380 });
    cues[at(16)] = line('FOLLOW_TRAIL', 2.8, { trailProgress: 520, vinnX: 820 });
    cues[at(17)] = [...line('LATER_SCREEN', 2.5), ...line('CASTLE_APPROACH', 2.2, { castleReveal: 1 })];
    cues[at(18)] = [{ phase: 'BOSS_LAB_INTRO', seconds: 2,
        enter: s => { s.queenX = 500; s.queenY = 420; s.colossusY = 550; }, to: { colossusY: 350 } }, ...line('BOSS_LAB_TALK')];
    for (let i = 19; i <= 23; i++) cues[at(i)] = line('BOSS_LAB_TALK');
    cues[at(24)] = line('GOLEM_LEAVE', 2, { boss1X: 1200 });
    cues[at(25)] = line('BOSS_LAB_TALK');
    return new DialogueTimeline(cues, line('COLOSSUS_LEAVE', 3, { colossusY: 620, queenY: 540 }));
}

export function world1Checkpoints() {
    const line = beat<World1ClearCutscene>;
    return new DialogueTimeline([
        line('TALK_WEDDING'), line('TALK_WEDDING'),
        line('BOT_NOTICE', 1.2, { botX: 850 }),
        line('GOLEM_ENTERS', 1.8, { boss1X: 800, botX: 900 }),
        [...line('REPAIR_ORDER', 0.8, { botX: 750 }), ...line('REPAIR_ORDER', 2, { boss1X: 1200, botX: 1150 })],
        [{ phase: 'BLAZE_PROMOTION', seconds: 1, enter: s => { s.hasCrown = true; }, to: { boss2X: 260 } }],
        line('BLAZE_PROMOTION'), line('BLAZE_PROMOTION')
    ], line('LUNCH_EXIT', 3, { colossusY: 620, queenY: 600, boss2X: -100 }));
}

export function world2Checkpoints() {
    const line = beat<World2ClearCutscene>;
    return new DialogueTimeline([
        line('TALK_WEDDING'), line('TALK_WEDDING'),
        line('BLAZE_ENTERS', 1.8, { boss2X: 800 }),
        line('BLAZE_ENTERS'), line('BLAZE_ENTERS'), line('BLAZE_ENTERS'),
        [{ phase: 'SUIT_UP', seconds: 1, enter: s => { s.hasSuit = true; } }],
        line('SUIT_UP'), line('QUEEN_RESIST', 1.5, { botX: 550, queenX: 470 })
    ], line('FINAL_EXIT', 3, { colossusY: 620, queenY: 620, boss2X: 1150, botX: 1100 }));
}

export function world3Checkpoints() {
    const line = beat<World3BossCutscene>;
    return new DialogueTimeline([
        line('ALTAR_SCENE'), line('ALTAR_SCENE'), line('ALTAR_SCENE'),
        line('VINN_ARRIVES', 1.8, { vinnX: 480, vinnY: 380 }),
        [{ phase: 'INK_ANGRY', seconds: 1.5, frame: (s, p) => { s.inkX = 400 + Math.sin(p * Math.PI * 16) * 8 * (1 - p); } }],
        [{ phase: 'GOLEM_SWORD', seconds: 1, enter: s => { s.golemSwordDrawn = true; } }],
        [...line('INK_CHASE_START', 0.8, { vinnX: 400, vinnY: 320, inkY: 320 }),
         { phase: 'RUN_CIRCLES', seconds: 3, frame: (s, p) => {
             s.circleTimer = p * Math.PI * 4;
             s.vinnX = 300 + Math.cos(s.circleTimer) * 100;
             s.inkX = 300 + Math.cos(s.circleTimer - 0.5) * 100;
         } },
         { phase: 'JUMP_OFF', seconds: 1.5, frame: (s, p) => {
             s.vinnX = 400 - p * 600; s.vinnY = 320 - Math.sin(p * Math.PI) * 110 + p * p * 450;
             s.inkX = 388 - p * 550; s.inkY = 320 + p * p * 420;
         } }],
        line('QUEEN_REACTION', 1.4, { queenX: 100 }),
        line('QUEEN_REACTION', 1, { golemX: 45, golemY: 350 })
    ]);
}

export function escapeCheckpoints(scene: World3EscapeCutscene) {
    const line = beat<World3EscapeCutscene>;
    const cues = scene.dialogues.map(() => line('DIALOGUE'));
    cues[0] = [...line('ENTRANCE', 1.6, { vinnX: 40, vinnY: 320 }), ...line('DIALOGUE', 0.5)];
    cues[1] = line('DIALOGUE', 0.8, { queenX: 160 });
    cues[2] = [...line('ENTRANCE', 1.5, { inkY: 250 }), ...line('DIALOGUE', 0.5)];
    cues[6] = line('DIALOGUE', 0.8, { queenX: 240, vinnX: 160 });
    return new DialogueTimeline(cues);
}

export function endingCheckpoints() {
    const line = beat<EndingCutscene>;
    return new DialogueTimeline([
        line('REUNION', 1.2, { vinnX: 300 }), line('REUNION'), line('REUNION'), line('REUNION'),
        line('PORTAL_EXIT', 2, { portalSize: 200, vinnX: 480, vinnY: 350, queenX: 510, queenY: 350 }),
        [{ phase: 'CASTLE_ARRIVAL', seconds: 0.8, enter: s => { s.vinnX = 400; s.queenX = 500; s.vinnY = 420; s.queenY = 420; s.portalSize = 0; } }],
        line('CASTLE_ARRIVAL'), line('CASTLE_ARRIVAL', 1, { queenX: 460 }),
        [{ phase: 'THE_REWARD', seconds: 1, enter: s => { s.isBowing = true; } },
         { phase: 'THE_KISS', seconds: 1.5, to: { queenX: 420 }, frame: (s, p) => {
             s.hearts = [0, 1, 2].map(i => ({ x: 410 + i * 14, y: 365 - p * 50 - i * 10, life: Math.max(0, 1 - p * 0.6) }));
         } },
         { phase: 'QUEEN_EXIT', seconds: 2.5, enter: s => { s.isBowing = false; }, to: { queenX: 1100 } },
         { phase: 'VINN_STUNNED', seconds: 1.5, enter: s => { s.vinnStunned = true; } }],
        line('BANQUET_CALL')
    ], [
        { phase: 'FOLLOW_QUEEN', seconds: 2, enter: s => { s.vinnStunned = false; s.hearts = []; }, to: { vinnX: 1100 } },
        ...line('BUT_SCREEN', 3), ...line('BOSS_REGEN', 5), ...line('BOSS_FUSION', 5), ...line('FIN_BAIT', 5)
    ]);
}
