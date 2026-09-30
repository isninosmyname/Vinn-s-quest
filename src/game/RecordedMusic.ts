export type MusicTrack = 'forest' | 'volcano' | 'smallBoss' | 'bigBoss' | 'victory' | 'map';
type MusicContext = {
    state: string;
    world: number;
    room?: { kind: 'BEAR' | 'GOLEM'; phase: string } | null;
    duff?: { phase: string; health: number } | null;
    boss?: { type: string; health: number; introPlayed: boolean } | null;
    paintDuo?: { active: boolean } | null;
};

export function selectRecordedMusic({ state, world, room, duff, boss, paintDuo }: MusicContext): MusicTrack | null {
    if (state === 'WORLD_MAP' || state === 'WORLD_MAP_TRANSITION') return 'map';
    if (state === 'LEVEL_TRANSITION') return 'victory';
    if (state === 'TUTORIAL') return 'forest';
    if (!['PLAYING', 'BOSS_VS_CUTSCENE', 'BOSS_GUIDE', 'INK_BOSS_INTRO'].includes(state)) return null;
    if (world === 3 && paintDuo?.active) return 'smallBoss';
    if (world === 1 && room && !['OUTSIDE', 'CLEAR'].includes(room.phase)) return room.kind === 'BEAR' ? 'smallBoss' : 'bigBoss';
    if (world === 1 && duff && duff.health > 0 && !['WAITING', 'DEFEATED'].includes(duff.phase)) return 'smallBoss';
    if (boss && boss.health > 0 && (boss.introPlayed || boss.type === 'INK_COLOSSUS')) return boss.type === 'LIVING_VOLCANO' ? 'smallBoss' : 'bigBoss';
    return state === 'PLAYING' ? (world === 1 ? 'forest' : world === 2 ? 'volcano' : null) : null;
}

/** One exclusive recorded track; repeated frames/keypresses never restart it. */
export class RecordedMusic {
    readonly player: HTMLAudioElement;
    private readonly urls: Record<MusicTrack, string>;
    private positions: Partial<Record<MusicTrack, number>> = {};
    private resumeAt = 0;
    private request = 0;
    private disposed = false;
    playbackError: string | null = null;
    active: MusicTrack | null = null;
    private restorePosition = () => {
        if (this.active && this.resumeAt > 0) this.player.currentTime = this.resumeAt;
        this.resumeAt = 0;
    };

    constructor(urls: Record<MusicTrack, string>, createAudio: (url: string) => HTMLAudioElement = url => new Audio(url)) {
        this.urls = urls;
        // Keep the same media element across exploration → Duff and other switches.
        // A successful play on one element must not leave the next track on a new,
        // still-blocked element. Metadata events restore exploration's saved position.
        this.player = createAudio(urls.forest);
        this.player.preload = 'auto';
        this.player.addEventListener('loadedmetadata', this.restorePosition);
    }

    private play() {
        const request = ++this.request;
        this.playbackError = null;
        void this.player.play().then(() => {
            if (request === this.request) this.playbackError = null;
        }).catch((error: unknown) => {
            // Switching tracks aborts an older request; don't blame the new track.
            if (request === this.request && !this.disposed) {
                this.playbackError = error instanceof Error ? error.message : String(error);
            }
        });
    }

    setTrack(next: MusicTrack | null) {
        if (this.disposed || this.active === next) return false;
        if (this.active) this.positions[this.active] = this.resumeAt || this.player.currentTime;
        ++this.request;
        this.player.pause();
        this.playbackError = null;
        this.active = next;
        if (next) {
            this.resumeAt = next === 'victory' || next.endsWith('Boss') ? 0 : this.positions[next] || 0;
            this.player.loop = next !== 'victory';
            this.player.volume = next === 'victory' ? 0.55 : next.endsWith('Boss') ? 0.5 : 0.45;
            this.player.src = this.urls[next];
            this.play();
        }
        return true;
    }

    resume() {
        if (this.disposed || !this.active) return;
        if (this.player.paused && (!this.player.ended || this.player.loop)) this.play();
    }

    dispose() {
        this.disposed = true;
        ++this.request;
        this.playbackError = null;
        this.active = null;
        this.player.pause();
        this.player.removeEventListener('loadedmetadata', this.restorePosition);
    }
}
