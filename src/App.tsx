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
      { length: 2400, enemies: [1000, 1800], platforms: [{x: 0, y: 460, w: 400}, {x: 500, y: 400, w: 100}, {x: 700, y: 350, w: 100}, {x: 900, y: 300, w: 100}, {x: 1100, y: 460, w: 1300}], items: [] },
      { length: 3000, enemies: [1200, 2200], platforms: [{x: 0, y: 460, w: 600}, {x: 700, y: 400, w: 100}, {x: 900, y: 350, w: 100}, {x: 1100, y: 300, w: 100}, {x: 1400, y: 460, w: 1600}], items: [] },
      { length: 3600, enemies: [1200, 2000, 2800], platforms: [{x: 0, y: 460, w: 1000}, {x: 1100, y: 350, w: 100}, {x: 1300, y: 250, w: 200}, {x: 1600, y: 460, w: 2000}], items: [] },
      { length: 3000, enemies: [1000, 2000], platforms: [{x: 0, y: 460, w: 800}, {x: 1000, y: 300, w: 100}, {x: 1200, y: 200, w: 100}, {x: 1500, y: 460, w: 1500}], items: [] },
      { length: 1600, enemies: [], platforms: [{x: 0, y: 460, w: 1600}], isBoss: true, bossType: 'BLAZE_KING' }
    ]
  },
  3: {
    theme: 'PAINT_LAND',
    levels: [
      { length: 2400, enemies: [1000, 2000], platforms: [{x: 0, y: 460, w: 800}, {x: 800, y: 400, w: 400, type: 'PAINT'}, {x: 1200, y: 460, w: 1200}], items: [] },
      { length: 3000, enemies: [800, 2400], platforms: [{x: 0, y: 460, w: 500}, {x: 500, y: 350, w: 200, type: 'PAINT'}, {x: 800, y: 460, w: 500}, {x: 1300, y: 300, w: 300, type: 'PAINT'}, {x: 1700, y: 460, w: 1300}], items: [] },
      { length: 3600, enemies: [1000, 2000, 3000], platforms: [{x: 0, y: 460, w: 1000}, {x: 1100, y: 300, w: 400, type: 'PAINT'}, {x: 1600, y: 460, w: 2000}], items: [] },
      { length: 4000, enemies: [1000, 2500], platforms: [{x: 0, y: 460, w: 1500}, {x: 1600, y: 250, w: 800, type: 'PAINT'}, {x: 2500, y: 460, w: 1500}], items: [] },
      { length: 1600, enemies: [], platforms: [{x: 0, y: 460, w: 1600}], isBoss: true, bossType: 'INK_COLOSSUS' }
    ]
  }
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tutorialPhase, setTutorialPhase] = useState(0);
  const [gameState, setGameState] = useState<'INTRO_CUTSCENE' | 'TUTORIAL' | 'PLAYING' | 'GAMEOVER' | 'LEVEL_TRANSITION' | 'WORLD_COMPLETE' | 'ENDING_CUTSCENE' | 'GAME_WON'>('INTRO_CUTSCENE');
  const [currentWorld, setCurrentWorld] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  
  const vinnRef = useRef<Vinn>(new Vinn(100, 420));
  const enemiesRef = useRef<Enemy[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const cutsceneRef = useRef<IntroCutscene>(new IntroCutscene());
  const endingRef = useRef<EndingCutscene>(new EndingCutscene());
  const musicRef = useRef<MusicManager>(new MusicManager());
  const cameraXRef = useRef(0);
  const cameraShakeRef = useRef(0);
  const particlesRef = useRef<{x: number, y: number, vx: number, vy: number, life: number, color?: string}[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
        if (e.key === 'w' || e.key === 'ArrowUp' || e.key === 'Control') {
            vinnRef.current.jump();
        }
        if (e.key === ' ' && gameState === 'INTRO_CUTSCENE') {
            musicRef.current.resume();
            cutsceneRef.current.advanceDialogue();
        }
        if (e.key === ' ' && gameState === 'ENDING_CUTSCENE') {
            endingRef.current.advanceDialogue();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const loadLevel = (worldIndex: number, levelIndex: number) => {
    const world = WORLD_CONFIGS[worldIndex];
    const config = world.levels[levelIndex - 1];
    vinnRef.current.x = 100;
    vinnRef.current.y = 400;
    vinnRef.current.health = vinnRef.current.maxHealth;
    cameraXRef.current = 0;
    enemiesRef.current = config.enemies.map((e: any) => new Enemy(e.x, 420, e.type));
    itemsRef.current = (config.items || []).map(i => ({ ...i }));
    
    if (config.isBoss) {
        bossRef.current = new Boss(1200, 460, config.bossType as BossType);
    } else {
        bossRef.current = null;
    }

    setCurrentWorld(worldIndex);
    setCurrentLevel(levelIndex);
    setGameState('PLAYING');
  };

  useGameLoop((dt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const world = WORLD_CONFIGS[currentWorld];
    const levelConfig = world.levels[currentLevel - 1];
    const platforms = levelConfig.platforms || [];

    if (gameState === 'PLAYING' || gameState === 'TUTORIAL') {
      vinnRef.current.update(dt, keys, levelConfig.length - 50, platforms, gameState === 'TUTORIAL' ? 0.7 : 1.0);
      
      if (vinnRef.current.health <= 0) {
        setGameState('GAMEOVER');
      }

      itemsRef.current.forEach(item => {
          if (!item.collected && Math.abs(vinnRef.current.x - item.x) < 40 && Math.abs(vinnRef.current.y - item.y) < 40) {
              item.collected = true;
              if (item.type === 'DOUBLE_JUMP') vinnRef.current.hasDoubleJump = true;
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
    } else if (gameState === 'TUTORIAL') {
        const tutorialPlatforms = [
            {x: 0, y: 460, w: 800, type: 'NORMAL'},
            {x: 850, y: 460, w: 400, type: 'NORMAL'},
            {x: 1300, y: 460, w: 300, type: 'NORMAL'}
        ] as Platform[];
        vinnRef.current.update(dt, keys, 1600, tutorialPlatforms, 0.7);
        
        if (!enemiesRef.current.length) {
            enemiesRef.current = [new Enemy(600, 420, 'TECH')];
        }
        const techSkeleton = enemiesRef.current[0];
        techSkeleton.update(dt, vinnRef.current.x);

        if (tutorialPhase === 0 && (keys['a'] || keys['d'])) setTutorialPhase(1);
        if (tutorialPhase === 1 && vinnRef.current.y < 400) setTutorialPhase(2);

        if (vinnRef.current.state === 'ATTACKING' && vinnRef.current.attackTimer < 0.1) {
            if (Math.abs(vinnRef.current.x - techSkeleton.x) < 80 && !techSkeleton.isHit) {
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

      const targetCamX = Math.max(0, Math.min(levelConfig.length - 800, vinnRef.current.x - 400));
      cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;

      enemiesRef.current.forEach(enemy => {
        enemy.update(dt, vinnRef.current.x);
        if (Math.abs(enemy.x - vinnRef.current.x) < 40 && enemy.state === 'ATTACKING' && enemy.attackTimer < 0.1) {
          vinnRef.current.takeDamage(1);
        }
      });

      if (bossRef.current) {
          bossRef.current.update(dt, vinnRef.current.x);
          if (bossRef.current.health > 0 && Math.abs(bossRef.current.x - vinnRef.current.x) < 100) {
              if (bossRef.current.state === 'ATTACKING' && bossRef.current.attackTimer > 0.8 && bossRef.current.attackTimer < 1.0) {
                  const dir = vinnRef.current.x > bossRef.current.x ? 1 : -1;
                  vinnRef.current.takeDamage(2, dir, 12);
                  cameraShakeRef.current = 15;
              }
          }
      }

      if (vinnRef.current.state === 'ATTACKING' && vinnRef.current.attackTimer < 0.1) {
        enemiesRef.current.forEach(enemy => {
          if (Math.abs(vinnRef.current.x - enemy.x) < 80 && !enemy.isHit && enemy.health > 0) {
            enemy.takeDamage();
            spawnParticles(enemy.x, enemy.y);
          }
        });
        if (bossRef.current && Math.abs(vinnRef.current.x - bossRef.current.x) < 100 && !bossRef.current.isHit && bossRef.current.health > 0) {
            bossRef.current.takeDamage(1);
            spawnParticles(bossRef.current.x, bossRef.current.y, '#fff');
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (cameraShakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * cameraShakeRef.current;
        const sy = (Math.random() - 0.5) * cameraShakeRef.current;
        ctx.translate(sx, sy);
        cameraShakeRef.current *= 0.9;
        if (cameraShakeRef.current < 0.5) cameraShakeRef.current = 0;
    }

    const camX = cameraXRef.current;
    
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
    else if (currentTheme === 'VOLCANO') ctx.fillStyle = '#2e1a1a';
    else ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    
    const activePlatforms = (gameState === 'TUTORIAL') ? 
        [{x: 0, y: 460, w: 800, type: 'NORMAL'}, {x: 850, y: 460, w: 400, type: 'NORMAL'}, {x: 1300, y: 460, w: 300, type: 'NORMAL'}] : 
        platforms;

    activePlatforms.forEach(p => {
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

    itemsRef.current.forEach(item => {
        if (!item.collected) {
            ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
            const hover = Math.sin(Date.now()/200) * 10;
            ctx.beginPath(); ctx.arc(item.x - camX, item.y + hover, 8, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
    });

    if (currentTheme === 'VOLCANO') {
        ctx.fillStyle = '#ff4500'; ctx.globalAlpha = 0.5; ctx.fillRect(0, 480, 800, 20); ctx.globalAlpha = 1.0;
    }

    vinnRef.current.draw(ctx, camX);
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
  });

  return (
    <div className="game-container">
      <div className="hud">
        {gameState !== 'INTRO_CUTSCENE' && (
        <div className="header">
          <h1 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '4px', color: '#00f2ff' }}>
            VINN'S QUEST {gameState !== 'TUTORIAL' && `- W${currentWorld}-L${currentLevel}`}
          </h1>
          <div className="health-bar">
            <div className="health-fill" style={{ width: `${Math.max(0, (vinnRef.current.health / vinnRef.current.maxHealth) * 100)}%` }}></div>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <p style={{fontFamily: 'var(--font-retro)', fontSize: '10px', marginTop: '5px'}}>HP: {Math.ceil(vinnRef.current.health)}/{vinnRef.current.maxHealth}</p>
            {vinnRef.current.hasDoubleJump && <span className="key-box" style={{background: '#00f2ff', color: '#000'}}>DOUBLE_JUMP</span>}
          </div>
        </div>
        )}

        <div className="center">
          {gameState === 'INTRO_CUTSCENE' && (
              <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'auto' }}>
                  <button onClick={() => { musicRef.current.stop(); setGameState('TUTORIAL'); }}>SKIP CUTSCENE</button>
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
      <canvas ref={canvasRef} width={800} height={500} style={{border: '4px solid #333'}} />
    </div>
  );
}

export default App;
