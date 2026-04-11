import { useRef, useState, useEffect } from 'react';
import { Vinn } from './game/Vinn';
import { Enemy } from './game/Enemy';
import { Boss } from './game/Boss';
import type { BossType } from './game/Boss';
import { IntroCutscene } from './game/Cutscene';
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
    type: 'DOUBLE_JUMP';
    collected: boolean;
}

const WORLD_CONFIGS: Record<number, { theme: WorldTheme, levels: any[] }> = {
  1: {
    theme: 'FOREST',
    levels: [
      { length: 2400, enemies: [{x: 1200, type: 'TECH'}, {x: 2000, type: 'TECH'}], platforms: [{x: 0, y: 460, w: 600}, {x: 700, y: 460, w: 400}, {x: 800, y: 350, w: 100, type: 'MUSHROOM'}, {x: 1200, y: 460, w: 800}, {x: 1500, y: 300, w: 200}, {x: 2100, y: 460, w: 300}], items: [] },
      { length: 3000, enemies: [{x: 800, type: 'TECH'}, {x: 1500, type: 'TECH'}, {x: 2500, type: 'TECH'}], platforms: [{x: 0, y: 460, w: 500}, {x: 600, y: 380, w: 150, type: 'MUSHROOM'}, {x: 900, y: 280, w: 200}, {x: 1200, y: 460, w: 600}, {x: 1900, y: 460, w: 400}, {x: 2400, y: 460, w: 600}], items: [{ x: 1000, y: 230, type: 'DOUBLE_JUMP', collected: false }] },
      { length: 3600, enemies: [{x: 1000, type: 'TECH'}, {x: 1800, type: 'TECH'}, {x: 2800, type: 'TECH'}], platforms: [{x: 0, y: 460, w: 800}, {x: 900, y: 400, w: 100, type: 'MUSHROOM'}, {x: 1100, y: 300, w: 100, type: 'MUSHROOM'}, {x: 1300, y: 200, w: 400}, {x: 1800, y: 460, w: 1000}, {x: 3000, y: 460, w: 600}], items: [] },
      { length: 3000, enemies: [{x: 1000, type: 'TECH'}, {x: 2000, type: 'TECH'}], platforms: [
          {x: 0, y: 460, w: 1000}, 
          {x: 1100, y: 250, w: 300}, 
          {x: 1500, y: 460, w: 1500}
      ], items: []},
      { length: 1600, enemies: [], platforms: [{x: 0, y: 460, w: 1600}], isBoss: true, bossType: 'GOLEM' }
    ]
  },
  2: {
    theme: 'VOLCANO',
    levels: [
      { length: 2800, enemies: [{x: 1000, type: 'NORMAL'}, {x: 1800, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 400}, {x: 600, y: 400, w: 200}, {x: 1000, y: 350, w: 200}, {x: 1400, y: 300, w: 200}, {x: 1800, y: 460, w: 1000}], items: [] },
      { length: 3200, enemies: [{x: 1200, type: 'NORMAL'}, {x: 2200, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 600}, {x: 800, y: 400, w: 100, type: 'MUSHROOM'}, {x: 1100, y: 300, w: 300}, {x: 1600, y: 250, w: 100, type: 'MUSHROOM'}, {x: 1900, y: 460, w: 1300}], items: [] },
      { length: 4000, enemies: [{x: 1200, type: 'NORMAL'}, {x: 2000, type: 'NORMAL'}, {x: 3200, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 1000}, {x: 1200, y: 350, w: 300}, {x: 1700, y: 250, w: 200}, {x: 2200, y: 400, w: 100}, {x: 2500, y: 300, w: 100, type: 'MUSHROOM'}, {x: 2800, y: 460, w: 1200}], items: [] },
      { length: 3600, enemies: [{x: 1000, type: 'NORMAL'}, {x: 2500, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 800}, {x: 1000, y: 300, w: 400}, {x: 1600, y: 200, w: 400}, {x: 2200, y: 400, w: 200}, {x: 2600, y: 460, w: 1000}], items: [] },
      { length: 1600, enemies: [], platforms: [{x: 0, y: 460, w: 1600}], isBoss: true, bossType: 'BLAZE_KING' }
    ]
  },
  3: {
    theme: 'PAINT_LAND',
    levels: [
      { length: 2400, enemies: [{x: 1000, type: 'NORMAL'}, {x: 2000, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 800}, {x: 800, y: 400, w: 400, type: 'PAINT'}, {x: 1200, y: 460, w: 1200}], items: [] },
      { length: 3000, enemies: [{x: 800, type: 'NORMAL'}, {x: 2400, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 500}, {x: 500, y: 350, w: 200, type: 'PAINT'}, {x: 800, y: 460, w: 500}, {x: 1300, y: 300, w: 300, type: 'PAINT'}, {x: 1700, y: 460, w: 1300}], items: [] },
      { length: 3600, enemies: [{x: 1000, type: 'NORMAL'}, {x: 2000, type: 'NORMAL'}, {x: 3000, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 1000}, {x: 1100, y: 300, w: 400, type: 'PAINT'}, {x: 1600, y: 460, w: 2000}], items: [] },
      { length: 4000, enemies: [{x: 1000, type: 'NORMAL'}, {x: 2500, type: 'NORMAL'}], platforms: [{x: 0, y: 460, w: 1500}, {x: 1600, y: 250, w: 800, type: 'PAINT'}, {x: 2500, y: 460, w: 1500}], items: [] },
      { length: 15000, enemies: [], platforms: [
          {x: 0, y: 460, w: 15000}
      ], isBoss: true, bossType: 'INK_COLOSSUS',
      bombs: [{x: 800}, {x: 1600}, {x: 2400}] }
    ]
  }
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tutorialPhase, setTutorialPhase] = useState(0);
  const [gameState, setGameState] = useState<'START_MENU' | 'SETTINGS' | 'LEVEL_SELECTOR' | 'INTRO_CUTSCENE' | 'TUTORIAL' | 'PLAYING' | 'BOSS_VS_CUTSCENE' | 'INK_BOSS_INTRO' | 'GAMEOVER' | 'LEVEL_TRANSITION' | 'WORLD_COMPLETE' | 'ENDING_CUTSCENE' | 'GAME_WON'>('START_MENU');
  const [language, setLanguage] = useState<'en' | 'es'>(() => (localStorage.getItem('vinns_quest_lang') as 'en' | 'es') || 'en');
  const [vinnColor, setVinnColor] = useState(() => localStorage.getItem('vinns_quest_color') || '#00f2ff');
  const [vinn2Color, setVinn2Color] = useState(() => localStorage.getItem('vinns_quest_color2') || '#ff00ff');
  const [isTwoPlayer, setIsTwoPlayer] = useState(() => localStorage.getItem('vinns_quest_2p') === 'true');

  const t = (key: string) => {
      const i18n: any = {
          en: {
              PLAY: 'PLAY', SETTINGS: 'SETTINGS', BACK: 'BACK TO MENU', CHOOSE_COLOR: 'HERO COLOR', LANGUAGE: 'LANGUAGE',
              SELECT_LEVEL: 'SELECT LEVEL', NEXT: 'NEXT LEVEL', RESTART: 'RESTART QUEST', TRY_AGAIN: 'TRY AGAIN',
              DEFEATED: 'DEFEATED', WORLD: 'WORLD', LEVEL: 'LEVEL', COMPLETE: 'COMPLETE',
              QUEST_MODE: 'QUEST MODE', SOLO: 'SOLO', DUO: 'DUO', P1_COLOR: 'P1 COLOR', P2_COLOR: 'P2 COLOR'
          },
          es: {
              PLAY: 'JUGAR', SETTINGS: 'AJUSTES', BACK: 'VOLVER AL MENÚ', CHOOSE_COLOR: 'COLOR DEL HÉROE', LANGUAGE: 'IDIOMA',
              SELECT_LEVEL: 'ELEGIR NIVEL', NEXT: 'SIGUIENTE', RESTART: 'REINICIAR', TRY_AGAIN: 'REINTENTAR',
              DEFEATED: 'DERROTADO', WORLD: 'MUNDO', LEVEL: 'NIVEL', COMPLETE: 'COMPLETADO',
              QUEST_MODE: 'MODO DE JUEGO', SOLO: 'SOLO', DUO: 'DÚO', P1_COLOR: 'P1 COLOR', P2_COLOR: 'P2 COLOR'
          }
      };
      return i18n[language][key] || key;
  };

  const [unlockedProgress, setUnlockedProgress] = useState<{world: number, level: number}>(() => {
      const saved = localStorage.getItem('vinns_quest_progress');
      return saved ? JSON.parse(saved) : { world: 1, level: 1 };
  });

  useEffect(() => {
      localStorage.setItem('vinns_quest_progress', JSON.stringify(unlockedProgress));
      localStorage.setItem('vinns_quest_lang', language);
      localStorage.setItem('vinns_quest_color', vinnColor);
      localStorage.setItem('vinns_quest_color2', vinn2Color);
      localStorage.setItem('vinns_quest_2p', isTwoPlayer.toString());
      if (vinnRef.current) vinnRef.current.color = vinnColor;
      if (vinn2Ref.current) vinn2Ref.current.color = vinn2Color;
  }, [unlockedProgress, language, vinnColor, vinn2Color, isTwoPlayer]);
  const [currentWorld, setCurrentWorld] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  
  const vinnRef = useRef<Vinn>(new Vinn(100, 420, vinnColor, 'NORMAL', 'Vinn'));
  const vinn2Ref = useRef<Vinn>(new Vinn(150, 420, vinn2Color, 'SPIKY', 'Jhon'));
  const enemiesRef = useRef<Enemy[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const fireFlamesRef = useRef<{type:'FLAME', x:number,y:number,vx:number,vy:number,life:number}[]>([]);
  const bossProjectilesRef = useRef<{type:'FIREBALL'|'LAVA', x:number,y:number,vx:number,vy:number,life:number}[]>([]);
  const cutsceneRef = useRef<IntroCutscene>(new IntroCutscene());
  const endingRef = useRef<EndingCutscene>(new EndingCutscene());
  const musicRef = useRef<MusicManager>(new MusicManager());
  const cameraXRef = useRef(0);
  const cameraShakeRef = useRef(0);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, life: number, color?: string}[]>([]);
  const rocksRef = useRef<{x: number, y: number, vy: number}[]>([]);
  // Paint puddles: static slippery zones for Paint Land
  const paintPuddlesRef = useRef<{x: number, w: number, color: string}[]>([]);
  // Ink Colossus battle refs
  const inkProjectilesRef = useRef<{x: number, y: number, vx: number, vy: number}[]>([]);
  const levelBombsRef = useRef<{x: number, launched: boolean, vx: number, vy: number, lx: number, ly: number}[]>([]);
  const inkIntroTimerRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        setKeys(prev => ({ ...prev, [k]: true }));
        
        // Vinn (P1) Jump: W or Control
        if (k === 'w' || e.key === 'Control') {
            vinnRef.current.jump();
        }
        // Jhon (P2) Jump: ArrowUp or Shift
        if (isTwoPlayer && (e.key === 'ArrowUp' || e.key === 'Shift')) {
            vinn2Ref.current.jump();
        }
        if (e.key === ' ' && gameState === 'INTRO_CUTSCENE') {
            musicRef.current.resume();
            cutsceneRef.current.advanceDialogue();
        }
        if (e.key === ' ' && gameState === 'ENDING_CUTSCENE') {
            endingRef.current.advanceDialogue();
        }
        if (e.key === ' ' && gameState === 'INK_BOSS_INTRO') {
            inkIntroTimerRef.current = 999; // force skip
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
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
    cameraXRef.current = 0;
    enemiesRef.current = config.enemies.map((e: any) => new Enemy(e.x, 420, e.type));
    const configItems = (config.items || []) as Item[];
    itemsRef.current = configItems.map((i: Item) => ({ ...i }));
    
    if (config.isBoss) {
        bossRef.current = new Boss(1200, 460, config.bossType as BossType);
    } else {
        bossRef.current = null;
    }

    // Generate paint puddles for Paint Land
    if (worldIndex === 3) {
        const PUDDLE_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#00ff88'];
        const puddles: {x: number, w: number, color: string}[] = [];
        const levelLength = config.length as number;
        let px = 300;
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
        levelBombsRef.current = (config.bombs || []).map((b: {x: number}) => ({
            x: b.x, launched: false, vx: 0, vy: 0, lx: b.x, ly: 440
        }));
        inkIntroTimerRef.current = 0;
        setCurrentWorld(worldIndex);
        setCurrentLevel(levelIndex);
        setGameState('INK_BOSS_INTRO');
        return;
    } else {
        levelBombsRef.current = [];
    }

    setCurrentWorld(worldIndex);
    setCurrentLevel(levelIndex);
    setGameState('PLAYING');
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

    const inkChase = currentWorld === 3 && currentLevel === 5 && bossRef.current?.type === 'INK_COLOSSUS';
    const anyAiming = vinnRef.current.state === 'AIMING' || vinn2Ref.current.state === 'AIMING';

    // ─── INK BOSS INTRO CUTSCENE ───────────────────────────────────────────
    if (gameState === 'INK_BOSS_INTRO') {
        musicRef.current.update('BUT_SCREEN');
        inkIntroTimerRef.current += dt;
        const t = inkIntroTimerRef.current;
        const INTRO_DURATION = 4.0;

        // Background
        ctx.fillStyle = '#0a000f';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Ground
        ctx.fillStyle = '#1a0025';
        ctx.fillRect(0, 455, GAME_WIDTH, 45);

        // Rocks on left side (cracks open)
        const crackProgress = Math.min(1, t / 1.5);
        const rockShake = t < 1.5 ? Math.sin(t * 30) * 3 : 0;
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(500 + rockShake, 300, 200, 160); // big rock
        ctx.fillRect(580 + rockShake, 250, 100, 80);  // top rock
        // Crack glow growing from rock center
        if (t > 0.5) {
            const glow = ctx.createRadialGradient(600, 400, 0, 600, 400, 80 * crackProgress);
            glow.addColorStop(0, 'rgba(255,0,255,0.8)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(520, 300, 180, 160);
        }

        // Ink Colossus emerging (scale from 0 to 1 between t=1 and t=2.5)
        if (t > 1.0) {
            const emerge = Math.min(1, (t - 1.0) / 1.5);
            ctx.save();
            ctx.translate(620, 460 - emerge * 160);
            ctx.scale(emerge, emerge);
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff00ff';
            ctx.fillStyle = '#000';
            ctx.beginPath();
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                const r = 70 + Math.sin(Date.now()/200 + i) * 20;
                const tx = Math.cos(a) * r, ty = -60 + Math.sin(a) * r * 0.7;
                i === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty);
            }
            ctx.closePath();
            ctx.fill();
            // Dots
            ctx.fillStyle = '#ff00ff';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(-40 + i*20, -60, 7, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Door on right side
        const doorX = 100, doorY = 340;
        ctx.fillStyle = '#663300';
        ctx.fillRect(doorX, doorY, 60, 120);
        ctx.fillStyle = '#884400';
        ctx.fillRect(doorX + 4, doorY + 4, 52, 112);
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(doorX + 50, doorY + 62, 5, 0, Math.PI*2);
        ctx.fill();
        // Door glow (open)
        if (t > 0.5) {
            ctx.fillStyle = 'rgba(0,200,255,0.25)';
            ctx.fillRect(doorX + 4, doorY + 4, 52, 112);
        }

        // Vinn running toward door (starts at x=400, moves to x=135 over first 2s)
        const vinnRunX = t < 2.5
            ? Math.max(135, 400 - (t / 2.5) * 265)
            : 135;
        const legSwing = Math.sin(Date.now() / 100) * 20;
        ctx.strokeStyle = vinnColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = vinnColor;
        // Body
        ctx.beginPath(); ctx.arc(vinnRunX, doorY + 50, 10, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vinnRunX, doorY+60); ctx.lineTo(vinnRunX, doorY+90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vinnRunX, doorY+90); ctx.lineTo(vinnRunX - legSwing, doorY+120); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vinnRunX, doorY+90); ctx.lineTo(vinnRunX + legSwing, doorY+120); ctx.stroke();
        ctx.shadowBlur = 0;

        // "RUN!" text in last second
        if (t > 2.8) {
            const flashAlpha = 0.5 + 0.5 * Math.sin((t - 2.8) * 12);
            ctx.save();
            ctx.globalAlpha = flashAlpha;
            ctx.font = 'bold 64px monospace';
            ctx.fillStyle = '#ff2d55';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.textAlign = 'center';
            ctx.strokeText('RUN!', 400, 220);
            ctx.fillText('RUN!', 400, 220);
            ctx.restore();
        }

        // Bottom bar — boss name
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 470, GAME_WIDTH, 30);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ff00ff';
        ctx.textAlign = 'center';
        ctx.fillText('⚠  THE INK COLOSSUS AWAKENS  ⚠', GAME_WIDTH / 2, 488);

        // Skip hint
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'right';
        ctx.fillText('[SPACE] Skip', 795, 18);

        if (t >= INTRO_DURATION) {
            if (bossRef.current) bossRef.current.state = 'CHASING';
            setGameState('PLAYING');
        }
        return;
    }

    if (gameState === 'PLAYING' || gameState === 'TUTORIAL') {
      const tutorialPlatforms = [
          {x: 0, y: 460, w: 800, type: 'NORMAL'},
          {x: 850, y: 460, w: 400, type: 'NORMAL'},
          {x: 1300, y: 460, w: 300, type: 'NORMAL'}
      ] as Platform[];
      const activePlatforms = gameState === 'TUTORIAL' ? tutorialPlatforms : worldPlatforms;
      const activeLength = gameState === 'TUTORIAL' ? 1600 : levelConfig.length;

      const leadX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;
      let minX = 50;
      if (currentWorld === 1 && currentLevel === 5 && leadX > GAME_WIDTH) minX = GAME_WIDTH;
      
      // BOSS VS Trigger
      if (gameState === 'PLAYING' && currentLevel === 5 && leadX > GAME_WIDTH && bossRef.current && !bossRef.current.introPlayed) {
          bossRef.current.introPlayed = true;
          setGameState('BOSS_VS_CUTSCENE');
          
          // Timeout to resume gameplay
          setTimeout(() => {
              setGameState('PLAYING');
              if (bossRef.current) bossRef.current.state = bossRef.current.type === 'GOLEM' ? 'FLY_UP' : 'WALKING';
          }, 3000);
          return;
      }

      // Ink Colossus: auto-run mode — override Vinn's vx, only jump/attack input allowed
      
      const autoRunKeys = (inkChase && !anyAiming)
          ? { ...keys, 'd': true, 'a': false, 'arrowright': true, 'arrowleft': false }
          : keys;

      // P1 Update
      vinnRef.current.update(dt, autoRunKeys, activeLength - 50, activePlatforms, gameState === 'TUTORIAL' ? 0.7 : 1.0, minX);
      if (inkChase && !anyAiming) vinnRef.current.vx = Math.max(vinnRef.current.vx, 6.5); // enforce auto-run speed
      else if (anyAiming) vinnRef.current.vx = 0;

      
      // P2 Update
      if (isTwoPlayer) {
          const p2Keys = {
              'a': keys['arrowleft'], 'd': keys['arrowright'], ' ': keys['enter']
          };
          vinn2Ref.current.update(dt, p2Keys, activeLength - 50, activePlatforms, 1.0, minX);
          if (inkChase && !anyAiming) vinn2Ref.current.vx = Math.max(vinn2Ref.current.vx, 6.5);
          else if (anyAiming) vinn2Ref.current.vx = 0;

          // Revive Logic
          if (vinnRef.current.health > 0 && vinn2Ref.current.health <= 0) {
              const d = Math.abs(vinnRef.current.x - vinn2Ref.current.x) + Math.abs(vinnRef.current.y - vinn2Ref.current.y);
              if (d < 60) vinn2Ref.current.health = 5;
          }
          if (vinn2Ref.current.health > 0 && vinnRef.current.health <= 0) {
            const d = Math.abs(vinnRef.current.x - vinn2Ref.current.x) + Math.abs(vinnRef.current.y - vinn2Ref.current.y);
            if (d < 60) vinnRef.current.health = 5;
          }
      }

      const anyAlive = vinnRef.current.health > 0 || (isTwoPlayer && vinn2Ref.current.health > 0);
      
      if (vinnRef.current.y > 550 && world.theme === 'VOLCANO') vinnRef.current.health = 0;
      if (isTwoPlayer && vinn2Ref.current.y > 550 && world.theme === 'VOLCANO') vinn2Ref.current.health = 0;

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
          const checkCol = (p: any) => !item.collected && Math.abs(p.x - item.x) < 40 && Math.abs(p.y - item.y) < 40;
          if (checkCol(vinnRef.current)) {
              item.collected = true;
              vinnRef.current.hasDoubleJump = true;
              spawnParticles(item.x, item.y, '#fff');
          }
          if (isTwoPlayer && checkCol(vinn2Ref.current)) {
              item.collected = true;
              vinn2Ref.current.hasDoubleJump = true;
              spawnParticles(item.x, item.y, '#fff');
          }
      });
    }

    if (gameState === 'INTRO_CUTSCENE') {
        const finished = cutsceneRef.current.update(dt);
        musicRef.current.update(cutsceneRef.current.phase);
        if (finished === true) {
            musicRef.current.stop();
            setGameState('TUTORIAL');
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
        
        if (isInkBossActive) {
            musicRef.current.update('BUT_SCREEN');
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

        if (tutorialPhase === 0 && (keys['a'] || keys['d'])) setTutorialPhase(1);
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
            if (currentLevel < 5) setGameState('LEVEL_TRANSITION');
        } else if (bossRef.current && bossRef.current.health <= 0) {
            if (currentWorld < 3) setGameState('WORLD_COMPLETE');
            else {
                setGameState('ENDING_CUTSCENE');
            }
        }
      }

      if (gameState === 'PLAYING' && currentLevel === 5 && bossRef.current && !bossRef.current.introPlayed) {
          bossRef.current.introPlayed = true;
          setGameState('BOSS_VS_CUTSCENE');
          setTimeout(() => {
              setGameState('PLAYING');
              if (bossRef.current) bossRef.current.state = bossRef.current.type === 'GOLEM' ? 'FLY_UP' : 'WALKING';
          }, 3000);
          return;
      }

      const leadX = isTwoPlayer ? Math.max(vinnRef.current.x, vinn2Ref.current.x) : vinnRef.current.x;
      
      let targetCamX = Math.max(0, Math.min(levelConfig.length - GAME_WIDTH, leadX - GAME_WIDTH / 2));
      if (inkChase) {
          // No clamp during infinite chase
          targetCamX = Math.max(0, leadX - GAME_WIDTH / 2);

          // Treadmill Loop: if player is a bit far, shift EVERYTHING back
          // We can use 6000 as threshold, shift 4000
          if (leadX > 6000) {
              const shift = 4000;
              vinnRef.current.x -= shift; vinnRef.current.lastSafeX -= shift;
              vinn2Ref.current.x -= shift; vinn2Ref.current.lastSafeX -= shift;
              if (bossRef.current) bossRef.current.x -= shift;
              cameraXRef.current -= shift;
              targetCamX -= shift;
              particlesRef.current.forEach(p => p.x -= shift);
              rocksRef.current.forEach(r => r.x -= shift);
              paintPuddlesRef.current.forEach(p => p.x -= shift);
              inkProjectilesRef.current.forEach(p => p.x -= shift);
              levelBombsRef.current.forEach(b => { b.x -= shift; b.lx -= shift; });
              bossProjectilesRef.current.forEach(p => p.x -= shift);
              fireFlamesRef.current.forEach(f => f.x -= shift);
          }

          // Randomly spawn new things ahead of the player as they go
          // Puddles: reduced chance from 0.005 to 0.0035, added 600px spacing
          const furthestPuddle = paintPuddlesRef.current.length > 0
            ? Math.max(...paintPuddlesRef.current.map(p => p.x)) : 0;
            
          if (Math.random() < 0.0035 && furthestPuddle < leadX + 2000) { 
              const spawnX = Math.max(leadX + 800 + Math.random() * 800, furthestPuddle + 600);
              paintPuddlesRef.current.push({
                  x: spawnX,
                  w: 60 + Math.random() * 80,
                  color: ['#ff00ff', '#00ffff', '#ffff00'][Math.floor(Math.random()*3)]
              });
          }
          
          // Bombs: reduced chance from 0.003 to 0.002, added 1500px spacing
          const bombsAhead = levelBombsRef.current.filter(b => b.lx > leadX && !b.launched).length;
          const furthestBomb = levelBombsRef.current.length > 0
            ? Math.max(...levelBombsRef.current.map(b => b.lx)) : 0;

          if (bombsAhead < 2 && Math.random() < 0.002 && furthestBomb < leadX + 3000) {
              const spawnX = Math.max(leadX + 1200 + Math.random() * 600, furthestBomb + 1500);
              levelBombsRef.current.push({
                  x: spawnX,
                  launched: false, vx: 0, vy: 0, 
                  lx: spawnX, 
                  ly: 440
              });
          }

          // Cleanup far-behind objects
          paintPuddlesRef.current = paintPuddlesRef.current.filter(p => p.x > cameraXRef.current - 1000);
          levelBombsRef.current = levelBombsRef.current.filter(b => b.lx > cameraXRef.current - 1000);
          inkProjectilesRef.current = inkProjectilesRef.current.filter(p => p.x > cameraXRef.current - 1000);
      }
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;
      
      // ENEMIES, BOSS & PROJECTILES UPDATE (ONLY IF NOT AIMING)
      if (!anyAiming) {
          // Render Rocks (Golem)
          rocksRef.current = rocksRef.current.filter(rock => {
              rock.y += rock.vy;
              rock.vy += 0.5;

              const rockHitsPlayer = (p: {x: number, y: number, isHit: boolean, takeDamage: Function}) => {
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
              bossRef.current.update(dt, bTargetX);
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
                if (proj.y >= 460) {
                    // Splat → convert to paint puddle
                    paintPuddlesRef.current.push({
                        x: proj.x - 40,
                        w: 80 + Math.random() * 40,
                        color: PUDDLE_COLORS_INK[Math.floor(Math.random() * PUDDLE_COLORS_INK.length)]
                    });
                    cameraShakeRef.current = 4;
                    return false;
                }
                return proj.x > cameraXRef.current - 100 && proj.x < cameraXRef.current + 900;
            });

          }
      } // End anyAiming check for updates (boss projectiles, etc)

      // --- INK COLOSSUS AIMING & BOMB PHYSICS (Always update even if world is paused) ---
      const updateBombAiming = (p: typeof vinnRef.current, attackKey: string) => {
          const isDown = keys[attackKey];
          const boss = bossRef.current;
          if (!inkChase || !boss) return;

          // Start Aiming
          if (isDown && p.state !== 'AIMING') {
              levelBombsRef.current.forEach(bomb => {
                  if (bomb.launched) return;
                  if (Math.abs(p.x - bomb.lx) < 80 && Math.abs(p.y - bomb.ly) < 60) {
                      p.state = 'AIMING';
                      p.aimTimer = 0;
                      boss.enterBombStun();
                      boss.bombStunTimer = 0; 
                  }
              });
          }

          // Launch on Release
          if (!isDown && p.state === 'AIMING') {
              levelBombsRef.current.forEach(bomb => {
                  if (bomb.launched) return;
                  if (Math.abs(p.x - bomb.lx) < 120 && Math.abs(p.y - bomb.ly) < 100) {
                      bomb.launched = true;
                      const launchSpeed = 16;
                      bomb.vx = Math.cos(p.aimAngle) * launchSpeed * p.direction;
                      bomb.vy = Math.sin(p.aimAngle) * launchSpeed;
                      p.state = 'IDLE';
                      spawnParticles(bomb.lx, bomb.ly, '#ffcc00');
                  }
              });
              if (p.state === 'AIMING') p.state = 'IDLE'; 
          }
      };

      const attackKey1 = ' ';
      const attackKey2 = 'enter';
      updateBombAiming(vinnRef.current, attackKey1);
      if (isTwoPlayer) updateBombAiming(vinn2Ref.current, attackKey2);

      // Update launched bombs
      levelBombsRef.current.forEach(bomb => {
          if (!bomb.launched) return;
          bomb.vy += 0.5;
          bomb.lx += bomb.vx;
          bomb.ly += bomb.vy;
          if (bomb.ly >= 455) { bomb.ly = 455; bomb.vy *= -0.4; bomb.vx *= 0.85; }
          if (bossRef.current && Math.abs(bomb.lx - bossRef.current.x) < 80 && Math.abs(bomb.ly - (bossRef.current.y - 100)) < 80) {
              bossRef.current.enterBombStun();
              bomb.vx = 0; bomb.vy = 0;
              spawnParticles(bomb.lx, bomb.ly, '#ff00ff');
              bomb.launched = false;
              bomb.lx = -999; 
          }
      });

            // Player attacks boss dots during BOMB_STUNNED
            const boss = bossRef.current;
            if (boss) {
                const checkDotHit = (player: typeof vinnRef.current) => {
                    if (player.state !== 'ATTACKING' || player.attackTimer > 0.15) return;
                    if (Math.abs(player.x - boss.x) < 150 && Math.abs(player.y - (boss.y - 100)) < 130) {
                        if (boss.takeBombHit()) {
                            spawnParticles(boss.x, boss.y - 100, '#ff00ff');
                            cameraShakeRef.current = 8;
                        }
                    }
                };
                checkDotHit(vinnRef.current);
                if (isTwoPlayer) checkDotHit(vinn2Ref.current);

                // Victory — boss defeated
                if (boss.state === 'DEFEATED' && boss.health <= 0) {
                    setTimeout(() => setGameState('WORLD_COMPLETE'), 1500);
                }

                // Camera locks on both player AND boss during stun
                if (boss.state === 'BOMB_STUNNED') {
                    const midX = (vinnRef.current.x + boss.x) / 2;
                    cameraXRef.current += (Math.max(0, midX - 400) - cameraXRef.current) * 0.05;
                }
            }

      // Boss collision with players (still active but movement frozen if anyAiming)
      if (bossRef.current) {
          const dx = Math.abs(bossRef.current.x - vinnRef.current.x);
          const dy = Math.abs(bossRef.current.y - vinnRef.current.y);
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

function spawnParticles(x: number, y: number, color?: string) {
    for(let i=0; i<8; i++) {
        particlesRef.current.push({
            x: x, y: y, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 10, life: 1, color: color || '#ffcc00'
        });
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

    const camX = cameraXRef.current;
    
    if (gameState === 'START_MENU') {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
            grad.addColorStop(0, '#151833');
            grad.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = grad; 
            ctx.fillRect(-50, -50, GAME_WIDTH + 100, GAME_HEIGHT + 100); // Oversized for shake
            ctx.fillStyle = '#10101a'; ctx.fillRect(0, 420, GAME_WIDTH, 80);
            vinnRef.current.x = GAME_WIDTH / 2; vinnRef.current.y = 420;
            vinnRef.current.draw(ctx, 0);
        }
        return;
    }
    if (gameState === 'INTRO_CUTSCENE') {
        cutsceneRef.current.draw(ctx);
        return;
    }
    if (gameState === 'ENDING_CUTSCENE') {
        endingRef.current.draw(ctx);
        return;
    }

    const currentTheme = (gameState === 'TUTORIAL') ? 'FOREST' : world.theme;
    if (currentTheme === 'FOREST') ctx.fillStyle = '#1a2e1a';
    else if (currentTheme === 'VOLCANO') {
        const grad = ctx.createLinearGradient(0, 0, 0, 500);
        grad.addColorStop(0, '#2b0a0a');
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
    }
    else ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-50, -50, GAME_WIDTH + 100, GAME_HEIGHT + 100);

    if (currentTheme === 'VOLCANO') {
        ctx.fillStyle = '#1a0505';
        for(let i=0; i<3; i++) {
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
        for(let i=0; i<5; i++) {
            ctx.fillRect(1400 + Math.sin(Date.now()/500+i)*50, 440 + Math.cos(i)*10, 15, 5);
        }
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for(let i = -camX % 160; i < canvas.width; i += 160) {
        for (let j = 0; j < canvas.height; j += 160) {
            if ((Math.floor((i + camX) / 160) + Math.floor(j / 160)) % 2 === 0) ctx.fillRect(i, j, 160, 160);
        }
    }
    
    const visiblePlatforms = (gameState === 'TUTORIAL') ? 
        [{x: 0, y: 460, w: 800, type: 'NORMAL'}, {x: 850, y: 460, w: 400, type: 'NORMAL'}, {x: 1300, y: 460, w: 300, type: 'NORMAL'}] : 
        worldPlatforms;

    visiblePlatforms.forEach((p: Platform) => {
        ctx.save();
        if (p.type === 'MUSHROOM') {
            ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.ellipse(p.x - camX + p.w/2, p.y + 10, p.w/2, 20, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x - camX + p.w/2, p.y + 5, 10, 0, Math.PI*2); ctx.fill();
        } else if (p.type === 'PAINT') {
            const gradient = ctx.createLinearGradient(0, p.y, 0, p.y + 20);
            gradient.addColorStop(0, '#ff00ff'); gradient.addColorStop(1, '#00ffff');
            ctx.fillStyle = gradient; ctx.fillRect(p.x - camX, p.y, p.w, 20);
        } else {
            ctx.fillStyle = (currentTheme === 'FOREST') ? '#4d2600' : (currentTheme === 'VOLCANO' ? '#222' : '#444');
            ctx.fillRect(p.x - camX, p.y, p.w, 15);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(p.x - camX, p.y, p.w, 15);
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
            ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
            const hover = Math.sin(Date.now()/200) * 10;
            ctx.beginPath(); ctx.arc(item.x - camX, item.y + hover, 8, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
    });

    rocksRef.current.forEach(rock => {
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(rock.x - camX, rock.y, 15, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        if (rock.y < 460) {
            const scale = Math.max(0, rock.y / 460);
            ctx.beginPath();
            ctx.ellipse(rock.x - camX, 460, 15 * scale, 5 * scale, 0, 0, Math.PI*2);
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
        ctx.arc(sx, proj.y, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(sx + 3, proj.y - 4, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    });

    // Ink Colossus: draw bombs
    levelBombsRef.current.forEach(bomb => {
        if (bomb.lx < -500) return;
        const sx = bomb.lx - camX;
        const sy = bomb.ly;
        const bobble = Math.sin(Date.now() / 300) * 3;
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffcc00';
        ctx.fillStyle = '#cc6600';
        ctx.fillRect(sx - 16, sy - 28 + bobble, 32, 28);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - 16, sy - 28 + bobble, 32, 28);
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffcc00';
        ctx.textAlign = 'center';
        ctx.fillText('TNT', sx, sy - 12 + bobble);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 28 + bobble);
        ctx.lineTo(sx + 5, sy - 36 + bobble);
        ctx.stroke();
        ctx.fillStyle = '#ff8800';
        ctx.shadowColor = '#ff8800';
        ctx.beginPath();
        ctx.arc(sx + 5, sy - 38 + bobble, 3, 0, Math.PI*2);
        ctx.fill();
        if (!bomb.launched && Math.abs((vinnRef.current.x - camX) - sx) < 80) {
            ctx.shadowBlur = 0;
            ctx.font = '9px monospace';
            ctx.fillStyle = '#ffcc00';
            ctx.fillText('[ATTACK]', sx, sy - 48 + bobble);
        }
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
        if (hitsPlayer(vinnRef.current)) {
            flame.life = 0;
        }
        if (isTwoPlayer && hitsPlayer(vinn2Ref.current)) {
            flame.life = 0;
        }

        ctx.fillStyle = '#ff9a00';
        ctx.beginPath();
        ctx.arc(flame.x - camX, flame.y, 12, 0, Math.PI * 2);
        ctx.fill();

        return flame.life > 0 && flame.y < 560;
    });

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

    vinnRef.current.draw(ctx, camX);
    if (isTwoPlayer) vinn2Ref.current.draw(ctx, camX);
    if (gameState === 'TUTORIAL') {
        enemiesRef.current.forEach(e => e.draw(ctx, camX));
    }
    if (gameState === 'PLAYING') {
        enemiesRef.current.forEach(e => e.health > 0 && e.draw(ctx, camX));
        if (bossRef.current && bossRef.current.health > 0) bossRef.current.draw(ctx, camX);
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
      ctx.beginPath(); ctx.arc(p.x - camX, p.y, 3, 0, Math.PI * 2); ctx.fill();
      return p.life > 0;
    });
    
    ctx.restore();
  });

  return (
    <div className="game-container">
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
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <p style={{fontFamily: 'var(--font-retro)', fontSize: '10px', marginTop: '5px'}}>
               P1: {Math.ceil(vinnRef.current.health)}/{vinnRef.current.maxHealth}
               {isTwoPlayer && ` | P2: ${Math.ceil(vinn2Ref.current.health)}/${vinn2Ref.current.maxHealth}`}
            </p>
            {vinnRef.current.hasDoubleJump && <span className="key-box" style={{background: '#00f2ff', color: '#000'}}>DOUBLE_JUMP</span>}
          </div>
        </div>
        )}

        <div className="center">
          {gameState === 'START_MENU' && (
              <div className="menu-overlay">
                  <div className="menu-background">
                      <div className="cloud" style={{width: 100, height: 40, top: 50, left: -200, animationDuration: '40s'}}></div>
                      <div className="cloud" style={{width: 150, height: 60, top: 120, left: -200, animationDuration: '30s', animationDelay: '10s'}}></div>
                  </div>

                  <div className="play-cluster">
                      <div className="btn-circle" title={t('SETTINGS')} onClick={() => setGameState('SETTINGS')}><span style={{fontSize: '2rem'}}>⚙</span></div>
                      <div className="btn-circle btn-play" onClick={() => { musicRef.current.resume(); setGameState('INTRO_CUTSCENE'); }}>
                          <div className="play-icon"></div>
                      </div>
                  </div>
                  
                  <button 
                    className="level-btn" 
                    style={{ 
                        position: 'absolute',
                        top: '75%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '12px 24px', 
                        fontSize: '11px', 
                        borderColor: '#ff00ff',
                        color: '#ff00ff',
                        width: 'auto',
                        height: 'auto',
                        minWidth: '220px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 1000,
                        background: 'rgba(0,0,0,0.6)',
                        border: '3px solid #ff00ff',
                        borderRadius: '8px'
                    }} 
                    onClick={(e) => {
                        e.stopPropagation();
                        musicRef.current.resume();
                        loadLevel(3, 5);
                    }}
                  >
                    TRANSFER TO INK COLOSSUS
                  </button>
              </div>
          )}

          {gameState === 'SETTINGS' && (
             <div className="menu-overlay level-selector-overlay" style={{background: 'rgba(0,0,0,0.9)'}}>
                 <div className="selector-content" style={{gap: '1.5rem'}}>
                     <h2 style={{fontFamily: 'var(--font-retro)', color: '#ffcc00'}}>{t('SETTINGS')}</h2>

                     <div style={{textAlign: 'center'}}>
                         <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: '#00f2ff'}}>{t('QUEST_MODE')}</p>
                         <div style={{display: 'flex', gap: '1rem'}}>
                             <button className={`level-btn ${!isTwoPlayer ? '' : 'locked'}`} style={{fontSize: '10px'}} onClick={() => setIsTwoPlayer(false)}>{t('SOLO')}</button>
                             <button className={`level-btn ${isTwoPlayer ? '' : 'locked'}`} style={{fontSize: '10px'}} onClick={() => setIsTwoPlayer(true)}>{t('DUO')}</button>
                         </div>
                     </div>
                     
                     <div style={{display: 'flex', gap: '2rem'}}>
                        <div style={{textAlign: 'center'}}>
                            <p style={{fontSize: '0.8rem', marginBottom: '0.5rem', color: vinnColor}}>{t('P1_COLOR')}</p>
                            <input 
                                type="color" 
                                value={vinnColor} 
                                onChange={(e) => setVinnColor(e.target.value)}
                                style={{width: '60px', height: '40px', border: '2px solid #fff', cursor: 'pointer', background: 'none'}}
                            />
                        </div>
                        {isTwoPlayer && (
                            <div style={{textAlign: 'center'}}>
                                <p style={{fontSize: '0.8rem', marginBottom: '0.5rem', color: vinn2Color}}>{t('P2_COLOR')}</p>
                                <input 
                                    type="color" 
                                    value={vinn2Color} 
                                    onChange={(e) => setVinn2Color(e.target.value)}
                                    style={{width: '60px', height: '40px', border: '2px solid #fff', cursor: 'pointer', background: 'none'}}
                                />
                            </div>
                        )}
                     </div>

                     <div style={{textAlign: 'center'}}>
                         <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: '#00f2ff'}}>{t('LANGUAGE')}</p>
                         <div style={{display: 'flex', gap: '1rem'}}>
                             <button className={`level-btn ${language === 'en' ? '' : 'locked'}`} onClick={() => setLanguage('en')}>EN</button>
                             <button className={`level-btn ${language === 'es' ? '' : 'locked'}`} onClick={() => setLanguage('es')}>ES</button>
                         </div>
                     </div>
                     
                     <button className="back-btn" onClick={() => setGameState('START_MENU')}>{t('BACK')}</button>
                 </div>
             </div>
          )}

          {gameState === 'LEVEL_SELECTOR' && (
              <div className="menu-overlay level-selector-overlay" style={{background: 'rgba(0,0,0,0.85)'}}>
                  <div className="selector-content">
                      <h2 style={{fontFamily: 'var(--font-retro)', color: '#ffcc00', marginBottom: '2rem'}}>SELECT LEVEL</h2>
                      
                      {[1, 2, 3].map(w => (
                          <div key={w} className="world-row">
                              <h3 style={{fontSize: '0.8rem', color: '#00f2ff', textAlign: 'left', marginBottom: '1rem'}}>
                                  WORLD {w}: {w === 1 ? 'FOREST' : w === 2 ? 'VOLCANO' : 'PAINT LAND'}
                              </h3>
                              <div className="level-grid">
                                  {[1, 2, 3, 4, 5].map(l => {
                                      const isUnlocked = w < unlockedProgress.world || (w === unlockedProgress.world && l <= unlockedProgress.level);
                                      return (
                                          <button 
                                              key={l}
                                              className={`level-btn ${!isUnlocked ? 'locked' : ''}`}
                                              disabled={!isUnlocked}
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
                 <style dangerouslySetInnerHTML={{__html: `
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
              <h2 style={{color: '#ffcc00'}}>ULTIMATE VICTORY</h2>
              <button onClick={() => window.location.reload()}>RESTART QUEST</button>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="tutorial-card" style={{borderColor: '#ff2d55'}}>
              <h2>DEFEATED</h2>
              <button onClick={() => loadLevel(currentWorld, currentLevel)}>TRY AGAIN</button>
            </div>
          )}
        </div>
        <div className="controls-hint"><span>[WASD] MOVE/JUMP</span><span>[SPACE] ATTACK</span></div>
      </div>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{border: '4px solid #333'}} />
    </div>
  );
}

export default App;
