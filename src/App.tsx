import { useRef, useState, useEffect } from 'react';
import { Vinn } from './game/Vinn';
import { Enemy } from './game/Enemy';
import { Boss } from './game/Boss';
import type { BossType } from './game/Boss';
import { IntroCutscene, World1ClearCutscene, World2ClearCutscene, World3BossCutscene, World3EscapeCutscene } from './game/Cutscene';
import { EndingCutscene } from './game/EndingCutscene';
import { MusicManager } from './game/SoundEngine';
import { useGameLoop } from './game/useGameLoop';

type WorldTheme = 'FOREST' | 'VOLCANO' | 'PAINT_LAND';

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 500;

interface Platform {
    x: number;
    y: number;
    w: number;
    h: number;
    type?: 'MUSHROOM' | 'PAINT' | 'NORMAL';
}

interface Item {
    x: number;
    y: number;
    type: 'DOUBLE_JUMP' | 'RAINBOW' | 'FEATHER';
    collected: boolean;
}

const WORLD_CONFIGS: Record<number, { theme: WorldTheme, levels: any[] }> = {
    1: {
        theme: 'FOREST',
        levels: [
            { length: 2400, enemies: [{ x: 1200, type: 'TECH' }, { x: 2000, type: 'TECH' }], platforms: [{ x: 0, y: 460, w: 600 }, { x: 700, y: 460, w: 400 }, { x: 800, y: 350, w: 100, type: 'MUSHROOM' }, { x: 1200, y: 460, w: 800 }, { x: 1500, y: 300, w: 200 }, { x: 2100, y: 460, w: 300 }], items: [] },
            { length: 3000, enemies: [{ x: 800, type: 'TECH' }, { x: 1500, type: 'TECH' }, { x: 2500, type: 'TECH' }], platforms: [{ x: 0, y: 460, w: 500 }, { x: 600, y: 380, w: 150, type: 'MUSHROOM' }, { x: 900, y: 280, w: 200 }, { x: 1200, y: 460, w: 600 }, { x: 1900, y: 460, w: 400 }, { x: 2400, y: 460, w: 600 }], items: [{ x: 1000, y: 230, type: 'DOUBLE_JUMP', collected: false }] },
            { length: 3600, enemies: [{ x: 1000, type: 'TECH' }, { x: 1800, type: 'TECH' }, { x: 2800, type: 'TECH' }], platforms: [{ x: 0, y: 460, w: 800 }, { x: 900, y: 400, w: 100, type: 'MUSHROOM' }, { x: 1100, y: 300, w: 100, type: 'MUSHROOM' }, { x: 1300, y: 200, w: 400 }, { x: 1800, y: 460, w: 1000 }, { x: 3000, y: 460, w: 600 }], items: [] },
            {
                length: 3000, enemies: [{ x: 1000, type: 'TECH' }, { x: 2000, type: 'TECH' }], platforms: [
                    { x: 0, y: 460, w: 1000 },
                    { x: 1100, y: 250, w: 300 },
                    { x: 1500, y: 460, w: 1500 }
                ], items: []
            },
            { length: 1600, enemies: [], platforms: [{ x: 0, y: 460, w: 1600 }], isBoss: true, bossType: 'GOLEM' }
        ]
    },
    2: {
        theme: 'VOLCANO',
        levels: [
            { length: 2800, enemies: [{ x: 1000, type: 'NORMAL' }, { x: 1800, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 400 }, { x: 600, y: 400, w: 200 }, { x: 1000, y: 350, w: 200 }, { x: 1400, y: 300, w: 200 }, { x: 1800, y: 460, w: 1000 }], items: [] },
            { length: 3200, enemies: [{ x: 1200, type: 'NORMAL' }, { x: 2200, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 600 }, { x: 800, y: 400, w: 100, type: 'MUSHROOM' }, { x: 1100, y: 300, w: 300 }, { x: 1600, y: 250, w: 100, type: 'MUSHROOM' }, { x: 1900, y: 460, w: 1300 }], items: [] },
            { length: 4000, enemies: [{ x: 1200, type: 'NORMAL' }, { x: 2000, type: 'NORMAL' }, { x: 3200, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 1000 }, { x: 1200, y: 350, w: 300 }, { x: 1700, y: 250, w: 200 }, { x: 2200, y: 400, w: 100 }, { x: 2500, y: 300, w: 100, type: 'MUSHROOM' }, { x: 2800, y: 460, w: 1200 }], items: [] },
            { length: 3600, enemies: [{ x: 1000, type: 'NORMAL' }, { x: 2500, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 800 }, { x: 1000, y: 300, w: 400 }, { x: 1600, y: 200, w: 400 }, { x: 2200, y: 400, w: 200 }, { x: 2600, y: 460, w: 1000 }], items: [] },
            { length: 1600, enemies: [], platforms: [{ x: 0, y: 460, w: 1600 }], isBoss: true, bossType: 'BLAZE_KING' }
        ]
    },
    3: {
        theme: 'PAINT_LAND',
        levels: [
            { length: 2400, enemies: [{ x: 1000, type: 'NORMAL' }, { x: 2000, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 800 }, { x: 800, y: 400, w: 400, type: 'PAINT' }, { x: 1200, y: 460, w: 1200 }], items: [] },
            { length: 3000, enemies: [{ x: 800, type: 'NORMAL' }, { x: 2400, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 500 }, { x: 500, y: 350, w: 200, type: 'PAINT' }, { x: 800, y: 460, w: 500 }, { x: 1300, y: 300, w: 300, type: 'PAINT' }, { x: 1700, y: 460, w: 1300 }], items: [] },
            { length: 3600, enemies: [{ x: 1000, type: 'NORMAL' }, { x: 2000, type: 'NORMAL' }, { x: 3000, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 1000 }, { x: 1100, y: 300, w: 400, type: 'PAINT' }, { x: 1600, y: 460, w: 2000 }], items: [] },
            { length: 4000, enemies: [{ x: 1000, type: 'NORMAL' }, { x: 2500, type: 'NORMAL' }], platforms: [{ x: 0, y: 460, w: 1500 }, { x: 1600, y: 250, w: 800, type: 'PAINT' }, { x: 2500, y: 460, w: 1500 }], items: [] },
            {
                length: 15400, enemies: [], platforms: [
                    // Phase 1 (0-3000): Introductory jumps
                    { x: 0, y: 460, w: 600 }, { x: 750, y: 400, w: 200 }, { x: 1100, y: 460, w: 400, type: 'PAINT' }, { x: 1600, y: 350, w: 300 }, { x: 2000, y: 460, w: 500 },
                    { x: 2300, y: 300, w: 100, type: 'MUSHROOM' }, { x: 2600, y: 460, w: 600 },
                    { x: 3200, y: 300, w: 500, type: 'NORMAL' }, // ELEVATOR 1 (at ~3k)

                    // Phase 2 (3000-6000): Rising verticality
                    { x: 3800, y: 460, w: 300 }, { x: 4200, y: 380, w: 200 }, { x: 4500, y: 300, w: 200 }, { x: 4800, y: 220, w: 200 }, { x: 5100, y: 350, w: 300, type: 'PAINT' },
                    { x: 5500, y: 460, w: 500 },
                    { x: 6200, y: 300, w: 500, type: 'NORMAL' }, // ELEVATOR 2 (at ~6k)

                    // Phase 3 (6000-9000): Void leaps & Small slabs
                    { x: 6800, y: 400, w: 150 }, { x: 7100, y: 350, w: 100 }, { x: 7400, y: 300, w: 100, type: 'MUSHROOM' }, { x: 7700, y: 250, w: 150 }, { x: 8000, y: 400, w: 200 },
                    { x: 8400, y: 460, w: 400, type: 'PAINT' },
                    { x: 9200, y: 300, w: 500, type: 'NORMAL' }, // ELEVATOR 3 (at ~9k)

                    // Phase 4 (9000-12000): Hazard density
                    { x: 9800, y: 460, w: 400 }, { x: 10300, y: 400, w: 200, type: 'PAINT' }, { x: 10600, y: 350, w: 200, type: 'PAINT' }, { x: 10900, y: 300, w: 200, type: 'PAINT' },
                    { x: 11200, y: 350, w: 400 }, { x: 11700, y: 460, w: 300 },
                    { x: 12200, y: 300, w: 500, type: 'NORMAL' }, // ELEVATOR 4 (at ~12k)

                    // Phase 5 (12000-15400): Final dash
                    { x: 12800, y: 400, w: 300 }, { x: 13200, y: 320, w: 200 }, { x: 13500, y: 250, w: 100, type: 'MUSHROOM' }, { x: 13800, y: 380, w: 400, type: 'PAINT' },
                    { x: 14300, y: 460, w: 600 }, { x: 15000, y: 460, w: 400 } // FINAL DOOR at ~15.4k
                ], isBoss: true, bossType: 'INK_COLOSSUS',
                bombs: [],
                items: [
                    { x: 4500, y: 260, type: 'RAINBOW', collected: false },
                    { x: 7400, y: 260, type: 'RAINBOW', collected: false },
                    { x: 10600, y: 310, type: 'RAINBOW', collected: false },
                    { x: 13800, y: 340, type: 'RAINBOW', collected: false }
                ]
            }
        ]
    }
};

const BOSS_GUIDES: Record<string, { img?: string, title: string, text: string }[]> = {
    'BLAZE_KING': [
        { img: '/guides/blaze_king_fire.png', title: 'Phase 1: Rain of Fire', text: 'The Blaze King will summon fireballs from the sky! Keep moving and dodge the shadows to survive.' },
        { img: '/guides/blaze_king_smash.png', title: 'Phase 2: Ground Smash', text: 'Watch out when he slams the ground! Jump over the fiery shockwaves racing along the floor.' },
        { title: 'Counter Attack!', text: 'After his intense attacks, he will be momentarily stunned and dizzy. Safely run up and use your sword to damage him!' }
    ],
    'GOLEM': [
        { img: '/guides/golem_raining.png', title: 'Phase 1: Death From Above', text: 'The Golem flies high and drops giant boulders. Evade the red shadows to avoid being crushed!' },
        { title: 'Phase 2: Shockwave Stomp', text: 'He will heavily stomp the terrain sending powerful shockwaves. Time your jumps perfectly!' },
        { img: '/guides/golem_stun.png', title: 'Counter Attack!', text: 'When the Golem finally collapses in a dizzy stun, strike him quickly with your sword!' }
    ],
    'INK_COLOSSUS': [
        { title: 'Phase 1: Run!', text: 'The Ink Colossus will brutally chase you down a fast 15,000-pixel path! Jump across obstacles as fast as possible.' },
        { title: 'Phase 2: The Rainbow Speed', text: 'Grab the glowing rainbow crystals to gain a massive speed boost and outrun the Colossus in his fastest chase moments!' },
        { title: 'Phase 3: The Elevator Ascent', text: 'When you arrive at an Elevator checkpoint, stop! When the Boss rises beneath you from the pit, strike him immediately to launch your elevator upwards!' }
    ]
};

const MINIGAME_CONFIGS = [
    { id: 'MG_MUSHROOM_JUMP', world: 1, title: { en: 'Mushroom Jump', es: 'Salto de Hongo' } },
    { id: 'MG_STONE_SMASH', world: 2, title: { en: 'Stone Smash', es: 'Golpe de Piedra' } },
    { id: 'MG_ESCAPE', world: 3, title: { en: 'Escape!', es: '¡Escape!' } },
];

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tutorialPhase, setTutorialPhase] = useState(0);
    const [gameState, setGameState] = useState<'START_MENU' | 'SETTINGS' | 'LEVEL_SELECTOR' | 'INTRO_CUTSCENE' | 'TUTORIAL' | 'PLAYING' | 'BOSS_VS_CUTSCENE' | 'INK_BOSS_INTRO' | 'GAMEOVER' | 'LEVEL_TRANSITION' | 'WORLD_COMPLETE' | 'ENDING_CUTSCENE' | 'WORLD1_INTERLUDE' | 'WORLD2_INTERLUDE' | 'WORLD3_BOSS_INTRO' | 'WORLD3_ESCAPE_CUTSCENE' | 'GAME_WON' | 'BOSS_GUIDE' | 'MINIGAME_SELECTOR' | 'MG_MUSHROOM_JUMP' | 'MG_STONE_SMASH' | 'MG_ESCAPE' | 'MG_GAMEOVER'>('START_MENU');
    const [guideStep, setGuideStep] = useState(0);
    const [mgScore, setMgScore] = useState(0);
    const [mgHighScores, setMgHighScores] = useState<{ mushroom: number, stone: number, escape: number }>(() => {
        const saved = localStorage.getItem('vinns_quest_mg_scores');
        return saved ? JSON.parse(saved) : { mushroom: 0, stone: 0, escape: 0 };
    });
    const [language, setLanguage] = useState<'en' | 'es'>(() => (localStorage.getItem('vinns_quest_lang') as 'en' | 'es') || 'en');
    const [vinnColor, setVinnColor] = useState(() => localStorage.getItem('vinns_quest_color') || '#00f2ff');
    const [vinn2Color, setVinn2Color] = useState(() => localStorage.getItem('vinns_quest_color2') || '#ff00ff');
    const [isTwoPlayer, setIsTwoPlayer] = useState(() => localStorage.getItem('vinns_quest_2p') === 'true');

    const vinnRef = useRef<Vinn>(new Vinn(100, 420, vinnColor, 'NORMAL', 'Vinn'));
    const vinn2Ref = useRef<Vinn>(new Vinn(150, 420, vinn2Color, 'SPIKY', 'Jhon'));
    const platformsRef = useRef<Platform[]>([]);
    const queenPosRef = useRef({ x: 0, y: 0 });
    const currentMgRef = useRef<string | null>(null);
    const enemiesRef = useRef<Enemy[]>([]);
    const bossRef = useRef<Boss | null>(null);
    const itemsRef = useRef<Item[]>([]);
    const fireFlamesRef = useRef<{ type: 'FLAME', x: number, y: number, vx: number, vy: number, life: number }[]>([]);
    const bossProjectilesRef = useRef<{ type: 'FIREBALL' | 'LAVA', x: number, y: number, vx: number, vy: number, life: number }[]>([]);
    const cutsceneRef = useRef<IntroCutscene>(new IntroCutscene());
    const interlude1Ref = useRef<World1ClearCutscene | null>(null);
    const interlude2Ref = useRef<World2ClearCutscene | null>(null);
    const interlude3Ref = useRef<World3BossCutscene | null>(null);
    const escapeCutsceneRef = useRef<World3EscapeCutscene>(new World3EscapeCutscene());
    const endingRef = useRef<EndingCutscene>(new EndingCutscene());
    const musicRef = useRef<MusicManager>(new MusicManager());
    const cameraXRef = useRef(0);
    const cameraShakeRef = useRef(0);
    const particlesRef = useRef<{ x: number, y: number, vx: number, vy: number, life: number, color?: string }[]>([]);
    const rocksRef = useRef<{ x: number, y: number, vy: number }[]>([]);
    const paintPuddlesRef = useRef<{ x: number, w: number, color: string }[]>([]);
    const inkProjectilesRef = useRef<{ x: number, y: number, vx: number, vy: number }[]>([]);
    const inkIntroTimerRef = useRef(0);
    const cameraYRef = useRef(0);
    const castleSequenceRef = useRef({ triggered: false, timer: 0, active: false });
    const rocks3DRef = useRef<{ x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number }[]>([]);
    const mousePosRef = useRef({ x: 400, y: 300 });
    const isSlashingRef = useRef(0); // Timer for slash duration
    const mgHitsRef = useRef(0);
    const mgFearRef = useRef(0);
    const mgTimeLeftRef = useRef(60);

    const [isMobile] = useState(() =>
        typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );
    const mobileKeysRef = useRef<Record<string, boolean>>({});

    const t = (key: string) => {
        const i18n: any = {
            en: {
                PLAY: 'PLAY', SETTINGS: 'SETTINGS', BACK: 'BACK TO MENU', CHOOSE_COLOR: 'HERO COLOR', LANGUAGE: 'LANGUAGE',
                SELECT_LEVEL: 'SELECT LEVEL', NEXT: 'NEXT LEVEL', RESTART: 'RESTART QUEST', TRY_AGAIN: 'TRY AGAIN',
                DEFEATED: 'DEFEATED', WORLD: 'WORLD', LEVEL: 'LEVEL', COMPLETE: 'COMPLETE',
                QUEST_MODE: 'QUEST MODE', SOLO: 'SOLO', DUO: 'DUO', P1_COLOR: 'P1 COLOR', P2_COLOR: 'P2 COLOR',
                MINIGAMES: 'MINIGAMES', SCORE: 'SCORE', HI_SCORE: 'HI-SCORE', LOCKED: 'LOCKED', UNLOCK_BY: 'FINISH WORLD',
                GAME_OVER: 'GAME OVER'
            },
            es: {
                PLAY: 'JUGAR', SETTINGS: 'AJUSTES', BACK: 'VOLVER AL MENÚ', CHOOSE_COLOR: 'COLOR DEL HÉROE', LANGUAGE: 'IDIOMA',
                SELECT_LEVEL: 'ELEGIR NIVEL', NEXT: 'SIGUIENTE', RESTART: 'REINICIAR', TRY_AGAIN: 'REINTENTAR',
                DEFEATED: 'DERROTADO', WORLD: 'MUNDO', LEVEL: 'NIVEL', COMPLETE: 'COMPLETADO',
                QUEST_MODE: 'MODO DE JUEGO', SOLO: 'SOLO', DUO: 'DÚO', P1_COLOR: 'P1 COLOR', P2_COLOR: 'P2 COLOR',
                MINIGAMES: 'MINIJUEGOS', SCORE: 'PUNTAJE', HI_SCORE: 'RECORD', LOCKED: 'BLOQUEADO', UNLOCK_BY: 'TERMINA MUNDO',
                GAME_OVER: 'FIN DEL JUEGO'
            }
        };
        return i18n[language][key] || key;
    };

    const [unlockedProgress, setUnlockedProgress] = useState<{ world: number, level: number }>(() => {
        const saved = localStorage.getItem('vinns_quest_progress');
        return saved ? JSON.parse(saved) : { world: 1, level: 1 };
    });

    useEffect(() => {
        localStorage.setItem('vinns_quest_progress', JSON.stringify(unlockedProgress));
        localStorage.setItem('vinns_quest_lang', language);
        localStorage.setItem('vinns_quest_color', vinnColor);
        localStorage.setItem('vinns_quest_color2', vinn2Color);
        localStorage.setItem('vinns_quest_2p', isTwoPlayer.toString());
        localStorage.setItem('vinns_quest_mg_scores', JSON.stringify(mgHighScores));
        if (vinnRef.current) vinnRef.current.color = vinnColor;
        if (vinn2Ref.current) vinn2Ref.current.color = vinn2Color;
    }, [unlockedProgress, language, vinnColor, vinn2Color, isTwoPlayer, mgHighScores]);
    const [currentWorld, setCurrentWorld] = useState(() => {
        const saved = localStorage.getItem('vinns_quest_progress');
        return saved ? JSON.parse(saved).world : 1;
    });
    const [currentLevel, setCurrentLevel] = useState(() => {
        const saved = localStorage.getItem('vinns_quest_progress');
        return saved ? JSON.parse(saved).level : 1;
    });
    const [keys, setKeys] = useState<Record<string, boolean>>({});
    const mergedKeys = isMobile ? { ...keys, ...mobileKeysRef.current } : keys;


    const inkChase = currentWorld === 3 && currentLevel === 5 && bossRef.current?.type === 'INK_COLOSSUS';

    const advanceCutscene = () => {
        if (gameState === 'INTRO_CUTSCENE') {
            musicRef.current.resume();
            cutsceneRef.current.advanceDialogue();
        } else if (gameState === 'WORLD1_INTERLUDE' && interlude1Ref.current) {
            interlude1Ref.current.advanceDialogue();
        } else if (gameState === 'WORLD2_INTERLUDE' && interlude2Ref.current) {
            interlude2Ref.current.advanceDialogue();
        } else if (gameState === 'WORLD3_BOSS_INTRO' && interlude3Ref.current) {
            interlude3Ref.current.advanceDialogue();
        } else if (gameState === 'WORLD3_ESCAPE_CUTSCENE') {
            escapeCutsceneRef.current.advanceDialogue();
        } else if (gameState === 'ENDING_CUTSCENE') {
            endingRef.current.advanceDialogue();
        } else if (gameState === 'INK_BOSS_INTRO') {
            inkIntroTimerRef.current = 999; // force skip
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            setKeys(prev => ({ ...prev, [k]: true }));

            if (k === 'w' || e.key === 'Control') vinnRef.current.jump();
            if (isTwoPlayer && (e.key === 'ArrowUp' || e.key === 'Shift')) vinn2Ref.current.jump();

            if (e.key === ' ') {
                advanceCutscene();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                mousePosRef.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }
        };
        const handleMouseDown = () => {
            if (gameState === 'MG_STONE_SMASH') {
                isSlashingRef.current = 0.15; // 150ms slash
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        if (gameState === 'WORLD_COMPLETE') {
            const nextWorld = currentWorld + 1;
            setUnlockedProgress(prev => {
                if (nextWorld > prev.world) return { world: nextWorld, level: 1 };
                return prev;
            });
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [gameState]);

    const loadLevel = (worldIndex: number, levelIndex: number) => {
        const world = WORLD_CONFIGS[worldIndex];
        if (!world) { setGameState('GAME_WON'); return; }
        const config = world.levels[levelIndex - 1];

        // Update progress
        setUnlockedProgress(prev => {
            if (worldIndex > prev.world) return { world: worldIndex, level: levelIndex };
            if (worldIndex === prev.world && levelIndex > prev.level) return { world: worldIndex, level: levelIndex };
            return prev;
        });

        vinnRef.current.x = 100;
        vinnRef.current.y = 400;
        vinnRef.current.health = vinnRef.current.maxHealth;
        vinnRef.current.weapon = (worldIndex === 3 && levelIndex === 5) ? 'HAND' : 'SWORD';
        cameraXRef.current = 0;
        enemiesRef.current = config.enemies.map((e: any) => new Enemy(e.x, 420, e.type));
        const configItems = (config.items || []) as Item[];
        itemsRef.current = configItems.map((i: Item) => ({ ...i }));

        if (config.isBoss) {
            const startX = config.bossType === 'INK_COLOSSUS' ? -100 : 1200;
            bossRef.current = new Boss(startX, 580, config.bossType as BossType);
            if (config.bossType === 'INK_COLOSSUS') {
                bossRef.current.state = 'CHASING';
                if (!vinnRef.current.hasDoubleJump) vinnRef.current.hasDoubleJump = true;
                if (isTwoPlayer && !vinn2Ref.current.hasDoubleJump) vinn2Ref.current.hasDoubleJump = true;
            }
        } else {
            bossRef.current = null;
        }

        // Generate paint puddles for Paint Land
        if (worldIndex === 3) {
            const PUDDLE_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#00ff88'];
            const puddles: { x: number, w: number, color: string }[] = [];
            const levelLength = config.length as number;
            let px = 700;
            while (px < levelLength - 200) {
                puddles.push({
                    x: px,
                    w: 60 + Math.random() * 80,
                    color: PUDDLE_COLORS[Math.floor(Math.random() * PUDDLE_COLORS.length)]
                });
                px += 250 + Math.random() * 300;
            }
            paintPuddlesRef.current = puddles;
        } else {
            paintPuddlesRef.current = [];
        }

        // Ink Colossus fight setup
        inkProjectilesRef.current = [];
        if (config.isBoss && config.bossType === 'INK_COLOSSUS') {
            vinnRef.current.x = 250;
            inkIntroTimerRef.current = 0;
            setCurrentWorld(worldIndex);
            setCurrentLevel(levelIndex);
            setGameState('PLAYING');
            return;
        }

    setCurrentWorld(worldIndex);
    setCurrentLevel(levelIndex);
    setGameState('PLAYING');
  };

  const initMinigame = (type: string) => {
      vinnRef.current.reset(100, 420);
      vinnRef.current.health = vinnRef.current.maxHealth;
      if (isTwoPlayer) {
          vinn2Ref.current.reset(150, 420);
          vinn2Ref.current.health = vinn2Ref.current.maxHealth;
      }
      setMgScore(0);
      currentMgRef.current = type;
      particlesRef.current = [];
      enemiesRef.current = [];
      itemsRef.current = [];
      rocksRef.current = [];
      paintPuddlesRef.current = [];
      inkProjectilesRef.current = [];
      cameraXRef.current = 0;

      if (type === 'MG_MUSHROOM_JUMP') {
          vinnRef.current.reset(GAME_WIDTH / 2, 400);
          if (isTwoPlayer) vinn2Ref.current.reset(GAME_WIDTH / 2 + 30, 400);
          vinnRef.current.vy = -18;
          cameraYRef.current = 0;
          platformsRef.current = [{ x: -100, y: 560, w: 1000, h: 40 }]; // Ground
          for(let i=1; i<10; i++) {
              platformsRef.current.push({ x: Math.random()*(GAME_WIDTH-120) + 60, y: 560 - i*150, w: 100, h: 20, type: 'MUSHROOM' });
          }
      } else if (type === 'MG_STONE_SMASH') {
          rocks3DRef.current = [];
          mgHitsRef.current = 0;
          setMgScore(0);
          vinnRef.current.x = 200; if(isTwoPlayer) vinn2Ref.current.x = 150;
          platformsRef.current = [{ x: 0, y: 460, w: 1200, h: 20 }];
      } else if (type === 'MG_ESCAPE') {
          vinnRef.current.x = 200; if(isTwoPlayer) vinn2Ref.current.x = 150;
          platformsRef.current = [{ x: 0, y: 460, w: 2000, h: 20 }];
          queenPosRef.current = { x: 100, y: 430 };
      }
      setGameState(type as any);
  };


    const spawnParticles = (x: number, y: number, color?: string) => {
        for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
                x: x, y: y, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 10, life: 1, color: color || '#ffcc00'
            });
        }
    };

    const drawCastle = (ctx: CanvasRenderingContext2D, x: number) => {
        ctx.save();
        const baseWidth = 500;
        const baseY = 460;
        
        // Timer for door animation (0.0 to 1.0)
        const timerVal = castleSequenceRef.current.timer;
        const doorOpenFactor = timerVal < 120 ? Math.min(1.0, (120 - timerVal) / 60) : 0;

        // Draw Imposing Base
        ctx.fillStyle = '#050010';
        ctx.fillRect(x - 200, baseY - 50, baseWidth + 400, 100);

        // Main Keep (Large and dark)
        ctx.fillStyle = '#0a0015';
        ctx.fillRect(x, baseY - 450, baseWidth, 450);
        
        // Lava accents (Glowing cracks)
        ctx.shadowBlur = 10; ctx.shadowColor = '#ff2200';
        ctx.strokeStyle = '#330000'; ctx.lineWidth = 1;
        for(let i=0; i<10; i++) {
             ctx.beginPath();
             ctx.moveTo(x + Math.random()*baseWidth, baseY - Math.random()*400);
             ctx.lineTo(x + Math.random()*baseWidth, baseY - Math.random()*400);
             ctx.strokeStyle = i % 2 === 0 ? '#ff2200' : '#440000';
             ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Several Towers of varying heights
        const towerWidth = 80;
        const drawTower = (tx: number, th: number) => {
            ctx.fillStyle = '#100020';
            ctx.fillRect(tx, baseY - th, towerWidth, th);
            ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
            ctx.strokeRect(tx, baseY - th, towerWidth, th);
            // Spikes on top
            ctx.fillStyle = '#220033';
            ctx.beginPath();
            ctx.moveTo(tx, baseY - th);
            ctx.lineTo(tx + towerWidth/2, baseY - th - 40);
            ctx.lineTo(tx + towerWidth, baseY - th);
            ctx.fill();
        };

        drawTower(x - 60, 500); // Far Left
        drawTower(x + 20, 350); // Mid Left
        drawTower(x + baseWidth - 100, 350); // Mid Right
        drawTower(x + baseWidth - 20, 500); // Far Right

        // Wedding Banners (Pink/Magenta)
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(x + 50, baseY - 400, 30, 200);
        ctx.fillRect(x + baseWidth - 80, baseY - 400, 30, 200);

        // Gate Arch
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(x + 150, baseY);
        ctx.lineTo(x + 150, baseY - 180);
        ctx.quadraticCurveTo(x + 250, baseY - 240, x + 350, baseY - 180);
        ctx.lineTo(350 + x, baseY);
        ctx.fill();

        // Doors (Animated sliding open)
        const doorYOffset = doorOpenFactor * 200;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 150, baseY - 220, 200, 220);
        ctx.clip(); // Keep doors within the arch area

        ctx.fillStyle = '#2d0045';
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        
        // Left Door
        ctx.fillRect(x + 150 - doorYOffset/2, baseY - 220, 100, 220);
        ctx.strokeRect(x + 150 - doorYOffset/2, baseY - 220, 100, 220);
        // Right Door
        ctx.fillRect(x + 250 + doorYOffset/2, baseY - 220, 100, 220);
        ctx.strokeRect(x + 250 + doorYOffset/2, baseY - 220, 100, 220);

        // Giant Gold Handles
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x + 240 - doorYOffset/2, baseY - 100, 8, 0, Math.PI*2);
        ctx.arc(x + 260 + doorYOffset/2, baseY - 100, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    };

    useGameLoop((dt: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const world = WORLD_CONFIGS[currentWorld];

        // Sync cutscene language and player settings
        if (cutsceneRef.current) cutsceneRef.current.setLanguage(language, isTwoPlayer, vinnColor, vinn2Color);
        if (endingRef.current) endingRef.current.setLanguage(language, isTwoPlayer, vinnColor, vinn2Color);

        if (gameState === 'PLAYING' && world.theme === 'VOLCANO' && Math.random() < 0.02) {
            particlesRef.current.push({
                x: cameraXRef.current + Math.random() * GAME_WIDTH,
                y: 500,
                vx: (Math.random() - 0.5) * 5,
                vy: -10 - Math.random() * 10,
                life: 1,
                color: '#ff4500'
            });
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const levelConfig = world.levels[currentLevel - 1];
        const worldPlatforms = levelConfig.platforms || [];

        const tutorialPlatforms: Platform[] = [
            { x: 0, y: 460, w: 800, h: 20, type: 'NORMAL' },
            { x: 850, y: 460, w: 400, h: 20, type: 'NORMAL' },
            { x: 1300, y: 460, w: 300, h: 20, type: 'NORMAL' }
        ];
        const activePlatforms = (gameState === 'MG_MUSHROOM_JUMP' || gameState === 'MG_STONE_SMASH' || gameState === 'MG_ESCAPE') 
            ? platformsRef.current 
            : (gameState === 'TUTORIAL' ? tutorialPlatforms : worldPlatforms);
        const activeLength = gameState === 'TUTORIAL' ? 1600 : levelConfig.length;
        const anyAiming = vinnRef.current.state === 'AIMING' || vinn2Ref.current.state === 'AIMING';

        let anyAlive = vinnRef.current.health > 0 || (isTwoPlayer && vinn2Ref.current.health > 0);
        let leadX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;
        let leadY = isTwoPlayer ? Math.min(vinnRef.current.y, vinn2Ref.current.y) : vinnRef.current.y;
        const elevatorXTargets = [3200, 6200, 9200, 12200, 15000];
        const targetElevatorX = inkChase ? elevatorXTargets[bossRef.current?.inkHits || 0] : undefined;

        // Increment ink boss intro timer during gameplay for 'appearance' sync
        if (inkChase && gameState === 'PLAYING') {
            inkIntroTimerRef.current += dt;
        }

        if (gameState === 'PLAYING' || gameState === 'TUTORIAL') {
            leadX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;
            let minX = 50;
            if (currentWorld === 1 && currentLevel === 5 && leadX > GAME_WIDTH) minX = GAME_WIDTH;

            // BOSS VS Trigger
            const shouldTriggerVS = gameState === 'PLAYING' && currentLevel === 5 && leadX > GAME_WIDTH && bossRef.current && !bossRef.current.introPlayed;
            if (shouldTriggerVS) {
                bossRef.current.introPlayed = true;
                if (bossRef.current.type !== 'INK_COLOSSUS') {
                    setGameState('BOSS_VS_CUTSCENE');

                    // Timeout to show boss guide
                    setTimeout(() => {
                        setGameState('BOSS_GUIDE');
                        setGuideStep(0);
                    }, 3000);
                    return;
                } else {
                    setGameState('BOSS_GUIDE');
                    setGuideStep(0);
                    return;
                }
            }

            // Ink Colossus: auto-run mode — override Vinn's vx, only jump/attack input allowed
            const nearElevator = inkChase && targetElevatorX !== undefined && Math.abs(vinnRef.current.x - (targetElevatorX + 250)) < 240;
            const isAutoHalted = nearElevator;

            const autoRunKeys = (inkChase && !anyAiming && !isAutoHalted)
                ? { ...mergedKeys, 'd': true, 'a': false, 'arrowright': true, 'arrowleft': false }
                : mergedKeys;

            // P1 Update
            const isFrozen = castleSequenceRef.current.active;
            const inputKeys = isFrozen ? {} : autoRunKeys;
            vinnRef.current.update(dt, inputKeys, activeLength - 50, activePlatforms, gameState === 'TUTORIAL' ? 0.7 : 1.0, minX);
            if (inkChase && !anyAiming) {
                if (isAutoHalted) {
                    vinnRef.current.vx = 0;
                }
            } else if (anyAiming) {
                vinnRef.current.vx = 0;
            }


            // P2 Update
            if (isTwoPlayer) {
                const iKeys = castleSequenceRef.current.active ? {} : {
                    'a': mergedKeys['arrowleft'], 'd': mergedKeys['arrowright'], ' ': mergedKeys['enter']
                };
                vinn2Ref.current.update(dt, iKeys, activeLength - 50, activePlatforms, 1.0, minX);
                if (inkChase && !anyAiming) vinn2Ref.current.vx = Math.max(vinn2Ref.current.vx, 5.0);
                else if (anyAiming) vinn2Ref.current.vx = 0;

                // Revive Logic
                const distPlayers = Math.abs(vinnRef.current.x - vinn2Ref.current.x) + Math.abs(vinnRef.current.y - vinn2Ref.current.y);
                if (vinnRef.current.health > 0 && vinn2Ref.current.health <= 0 && distPlayers < 60) {
                    vinn2Ref.current.health = 5;
                }
                if (vinn2Ref.current.health > 0 && vinnRef.current.health <= 0 && distPlayers < 60) {
                    vinnRef.current.health = 5;
                }
            }

            anyAlive = vinnRef.current.health > 0 || (isTwoPlayer && vinn2Ref.current.health > 0);

            if (vinnRef.current.y > 550 && (world.theme === 'VOLCANO' || world.theme === 'PAINT_LAND')) vinnRef.current.health = 0;
            if (isTwoPlayer && vinn2Ref.current.y > 550 && (world.theme === 'VOLCANO' || world.theme === 'PAINT_LAND')) vinn2Ref.current.health = 0;

            // Paint Puddle Slip collision
            if (world.theme === 'PAINT_LAND') {
                paintPuddlesRef.current.forEach(puddle => {
                    const checkSlip = (player: typeof vinnRef.current) => {
                        if (player.health <= 0) return;
                        const onGround = player.onGround;
                        const inPuddleX = player.x > puddle.x && player.x < puddle.x + puddle.w;
                        const nearGround = Math.abs(player.y - 430) < 60;
                        if (onGround && inPuddleX && nearGround && !player.isSlipping) {
                            player.startSlip(player.vx >= 0 ? 1 : -1);
                        }
                    };
                    checkSlip(vinnRef.current);
                    if (isTwoPlayer) checkSlip(vinn2Ref.current);
                });
            }


            if (!anyAlive && gameState === 'PLAYING') {
                setGameState('GAMEOVER');
            }

            itemsRef.current.forEach(item => {
                const checkItemCol = (p: any) => !item.collected && Math.abs(p.x - item.x) < 40 && Math.abs(p.y - item.y) < 40;
                const collect = (p: any) => {
                    item.collected = true;
                    if (item.type === 'DOUBLE_JUMP') p.hasDoubleJump = true;
                    else if (item.type === 'RAINBOW') p.speedBoostTimer = 3.0;
                    else if (item.type === 'FEATHER') {
                        p.jumpCharges = p.maxJumpCharges;
                        p.rechargeTimer = 0;
                    }
                    spawnParticles(item.x, item.y, item.type === 'FEATHER' ? '#fff' : '#fff');
                };
                if (checkItemCol(vinnRef.current)) collect(vinnRef.current);
                if (isTwoPlayer && checkItemCol(vinn2Ref.current)) collect(vinn2Ref.current);
            });
        }

        // --- MINIGAME LOGIC BLOCKS ---
        if (['MG_MUSHROOM_JUMP', 'MG_STONE_SMASH', 'MG_ESCAPE'].includes(gameState)) {
            leadX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;
            leadY = isTwoPlayer ? Math.min(vinnRef.current.y, vinn2Ref.current.y) : vinnRef.current.y;

            const isFrozen = castleSequenceRef.current.active;
            const inputKeys = isFrozen ? {} : mergedKeys;
            vinnRef.current.update(dt, inputKeys, 999999, activePlatforms);
            if (isTwoPlayer) {
                const iKeys = castleSequenceRef.current.active ? {} : { 'a': mergedKeys['arrowleft'], 'd': mergedKeys['arrowright'], ' ': mergedKeys['enter'] };
                vinn2Ref.current.update(dt, iKeys, 999999, activePlatforms);
                if (vinnRef.current.health > 0 && vinn2Ref.current.health <= 0) { if (Math.abs(vinnRef.current.x - vinn2Ref.current.x) < 60) vinn2Ref.current.health = 5; }
                if (vinn2Ref.current.health > 0 && vinnRef.current.health <= 0) { if (Math.abs(vinnRef.current.x - vinn2Ref.current.x) < 60) vinn2Ref.current.health = 5; }
            }

            // 1. Mushroom Jump Logic
            if (gameState === 'MG_MUSHROOM_JUMP') {
                const worldY = Math.floor(400 - leadY);
                if (worldY > mgScore) setMgScore(worldY);
                
                // Vertical Camera follow (only goes up)
                const targetY = leadY - 300;
                if (targetY < cameraYRef.current) {
                    cameraYRef.current += (targetY - cameraYRef.current) * 0.1;
                }

                // Horizontal Wrap
                [vinnRef.current, vinn2Ref.current].forEach(p => {
                    if (p.x < -20) p.x = GAME_WIDTH + 10;
                    else if (p.x > GAME_WIDTH + 20) p.x = -10;
                });

                cameraXRef.current = 0;
                const m_activePlatforms = platformsRef.current;
                const highestPlatY = Math.min(...m_activePlatforms.map(p => p.y));
                if (highestPlatY > cameraYRef.current - 400) {
                    const nx = Math.random() * (GAME_WIDTH - 100);
                    const ny = highestPlatY - 140 - Math.random() * 40;
                    platformsRef.current.push({
                        x: nx,
                        y: ny,
                        w: 100,
                        h: 20,
                        type: 'MUSHROOM'
                    });
                    // Spawn Feather power-up on some platforms
                    if (Math.random() < 0.15) {
                        itemsRef.current.push({ x: nx + 50, y: ny - 30, type: 'FEATHER', collected: false });
                    }
                }
                // Cleanup platforms far below camera
                if (platformsRef.current.length > 40) {
                    platformsRef.current = platformsRef.current.filter(p => p.y < cameraYRef.current + 800);
                }

                if (vinnRef.current.y > cameraYRef.current + 600 && (!isTwoPlayer || vinn2Ref.current.y > cameraYRef.current + 600)) {
                    setGameState('MG_GAMEOVER');
                }
            }

            // 2. 3D Stone Smash Logic
            if (gameState === 'MG_STONE_SMASH') {
                if (isSlashingRef.current > 0) isSlashingRef.current -= dt;

                // Spawn rocks in 3D
                if (Math.random() < (0.02 + mgScore * 0.00005)) {
                    rocks3DRef.current.push({
                        x: (Math.random() - 0.5) * 600,
                        y: (Math.random() - 0.5) * 400 - 50,
                        z: 1000,
                        vx: 0, vy: 0, vz: -8 - (mgScore * 0.05),
                        size: 40 + Math.random() * 40
                    });
                }

                rocks3DRef.current = rocks3DRef.current.filter(rock => {
                    rock.z += rock.vz;
                    
                    // Simple Projection for collision check
                    const focalLength = 400;
                    const scale = focalLength / Math.max(1, rock.z);
                    const screenX = 400 + rock.x * scale;
                    const screenY = 250 + rock.y * scale;
                    const screenR = rock.size * scale;

                    // Collision plane (at roughly z=50-100)
                    if (rock.z < 120 && rock.z > 10) {
                        const dx = mousePosRef.current.x - screenX;
                        const dy = mousePosRef.current.y - screenY;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < screenR + 60 && isSlashingRef.current > 0) { // Sword reach + Slash active
                            spawnParticles(screenX, screenY, '#fff');
                            setMgScore(s => s + 1);
                            cameraShakeRef.current = 4;
                            return false; // Rock broken
                        }
                    }

                    // Rock hits player
                    if (rock.z <= 20) {
                        mgHitsRef.current++;
                        cameraShakeRef.current = 20;
                        if (mgHitsRef.current >= 3) {
                             setGameState('MG_GAMEOVER');
                        }
                        return false;
                    }

                    return true;
                });
            }

            // 3. Escape! Logic (Protect the Queen)
            if (gameState === 'MG_ESCAPE') {
                const isStoryMode = currentMgRef.current === null;
                setMgScore(prev => prev + dt * 50);

                if (isStoryMode) {
                    mgTimeLeftRef.current -= dt;
                    mgFearRef.current += dt * 0.5; // Passive fear increase
                    if (mgTimeLeftRef.current <= 0) {
                        setGameState('ENDING_CUTSCENE');
                    }
                    if (mgFearRef.current >= 100) {
                        setGameState('GAMEOVER'); // Lose canonical escape
                    }
                }

                // Queen follows Vinn
                const tx = vinnRef.current.x - 60;
                const ty = vinnRef.current.y - 10;
                queenPosRef.current.x += (tx - queenPosRef.current.x) * 0.1;
                queenPosRef.current.y += (ty - queenPosRef.current.y) * 0.1;

                if (Math.random() < 0.05) {
                    inkProjectilesRef.current.push({ x: leadX + 1000, y: 300 + Math.random() * 200, vx: -5 - Math.random() * 5, vy: 0 });
                }
                if (activePlatforms[activePlatforms.length - 1].x < leadX + 1000) {
                    platformsRef.current.push({ x: activePlatforms[activePlatforms.length - 1].x + 300, y: 460, w: 200 + Math.random() * 400, h: 20 });
                }

                inkProjectilesRef.current = inkProjectilesRef.current.filter(p => {
                    p.x += p.vx;
                    // Vinn can block projectiles while attacking
                    const vinnBlocks = vinnRef.current.state === 'ATTACKING' && Math.abs(p.x - vinnRef.current.x) < 60 && Math.abs(p.y - vinnRef.current.y) < 60;
                    const p2Blocks = isTwoPlayer && vinn2Ref.current.state === 'ATTACKING' && Math.abs(p.x - vinn2Ref.current.x) < 60 && Math.abs(p.y - vinn2Ref.current.y) < 60;
                    
                    if (vinnBlocks || p2Blocks) { 
                        spawnParticles(p.x, p.y, '#00f2ff'); 
                        setMgScore(s => s + 200);
                        return false; 
                    }
                    
                    // Queen hit check
                    if (Math.abs(p.x - queenPosRef.current.x) < 30 && Math.abs(p.y - queenPosRef.current.y) < 30) {
                        spawnParticles(queenPosRef.current.x, queenPosRef.current.y, '#ff00ff');
                        if (isStoryMode) {
                            mgFearRef.current += 15;
                            cameraShakeRef.current = 15;
                        } else {
                            setGameState('MG_GAMEOVER');
                        }
                        return false;
                    }
                    if (Math.abs(p.x - vinnRef.current.x) < 30 && Math.abs(p.y - vinnRef.current.y) < 30) { vinnRef.current.takeDamage(1); return false; }
                    if (isTwoPlayer && Math.abs(p.x - vinn2Ref.current.x) < 30 && Math.abs(p.y - vinn2Ref.current.y) < 30) { vinn2Ref.current.takeDamage(1); return false; }
                    
                    return p.x > cameraXRef.current - 200;
                });
                
                if (vinnRef.current.health <= 0 && (!isTwoPlayer || vinn2Ref.current.health <= 0)) {
                    setGameState(isStoryMode ? 'GAMEOVER' : 'MG_GAMEOVER');
                }
                if (vinnRef.current.y > 600) {
                    setGameState(isStoryMode ? 'GAMEOVER' : 'MG_GAMEOVER');
                }
            }

            cameraXRef.current = (gameState === 'MG_MUSHROOM_JUMP') ? 0 : leadX - 200;
        }

        if (gameState === 'INTRO_CUTSCENE') {
            const finished = cutsceneRef.current.update(dt);
            musicRef.current.update(cutsceneRef.current.phase);
            if (finished === true) {
                musicRef.current.stop();
                setGameState('TUTORIAL');
            }
        } else if (gameState === 'WORLD1_INTERLUDE' && interlude1Ref.current) {
            const finished = interlude1Ref.current.update(dt);
            musicRef.current.update((interlude1Ref.current as any).phase);
            if (finished === true) {
                setCurrentWorld(2);
                setCurrentLevel(1);
                setUnlockedProgress(prev => ({ world: 2, level: 1 }));
                setGameState('LEVEL_SELECTOR');
            }
        } else if (gameState === 'WORLD2_INTERLUDE' && interlude2Ref.current) {
            const finished = interlude2Ref.current.update(dt);
            musicRef.current.update((interlude2Ref.current as any).phase);
            if (finished === true) {
                setCurrentWorld(3);
                setCurrentLevel(1);
                setUnlockedProgress(prev => ({ world: 3, level: 1 }));
                setGameState('LEVEL_SELECTOR');
            }
        } else if (gameState === 'WORLD3_BOSS_INTRO' && interlude3Ref.current) {
            const finished = interlude3Ref.current.update(dt);
            musicRef.current.update((interlude3Ref.current as any).phase); // It will fallback to STINGER mostly
            if (finished === true) {
                setCurrentWorld(3);
                setCurrentLevel(5);
                setGameState('INK_BOSS_INTRO');
            }
        } else if (gameState === 'WORLD3_ESCAPE_CUTSCENE') {
            const finished = escapeCutsceneRef.current.update(dt);
            if (finished === true) {
                vinnRef.current.reset(100, 420);
                vinnRef.current.health = vinnRef.current.maxHealth;
                if (isTwoPlayer) {
                    vinn2Ref.current.reset(150, 420);
                    vinn2Ref.current.health = vinn2Ref.current.maxHealth;
                }
                setMgScore(0);
                currentMgRef.current = null; // null marks canonical story run
                particlesRef.current = [];
                enemiesRef.current = [];
                inkProjectilesRef.current = [];
                cameraXRef.current = 0;
                mgTimeLeftRef.current = 60;
                mgFearRef.current = 0;
                queenPosRef.current = { x: 0, y: 460 };
                platformsRef.current = [{ x: 0, y: 460, w: 1200, h: 20 }];
                setGameState('MG_ESCAPE');
            }
        } else if (gameState === 'ENDING_CUTSCENE') {
            const finished = endingRef.current.update(dt);
            musicRef.current.update(endingRef.current.phase);
            if (finished === true) {
                setGameState('GAME_WON');
            }
        }

        // Separate music logic so it doesn't block state updates
        if (gameState === 'PLAYING') {
            const isInkBossActive = currentWorld === 3 && currentLevel === 5 && bossRef.current?.state && bossRef.current.state !== 'DEFEATED';

            const isBossActive = levelConfig.isBoss && bossRef.current?.state && bossRef.current.state !== 'DEFEATED';
            
            if (isBossActive && bossRef.current) {
                const healthPercent = bossRef.current.health / bossRef.current.maxHealth;
                if ((musicRef.current as any).setIntensity) {
                    musicRef.current.setIntensity(healthPercent);
                }
                musicRef.current.update('BOSS_BATTLE');
            } else if (currentWorld === 1) {
                musicRef.current.update('FOREST_WORLD');
            } else if (currentWorld === 2) {
                musicRef.current.update('VOLCANO_WORLD');
            } else if (currentWorld === 3) {
                musicRef.current.update('PAINT_WORLD');
            }
        }

        if (gameState === 'TUTORIAL') {
            musicRef.current.update('WALK_IN');
            if (!enemiesRef.current.length) {
                enemiesRef.current = [new Enemy(600, 420, 'TECH')];
            }
            const techSkeleton = enemiesRef.current[0];
            let tutTargetX = vinnRef.current.x;
            if (isTwoPlayer) {
                const d1 = Math.abs(techSkeleton.x - vinnRef.current.x);
                const d2 = Math.abs(techSkeleton.x - vinn2Ref.current.x);
                if (vinn2Ref.current.health > 0 && (vinnRef.current.health <= 0 || d2 < d1)) tutTargetX = vinn2Ref.current.x;
            }
            techSkeleton.update(dt, tutTargetX);

            if (tutorialPhase === 0 && (mergedKeys['a'] || mergedKeys['d'])) setTutorialPhase(1);
            if (tutorialPhase === 1 && vinnRef.current.y < 400) setTutorialPhase(2);

            if (vinnRef.current.state === 'ATTACKING' && vinnRef.current.attackTimer < 0.1) {
                if (Math.abs(vinnRef.current.x - techSkeleton.x) < 80 && !techSkeleton.isHit) {
                    techSkeleton.takeDamage();
                    spawnParticles(techSkeleton.x, techSkeleton.y);
                    if (techSkeleton.health <= 0) setTutorialPhase(3);
                }
            }
            if (isTwoPlayer && vinn2Ref.current.state === 'ATTACKING' && vinn2Ref.current.attackTimer < 0.1) {
                if (Math.abs(vinn2Ref.current.x - techSkeleton.x) < 80 && !techSkeleton.isHit) {
                    techSkeleton.takeDamage();
                    spawnParticles(techSkeleton.x, techSkeleton.y);
                    if (techSkeleton.health <= 0) setTutorialPhase(3);
                }
            }
        } else if (gameState === 'PLAYING') {
            if (vinnRef.current.x >= levelConfig.length - 100) {
                if (!levelConfig.isBoss) {
                    if (currentWorld === 3 && currentLevel === 4) {
                        // Handled by castle sequence timer.
                    } else if (currentLevel < 5) {
                        setGameState('LEVEL_TRANSITION');
                    }
                } else if (bossRef.current && bossRef.current.health <= 0) {
                    if (currentWorld === 1 && currentLevel === 5) {
                        interlude1Ref.current = new World1ClearCutscene();
                        interlude1Ref.current.setLanguage(language);
                        setGameState('WORLD1_INTERLUDE');
                    } else if (currentWorld === 2 && currentLevel === 5) {
                        interlude2Ref.current = new World2ClearCutscene();
                        interlude2Ref.current.setLanguage(language);
                        setGameState('WORLD2_INTERLUDE');
                    } else if (currentWorld < 3) {
                        setGameState('WORLD_COMPLETE');
                    } else {
                        setGameState('ENDING_CUTSCENE');
                    }
                }
            }


            leadX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;

            let targetCamX = Math.max(0, Math.min(levelConfig.length - GAME_WIDTH, leadX - GAME_WIDTH / 2));
            
            // Castle Sequence for World 3 Level 4
            if (currentWorld === 3 && currentLevel === 4) {
                if (leadX >= 3600 && !castleSequenceRef.current.triggered) {
                    castleSequenceRef.current.triggered = true;
                    castleSequenceRef.current.active = true;
                    castleSequenceRef.current.timer = 180; // 3 seconds
                }
                if (castleSequenceRef.current.active) {
                    castleSequenceRef.current.timer--;
                    if (castleSequenceRef.current.timer <= 0) {
                        castleSequenceRef.current.active = false;
                        interlude3Ref.current = new World3BossCutscene();
                        interlude3Ref.current.setLanguage(language);
                        setGameState('WORLD3_BOSS_INTRO');
                    }
                    // Pan camera to the castle (end of level)
                    targetCamX = 4000 - GAME_WIDTH;
                } else if (castleSequenceRef.current.triggered) {
                    targetCamX = 4000 - GAME_WIDTH;
                }
            }

            if (inkChase) {
                // No clamp during infinite chase originally, but now we respect level boundaries
                targetCamX = Math.max(0, Math.min(activeLength - GAME_WIDTH, leadX - GAME_WIDTH / 2));

                // Cleanup far-behind objects
                paintPuddlesRef.current = paintPuddlesRef.current.filter(p => p.x > cameraXRef.current - 1000);
                inkProjectilesRef.current = inkProjectilesRef.current.filter(p => p.x > cameraXRef.current - 1000);
            }
            cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;

            // ENEMIES, BOSS & PROJECTILES UPDATE (ONLY IF NOT AIMING)
            if (!anyAiming) {
                // Render Rocks (Golem)
                rocksRef.current = rocksRef.current.filter(rock => {
                    rock.y += rock.vy;
                    rock.vy += 0.5;

                    const rockHitsPlayer = (p: { x: number, y: number, isHit: boolean, takeDamage: Function }) => {
                        return !p.isHit && Math.abs(rock.x - p.x) < 25 && Math.abs(rock.y - p.y) < 30;
                    };

                    if (rockHitsPlayer(vinnRef.current)) vinnRef.current.takeDamage(2);
                    if (isTwoPlayer && rockHitsPlayer(vinn2Ref.current)) vinn2Ref.current.takeDamage(2);

                    return rock.y <= 600;
                });

                if (bossRef.current && bossRef.current.type === 'GOLEM' && ['FLY_UP', 'RAINING'].includes(bossRef.current.state)) {
                    const spawnChance = bossRef.current.state === 'FLY_UP' ? 0.04 : 0.08;
                    if (Math.random() < spawnChance) {
                        const leadPlayerX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;
                        const preferPlayer = Math.random() < 0.55;
                        const spawnX = preferPlayer
                            ? Math.min(Math.max(leadPlayerX + (Math.random() * 240 - 120), cameraXRef.current + 100), cameraXRef.current + 700)
                            : cameraXRef.current + Math.random() * 900 - 50;
                        rocksRef.current.push({ x: spawnX, y: -50, vy: Math.random() * 3 + 2 });
                    }
                }

                enemiesRef.current.forEach(enemy => {
                    let targetX = vinnRef.current.x;
                    if (isTwoPlayer) {
                        const d1 = Math.abs(enemy.x - vinnRef.current.x);
                        const d2 = Math.abs(enemy.x - vinn2Ref.current.x);
                        const p1Alive = vinnRef.current.health > 0;
                        const p2Alive = vinn2Ref.current.health > 0;
                        if (p1Alive && p2Alive) targetX = d1 < d2 ? vinnRef.current.x : vinn2Ref.current.x;
                        else if (p2Alive) targetX = vinn2Ref.current.x;
                    }
                    enemy.update(dt, targetX);
                    const dx = Math.abs(enemy.x - vinnRef.current.x);
                    const dy = Math.abs(enemy.y - vinnRef.current.y);
                    const p1Slipping = vinnRef.current.isSlipping;
                    if (dx < 40 && dy < 60 && enemy.state === 'ATTACKING' && enemy.attackTimer < 0.1) {
                        if (p1Slipping) { vinnRef.current.isHit = false; } // slipping = no invincibility frames
                        vinnRef.current.takeDamage(1);
                    }
                    if (isTwoPlayer) {
                        const dx2 = Math.abs(enemy.x - vinn2Ref.current.x);
                        const dy2 = Math.abs(enemy.y - vinn2Ref.current.y);
                        const p2Slipping = vinn2Ref.current.isSlipping;
                        if (dx2 < 40 && dy2 < 60 && enemy.state === 'ATTACKING' && enemy.attackTimer < 0.1) {
                            if (p2Slipping) { vinn2Ref.current.isHit = false; }
                            vinn2Ref.current.takeDamage(1);
                        }
                    }
                });

                if (bossRef.current) {
                    const prevState = bossRef.current.state;
                    let bTargetX = vinnRef.current.x;
                    if (isTwoPlayer) {
                        const d1 = Math.abs(bossRef.current.x - vinnRef.current.x);
                        const d2 = Math.abs(bossRef.current.x - vinn2Ref.current.x);
                        const p1A = vinnRef.current.health > 0;
                        const p2A = vinn2Ref.current.health > 0;
                        if (p1A && p2A) bTargetX = d1 < d2 ? vinnRef.current.x : vinn2Ref.current.x;
                        else if (p2A) bTargetX = vinn2Ref.current.x;
                    }
                    if (bossRef.current.type === 'INK_COLOSSUS' && inkIntroTimerRef.current < 1.0) {
                        // Boss stands still waiting for the 1 sec intro
                    } else {
                        bossRef.current.update(dt, bTargetX);
                    }
                    const nextState = bossRef.current.state;
                    if (bossRef.current.type === 'BLAZE_KING' && prevState !== nextState) {
                        if (nextState === 'FIRE_SUMMON') {
                            const baseY = bossRef.current.y - 80;
                            fireFlamesRef.current.push(
                                { type: 'FLAME', x: bossRef.current.x - 30, y: baseY, vx: -2, vy: -2, life: 1 },
                                { type: 'FLAME', x: bossRef.current.x + 30, y: baseY, vx: 2, vy: -2, life: 1 }
                            );
                        } else if (nextState === 'FIREBALL') {
                            bossProjectilesRef.current.push({ type: 'FIREBALL', x: bossRef.current.x, y: bossRef.current.y - 40, vx: bossRef.current.direction * 8, vy: 0, life: 1 });
                        }
                    }
                }

                if (vinnRef.current.state === 'ATTACKING' && vinnRef.current.attackTimer < 0.1) {
                    enemiesRef.current.forEach(enemy => {
                        if (enemy.health > 0 && Math.abs(vinnRef.current.x - enemy.x) < 80 && !enemy.isHit) {
                            enemy.takeDamage();
                            spawnParticles(enemy.x, enemy.y);
                        }
                    });
                    if (bossRef.current && Math.abs(vinnRef.current.x - bossRef.current.x) < 120) {
                        if (bossRef.current.type !== 'GOLEM' || bossRef.current.state === 'STUNNED') {
                            const bossHitDamage = (bossRef.current.state === 'STUNNED' && (bossRef.current.type === 'GOLEM' || bossRef.current.type === 'BLAZE_KING')) ? 3 : 1;
                            if (bossRef.current.takeDamage(bossHitDamage)) {
                                spawnParticles(bossRef.current.x, bossRef.current.y);
                            }
                        }
                    }
                }

                if (isTwoPlayer && vinn2Ref.current.state === 'ATTACKING' && vinn2Ref.current.attackTimer < 0.1) {
                    enemiesRef.current.forEach(enemy => {
                        if (enemy.health > 0 && Math.abs(vinn2Ref.current.x - enemy.x) < 80 && !enemy.isHit) {
                            enemy.takeDamage();
                            spawnParticles(enemy.x, enemy.y);
                        }
                    });
                    if (bossRef.current && Math.abs(vinn2Ref.current.x - bossRef.current.x) < 120) {
                        if (bossRef.current.type !== 'GOLEM' || bossRef.current.state === 'STUNNED') {
                            const bossHitDamage = (bossRef.current.state === 'STUNNED' && (bossRef.current.type === 'GOLEM' || bossRef.current.type === 'BLAZE_KING')) ? 3 : 1;
                            if (bossRef.current.takeDamage(bossHitDamage)) {
                                spawnParticles(bossRef.current.x, bossRef.current.y);
                            }
                        }
                    }
                }

                // ─── INK COLOSSUS FIGHT MECHANICS ────────────────────────────────────
                if (inkChase && bossRef.current) {
                    const boss = bossRef.current;

                    // Trigger Rising at Elevators
                    const atElevator = targetElevatorX !== undefined && vinnRef.current.x > targetElevatorX && vinnRef.current.x < targetElevatorX + 500;

                    if (atElevator && boss.state === 'CHASING') {
                        if (Math.abs(boss.x - vinnRef.current.x) < 50) {
                            boss.state = 'RISING';
                        }
                    }

                    // Boss rising penalty
                    if (boss.state === 'RISING' && boss.y < 300) {
                        const checkBite = (player: typeof vinnRef.current) => {
                            if (player.health > 0 && Math.abs(player.x - boss.x) < 400 && player.y > boss.y - 120) {
                                player.takeDamage(5, player.x > boss.x ? 1 : -1, 15);
                            }
                        };
                        checkBite(vinnRef.current);
                        if (isTwoPlayer) checkBite(vinn2Ref.current);
                    }

                    // Melee attack during RISING
                    const checkMeleeHit = (player: typeof vinnRef.current) => {
                        if (player.state === 'ATTACKING' && player.attackTimer < 0.15) {
                            if (boss.state === 'RISING' && Math.abs(player.x - boss.x) < 250 && Math.abs(player.y - (boss.y - 100)) < 150) {
                                boss.inkHits++;
                                boss.state = 'FALLING';
                                cameraShakeRef.current = 10;
                                spawnParticles(boss.x, boss.y - 100, '#ff00ff');
                            }
                        }
                    };
                    checkMeleeHit(vinnRef.current);
                    if (isTwoPlayer) checkMeleeHit(vinn2Ref.current);

                    if (boss.inkHits >= 5 && vinnRef.current.x >= 15200) {
                        boss.state = 'DEFEATED';
                        boss.health = 0; // Sync health for standard end triggers
                        setTimeout(() => {
                            if (currentWorld === 3) setGameState('WORLD3_ESCAPE_CUTSCENE');
                            else setGameState('WORLD_COMPLETE');
                        }, 1500);
                    }

                    // Catch-up if reaching end without hits
                    if (vinnRef.current.x > 15300 && boss.inkHits < 5 && boss.state !== 'DEFEATED') {
                        boss.x += (vinnRef.current.x - 50 - boss.x) * 0.1; // Accelerate to catch
                    }

                    // Spawn ink projectile when boss throws
                    if (boss.throwReady) {
                        boss.throwReady = false;
                        const targetX = vinnRef.current.x;
                        const dx = targetX - boss.x;
                        const dist2 = Math.abs(dx);
                        const speed = 5;
                        const vxP = (dx / dist2) * speed;
                        inkProjectilesRef.current.push({ x: boss.x, y: boss.y - 80, vx: vxP, vy: -8 });
                    }

                    // Update ink projectiles
                    const PUDDLE_COLORS_INK = ['#1a0030', '#0a0020', '#ff00ff'];
                    inkProjectilesRef.current = inkProjectilesRef.current.filter(proj => {
                        proj.vy += 0.4; // gravity
                        proj.x += proj.vx;
                        proj.y += proj.vy;

                        // Splat on platforms
                        let splatted = false;
                        activePlatforms.forEach(p => {
                            if (proj.x > p.x && proj.x < p.x + p.w && Math.abs(proj.y - p.y) < 20 && proj.vy > 0) {
                                splatted = true;
                                paintPuddlesRef.current.push({
                                    x: proj.x - 40, w: 80 + Math.random() * 40,
                                    color: PUDDLE_COLORS_INK[Math.floor(Math.random() * PUDDLE_COLORS_INK.length)]
                                });
                            }
                        });

                        if (splatted) { cameraShakeRef.current = 4; return false; }
                        if (proj.y >= 550) return false;
                        return proj.x > cameraXRef.current - 100 && proj.x < cameraXRef.current + 900;
                    });
                }

                // Boss collision with players (still active but movement frozen if anyAiming)
                if (bossRef.current) {
                    const boss = bossRef.current;
                    const dx = Math.abs(boss.x - vinnRef.current.x);
                    const dy = Math.abs(boss.y - vinnRef.current.y);
                    if (boss.health > 0 && dx < 100 && dy < 100) {
                        const isAttacking = boss.state === 'ATTACKING';
                        const isPlummeting = boss.state === 'FALLING';
                        const attackActive = boss.type === 'GOLEM' ? isPlummeting :
                            (boss.type === 'BLAZE_KING' ? isAttacking : (boss.type === 'INK_COLOSSUS' ? boss.state === 'CHASING' : true));
                        const isStunned = boss.state === 'STUNNED' || boss.state === 'WAKING' || boss.state === 'BOMB_STUNNED' || boss.state === 'DEFEATED';

                        if (!isStunned && (attackActive || dx < 60)) {
                            const dir = vinnRef.current.x > boss.x ? 1 : -1;
                            const damage = boss.type === 'BLAZE_KING' && isAttacking ? 4 : (isPlummeting ? 5 : 2);
                            vinnRef.current.takeDamage(damage, dir, isPlummeting ? 20 : 12);
                            cameraShakeRef.current = boss.type === 'INK_COLOSSUS' ? 5 : 15;
                        }
                    }

                    if (isTwoPlayer && boss.health > 0) {
                        const dx2 = Math.abs(boss.x - vinn2Ref.current.x);
                        const dy2 = Math.abs(boss.y - vinn2Ref.current.y);
                        if (dx2 < 100 && dy2 < 100) {
                            const isAttacking = boss.state === 'ATTACKING';
                            const isPlummeting = boss.state === 'FALLING';
                            const attackActive = boss.type === 'GOLEM' ? isPlummeting :
                                (boss.type === 'BLAZE_KING' ? isAttacking : (boss.type === 'INK_COLOSSUS' ? boss.state === 'CHASING' : true));
                            const isStunned = boss.state === 'STUNNED' || boss.state === 'WAKING' || boss.state === 'BOMB_STUNNED' || boss.state === 'DEFEATED';

                            if (!isStunned && (attackActive || dx2 < 60)) {
                                const dir = vinn2Ref.current.x > boss.x ? 1 : -1;
                                const damage = boss.type === 'BLAZE_KING' && isAttacking ? 4 : (isPlummeting ? 5 : 2);
                                vinn2Ref.current.takeDamage(damage, dir, isPlummeting ? 20 : 12);
                                cameraShakeRef.current = boss.type === 'INK_COLOSSUS' ? 5 : 15;
                            }
                        }
                    }
                }
            }
        }

        ctx.fillStyle = '#0a0b1e'; // Dark void color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        if (cameraShakeRef.current > 0) {
            const sx = (Math.random() - 0.5) * cameraShakeRef.current;
            const sy = (Math.random() - 0.5) * cameraShakeRef.current;
            ctx.translate(sx, sy);
            cameraShakeRef.current *= 0.9;
            if (cameraShakeRef.current < 0.5) cameraShakeRef.current = 0;
        }

        if (gameState === 'MG_STONE_SMASH') {
            // Render 3D Minigame instead of world
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, 800, 500);
            
            // Draw 3D Grid
            ctx.strokeStyle = '#1e1e40';
            ctx.lineWidth = 1;
            const focalLength = 400;
            for(let i=-5; i<=5; i++) {
                // Horizontal lines (floor)
                ctx.beginPath();
                for(let z=100; z<1000; z+=100) {
                     const scale = focalLength / z;
                     ctx.moveTo(400 - 1000 * scale, 250 + 200 * scale);
                     ctx.lineTo(400 + 1000 * scale, 250 + 200 * scale);
                }
                ctx.stroke();
                // Persisting lines (converging to center)
                ctx.beginPath();
                ctx.moveTo(400 + i * 200, 500);
                ctx.lineTo(400, 250);
                ctx.stroke();
            }

            // Render 3D Rocks
            rocks3DRef.current.forEach(rock => {
                const scale = focalLength / Math.max(1, rock.z);
                const screenX = 400 + rock.x * scale;
                const screenY = 250 + rock.y * scale;
                const screenR = rock.size * scale;

                // Rock Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath();
                ctx.ellipse(screenX, 250 + 200 * scale, screenR, screenR * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Rock Body
                const grad = ctx.createRadialGradient(screenX - screenR/3, screenY - screenR/3, screenR/4, screenX, screenY, screenR);
                grad.addColorStop(0, '#888');
                grad.addColorStop(1, '#222');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(screenX, screenY, screenR, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#444'; ctx.lineWidth = 2 * scale;
                ctx.stroke();
            });

            // Render 1st Person Sword
            const mx = mousePosRef.current.x;
            const my = mousePosRef.current.y;
            ctx.save();
            ctx.translate(mx, my);
            // Tilt the sword based on movement
            const tilt = (mx - 400) / 400 * 0.5;
            ctx.rotate(tilt);
            
            // Blade
            const bladeGrad = ctx.createLinearGradient(-10, -100, 10, -100);
            bladeGrad.addColorStop(0, '#e0f7fa'); bladeGrad.addColorStop(0.5, '#fff'); bladeGrad.addColorStop(1, '#00f2ff');
            ctx.fillStyle = bladeGrad;
            ctx.beginPath();
            ctx.moveTo(-15, 0); ctx.lineTo(-10, -180); ctx.lineTo(0, -210); ctx.lineTo(10, -180); ctx.lineTo(15, 0);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#00f2ff'; ctx.lineWidth = 2; ctx.stroke();
            
            // Hilt
            ctx.fillStyle = '#444'; ctx.fillRect(-25, 0, 50, 10);
            ctx.fillStyle = '#222'; ctx.fillRect(-8, 5, 16, 60);

            ctx.restore();

            // Render Slash Effect
            if (isSlashingRef.current > 0) {
                ctx.save();
                ctx.translate(mx, my);
                ctx.rotate(tilt);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(0, -100, 100, -Math.PI * 0.8, -Math.PI * 0.2);
                ctx.stroke();
                ctx.strokeStyle = '#00f2ff';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(0, -100, 100, -Math.PI * 0.8, -Math.PI * 0.2);
                ctx.stroke();
                ctx.restore();
            }

            // Minigame UI (3 Hits limit)
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(`SCORE: ${Math.floor(mgScore)}`, 30, 50);

            // Draw Health Hearts
            for(let i=0; i<3; i++) {
                const hx = 750 - i * 40;
                const hy = 40;
                ctx.fillStyle = i < (3 - mgHitsRef.current) ? '#ff0055' : '#333';
                ctx.beginPath();
                ctx.moveTo(hx, hy);
                ctx.bezierCurveTo(hx-10, hy-10, hx-20, hy+5, hx, hy+20);
                ctx.bezierCurveTo(hx+20, hy+5, hx+10, hy-10, hx, hy);
                ctx.fill();
            }

            ctx.restore();
            return; // Skip rest of world drawing
        }

        const camX = cameraXRef.current;
        const camY = (gameState === 'MG_MUSHROOM_JUMP') ? cameraYRef.current : 0;

        if (gameState === 'START_MENU') {
            const innerCtx = canvasRef.current?.getContext('2d');
            if (innerCtx) {
                const grad = innerCtx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
                grad.addColorStop(0, '#151833');
                grad.addColorStop(1, '#1a1a2e');
                innerCtx.fillStyle = grad;
                innerCtx.fillRect(-50, -50, GAME_WIDTH + 100, GAME_HEIGHT + 100);
                innerCtx.fillStyle = '#10101a'; innerCtx.fillRect(0, 420, GAME_WIDTH, 80);
                vinnRef.current.x = GAME_WIDTH / 2; vinnRef.current.y = 420;
                vinnRef.current.draw(innerCtx, 0);
            }
            return;
        }
        if (gameState === 'INTRO_CUTSCENE') {
            cutsceneRef.current.draw(ctx);
            return;
        }
        if (gameState === 'WORLD1_INTERLUDE' && interlude1Ref.current) {
            interlude1Ref.current.draw(ctx);
            return;
        }
        if (gameState === 'WORLD2_INTERLUDE' && interlude2Ref.current) {
            interlude2Ref.current.draw(ctx);
            return;
        }
        if (gameState === 'WORLD3_BOSS_INTRO' && interlude3Ref.current) {
            interlude3Ref.current.draw(ctx);
            return;
        }
        if (gameState === 'WORLD3_ESCAPE_CUTSCENE') {
            escapeCutsceneRef.current.draw(ctx);
            return;
        }
        if (gameState === 'ENDING_CUTSCENE') {
            endingRef.current.draw(ctx);
            return;
        }

        const currentTheme = (gameState === 'MG_MUSHROOM_JUMP') ? 'MUSHROOM_SKY' : ((gameState === 'TUTORIAL') ? 'FOREST' : world.theme);
        
        if (currentTheme === 'MUSHROOM_SKY') {
            const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
            grad.addColorStop(0, '#87ceeb'); // Sky blue
            grad.addColorStop(1, '#e0f7fa'); // Light cyan
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            
            // Draw some stylized clouds relative to camera altitude
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 0.6;
            for (let i = 0; i < 6; i++) {
                const cx = (i * 200 - camX * 0.1) % 1000;
                const cy = (i * 150 - camY * 0.2) % 600;
                ctx.beginPath();
                ctx.arc(cx, cy, 30, 0, Math.PI * 2);
                ctx.arc(cx + 25, cy - 10, 25, 0, Math.PI * 2);
                ctx.arc(cx + 45, cy, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        } else if (currentTheme === 'FOREST') {
            ctx.fillStyle = '#1a2e1a';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
        else if (currentTheme === 'VOLCANO') {
            const grad = ctx.createLinearGradient(0, 0, 0, 500);
            grad.addColorStop(0, '#2b0a0a');
            grad.addColorStop(1, '#000');
            ctx.fillStyle = grad;
            ctx.fillRect(-50, -50, GAME_WIDTH + 100, GAME_HEIGHT + 100);
        }
        else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }

        // World 3 Castle Rendering
        if (currentWorld === 3 && currentLevel === 4) {
            drawCastle(ctx, 3800 - camX);
        }

        if (currentTheme === 'VOLCANO') {
            ctx.fillStyle = '#1a0505';
            for (let i = 0; i < 3; i++) {
                const vx = (i * 500 - camX * 0.2) % 1500;
                ctx.beginPath();
                ctx.moveTo(vx - 200, GAME_HEIGHT);
                ctx.lineTo(vx, 100);
                ctx.lineTo(vx + 200, GAME_HEIGHT);
                ctx.fill();
                ctx.fillStyle = '#ff4500';
                ctx.beginPath();
                ctx.moveTo(vx - 20, 140);
                ctx.lineTo(vx, 100);
                ctx.lineTo(vx + 20, 140);
                ctx.fill();
                ctx.fillStyle = '#1a0505';
            }
        }

        if (gameState === 'TUTORIAL') {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(1400 + Math.sin(Date.now() / 500 + i) * 50, 440 + Math.cos(i) * 10, 15, 5);
            }
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = -camX % 160; i < canvas.width; i += 160) {
            for (let j = 0; j < canvas.height; j += 160) {
                if ((Math.floor((i + camX) / 160) + Math.floor(j / 160)) % 2 === 0) ctx.fillRect(i, j, 160, 160);
            }
        }

        const isMinigame = ['MG_MUSHROOM_JUMP', 'MG_STONE_SMASH', 'MG_ESCAPE'].includes(gameState);
        const visiblePlatforms = (gameState === 'TUTORIAL') ?
            [{ x: 0, y: 460, w: 800, type: 'NORMAL' }, { x: 850, y: 460, w: 400, type: 'NORMAL' }, { x: 1300, y: 460, w: 300, type: 'NORMAL' }] :
            (isMinigame ? platformsRef.current : worldPlatforms);

        visiblePlatforms.forEach((p: Platform) => {
            ctx.save();
            const sx = p.x - camX;
            const sy = p.y - camY;

            if (p.type === 'MUSHROOM') {
                // Better Mushroom platform
                ctx.fillStyle = '#ff4d4d'; // Red cap
                ctx.beginPath();
                ctx.ellipse(sx + p.w / 2, sy + 12, p.w / 2, 18, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // White spots
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.beginPath(); ctx.arc(sx + p.w/2, sy + 4, 8, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(sx + p.w/4, sy + 12, 5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(sx + 3*p.w/4, sy + 12, 5, 0, Math.PI*2); ctx.fill();
                
                // Stem
                ctx.fillStyle = '#fdf5e6';
                ctx.fillRect(sx + p.w/2 - 10, sy + 18, 20, 12);
            } else if (p.type === 'PAINT') {
                const gradient = ctx.createLinearGradient(0, sy, 0, sy + 20);
                gradient.addColorStop(0, '#ff00ff'); gradient.addColorStop(1, '#00ffff');
                ctx.fillStyle = gradient; ctx.fillRect(sx, sy, p.w, 20);
            } else {
                ctx.fillStyle = (currentTheme === 'FOREST') ? '#4d2600' : (currentTheme === 'VOLCANO' ? '#222' : (currentTheme === 'MUSHROOM_SKY' ? '#8bc34a' : '#444'));
                ctx.fillRect(sx, sy, p.w, 15);
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(sx, sy, p.w, 15);
            }
            ctx.restore();
        });

        // Draw paint puddles (Paint Land)
        if (currentTheme === 'PAINT_LAND' && paintPuddlesRef.current.length > 0) {
            const t = Date.now() / 800;
            paintPuddlesRef.current.forEach(puddle => {
                const screenX = puddle.x - camX;
                const halfW = puddle.w / 2;
                const centerX = screenX + halfW;
                const groundY = 460;

                // Only render if on screen
                if (screenX + puddle.w < -50 || screenX > canvas.width + 50) return;

                ctx.save();

                // Glowing puddle ellipse
                ctx.shadowBlur = 18;
                ctx.shadowColor = puddle.color;

                const grad = ctx.createRadialGradient(centerX, groundY, 4, centerX, groundY, halfW);
                grad.addColorStop(0, puddle.color + 'cc');
                grad.addColorStop(0.6, puddle.color + '88');
                grad.addColorStop(1, puddle.color + '22');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(centerX, groundY, halfW, 9 + Math.sin(t + puddle.x) * 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Shimmer ring
                ctx.strokeStyle = puddle.color + '99';
                ctx.lineWidth = 1.5;
                const shimmerR = halfW * (0.5 + 0.5 * ((t * 0.5 + puddle.x) % 1));
                ctx.beginPath();
                ctx.ellipse(centerX, groundY, shimmerR, shimmerR * 0.25, 0, 0, Math.PI * 2);
                ctx.stroke();

                // "!" danger icon
                ctx.shadowBlur = 0;
                ctx.font = 'bold 11px monospace';
                ctx.fillStyle = puddle.color;
                ctx.textAlign = 'center';
                ctx.fillText('!', centerX, groundY - 14);

                ctx.restore();
            });
        }

        itemsRef.current.forEach(item => {
            if (!item.collected) {
                ctx.save();
                const hover = Math.sin(Date.now() / 200) * 10;
                if (item.type === 'DOUBLE_JUMP') {
                    ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(item.x - camX, item.y + hover, 8, 0, Math.PI * 2); ctx.fill();
                } else if (item.type === 'RAINBOW') {
                    ctx.fillStyle = `hsl(${(Date.now() % 1000) * 0.36}, 100%, 50%)`;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.moveTo(item.x - camX, item.y + hover - 10);
                    ctx.lineTo(item.x - camX + 8, item.y + hover);
                    ctx.lineTo(item.x - camX, item.y + hover + 10);
                    ctx.lineTo(item.x - camX - 8, item.y + hover);
                    ctx.closePath();
                    ctx.fill();
                } else if (item.type === 'FEATHER') {
                    ctx.save();
                    ctx.shadowBlur = 15; ctx.shadowColor = '#fff';
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.ellipse(item.x - camX, item.y + hover, 6, 12, 0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                ctx.restore();
            }
        });

        rocksRef.current.forEach(rock => {
            ctx.fillStyle = '#444';
            ctx.beginPath();
            ctx.arc(rock.x - camX, rock.y, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            if (rock.y < 460) {
                const scale = Math.max(0, rock.y / 460);
                ctx.beginPath();
                ctx.ellipse(rock.x - camX, 460, 15 * scale, 5 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Ink Colossus: draw ink projectiles in flight
        inkProjectilesRef.current.forEach(proj => {
            const sx = proj.x - camX;
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#aa00ff';
            ctx.fillStyle = '#1a0030';
            ctx.beginPath();
            ctx.arc(sx, proj.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(sx + 3, proj.y - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        fireFlamesRef.current = fireFlamesRef.current.filter(flame => {
            const playerTarget = isTwoPlayer
                ? (Math.abs(vinnRef.current.x - flame.x) < Math.abs(vinn2Ref.current.x - flame.x) ? vinnRef.current : vinn2Ref.current)
                : vinnRef.current;
            const dx = playerTarget.x - flame.x;
            const dy = playerTarget.y - flame.y;
            const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            flame.vx += (dx / dist) * 0.15;
            flame.vy += (dy / dist) * 0.15;
            flame.x += flame.vx;
            flame.y += flame.vy;
            flame.life -= dt * 0.4;
            const hitsPlayer = (p: any) => !p.isHit && Math.abs(p.x - flame.x) < 30 && Math.abs(p.y - flame.y) < 30;
            if (hitsPlayer(vinnRef.current) || (isTwoPlayer && hitsPlayer(vinn2Ref.current))) flame.life = 0;
            ctx.fillStyle = '#ff9a00'; ctx.beginPath(); ctx.arc(flame.x - camX, flame.y, 12, 0, Math.PI * 2); ctx.fill();
            return flame.life > 0 && flame.y < 560;
        });

        // Minigame Specials: Queen Drawing
        if (gameState === 'MG_ESCAPE') {
            const rx = queenPosRef.current.x - camX;
            const ry = queenPosRef.current.y + Math.sin(Date.now() / 300) * 5; // Floating animation
            ctx.save();
            // Royal Glow
            ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff';
            
            // Dress
            ctx.fillStyle = '#ff00ff'; 
            ctx.beginPath();
            ctx.moveTo(rx - 15, ry + 20);
            ctx.lineTo(rx + 15, ry + 20);
            ctx.lineTo(rx, ry - 10);
            ctx.closePath();
            ctx.fill();

            // Face
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath();
            ctx.arc(rx, ry - 15, 8, 0, Math.PI * 2);
            ctx.fill();

            // Crown
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.moveTo(rx - 10, ry - 22);
            ctx.lineTo(rx - 5, ry - 18);
            ctx.lineTo(rx, ry - 25);
            ctx.lineTo(rx + 5, ry - 18);
            ctx.lineTo(rx + 10, ry - 22);
            ctx.lineTo(rx + 10, ry - 15);
            ctx.lineTo(rx - 10, ry - 15);
            ctx.closePath();
            ctx.fill();

            // Text Label
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText("QUEEN", rx, ry - 35);
            
            ctx.restore();
        }

        bossProjectilesRef.current = bossProjectilesRef.current.filter(proj => {
            proj.x += proj.vx;
            proj.y += proj.vy;
            if (proj.type === 'LAVA') proj.vy += 0.3;

            const hitPlayer = (p: any) => !p.isHit && Math.abs(p.x - proj.x) < 30 && Math.abs(p.y - proj.y) < 30;
            if (proj.type === 'LAVA' || proj.type === 'FIREBALL') {
                if (hitPlayer(vinnRef.current)) {
                    vinnRef.current.takeDamage(5);
                    proj.life = 0;
                }
                if (isTwoPlayer && hitPlayer(vinn2Ref.current)) {
                    vinn2Ref.current.takeDamage(5);
                    proj.life = 0;
                }
            } else {
                if (hitPlayer(vinnRef.current)) {
                    proj.life = 0;
                }
                if (isTwoPlayer && hitPlayer(vinn2Ref.current)) {
                    proj.life = 0;
                }
            }

            if (proj.type === 'FIREBALL' && bossRef.current && bossRef.current.type === 'BLAZE_KING' && bossRef.current.state === 'FIREBALL') {
                if (proj.x - camX < 20 || proj.x - camX > 780) {
                    bossRef.current.state = 'STUNNED';
                    bossRef.current.attackTimer = 0;
                    proj.life = 0;
                    spawnParticles(proj.x, proj.y, '#ff8c00');
                }
            }

            if (proj.type === 'LAVA' && proj.y > 460) {
                proj.life = 0;
                spawnParticles(proj.x, proj.y, '#ff5500');
            }

            if (proj.type === 'FIREBALL') {
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ffda75';
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(proj.x - camX, proj.y, 14, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ff4500';
                ctx.fillStyle = '#ff2f00';
                ctx.beginPath();
                ctx.arc(proj.x - camX, proj.y, 18, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;

            return proj.life > 0 && proj.x > camX - 100 && proj.x < camX + 900 && proj.y < 620;
        });

        if (currentTheme === 'VOLCANO') {
            ctx.fillStyle = '#ff4500'; ctx.globalAlpha = 0.5; ctx.fillRect(0, 480, 800, 20); ctx.globalAlpha = 1.0;
        }

        vinnRef.current.draw(ctx, camX, camY);
        // Draw Jump Charge indicator
        if (gameState === 'MG_MUSHROOM_JUMP') {
            const p = vinnRef.current;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`⚡ x${p.jumpCharges}`, p.x - camX, p.y - camY - 70);
            if (p.rechargeTimer > 0) {
                 ctx.fillStyle = 'rgba(255,255,255,0.3)';
                 ctx.fillRect(p.x - camX - 15, p.y - camY - 65, 30 * (p.rechargeTimer / 4), 2);
            }
        }

        if (isTwoPlayer) {
            vinn2Ref.current.draw(ctx, camX, camY);
            if (gameState === 'MG_MUSHROOM_JUMP') {
                const p = vinn2Ref.current;
                ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`⚡ x${p.jumpCharges}`, p.x - camX, p.y - camY - 70);
            }
        }
        if (gameState === 'TUTORIAL') {
            enemiesRef.current.forEach(e => e.draw(ctx, camX));
        }
        if (gameState === 'PLAYING') {
            enemiesRef.current.forEach(e => e.health > 0 && e.draw(ctx, camX));
            if (bossRef.current && bossRef.current.health > 0) {
                const isInk = bossRef.current.type === 'INK_COLOSSUS';
                if (!isInk || inkIntroTimerRef.current >= 1.0) {
                    bossRef.current.draw(ctx, camX);
                }
            }
        }

        if (gameState === 'PLAYING' && bossRef.current && bossRef.current.health > 0) {
            const barW = 400; const barH = 20;
            ctx.fillStyle = '#222'; ctx.fillRect(200, 20, barW, barH);
            ctx.fillStyle = '#ff2d55'; ctx.fillRect(200, 20, barW * (bossRef.current.health / bossRef.current.maxHealth), barH);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(200, 20, barW, barH);
            ctx.fillStyle = '#fff'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
            ctx.fillText(bossRef.current.type, 400, 55);
        }


        particlesRef.current = particlesRef.current.filter(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= dt * 2;
            ctx.fillStyle = p.color || `rgba(255, 204, 0, ${p.life})`;
            ctx.beginPath(); ctx.arc(p.x - camX, p.y - camY, 3, 0, Math.PI * 2); ctx.fill();
            return p.life > 0;
        });

        // Story Mode Escape UI (Fear Bar and Timer)
        if (gameState === 'MG_ESCAPE' && currentMgRef.current === null) {
            // Timer
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px "Press Start 2P"';
            ctx.textAlign = 'center';
            const timeLeft = Math.max(0, Math.ceil(mgTimeLeftRef.current));
            ctx.fillText(`TIME: ${timeLeft}s`, 400, 40);

            // Fear Bar
            const barW = 300; const barH = 15;
            ctx.fillStyle = '#111'; ctx.fillRect(250, 60, barW, barH);
            const fearRatio = Math.min(1, Math.max(0, mgFearRef.current / 100));
            // Glitchy fear effect
            const fearColor = `rgb(${100 + fearRatio*155}, 0, ${150 + Math.random()*50})`;
            ctx.fillStyle = fearColor;
            ctx.fillRect(250, 60, barW * fearRatio, barH);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(250, 60, barW, barH);
            
            ctx.fillStyle = fearRatio > 0.8 && Date.now() % 200 < 100 ? '#ff0000' : '#fff';
            ctx.font = '10px "Press Start 2P"';
            ctx.fillText("FEAR", 400, 90);
        }

        ctx.restore();
    });


    return (
        <div className="game-container">
            <div className="orientation-overlay">
                <h2>PLEASE ROTATE<br />YOUR DEVICE</h2>
                <div className="phone-icon"></div>
            </div>
            <div className="hud">
                {['PLAYING', 'TUTORIAL', 'GAMEOVER', 'LEVEL_TRANSITION', 'WORLD_COMPLETE', 'GAME_WON'].includes(gameState) && (
                    <div className="header">
                        <h1 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '4px', color: '#00f2ff' }}>
                            VINN'S QUEST {gameState !== 'TUTORIAL' && `- W${currentWorld}-L${currentLevel}`}
                        </h1>
                        <div className="health-bar">
                            <div className="health-fill" style={{ width: `${Math.max(0, (vinnRef.current.health / vinnRef.current.maxHealth) * 100)}%` }}></div>
                        </div>
                        {isTwoPlayer && (
                            <div className="health-bar" style={{ marginTop: '5px', borderColor: vinn2Ref.current.color }}>
                                <div className="health-fill" style={{ background: vinn2Ref.current.color, width: `${Math.max(0, (vinn2Ref.current.health / vinn2Ref.current.maxHealth) * 100)}%` }}></div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <p style={{ fontFamily: 'var(--font-retro)', fontSize: '10px', marginTop: '5px' }}>
                                P1: {Math.ceil(vinnRef.current.health)}/{vinnRef.current.maxHealth}
                                {isTwoPlayer && ` | P2: ${Math.ceil(vinn2Ref.current.health)}/${vinn2Ref.current.maxHealth}`}
                            </p>
                            {vinnRef.current.hasDoubleJump && <span className="key-box" style={{ background: '#00f2ff', color: '#000' }}>DOUBLE_JUMP</span>}
                        </div>
                    </div>
                )}
                {gameState === 'START_MENU' && (
                    <div className="menu-overlay">
                        <h1 style={{ 
                            fontSize: '4.5rem', marginBottom: '30px', color: '#fff', 
                            textShadow: '0 0 10px #00f2ff, 0 0 20px #00f2ff',
                            fontFamily: 'var(--font-retro)' 
                        }}>VINN'S QUEST</h1>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                            { (unlockedProgress.world > 1 || unlockedProgress.level > 1) && (
                                <button 
                                    className="level-btn" 
                                    style={{ width: '280px', fontSize: '18px', borderColor: '#00f2ff', color: '#00f2ff' }}
                                    onClick={() => loadLevel(unlockedProgress.world, unlockedProgress.level)}
                                >
                                    {language === 'en' ? 'CONTINUE' : 'CONTINUAR'}
                                </button>
                            )}
                            <button 
                                className="level-btn" 
                                style={{ width: '280px', fontSize: '18px' }}
                                onClick={() => {
                                    setUnlockedProgress({ world: 1, level: 1 });
                                    setGameState('INTRO_CUTSCENE');
                                }}
                            >
                                {t('PLAY')}
                            </button>
                            <button 
                                className="level-btn" 
                                style={{ width: '280px', fontSize: '18px', borderColor: '#ffcc00', color: '#ffcc00' }}
                                onClick={() => setGameState('MINIGAME_SELECTOR')}
                            >
                                🎮 {t('MINIGAMES')}
                            </button>
                            <button 
                                className="level-btn" 
                                style={{ width: '280px', fontSize: '18px' }}
                                onClick={() => setGameState('SETTINGS')}
                            >
                                {t('SETTINGS')}
                            </button>
                        </div>
                    </div>
                )}

            {gameState === 'MINIGAME_SELECTOR' && (
                <div className="menu-overlay">
                    <h1 style={{ color: '#ffcc00', marginTop: '50px' }}>{t('MINIGAMES')}</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '40px', maxWidth: '1000px' }}>
                        {MINIGAME_CONFIGS.map(mg => {
                            const mgUnlocked = unlockedProgress.world > mg.world || (unlockedProgress.world === mg.world && unlockedProgress.level > 5);
                            const scoreKey = mg.id === 'MG_MUSHROOM_JUMP' ? 'mushroom' : (mg.id === 'MG_STONE_SMASH' ? 'stone' : 'escape');
                            return (
                                <div key={mg.id} 
                                     className={`level-box ${mgUnlocked ? '' : 'disabled'}`}
                                     style={{ 
                                         aspectRatio: '1', display: 'flex', flexDirection: 'column', 
                                         justifyContent: 'center', alignItems: 'center', gap: '10px',
                                         opacity: mgUnlocked ? 1 : 0.6, cursor: mgUnlocked ? 'pointer' : 'not-allowed',
                                         backgroundColor: mgUnlocked ? 'rgba(255, 204, 0, 0.1)' : 'rgba(0,0,0,0.5)',
                                         border: mgUnlocked ? '3px solid #ffcc00' : '3px solid #444',
                                         position: 'relative'
                                     }}
                                     onClick={() => mgUnlocked && initMinigame(mg.id)}
                                >
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{mg.title[language]}</div>
                                    {!mgUnlocked ? (
                                        <div style={{ fontSize: '10px', color: '#ff4444' }}>
                                            {t('LOCKED')}<br/>{t('UNLOCK_BY')} {mg.world}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '14px', color: '#00f2ff' }}>
                                            {t('HI_SCORE')}: {mgHighScores[scoreKey as keyof typeof mgHighScores]}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <button className="level-btn" onClick={() => setGameState('START_MENU')}>{t('BACK')}</button>
                </div>
            )}

                    {gameState === 'SETTINGS' && (
                        <div className="menu-overlay level-selector-overlay" style={{ background: 'rgba(0,0,0,0.9)' }}>
                            <div className="selector-content" style={{ gap: '1.5rem' }}>
                                <h2 style={{ fontFamily: 'var(--font-retro)', color: '#ffcc00' }}>{t('SETTINGS')}</h2>

                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#00f2ff' }}>{t('QUEST_MODE')}</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className={`level-btn ${!isTwoPlayer ? '' : 'locked'}`} style={{ fontSize: '10px' }} onClick={() => setIsTwoPlayer(false)}>{t('SOLO')}</button>
                                        <button className={`level-btn ${isTwoPlayer ? '' : 'locked'}`} style={{ fontSize: '10px' }} onClick={() => setIsTwoPlayer(true)}>{t('DUO')}</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: vinnColor }}>{t('P1_COLOR')}</p>
                                        <input
                                            type="color"
                                            value={vinnColor}
                                            onChange={(e) => setVinnColor(e.target.value)}
                                            style={{ width: '60px', height: '40px', border: '2px solid #fff', cursor: 'pointer', background: 'none' }}
                                        />
                                    </div>
                                    {isTwoPlayer && (
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: vinn2Color }}>{t('P2_COLOR')}</p>
                                            <input
                                                type="color"
                                                value={vinn2Color}
                                                onChange={(e) => setVinn2Color(e.target.value)}
                                                style={{ width: '60px', height: '40px', border: '2px solid #fff', cursor: 'pointer', background: 'none' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#00f2ff' }}>{t('LANGUAGE')}</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className={`level-btn ${language === 'en' ? '' : 'locked'}`} onClick={() => setLanguage('en')}>EN</button>
                                        <button className={`level-btn ${language === 'es' ? '' : 'locked'}`} onClick={() => setLanguage('es')}>ES</button>
                                    </div>
                                </div>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <button 
                                        className="level-btn locked" 
                                        style={{ width: '200px', fontSize: '12px', borderColor: '#ff4444', color: '#ff4444' }}
                                        onClick={() => {
                                            if (window.confirm(language === 'en' ? "Delete all progress?" : "¿Borrar todo el progreso?")) {
                                                localStorage.clear();
                                                window.location.reload();
                                            }
                                        }}
                                    >
                                        {language === 'en' ? 'RESET PROGRESS' : 'REINICIAR PROGRESO'}
                                    </button>
                                </div>

                                <button className="back-btn" onClick={() => setGameState('START_MENU')}>{t('BACK')}</button>
                            </div>
                        </div>
                    )}

                    {gameState === 'LEVEL_SELECTOR' && (
                        <div className="menu-overlay level-selector-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
                            <div className="selector-content">
                                <h2 style={{ fontFamily: 'var(--font-retro)', color: '#ffcc00', marginBottom: '2rem' }}>SELECT LEVEL</h2>

                                {[1, 2, 3].map(w => (
                                    <div key={w} className="world-row">
                                        <h3 style={{ fontSize: '0.8rem', color: '#00f2ff', textAlign: 'left', marginBottom: '1rem' }}>
                                            WORLD {w}: {w === 1 ? 'FOREST' : w === 2 ? 'VOLCANO' : 'PAINT LAND'}
                                        </h3>
                                        <div className="level-grid">
                                            {[1, 2, 3, 4, 5].map(l => {
                                                const lvlUnlocked = w < unlockedProgress.world || (w === unlockedProgress.world && l <= unlockedProgress.level);
                                                return (
                                                    <button
                                                        key={l}
                                                        className={`level-btn ${!lvlUnlocked ? 'locked' : ''}`}
                                                        disabled={!lvlUnlocked}
                                                        onClick={() => {
                                                            setCurrentWorld(w);
                                                            setCurrentLevel(l);
                                                            loadLevel(w, l);
                                                        }}
                                                    >
                                                        {l === 5 ? 'BOSS' : l}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <button className="back-btn" onClick={() => setGameState('START_MENU')}>BACK TO MENU</button>
                            </div>
                        </div>
                    )}

                    {gameState === 'INTRO_CUTSCENE' && (
                        <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'auto', zIndex: 9999 }}>
                            <button
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    musicRef.current.stop();
                                    setGameState('TUTORIAL');
                                }}
                            >
                                SKIP CUTSCENE
                            </button>
                        </div>
                    )}

                    {gameState === 'WORLD3_BOSS_INTRO' && (
                        <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'auto', zIndex: 9999 }}>
                            <button
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    musicRef.current.stop();
                                    setCurrentWorld(3);
                                    setCurrentLevel(5);
                                    loadLevel(3, 5);
                                }}
                            >
                                SKIP CUTSCENE
                            </button>
                        </div>
                    )}

                    {gameState === 'BOSS_VS_CUTSCENE' && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px`, pointerEvents: 'none', overflow: 'hidden', zIndex: 100 }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)' }}></div>
                            <div style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, #004488, transparent)', animation: 'slideRight 0.5s ease-out forwards', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-retro)', fontSize: '1.8rem', color: '#00f2ff', textShadow: '4px 4px 0 #000', lineHeight: '1.1' }}>VINN THE</div>
                                    <div style={{ fontFamily: 'var(--font-retro)', fontSize: '2.6rem', color: '#00f2ff', textShadow: '4px 4px 0 #000', fontWeight: '700', letterSpacing: '2px' }}>KNIGHT</div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: 'linear-gradient(-90deg, #2d3e12, transparent)', animation: 'slideLeft 0.5s ease-out forwards', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-retro)', fontSize: '1.8rem', color: '#ffcc00', textShadow: '4px 4px 0 #000', lineHeight: '1.1' }}>THE</div>
                                    <div style={{ fontFamily: 'var(--font-retro)', fontSize: '2.6rem', color: '#ffcc00', textShadow: '4px 4px 0 #000', fontWeight: '700', letterSpacing: '2px' }}>{bossRef.current?.type === 'BLAZE_KING' ? 'BLAZE KING' : bossRef.current?.type === 'INK_COLOSSUS' ? 'INK COLOSSUS' : 'GOLEM'}</div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'popIn 0.5s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both', opacity: 0 }}>
                                <h2 style={{ fontFamily: 'var(--font-retro)', fontSize: '4rem', color: '#ff2d55', textShadow: '6px 6px 0 #000, 0 0 20px #ff2d55', fontStyle: 'italic', letterSpacing: '-5px' }}>VS</h2>
                            </div>
                            <style dangerouslySetInnerHTML={{
                                __html: `
                    @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                    @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
                    @keyframes popIn { from { transform: translate(-50%, -50%) scale(0); opacity: 0; } to { transform: translate(-50%, -50%) scale(1) rotate(-10deg); opacity: 1; } }
                 `}} />
                        </div>
                    )}

                    {gameState === 'TUTORIAL' && (
                        <div className="tutorial-card">
                            {tutorialPhase === 0 && <div><h2>Chapter 0: The Pursuit</h2><p>Vinn has landed! Walk with [A/D].</p></div>}
                            {tutorialPhase === 1 && <div><h2>Over the logs</h2><p>Jump with [W] to stay on the trail!</p></div>}
                            {tutorialPhase === 2 && <div><h2>A straggler!</h2><p>Slay the Tech Skeleton! [SPACE]</p></div>}
                            {tutorialPhase === 3 && <button onClick={() => loadLevel(1, 1)}>START THE QUEST</button>}
                        </div>
                    )}

                    {gameState === 'LEVEL_TRANSITION' && (
                        <div className="tutorial-card">
                            <h2>LEVEL CLEAR</h2>
                            <button onClick={() => loadLevel(currentWorld, currentLevel + 1)}>NEXT LEVEL</button>
                        </div>
                    )}

                    {gameState === 'WORLD_COMPLETE' && (
                        <div className="tutorial-card">
                            <h2>WORLD {currentWorld} COMPLETE</h2>
                            <button onClick={() => loadLevel(currentWorld + 1, 1)}>CONTINUE</button>
                        </div>
                    )}

                    {gameState === 'GAME_WON' && (
                        <div className="tutorial-card">
                            <h2 style={{ color: '#ffcc00' }}>ULTIMATE VICTORY</h2>
                            <button onClick={() => window.location.reload()}>RESTART QUEST</button>
                        </div>
                    )}

                    {gameState === 'GAMEOVER' && (
                        <div className="tutorial-card" style={{ borderColor: '#ff2d55' }}>
                            <h2>DEFEATED</h2>
                            <button onClick={() => loadLevel(currentWorld, currentLevel)}>TRY AGAIN</button>
                        </div>
                    )}
                </div>
                <div className="controls-hint"><span>[WASD] MOVE/JUMP</span><span>[SPACE] ATTACK</span></div>
                <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{ border: '4px solid #333' }} />

            {/* ─── Ink Boss Entry Overlay ─────────────────────────── */}
            {inkChase && inkIntroTimerRef.current < 1.0 && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    pointerEvents: 'none', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div style={{
                        fontSize: '80px', fontFamily: 'monospace', fontWeight: 'bold',
                        color: '#ff2d55', textShadow: '4px 4px 0 #000', marginBottom: '20px',
                        animation: 'pulse 0.2s infinite alternate'
                    }}>RUN!</div>
                    <div style={{
                        position: 'absolute', bottom: '0', left: 0, width: '100%', height: '40px',
                        background: 'rgba(0,0,0,0.8)', borderTop: '2px solid #ff00ff',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: '#ff00ff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace'
                    }}>
                        ⚠  THE INK COLOSSUS AWAKENS  ⚠
                    </div>
                </div>
            )}

            {/* ─── Mobile On-Screen Controls ─────────────────────────── */}
            {isMobile && ['PLAYING', 'TUTORIAL', 'INTRO_CUTSCENE', 'ENDING_CUTSCENE', 'INK_BOSS_INTRO'].includes(gameState) && (
                <div className="mobile-controls">
                    {/* D-Pad - Only show during movement phases */}
                    {['PLAYING', 'TUTORIAL'].includes(gameState) && (
                        <div className="mobile-dpad">
                            <button
                                className="mobile-btn dpad-left"
                                onTouchStart={(e) => { e.preventDefault(); mobileKeysRef.current['a'] = true; }}
                                onTouchEnd={(e) => { e.preventDefault(); mobileKeysRef.current['a'] = false; }}
                            >◀</button>
                            <button
                                className="mobile-btn dpad-jump"
                                onTouchStart={(e) => { e.preventDefault(); vinnRef.current.jump(); }}
                            >▲</button>
                            <button
                                className="mobile-btn dpad-right"
                                onTouchStart={(e) => { e.preventDefault(); mobileKeysRef.current['d'] = true; }}
                                onTouchEnd={(e) => { e.preventDefault(); mobileKeysRef.current['d'] = false; }}
                            >▶</button>
                        </div>
                    )}
                    {/* Action Buttons */}
                    <div className="mobile-actions">
                        <button
                            className="mobile-btn action-attack"
                            onTouchStart={(e) => {
                                e.preventDefault();
                                mobileKeysRef.current[' '] = true;
                                advanceCutscene();
                            }}
                            onTouchEnd={(e) => { e.preventDefault(); mobileKeysRef.current[' '] = false; }}
                        >{['PLAYING', 'TUTORIAL'].includes(gameState) ? '⚔' : 'NEXT'}</button>
                    </div>
                </div>
            )}
            {/* Boss Guide Overlay */}
            {gameState === 'BOSS_GUIDE' && bossRef.current && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    color: '#fff', textAlign: 'center', fontFamily: 'monospace'
                }}>
                    {BOSS_GUIDES[bossRef.current.type] && BOSS_GUIDES[bossRef.current.type][guideStep] && (
                        <div style={{
                            backgroundColor: '#222', padding: 30, borderRadius: 15, border: '4px solid #555',
                            width: '60%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <h2 style={{ color: '#ffcc00', margin: '0 0 15px 0', fontSize: '28px' }}>
                                {BOSS_GUIDES[bossRef.current.type][guideStep].title}
                            </h2>
                            {BOSS_GUIDES[bossRef.current.type][guideStep].img && (
                                <img
                                    src={BOSS_GUIDES[bossRef.current.type][guideStep].img}
                                    alt="Guide"
                                    style={{ width: '100%', height: 'auto', borderRadius: 8, marginBottom: 20, border: '2px solid #000' }}
                                />
                            )}
                            <p style={{ fontSize: '18px', lineHeight: 1.5, marginBottom: 30, maxWidth: '90%' }}>
                                {BOSS_GUIDES[bossRef.current.type][guideStep].text}
                            </p>

                            <div style={{ display: 'flex', gap: 20 }}>
                                <button
                                    onClick={() => {
                                        if (!bossRef.current) return;
                                        const guideLen = BOSS_GUIDES[bossRef.current.type].length;
                                        if (guideStep + 1 >= guideLen) {
                                            setGameState('PLAYING');
                                            if (bossRef.current.type === 'GOLEM') bossRef.current.state = 'FLY_UP';
                                            else if (bossRef.current.type === 'BLAZE_KING') bossRef.current.state = 'WALKING';
                                        } else {
                                            setGuideStep(prev => prev + 1);
                                        }
                                    }}
                                    style={{
                                        padding: '10px 30px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer',
                                        backgroundColor: '#ffcc00', color: '#000', border: 'none', borderRadius: 8
                                    }}
                                >
                                    {bossRef.current && (guideStep + 1 >= BOSS_GUIDES[bossRef.current.type].length ? "LET'S GO!" : "NEXT")}
                                </button>
                            </div>

                            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                                {bossRef.current && BOSS_GUIDES[bossRef.current.type].map((_, i) => (
                                    <div key={i} style={{
                                        width: 12, height: 12, borderRadius: '50%',
                                        backgroundColor: i === guideStep ? '#ffcc00' : '#666'
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

      {/* Minigame Score HUD */}
      {['MG_MUSHROOM_JUMP', 'MG_STONE_SMASH', 'MG_ESCAPE'].includes(gameState) && (
          <div style={{
              position: 'absolute', top: 20, right: 20, textAlign: 'right',
              fontFamily: 'var(--font-retro)', color: '#ffcc00', textShadow: '2px 2px #000', zIndex: 100
          }}>
              <div style={{ fontSize: '24px' }}>{t('SCORE')}: {mgScore}</div>
              <div style={{ fontSize: '14px', color: '#00f2ff' }}>{t('HI_SCORE')}: {
                  gameState === 'MG_MUSHROOM_JUMP' ? mgHighScores.mushroom : 
                  (gameState === 'MG_STONE_SMASH' ? mgHighScores.stone : mgHighScores.escape)
              }</div>
          </div>
      )}

      {/* MG Game Over */}
      {gameState === 'MG_GAMEOVER' && (
          <div className="menu-overlay">
              <h1 style={{ color: '#ff4444' }}>{t('GAME_OVER')}</h1>
              <h2 style={{ color: '#fff' }}>{t('SCORE')}: {mgScore}</h2>
              <button className="level-btn" onClick={() => {
                  let key: 'mushroom' | 'stone' | 'escape' = 'mushroom';
                  if (currentMgRef.current === 'MG_STONE_SMASH') key = 'stone';
                  if (currentMgRef.current === 'MG_ESCAPE') key = 'escape';

                  if (mgScore > mgHighScores[key]) {
                      setMgHighScores(prev => ({ ...prev, [key]: mgScore }));
                  }
                  setGameState('MINIGAME_SELECTOR');
              }}>{t('CONTINUE') || 'OK'}</button>
          </div>
      )}

    </div>
  );
}

export default App;
