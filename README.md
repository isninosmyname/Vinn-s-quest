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

Run `node scripts/test-forest.cjs` and `node scripts/test-cutscenes.cjs`, then `npm run build`.
With Vite running, `/scripts/encounter-qa.html` is an isolated visual/mechanics test page using the real encounter classes; it does not read or change save data and is not a full-game playthrough. Its “Duff final hit” button seeds the last hit specifically to test his escape. This page is not included in the production build.

## 📜 License

This project is licensed under the MIT License.
