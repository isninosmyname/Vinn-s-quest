# Vinn's Quest — Version 1.5

A retro-inspired 2D action-platformer built with React, TypeScript, and HTML5 Canvas. Guide Vinn across three worlds to rescue the Queen, alone or with a friend.

Un juego de acción y plataformas 2D de estilo retro, creado con React, TypeScript y HTML5 Canvas. Acompaña a Vinn por tres mundos para rescatar a la Reina, solo o con un amigo.

![Vinn's Quest screenshot](https://github.com/user-attachments/assets/5a6a7fc1-d059-49ea-a022-775ed804dcbd)

> **Development notice / Aviso de desarrollo:** Version **1.5** is under active development. Bugs, unfinished details, and balance changes are still possible. Thanks for your patience and feedback!
>
> La versión **1.5** sigue en desarrollo. Puede contener errores, detalles pendientes y cambios de dificultad. ¡Gracias por tu paciencia y tus comentarios!

## What's in 1.5 / Qué incluye la versión 1.5

- **30 campaign levels across three maps:** Forest (8), Volcano Land (10), and Paint Land (12), plus the tutorial and story escape. / **30 niveles en tres mapas:** bosque (8), mundo volcánico (10) y mundo de pintura (12), además del tutorial y el escape de la historia.
- **Expanded encounters:** the bear cave, Duff's machine, Golem with Duff's support, Living Volcano, Blaze King, and the new elevated Ink Colossus/Duff fight. / **Más encuentros:** la cueva del oso, la máquina de Duff, el Golem con ayuda de Duff, el Volcán Viviente, el Rey de Fuego y el nuevo combate contra Duff y el Coloso en una galería elevada.
- **Exploration and movement:** selected swingable forest vines, hiding wolves, Queen letters, timed double jumps, crouching, and slippery paint. / **Exploración y movimiento:** lianas en árboles concretos, lobos escondidos, cartas de la Reina, doble salto temporal, agacharse y pintura resbaladiza.
- **Lives and coins:** three shared campaign lives, collectible coins, a life shop, recovery countdowns, and one-shot death animations. / **Vidas y monedas:** tres vidas compartidas, monedas, tienda de vidas, espera de recuperación y animaciones de muerte que no se repiten.
- **Pause and co-op:** pause with P or a button, restart levels, return to the menu, or switch player mode and restart. / **Pausa y cooperativo:** pausa con P o un botón, reinicia niveles, vuelve al menú o cambia el modo de jugadores y reinicia.
- **Presentation:** animated maps, world-transition explosions, finish flags, three possible victory routines, and recorded music. / **Presentación:** mapas animados, explosiones entre mundos, banderas de meta, tres posibles celebraciones y música grabada.

## Story / Historia

Vinn brings the Queen a rose and invites her onto the castle balcony. A portal interrupts their peaceful moment outside. Vinn follows her through it, but the fall leaves him unconscious in the forest while skeleton robots carry her away. He wakes up and follows their trail toward Ink Colossus's castle.

The journey crosses the forest, lava fields, and Paint Land. The final chase leads into the Queen's rescue and a timed escape from the collapsing castle.

Vinn lleva una rosa a la Reina y la invita al balcón del castillo. Un portal interrumpe su momento al aire libre. Vinn la sigue, pero la caída lo deja inconsciente en el bosque mientras unos esqueletos robóticos se llevan a la Reina. Al despertar, sigue su rastro hacia el castillo del Coloso de Tinta.

La aventura atraviesa el bosque, los campos de lava y el mundo de pintura. La persecución final conduce al rescate de la Reina y a un escape contrarreloj del castillo que se derrumba.

## Worlds and encounters / Mundos y encuentros

| World / Mundo | Levels / Niveles | Main encounters / Encuentros principales |
| --- | ---: | --- |
| Forest / Bosque | 8 | Level 3: bear cave / cueva del oso · Level 4: Duff's castle / castillo de Duff · Level 8: Golem and Duff / Golem y Duff |
| Volcano Land / Tierra volcánica | 10 | Level 5: Living Volcano / Volcán Viviente · Level 10: Blaze King / Rey de Fuego |
| Paint Land / Tierra de pintura | 12 | Level 6: Duff and elevated Ink Colossus / Duff y Coloso elevado · Level 12: original Colossus chase and rescue / persecución original y rescate |

### Forest / Bosque

- Wolves can hide in selected bushes; not every bush contains an enemy. Some trees have vines, rather than every tree.
- Grab a usable vine with **E**, swing with **A/D**, and jump with **W** to carry momentum across a gap. The lower routes in levels **2, 6, and 7** use vine crossings; levels **3 and 6** also have optional vines.
- Enter the **level-3 cave door** to fight the bear inside. When it lifts its front paws, prepare to jump its stomp shockwave.
- **Level 4** is a castle leading to Duff's conveyor-and-poles machine. Crouch under the high pole, jump the low pole, press the right switch and then the left, and climb the stopped poles to strike Duff. Each successful strike removes a quarter of his health. After defeat, he warns that he must tell Golem and escapes through a window.
- Enter the **level-8 fortress gate** to face Golem. Duff assists with thrown swords; Golem's landings send shockwaves in both directions.
- Clearing the world leads to Vinn planting a bomb on the forest map and running away. The explosion reveals Volcano Land.

Los lobos se esconden solo en algunos arbustos y las lianas aparecen en árboles concretos. Agarra una liana con **E**, balancéate con **A/D** y salta con **W**. Los niveles **2, 6 y 7** incluyen cruces con lianas en el camino bajo; **3 y 6** también tienen lianas opcionales.

Entra por la puerta de la **cueva del nivel 3** para luchar contra el oso y salta la onda de su pisotón. El **castillo del nivel 4** termina en la máquina de Duff: esquiva los postes, activa primero el botón derecho y después el izquierdo, sube y golpéalo. Cuatro golpes completan el combate; Duff avisa al Golem y escapa por una ventana. En la **fortaleza del nivel 8**, Duff lanza espadas mientras los aterrizajes del Golem crean dos ondas. Al terminar el mundo, Vinn coloca una bomba en el mapa; la explosión revela el mundo volcánico.

### Volcano Land / Tierra volcánica

- Ten extended levels span **6,200–11,000 pixels**, with additional terrain and alternate elevated routes.
- Double-jump feathers are scarcer **only here**: one or two per level. The lower routes are designed to be completed without feathers; forest feather counts are unchanged.
- **Level 5 — Living Volcano:** a background volcano with eyes and a mouth rains fireballs and fires a warned beam. Crouch beneath the beam, then attack its exposed ground-level core.
- **Level 10 — Blaze King:** at low health, he rises away while the background volcano attacks with its beam. The normal battle resumes between these assists.
- Falling into lava starts a short escape combination instead of an ordinary fall recovery; see [Lives, coins, and lava](#lives-coins-and-lava--vidas-monedas-y-lava).
- After clearing level 10, **Continue** enlarges the Living Volcano's map icon. It starts exploding while Vinn runs offscreen, then reveals the Paint Land map.

Los diez niveles miden **6.200–11.000 píxeles**, con terreno adicional y rutas elevadas. **Solo aquí** hay menos plumas: una o dos por nivel. Los caminos bajos están diseñados para completarse sin ellas; no se reducen las del bosque.

El **Volcán Viviente del nivel 5** lanza bolas de fuego y un rayo anunciado. Agáchate bajo el rayo y golpea su núcleo cuando quede expuesto. En el **nivel 10**, el Rey de Fuego se eleva cuando tiene poca salud y el volcán del fondo dispara su rayo antes de que continúe el combate. Caer en lava inicia una combinación de rescate. Tras superar el mundo, **Continuar** hace crecer y explotar el icono del Volcán Viviente mientras Vinn huye; después aparece el mapa de pintura.

### Paint Land / Tierra de pintura

- Twelve map nodes include numbered signs, level names, unlocks, clear markers, and castle markers.
- Eleven approaches feature distinct island layouts, elevated galleries, colored scenery, coins, enemies, and slippery paint. The original Ink Colossus chase is now **level 12**.
- **Level 6 — Duff and Ink Colossus:**
  1. Duff fights with a sword on the floor. **Ink Colossus stays above on the raised gallery.**
  2. Hit Duff **three times** to stun him for **eight seconds**.
  3. Hold **W** near the illuminated ladder (Player 2: **↑**) to climb, move right, and strike Colossus.
  4. Repeat the opening; **four hits on Colossus** win the encounter.
  5. Throughout the fight, Colossus telegraphs falling paint that becomes the same slippery floor pools found in the levels.
- **Level 12** preserves the long chase, rainbow speed boosts, elevator encounters, and the rescue/escape story. Its victory celebration leads into the existing escape cutscene.
- The existing story interlude plays the first time you enter Paint Land level 1.

El mapa tiene doce destinos con números, nombres, desbloqueos y marcas de victoria. Los once caminos previos tienen distintas islas, galerías, colores, monedas, enemigos y pintura resbaladiza. La persecución original pasa al **nivel 12**.

En el **nivel 6**, Duff pelea con espada abajo y **el Coloso permanece arriba, en la galería elevada**. Golpea a Duff **tres veces** para aturdirlo **ocho segundos**; mantén **W** junto a la escalera iluminada (jugador 2: **↑**), avanza a la derecha y golpea al Coloso. **Cuatro golpes al Coloso** ganan el combate. Mientras tanto, deja caer pintura anunciada que forma charcos resbaladizos. El nivel 12 conserva la persecución, los cristales arcoíris, los ascensores y el rescate. La escena entre mundos aparece al entrar por primera vez al nivel 1.

## Health, exploration, and victory / Salud, exploración y victoria

- **Health is separate from lives.** Each hero has **26 HP**. Boss entrances restore health; ordinary enemies and leftover hostile projectiles are cleared while scripted boss partners remain.
- Rest on solid ground without moving or attacking for **five seconds**, then recover **one HP per second**. Damage interrupts recovery.
- Double-jump feathers last **60 seconds**. Collecting another resets the timer.
- Queen letters introduce selected mechanics and landmarks instead of repeating throughout each level. They use parchment, the Queen's portrait, and the closing “Greetings, The queen.” / “Saludos, La reina.”
- Finish flags animate and stay locked until required encounters are cleared. Either living player can reach a normal unlocked finish.
- Each clear selects **one** celebration: sword toss and catch, slash and backflip, or a fighting stance. It does not cycle through all three. **Winning.MP3 plays once per clear**, even if the chosen animation repeats.

**La salud y las vidas son distintas.** Cada héroe tiene **26 puntos de salud**. Los combates de jefe restauran la salud y eliminan enemigos comunes y proyectiles sobrantes, conservando los compañeros del jefe. Descansa **cinco segundos** en suelo firme, sin moverte ni atacar, para recuperar **un punto por segundo**; recibir daño interrumpe la recuperación.

Las plumas de doble salto duran **60 segundos** y otra pluma reinicia el tiempo. Las cartas de la Reina explican novedades concretas en pergaminos con retrato y firma. Las banderas se desbloquean al completar el encuentro necesario. Cada victoria elige **una sola** celebración —lanzar y atrapar la espada, tajo y mortal, o postura de combate— y **Winning.MP3 suena una vez**, aunque se repita esa animación.

## Lives, coins, and lava / Vidas, monedas y lava

### Three lives and the shop / Tres vidas y la tienda

- Story mode starts with **three lives**, shared in co-op. Nearby teammate revival still works; a shared life is lost when both heroes are down.
- Collect coins along the levels. Each coin can be collected **once per location per tab session**; restarting does not duplicate collected coins.
- At **zero lives**, the Game Over screen or main-menu **Shop** sells **one life**, not three. Successive purchases cost **5, 10, 15, 20… coins**.
- Exhausting the three-life supply starts a **five-minute, real-time recovery countdown**.
- Buying a life leaves the count at **1**. Buying or losing that paid life **does not restart the countdown**.
- When the original countdown finishes, lives return to **3** and the price resets to **5 coins**. Only exhausting that restored set starts a new countdown.
- Free-life recovery continues while paused or in the menu. This is an in-game coin shop, not a real-money purchase.

La historia comienza con **tres vidas**, compartidas en cooperativo. Acercarse al compañero caído permite reanimarlo; se pierde una vida compartida cuando ambos caen. Cada moneda se recoge **una vez por ubicación y sesión de pestaña**, sin duplicarse al reiniciar.

Con **cero vidas**, la pantalla de derrota o la **Tienda** vende **una vida**, no tres, por **5, 10, 15, 20… monedas**. Agotar las tres vidas inicia una espera de **cinco minutos reales**. Comprar una deja el contador en **1**; comprarla o perderla **no reinicia esa espera**. Al terminar, recuperas **3 vidas** y el precio vuelve a **5 monedas**. La siguiente espera empieza al agotar las tres recuperadas. El tiempo sigue pasando en pausa o en el menú. No hay compras con dinero real.

### Falls and death / Caídas y muerte

- An ordinary fall costs **half maximum health** and returns Vinn to safe ground. It costs a life only if it empties his health.
- Normal death zooms toward Vinn under a spotlight while he spins, gets dizzy, and falls **once**. The “You died!” title drops into view, followed by **Quit?** and **Continue?**
- At zero lives, **GAME OVER** appears; the camera pulls back and Vinn fades. Choose coins or wait for recovery.
- Continue restarts the level, or the already-entered forest encounter where supported. Space cannot instantly revive a dead hero.

Una caída normal quita **la mitad de la salud máxima** y devuelve a Vinn al suelo seguro; solo consume una vida si agota su salud. Al morir, la cámara se acerca, un foco ilumina a Vinn y este gira, se marea y cae **una vez**. El título cae desde arriba y aparecen **¿Salir?** y **¿Continuar?** Sin vidas, aparece **FIN DEL JUEGO**, la cámara se aleja y Vinn se desvanece; puedes pagar monedas o esperar. Continuar reinicia el nivel o el encuentro del bosque al que ya entraste, cuando corresponde.

### Lava rescue / Rescate de la lava

In Volcano Land, Vinn raises his hands and struggles instead of using the spin animation. You have **3.5 seconds** to press the three displayed keys **in order**, releasing between presses:

- Player 1: the displayed sequence of **A/W/D**.
- Player 2: the displayed sequence of **arrow keys**.
- Touch: tap the displayed key buttons.

A wrong sequence key resets the combination and costs time. Success returns Vinn to a safe ledge with **half his remaining health**, rounded up and never below **1 HP**. Failure makes him sink completely and die.

En el mundo volcánico, Vinn levanta las manos e intenta salir. Tienes **3,5 segundos** para pulsar las tres teclas **en orden**, soltándolas entre pulsaciones: **A/W/D** para J1, **flechas** para J2 o los botones en pantalla. Equivocarse reinicia la combinación y resta tiempo. Acertar devuelve a Vinn a una plataforma con **la mitad de la salud restante**, redondeada hacia arriba y nunca menos de **1 punto**. Fallar hace que se hunda y muera, sin girar.

## Controls / Controles

| Action / Acción | Player 1 / Jugador 1 | Player 2 or shared / Jugador 2 o compartido |
| --- | --- | --- |
| Move / Moverse | A / D | ← / → |
| Jump / Saltar | W (alternative: Ctrl) | ↑ (alternative: Shift) |
| Attack / Atacar | Space / Espacio | Enter / Intro |
| Crouch and crawl / Agacharse y avanzar | C | ↓ |
| Read, enter doors, use switches / Leer, entrar, usar botones | E | Shared E / E compartida |
| Grab and swing on vines / Agarrar y balancearse | E, then A/D; W to leap | E, then ←/→; ↑ to leap |
| Gallery ladder / Escalera de la galería | Hold W to climb; S to descend | Hold ↑ to climb; ↓ to descend |
| Next dialogue / Siguiente diálogo | Space / Espacio | Same Space; E also advances forest encounter dialogue / Espacio; E también avanza diálogos de encuentros del bosque |
| Map selection / Elegir nivel en el mapa | A/D or ←/→ | Click a node or card / Clic en destino o tarjeta |
| Enter selected level / Entrar al nivel elegido | Space or Enter | Map Enter button / Botón Entrar del mapa |
| Pause or resume / Pausar o continuar | P | Click Pause / Botón Pausa |
| Stone Smash / Golpe de Piedra | Move mouse to aim; click to slash | Ratón para apuntar; clic para golpear |
| Skip supported cutscenes / Saltar escenas que lo permiten | Click Skip Cutscene | Botón Saltar escena |

Touch devices have on-screen controls, including lava key prompts and gallery climb buttons. / Los dispositivos táctiles tienen controles en pantalla, incluidas las teclas del rescate y los botones para subir a la galería.

### Pause, co-op, and language / Pausa, cooperativo e idioma

Press **P** or click **Pause** during gameplay for **Resume**, **Restart Level**, **Main Menu**, and **Enable/Disable 2P**. Changing player mode from this menu restarts the level. Restarting does not spend a life or refill collected coins. Gameplay—including the lava countdown—freezes while paused; the real-time life-recovery countdown does not.

Choose solo/duo mode, hero colors, and English/Spanish in Settings. Story scenes and new gameplay menus include translations; some legacy labels and guides may still appear in English.

Pulsa **P** o **Pausa** para **Continuar**, **Reiniciar nivel**, ir al **Menú principal** o **Activar/Desactivar 2J**. Cambiar el modo reinicia el nivel. Reiniciar no gasta una vida ni repone monedas. La pausa detiene el juego y el rescate de lava, pero no la recuperación de vidas en tiempo real.

En Ajustes puedes elegir modo solo/dúo, colores e idioma inglés/español. Las escenas y los menús nuevos incluyen traducciones; algunos textos y guías antiguos todavía pueden aparecer en inglés.

## Minigames / Minijuegos

The menu includes **Mushroom Jump**, **3D Stone Smash**, and **Escape!**, unlocked through campaign progress. High scores are saved locally. The story's timed Queen escape is separate from practice minigames and includes a fear meter.

El menú incluye **Salto de Hongo**, **Golpe de Piedra 3D** y **¡Escape!**, que se desbloquean con el progreso. Los récords se guardan localmente. El escape de la Reina en la historia es distinto de los minijuegos de práctica e incluye una barra de miedo.

## Music / Música

| Track / Pista | Used for / Uso |
| --- | --- |
| `Grasslands.mp3` | Forest exploration and tutorial / Bosque y tutorial |
| `Map.mp3` | World maps and map transitions / Mapas y transiciones |
| `Volcano _land.mp3` | Volcano exploration / Exploración volcánica |
| `small_boss.mp3` | Bear, Duff, Living Volcano, and Paint level 6 / Oso, Duff, Volcán Viviente y nivel 6 de pintura |
| `Big_Boss.mp3` | Golem, Blaze King, and the final Ink Colossus encounter / Golem, Rey de Fuego y encuentro final con el Coloso |
| `Winning.MP3` | Once per level clear, without looping / Una vez por victoria, sin bucle |
| Procedural audio / Audio procedural | Paint exploration and story sequences / Exploración de pintura y escenas |

If browser autoplay blocks music, interact with the game or use **Retry Music** when shown. / Si el navegador bloquea la música automática, interactúa con el juego o pulsa **Reintentar música** cuando aparezca.

Keep asset filename capitalization and spaces intact. / Conserva las mayúsculas y los espacios de los nombres de archivo.

## Saving / Guardado

- **Local storage:** campaign unlocks, all three maps' clear markers, intro flags, language, colors, player mode, and minigame high scores.
- **Tab-session storage:** lives, coins, collected coin locations, purchase price, and recovery deadline. Refreshing preserves this data. A fresh tab session starts a fresh economy; browser tab/session restoration may preserve an earlier session.
- Saves stay in the browser; there is no account or cloud synchronization. Clearing site data removes the corresponding saved progress.

**Almacenamiento local:** desbloqueos, niveles superados de los tres mapas, escenas vistas, idioma, colores, modo y récords. **Sesión de pestaña:** vidas, monedas, monedas recogidas, precio y tiempo de recuperación. Recargar conserva la sesión; una sesión nueva inicia una economía nueva. La restauración de pestañas del navegador puede recuperar una sesión anterior. No hay cuentas ni guardado en la nube; borrar los datos del sitio elimina el progreso correspondiente.

## Development / Desarrollo

### Stack / Tecnologías

React 19 · TypeScript · Vite 8 · HTML5 Canvas · CSS · browser audio APIs.

### Run locally / Ejecutar localmente

The installed Vite version requires **Node.js 20.19+ within v20, or 22.12+**, plus npm. / La versión de Vite instalada requiere **Node.js 20.19+ de la rama 20, o 22.12+**, además de npm.

Clone this repository, then enter its folder. Quote the folder name because it contains spaces and an apostrophe. / Clona el repositorio y entra en su carpeta; usa comillas porque el nombre contiene espacios y un apóstrofo.

```bash
cd "Vinn's Quest"
npm install
npm run dev
```

Open the URL printed by Vite, normally **http://localhost:5173**. If that server is already running, reuse it. / Abre la dirección que muestre Vite, normalmente **http://localhost:5173**. Si el servidor ya está funcionando, usa ese mismo.

### Available commands / Comandos disponibles

```bash
npm run dev       # Development server / Servidor de desarrollo
npm run build     # TypeScript checks + production build / Comprobación y compilación
npm run preview   # Preview the built app / Vista previa de la compilación
npm run lint      # ESLint
```

### Regression scripts / Pruebas de regresión

```bash
node scripts/test-forest.cjs
node scripts/test-cutscenes.cjs
node scripts/test-music.cjs
node scripts/test-lives.cjs
```

These scripts cover forest/volcano routes and encounters, recovery, vines, dialogue advancement, music selection, lives, coins, lava rescue, and death-rendering logic. They are not a substitute for playing through all twelve Paint Land stages. Listing them here does **not** mean the latest 1.5 changes have passed a fresh test run.

Los scripts cubren rutas y encuentros del bosque/volcán, recuperación, lianas, avance de diálogos, música, vidas, monedas, lava y lógica de animación de muerte. No sustituyen una partida completa de los doce niveles de pintura. Esta lista **no** significa que los últimos cambios de 1.5 hayan pasado una nueva ejecución de pruebas.

With Vite running, isolated development scenes are available at:

- `/scripts/encounter-qa.html` — forest encounters; the Duff final-hit action seeds the last hit.
- `/scripts/volcano-qa.html` — volcano boss, map, transition, and emblem scenes; the Blaze action seeds low health.
- `/scripts/music-qa.html` — recorded-track playback and switching.

These are development helpers, not complete playthroughs, and are not included in the production build. / Son herramientas de desarrollo, no partidas completas, y no se incluyen en la compilación de producción.

### Code guide / Guía del código

| File / Archivo | Responsibility / Responsabilidad |
| --- | --- |
| `src/App.tsx` | Menus, controls, progression, and game-loop integration / Menús, controles, progreso e integración |
| `src/game/Vinn.ts` | Hero movement, combat, health, and power-ups / Movimiento, combate, salud y poderes |
| `src/game/Cutscene.ts`, `DialogueTimeline.ts`, `SceneCheckpoints.ts` | Story scenes and dialogue checkpoints / Escenas y puntos de diálogo |
| `src/game/ForestWorld.ts`, `VolcanoWorld.ts`, `PaintWorld.ts` | Level layouts and world scenery / Niveles y escenarios |
| `src/game/WorldMap.ts`, `WorldMapTransition.ts`, `PaintMapTransition.ts` | Three maps and transitions / Mapas y transiciones |
| `src/game/DuffBoss.ts`, `ForestEncounter.ts`, `Boss.ts`, `PaintDuoBoss.ts` | Boss encounters / Encuentros de jefe |
| `src/game/SwingVine.ts` | Grabbing, swinging, and release momentum / Lianas e impulso |
| `src/game/Lives.ts`, `DeathScene.ts`, `LavaRescue.ts` | Coin economy, lives, deaths, and rescue / Monedas, vidas, muerte y rescate |
| `src/game/Victory.ts`, `RecordedMusic.ts` | Finish flags, celebrations, and soundtrack selection / Banderas, celebraciones y música |

## License / Licencia

This project is licensed under the MIT License. / Este proyecto utiliza la licencia MIT.
