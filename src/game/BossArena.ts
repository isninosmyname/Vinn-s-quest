import type { Enemy } from './Enemy';

/** Clear approach enemies once at entry, never during the boss's attack rounds. */
export function clearBossArena(
    enemies: { current: Enemy[] },
    projectileLists: { current: unknown[] }[],
    enemyBoss: Enemy | null = null
) {
    // The cave bear uses Enemy; other bosses and Duff live outside this list.
    enemies.current = enemyBoss ? [enemyBoss] : [];
    for (const projectiles of projectileLists) projectiles.current = [];
}
