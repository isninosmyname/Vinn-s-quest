export class MusicManager {
    private ctx: AudioContext | null = null;
    private currentTrack: string | null = null;
    private gain: GainNode | null = null;
    private nextNoteTime: number = 0;
    private noteIndex: number = 0;
    private intensity: number = 0;

    private NOTES: Record<string, number> = {
        'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74, 'Bb1': 58.27,
        'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47, 'Bb2': 116.54, 'Ab2': 103.83, 'Eb2': 77.78,
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'Bb3': 233.08, 'Ab3': 207.65, 'Eb3': 155.56, 'F#3': 185.00,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'G#4': 415.30, 'Bb4': 466.16, 'Eb4': 311.13, 'F#4': 369.99, 'Ab4': 415.30,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77, 'Bb5': 932.33, 'F#5': 739.99,
        'C6': 1046.50,
    };

    // Cutscene: Royal fanfare — stately and triumphant
    private ROYAL_THEME = [
        { lead: 'G3', bass: 'C3', perc: 'H', len: 0.5 },
        { lead: 'C4', bass: 'C3', perc: 'S', len: 0.5 },
        { lead: 'E4', bass: 'C3', perc: 'H', len: 0.5 },
        { lead: 'G4', bass: 'C3', perc: 'S', len: 0.5 },
        { lead: 'F4', bass: 'F3', perc: 'H', len: 0.5 },
        { lead: 'E4', bass: 'F3', perc: 'S', len: 0.5 },
        { lead: 'D4', bass: 'G3', perc: 'H', len: 1.0 },
        { lead: 'G3', bass: 'G3', perc: 'H', len: 0.5 },
        { lead: 'B3', bass: 'G3', perc: 'S', len: 0.5 },
        { lead: 'D4', bass: 'G3', perc: 'H', len: 0.5 },
        { lead: 'F4', bass: 'G3', perc: 'S', len: 0.5 },
        { lead: 'E4', bass: 'C3', perc: 'H', len: 0.5 },
        { lead: 'D4', bass: 'C3', perc: 'S', len: 0.5 },
        { lead: 'C4', bass: 'C3', perc: 'H', len: 1.0 },
        { lead: 'A4', bass: 'A3', perc: 'H', len: 0.5 },
        { lead: 'C5', bass: 'A3', perc: 'S', len: 0.5 },
        { lead: 'E5', bass: 'A3', perc: 'H', len: 0.5 },
        { lead: 'D5', bass: 'A3', perc: 'S', len: 0.5 },
        { lead: 'C5', bass: 'F3', perc: 'H', len: 0.5 },
        { lead: 'Bb4', bass: 'F3', perc: 'S', len: 0.5 },
        { lead: 'A4', bass: 'F3', perc: 'H', len: 1.0 },
        { lead: 'G4', bass: 'G3', perc: 'H', len: 0.5 },
        { lead: 'F4', bass: 'G3', perc: 'S', len: 0.5 },
        { lead: 'E4', bass: 'G3', perc: 'H', len: 0.5 },
        { lead: 'D4', bass: 'G3', perc: 'S', len: 0.5 },
        { lead: 'G4', bass: 'C3', perc: 'H', len: 0.5 },
        { lead: 'B4', bass: 'G3', perc: 'S', len: 0.5 },
        { lead: 'C5', bass: 'C3', perc: 'H', len: 1.5 }
    ];

    // Cutscene: Storm chase
    private STORM_THEME = [
        { lead: 'D4', bass: 'D3', perc: 'S', len: 0.15 },
        { lead: 'F4', bass: 'D3', perc: 'H', len: 0.15 },
        { lead: 'A4', bass: 'D3', perc: 'S', len: 0.15 },
        { lead: 'D5', bass: 'D3', perc: 'H', len: 0.15 },
        { lead: 'C5', bass: 'A3', perc: 'S', len: 0.15 },
        { lead: 'Bb4', bass: 'A3', perc: 'H', len: 0.15 },
        { lead: 'A4', bass: 'G3', perc: 'S', len: 0.15 },
        { lead: 'F4', bass: 'G3', perc: 'H', len: 0.15 },
        { lead: 'Ab4', bass: 'D3', perc: 'S', len: 0.15 },
        { lead: 'B4', bass: 'D3', perc: 'H', len: 0.15 },
        { lead: 'D5', bass: 'D3', perc: 'S', len: 0.15 },
        { lead: 'F5', bass: 'D3', perc: 'H', len: 0.15 },
        { lead: 'E5', bass: 'Bb3', perc: 'S', len: 0.15 },
        { lead: 'D5', bass: 'Bb3', perc: 'H', len: 0.15 },
        { lead: 'C5', bass: 'Bb3', perc: 'S', len: 0.15 },
        { lead: 'A4', bass: 'Bb3', perc: 'H', len: 0.15 },
        { lead: 'D4', bass: 'D3', perc: 'S', len: 0.1 },
        { lead: 'D4', bass: 'D2', perc: 'H', len: 0.1 },
        { lead: 'D4', bass: 'D3', perc: 'S', len: 0.1 },
        { lead: 'D5', bass: 'D4', perc: 'S', len: 0.5 }
    ];

    // Cutscene: Victory fanfare
    private VICTORY_THEME = [
        { lead: 'C5', bass: 'C3', perc: 'H', len: 0.4 },
        { lead: 'E5', bass: 'C3', perc: 'S', len: 0.4 },
        { lead: 'G5', bass: 'C3', perc: 'H', len: 0.4 },
        { lead: 'C6', bass: 'C4', perc: 'S', len: 0.8 },
        { lead: 'A5', bass: 'F3', perc: 'H', len: 0.4 },
        { lead: 'G5', bass: 'C3', perc: 'S', len: 0.4 },
        { lead: 'F5', bass: 'F3', perc: 'H', len: 0.4 },
        { lead: 'E5', bass: 'C3', perc: 'S', len: 0.8 }
    ];

    // Cutscene: Ominous stinger
    private STINGER_THEME = [
        { lead: 'D2', bass: 'D1', perc: 'H', len: 0.8 },
        { lead: 'D#2', bass: 'D#1', perc: 'S', len: 0.8 },
        { lead: 'D2', bass: 'D1', perc: 'H', len: 0.8 },
        { lead: 'C#2', bass: 'C#1', perc: 'S', len: 0.8 }
    ];

    // World 1 – Forest: bright, adventurous, skipping melody
    private FOREST_THEME = [
        { lead: 'E4', bass: 'C3', perc: 'H', len: 0.2 },
        { lead: 'G4', bass: 'C3', perc: null, len: 0.2 },
        { lead: 'A4', bass: 'C3', perc: 'S', len: 0.2 },
        { lead: 'C5', bass: 'G3', perc: null, len: 0.2 },
        { lead: 'B4', bass: 'G3', perc: 'H', len: 0.2 },
        { lead: 'A4', bass: 'G3', perc: null, len: 0.2 },
        { lead: 'G4', bass: 'F3', perc: 'S', len: 0.4 },
        { lead: 'E4', bass: 'F3', perc: 'H', len: 0.2 },
        { lead: 'F4', bass: 'C3', perc: null, len: 0.2 },
        { lead: 'G4', bass: 'C3', perc: 'H', len: 0.2 },
        { lead: 'E4', bass: 'G3', perc: 'S', len: 0.2 },
        { lead: 'D4', bass: 'G3', perc: null, len: 0.2 },
        { lead: 'C4', bass: 'G3', perc: 'H', len: 0.4 },
        { lead: 'D4', bass: 'A3', perc: null, len: 0.2 },
        { lead: 'E4', bass: 'A3', perc: 'S', len: 0.2 },
        { lead: 'G4', bass: 'A3', perc: 'H', len: 0.2 },
        { lead: 'A4', bass: 'F3', perc: null, len: 0.2 },
        { lead: 'G4', bass: 'F3', perc: 'S', len: 0.2 },
        { lead: 'F4', bass: 'G3', perc: 'H', len: 0.2 },
        { lead: 'E4', bass: 'G3', perc: null, len: 0.2 },
        { lead: 'D4', bass: 'C3', perc: 'S', len: 0.4 },
        { lead: 'C4', bass: 'C3', perc: 'H', len: 0.4 },
    ];

    // World 2 – Volcano: heavy, pounding, minor pentatonic danger riff
    private VOLCANO_THEME = [
        { lead: 'D3', bass: 'D2', perc: 'S', len: 0.15 },
        { lead: 'D3', bass: 'D2', perc: 'H', len: 0.15 },
        { lead: 'F3', bass: 'D2', perc: 'S', len: 0.15 },
        { lead: 'D3', bass: 'D2', perc: null, len: 0.15 },
        { lead: 'Ab3', bass: 'Ab2', perc: 'S', len: 0.3 },
        { lead: 'G3', bass: 'G2', perc: 'H', len: 0.15 },
        { lead: 'D3', bass: 'D2', perc: 'S', len: 0.15 },
        { lead: 'F3', bass: 'F2', perc: 'H', len: 0.15 },
        { lead: 'Eb3', bass: 'Eb2', perc: null, len: 0.15 },
        { lead: 'D3', bass: 'D2', perc: 'S', len: 0.3 },
        { lead: 'D3', bass: 'D2', perc: 'H', len: 0.15 },
        { lead: 'D3', bass: 'D2', perc: null, len: 0.15 },
        { lead: 'F3', bass: 'F2', perc: 'S', len: 0.15 },
        { lead: 'G3', bass: 'G2', perc: 'H', len: 0.15 },
        { lead: 'Bb3', bass: 'Bb2', perc: 'S', len: 0.3 },
        { lead: 'Ab3', bass: 'Ab2', perc: 'H', len: 0.3 },
    ];

    // World 3 – Paint: quirky, chromatic, glitchy and fun
    private PAINT_THEME = [
        { lead: 'C4', bass: 'C3', perc: 'H', len: 0.2 },
        { lead: 'E4', bass: 'C3', perc: null, len: 0.1 },
        { lead: 'F#4', bass: 'F#3', perc: 'S', len: 0.2 },
        { lead: 'E4', bass: 'C3', perc: null, len: 0.1 },
        { lead: 'G4', bass: 'G3', perc: 'H', len: 0.2 },
        { lead: 'Bb4', bass: 'Bb2', perc: 'S', len: 0.2 },
        { lead: 'A4', bass: 'F3', perc: null, len: 0.1 },
        { lead: 'G4', bass: 'G3', perc: 'H', len: 0.2 },
        { lead: 'F#4', bass: 'F#3', perc: 'S', len: 0.2 },
        { lead: 'E4', bass: 'C3', perc: null, len: 0.1 },
        { lead: 'Eb4', bass: 'Eb3', perc: 'H', len: 0.2 },
        { lead: 'D4', bass: 'D3', perc: 'S', len: 0.2 },
        { lead: 'C4', bass: 'C3', perc: null, len: 0.1 },
        { lead: 'B3', bass: 'G3', perc: 'H', len: 0.1 },
        { lead: 'C4', bass: 'C3', perc: 'S', len: 0.4 },
    ];

    // Boss fight – "Colossus Wakes" — original dark D-minor battle theme
    // Hook: dramatic falling-then-rising phrase | Verse: syncopated drive | Bridge: high-register climax
    private BOSS_MEGALO_THEME = [
        // === HOOK (A) — ominous opening climb ===
        { lead: 'D4', bass: 'D2', perc: 'S', len: 0.18 },
        { lead: 'F4', bass: 'D2', perc: null, len: 0.12 },
        { lead: 'A4', bass: 'D2', perc: 'H', len: 0.12 },
        { lead: 'C5', bass: 'D2', perc: null, len: 0.12 },
        { lead: 'Bb4', bass: 'Bb2', perc: 'S', len: 0.24 },
        { lead: 'A4', bass: 'Bb2', perc: null, len: 0.12 },
        { lead: 'G4', bass: 'G2', perc: 'H', len: 0.12 },
        { lead: 'F4', bass: 'G2', perc: 'S', len: 0.12 },
        { lead: 'E4', bass: 'A2', perc: null, len: 0.12 },
        { lead: 'D4', bass: 'A2', perc: 'H', len: 0.36 },

        // === VERSE (B) — driving syncopated riff ===
        { lead: 'D4', bass: 'D2', perc: 'S', len: 0.1 },
        { lead: 'D4', bass: 'D2', perc: null, len: 0.1 },
        { lead: 'F4', bass: 'D2', perc: 'H', len: 0.1 },
        { lead: 'G4', bass: 'G2', perc: null, len: 0.2 },
        { lead: 'F4', bass: 'G2', perc: 'S', len: 0.1 },
        { lead: 'D4', bass: 'D2', perc: null, len: 0.1 },
        { lead: 'E4', bass: 'A2', perc: 'H', len: 0.2 },
        { lead: 'D4', bass: 'D2', perc: 'S', len: 0.1 },
        { lead: 'C4', bass: 'C2', perc: null, len: 0.2 },
        { lead: 'D4', bass: 'D2', perc: 'H', len: 0.1 },
        { lead: 'F4', bass: 'F2', perc: null, len: 0.1 },
        { lead: 'Ab4', bass: 'Ab2', perc: 'S', len: 0.2 },
        { lead: 'G4', bass: 'G2', perc: null, len: 0.1 },
        { lead: 'E4', bass: 'A2', perc: 'H', len: 0.36 },

        // === BRIDGE (C) — high-register tension and crash ===
        { lead: 'A4', bass: 'D2', perc: 'S', len: 0.12 },
        { lead: 'Bb4', bass: 'Bb2', perc: null, len: 0.12 },
        { lead: 'C5', bass: 'C3', perc: 'H', len: 0.12 },
        { lead: 'D5', bass: 'D2', perc: 'S', len: 0.18 },
        { lead: 'Eb5', bass: 'Eb2', perc: null, len: 0.12 },
        { lead: 'D5', bass: 'D2', perc: 'H', len: 0.12 },
        { lead: 'C5', bass: 'C3', perc: 'S', len: 0.12 },
        { lead: 'Bb4', bass: 'G2', perc: null, len: 0.12 },
        { lead: 'A4', bass: 'A2', perc: 'H', len: 0.12 },
        { lead: 'G4', bass: 'G2', perc: 'S', len: 0.12 },
        { lead: 'F4', bass: 'D2', perc: null, len: 0.12 },
        { lead: 'E4', bass: 'A2', perc: 'H', len: 0.12 },
        { lead: 'D4', bass: 'D2', perc: 'S', len: 0.48 },
    ];

    constructor() {}

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gain = this.ctx.createGain();
            this.gain.connect(this.ctx.destination);
            this.gain.gain.value = 0.18;
        }
    }

    public resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    public setIntensity(percent: number) {
        if (percent > 0.7) this.intensity = 0;
        else if (percent > 0.3) this.intensity = 1;
        else this.intensity = 2;
    }

    public update(phase: string) {
        this.init();
        this.resume();

        let targetTrack = null;
        if (['WALK_IN', 'KNEEL_AND_TALK'].includes(phase)) targetTrack = 'ROYAL';
        else if (['PORTAL_OPENS', 'QUEEN_SUCKED_IN', 'VINN_JUMPS', 'FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING'].includes(phase)) targetTrack = 'STORM';
        else if (['REUNION', 'PORTAL_EXIT', 'CASTLE_ARRIVAL', 'THE_REWARD', 'THE_KISS', 'QUEEN_EXIT', 'BANQUET_CALL', 'FOLLOW_QUEEN'].includes(phase)) targetTrack = 'VICTORY';
        else if (['BUT_SCREEN', 'BOSS_REGEN', 'BOSS_FUSION', 'FIN_BAIT', 'LATER_SCREEN', 'BOSS_LAB_INTRO', 'BOSS_LAB_TALK', 'GOLEM_LEAVE', 'COLOSSUS_LEAVE', 'TALK_WEDDING', 'BOT_NOTICE', 'GOLEM_ENTERS', 'REPAIR_ORDER', 'BLAZE_PROMOTION', 'LUNCH_EXIT', 'BLAZE_ENTERS', 'SUIT_UP', 'QUEEN_RESIST', 'FINAL_EXIT'].includes(phase)) targetTrack = 'STINGER';
        else if (phase === 'FOREST_WORLD') targetTrack = 'FOREST_THEME';
        else if (phase === 'VOLCANO_WORLD') targetTrack = 'VOLCANO_THEME';
        else if (phase === 'PAINT_WORLD') targetTrack = 'PAINT_THEME';
        else if (phase === 'BOSS_BATTLE') targetTrack = 'BOSS_BATTLE';
        else if (phase === 'VINN_STUNNED') targetTrack = null;

        if (targetTrack !== this.currentTrack) {
            this.currentTrack = targetTrack;
            this.noteIndex = 0;
            this.nextNoteTime = this.ctx!.currentTime;
        }

        if (this.currentTrack && this.ctx!.currentTime >= this.nextNoteTime) {
            this.playMultiVoiceStep();
        }

        if (phase === 'BOSS_FUSION' && Math.random() < 0.05) {
            this.playScreech();
        }
    }

    private playScreech() {
        if (!this.ctx || !this.gain) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(2000 + Math.random() * 2000, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.05, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        o.connect(g); g.connect(this.gain);
        o.start(); o.stop(this.ctx.currentTime + 0.3);
    }

    private playMultiVoiceStep() {
        if (!this.ctx || !this.gain || !this.currentTrack) return;

        let melody;
        if (this.currentTrack === 'ROYAL') melody = this.ROYAL_THEME;
        else if (this.currentTrack === 'STORM') melody = this.STORM_THEME;
        else if (this.currentTrack === 'VICTORY') melody = this.VICTORY_THEME;
        else if (this.currentTrack === 'FOREST_THEME') melody = this.FOREST_THEME;
        else if (this.currentTrack === 'VOLCANO_THEME') melody = this.VOLCANO_THEME;
        else if (this.currentTrack === 'PAINT_THEME') melody = this.PAINT_THEME;
        else if (this.currentTrack === 'BOSS_BATTLE') melody = this.BOSS_MEGALO_THEME;
        else melody = this.STINGER_THEME;

        const step = melody[this.noteIndex];
        const time = this.ctx.currentTime;

        // Pick waveform per world for distinct sound identity
        const leadType: OscillatorType =
            this.currentTrack === 'ROYAL' ? 'triangle' :
            this.currentTrack === 'FOREST_THEME' ? 'triangle' :
            this.currentTrack === 'PAINT_THEME' ? 'sawtooth' :
            this.currentTrack === 'VOLCANO_THEME' ? 'sawtooth' :
            'square';

        this.playOsc(step.lead, time, step.len, leadType, 0.12);

        // Boss: octave harmony at high intensity
        if (this.currentTrack === 'BOSS_BATTLE' && this.intensity >= 2) {
            this.playOsc(step.lead, time, step.len, 'square', 0.06, 2.0);
        }

        // Boss: sub-bass kick on snare hits
        if (this.currentTrack === 'BOSS_BATTLE' && step.perc === 'S') {
            this.playSubBass(time, step.len);
        }

        if (step.bass) {
            const skipBass = this.currentTrack === 'BOSS_BATTLE' && this.intensity < 1;
            if (!skipBass) {
                const bassType: OscillatorType =
                    this.currentTrack === 'VOLCANO_THEME' ? 'sawtooth' : 'sine';
                this.playOsc(step.bass, time, step.len, bassType, 0.1);
            }
        }

        if (step.perc === 'S') {
            const skipS = this.currentTrack === 'BOSS_BATTLE' && this.intensity < 1;
            if (!skipS) this.playNoise(time, 0.12, 0.06);
        } else if (step.perc === 'H') {
            this.playNoise(time, 0.04, 0.025);
        }

        this.nextNoteTime = time + step.len;
        this.noteIndex = (this.noteIndex + 1) % melody.length;
    }

    private playOsc(note: string, time: number, len: number, type: OscillatorType, vol: number, mult: number = 1.0) {
        if (!this.ctx || !this.gain) return;
        const freq = (this.NOTES[note] || 440) * mult;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(vol, time + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, time + len);
        osc.connect(g);
        g.connect(this.gain);
        osc.start(time);
        osc.stop(time + len);
    }

    // Deep thudding sub-bass kick for boss fights
    private playSubBass(time: number, _len: number) {
        if (!this.ctx || !this.gain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
        g.gain.setValueAtTime(0.22, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(g);
        g.connect(this.gain);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    private playNoise(time: number, len: number, vol: number) {
        if (!this.ctx || !this.gain) return;
        const bufferSize = Math.ceil(this.ctx.sampleRate * len);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + len);
        noise.connect(g);
        g.connect(this.gain);
        noise.start(time);
        noise.stop(time + len);
    }

    public stop() {
        this.currentTrack = null;
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
    }
}
