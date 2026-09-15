# Vinn's Quest

A vibrant, retro-inspired 2D action-platformer built with React, TypeScript, and the HTML5 Canvas API.

![Vinn's Quest](<img width="824" height="511" alt="image" src="https://github.com/user-attachments/assets/5a6a7fc1-d059-49ea-a022-775ed804dcbd" />
)

# Alert!
This game is in 1.0 so there will be many errors and bugs. Please be patient as I work on improving the game.

## 📖 The Story

Join **Vinn**, a brave knight, on a high-stakes journey across three dangerous worlds to rescue the Queen. After being snatched away by a mechanical menace, the Queen is taken through a portal to the surreal **Paint Land**.

Along the way, Vinn must outsmart and defeat cunning guardians, culminating in a final showdown against the titan of ink, the **Ink Colossus**. But victory is just the beginning. As the castle crumbles and the exits are demolished, Vinn and the Queen must race against time to reach the main entrance before they are trapped forever!

## 🎮 Features

- **Three Unique Worlds**:
  - 🌲 **The Forest**: A dense woodland filled with tech-skeletons and hidden secrets.
  - 🌋 **Volcano Realm**: A perilous land of lava and intense heat.
  - 🎨 **Paint Land**: A surreal world where the ground itself can be a hazard.
- **Epic Boss Battles**: Face off against the **Golem**, the **Blaze King**, and the titan of the ink, the **Ink Colossus**.
- **Dynamic Gameplay**:
  - **3D Stone Smash**: A first-person reflexive minigame where you slash flying boulders in 3D space.
  - **The escape**: A high-stakes, time-limited finale featuring a **Fear Bar** that increases as the castle crumbles around you.
  - **Local Persistence**: A robust save system that tracks level progress and minigame high scores. Use the **CONTINUE** button to resume your journey.
  - **Two-Player Mode**: Play solo or in 'Duo' mode with a friend, featuring customizable hero colors.
  - **Bilingual**: Full support for both **English** and **Spanish**.
- **Cinematic Narrative**: Fully animated cutscenes, including a dramatic post-boss escape sequence where a bandaged Ink Colossus attempts to trap Vinn in his crumbling fortress.
- **Retro Aesthetics**: Glowing neon visuals, particle effects, and a custom "Press Start 2P" inspired UI.

## ⌨️ Controls

| Action | Player 1 | Player 2 / Alternative |
| :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` | `Left` / `Right` Arrow Keys |
| **Jump** | `W` | `Up` Arrow |
| **Attack / Advance** | `Space` | `Enter` |
| **Crouch and crawl** | `C` | `Down` Arrow |
| **Read / enter a door / activate switch** | `E` | Mobile `E / USE` button |
| **Skip Cutscene** | Click Button | |
| **3D Slash** | `Mouse Click` | (Move cursor to aim) |

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Rendering**: HTML5 Canvas API
- **Styling**: Vanilla CSS with custom design tokens

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Vinn's Quest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Forest encounters / Encuentros del bosque

- **EN:** Level 3's door leads into the bear cave. Jump the wave when the bear raises its front paws and stomps. After Duff's level-4 defeat, advance his warning with Space/E to see him escape through a window. Enter the level-8 fortress gate with E: Golem and Duff arrive together, Golem's landings send waves left and right, and Duff throws swords from the gallery. Defeat the room's boss to open its exit. Retries after entering restart the encounter, not the whole forest approach. The world map plays `Map.mp3`.
- **ES:** La puerta del nivel 3 lleva a la cueva del oso. Salta la onda cuando levante las patas delanteras y golpee el suelo. Tras vencer a Duff en el nivel 4, avanza su aviso con Espacio/E para verlo escapar por la ventana. Entra por la puerta de la fortaleza del nivel 8 con E: el Golem y Duff llegan juntos; los aterrizajes del Golem crean ondas hacia ambos lados y Duff lanza espadas desde la galería. Vence al jefe para abrir la salida. Al reintentar, vuelves al encuentro sin repetir el camino del bosque. El mapa reproduce `Map.mp3`.

### Regression checks

Run `node scripts/test-forest.cjs`, `node scripts/test-cutscenes.cjs`, and `node scripts/test-music.cjs`, then `npm run build`.
With Vite running, `/scripts/encounter-qa.html` is an isolated visual/mechanics test page using the real encounter classes; it does not read or change save data and is not a full-game playthrough. Its “Duff final hit” button seeds the last hit specifically to test his escape. This page is not included in the production build.

## Recovery and Volcano Realm / Recuperación y mundo volcánico

- **Music / Música:** `Volcano _land.mp3` loops during Volcano exploration. `small_boss.mp3` loops for the bear, Duff, and Living Volcano; `Big_Boss.mp3` loops for Golem, Blaze King, and Ink Colossus. Exploration resumes after fights; tracks never restart between boss rounds. `Winning.MP3` remains non-looping and plays once per level clear. / `Volcano _land.mp3` suena en bucle al explorar el mundo volcánico. `small_boss.mp3` acompaña al oso, Duff y el Volcán Viviente; `Big_Boss.mp3` al Golem, Rey de Fuego y Coloso de Tinta. La música de exploración regresa tras el combate; las rondas del jefe no reinician la canción. `Winning.MP3` sigue sonando una sola vez por nivel superado.

- **EN:** Entering a boss fight restores both players to full health. Rest on solid ground without moving or attacking for five seconds, then recover one HP per second. Damage interrupts recovery. Clearing the Forest leads to Vinn planting a bomb on its map, running offscreen, and revealing the ten-level Volcano map. The second story cutscene plays the first time you enter Volcano level 1. Progress and cleared markers are saved separately for both maps.
- **ES:** Al entrar en una pelea de jefe, ambos jugadores recuperan toda la vida. Descansa en suelo firme sin moverte ni atacar durante cinco segundos para recuperar un punto de vida por segundo. Recibir daño interrumpe la recuperación. Tras superar el bosque, Vinn coloca una bomba en el mapa y sale de la pantalla; la explosión revela el mapa volcánico de diez niveles. La segunda escena de la historia aparece al entrar por primera vez en el nivel volcánico 1. Cada mapa guarda su progreso y los niveles superados.
- **EN:** Level 5 is the 120-HP Living Volcano: arcing fireballs, a 1.8-second beam warning, a 1.5-second mouth beam, then five seconds to strike its exposed ground-level core. Hold C (Player 2: Down) to duck beneath the beam. At level 10, Blaze King replaces his below-40%-health rage boost with a rise → volcano beam → dizzy return sequence. Normal attacks resume between repeated assists. Both fights have animated pixel emblems, and level 5 has its own map icon. Boss entrances clear ordinary enemies and leftover projectiles, preserving the encounter boss and scripted partners such as Duff.
- **ES:** El nivel 5 contiene al Volcán Viviente, con 120 puntos de vida: bolas de fuego en arco, un aviso de 1,8 segundos, un rayo de 1,5 segundos y cinco segundos para golpear su núcleo expuesto en el suelo. Mantén C (jugador 2: Abajo) para agacharte bajo el rayo. En el nivel 10, cuando le queda menos del 40 % de vida, el Rey de Fuego sustituye su enfado por una subida → rayo del volcán → regreso mareado. Repite la ayuda del volcán entre ciclos de ataques normales. Ambos jefes tienen emblemas animados y el nivel 5 tiene un icono propio en el mapa. Al entrar en una pelea se eliminan los enemigos comunes y sus proyectiles; se conservan el jefe y sus compañeros de combate, como Duff.

`/scripts/volcano-qa.html` tests the real boss, map, transition, and emblem renderers without save data. The Blaze button seeds 59 HP to exercise the assist threshold. This is an isolated test scene, not a full-game playthrough, and is excluded from production builds. `node scripts/test-forest.cjs` also checks recovery, all ten routes, boss cycles, core damage, co-op beam collision, and refresh-rate independence.

## 📜 License

This project is licensed under the MIT License.
