export type MusicTrack = 'forest' | 'volcano' | 'smallBoss' | 'bigBoss' | 'victory' | 'map';
type MusicContext = {
    state: string;
    world: number;
    room?: { kind: 'BEAR' | 'GOLEM'; phase: string } | null;
    duff?: { phase: string; health: number } | null;
    boss?: { type: string; health: number; introPlayed: boolean } | null;
};

export function selectRecordedMusic({ state, world, room, duff, boss }: MusicContext): MusicTrack | null {
    if (state === 'WORLD_MAP' || state === 'WORLD_MAP_TRANSITION') return 'map';
    if (state === 'LEVEL_TRANSITION' && world <= 2) return 'victory';
    if (state === 'TUTORIAL') return 'forest';
    if (!['PLAYING', 'BOSS_VS_CUTSCENE', 'BOSS_GUIDE', 'INK_BOSS_INTRO'].includes(state)) return null;
    if (world === 1 && room && !['OUTSIDE', 'CLEAR'].includes(room.phase)) return room.kind === 'BEAR' ? 'smallBoss' : 'bigBoss';
    if (world === 1 && duff && duff.health > 0 && !['WAITING', 'DEFEATED'].includes(duff.phase)) return 'smallBoss';
    if (boss && boss.health > 0 && (boss.introPlayed || boss.type === 'INK_COLOSSUS')) return boss.type === 'LIVING_VOLCANO' ? 'smallBoss' : 'bigBoss';
    return state === 'PLAYING' ? (world === 1 ? 'forest' : world === 2 ? 'volcano' : null) : null;
}

/** One exclusive recorded track; repeated frames/keypresses never restart it. */
export class RecordedMusic {
    readonly tracks: Record<MusicTrack, HTMLAudioElement>;
    active: MusicTrack | null = null;

    constructor(urls: Record<MusicTrack, string>, createAudio: (url: string) => HTMLAudioElement = url => new Audio(url)) {
        this.tracks = Object.fromEntries(Object.entries(urls).map(([name, url]) => {
            const track = createAudio(url);
            track.preload = 'metadata';
            track.loop = name !== 'victory';
            track.volume = name === 'victory' ? 0.55 : name.endsWith('Boss') ? 0.5 : 0.45;
            return [name, track];
        })) as Record<MusicTrack, HTMLAudioElement>;
    }

    setTrack(next: MusicTrack | null) {
        if (this.active === next) return false;
        if (this.active) this.tracks[this.active].pause();
        this.active = next;
        if (next) {
            const track = this.tracks[next];
            if (next === 'victory' || next.endsWith('Boss')) track.currentTime = 0;
            void track.play().catch(() => {}); // Retry blocked autoplay on a user gesture.
        }
        return true;
    }

    resume() {
        if (!this.active) return;
        const track = this.tracks[this.active];
        if (track.paused && (!track.ended || track.loop)) void track.play().catch(() => {});
    }

    dispose() {
        this.active = null;
        for (const track of Object.values(this.tracks)) track.pause();
    }
}
