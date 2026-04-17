export class MusicManager {
    private ctx: AudioContext | null = null;
    private currentTrack: string | null = null;
    private gain: GainNode | null = null;
    private nextNoteTime: number = 0;
    private noteIndex: number = 0;
    private intensity: number = 0; // 0, 1, 2

    private NOTES: Record<string, number> = {
        'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47, 'Bb2': 116.54,
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'Bb3': 233.08,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'G#4': 415.30, 'Bb4': 466.16, 'Eb4': 311.13,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    };

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

    private STINGER_THEME = [
        { lead: 'D2', bass: 'D1', perc: 'H', len: 0.8 },
        { lead: 'D#2', bass: 'D#1', perc: 'S', len: 0.8 },
        { lead: 'D2', bass: 'D1', perc: 'H', len: 0.8 },
        { lead: 'C#2', bass: 'C#1', perc: 'S', len: 0.8 }
    ];

    private FOREST_THEME = [
        { lead: 'C4', bass: 'C3', perc: 'H', len: 0.25 },
        { lead: 'E4', bass: 'G3', perc: 'S', len: 0.25 },
        { lead: 'G4', bass: 'C3', perc: 'H', len: 0.25 },
        { lead: 'A4', bass: 'F3', perc: 'S', len: 0.25 },
        { lead: 'G4', bass: 'C3', perc: 'H', len: 0.5 },
        { lead: 'E4', bass: 'G3', perc: 'S', len: 0.5 }
    ];

    private VOLCANO_THEME = [
        { lead: 'D3', bass: 'D2', perc: 'H', len: 0.4 },
        { lead: 'F3', bass: 'D2', perc: 'S', len: 0.4 },
        { lead: 'G#3', bass: 'G#2', perc: 'H', len: 0.4 },
        { lead: 'F3', bass: 'D2', perc: 'S', len: 0.4 }
    ];

    private PAINT_THEME = [
        { lead: 'C4', bass: 'C3', perc: 'H', len: 0.3 },
        { lead: 'D#4', bass: 'F#2', perc: 'S', len: 0.3 },
        { lead: 'F#4', bass: 'C3', perc: 'H', len: 0.3 },
        { lead: 'A4', bass: 'F#2', perc: 'S', len: 0.3 }
    ];
    private BOSS_MEGALO_THEME = [
        // The iconic riff
        { lead: 'D4', bass: 'D3', perc: 'H', len: 0.12 }, { lead: 'D4', bass: 'D3', perc: null, len: 0.12 },
        { lead: 'D5', bass: 'D3', perc: 'S', len: 0.24 }, { lead: 'A4', bass: 'D3', perc: null, len: 0.24 },
        { lead: 'G#4', bass: 'D3', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'D3', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'D3', perc: 'S', len: 0.12 }, { lead: 'D4', bass: 'D3', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'D3', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'D3', perc: null, len: 0.12 },

        { lead: 'C4', bass: 'C3', perc: 'H', len: 0.12 }, { lead: 'C4', bass: 'C3', perc: null, len: 0.12 },
        { lead: 'D5', bass: 'C3', perc: 'S', len: 0.24 }, { lead: 'A4', bass: 'C3', perc: null, len: 0.24 },
        { lead: 'G#4', bass: 'C3', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'C3', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'C3', perc: 'S', len: 0.12 }, { lead: 'D4', bass: 'C3', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'C3', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'C3', perc: null, len: 0.12 },

        { lead: 'B3', bass: 'B2', perc: 'H', len: 0.12 }, { lead: 'B3', bass: 'B2', perc: null, len: 0.12 },
        { lead: 'D5', bass: 'B2', perc: 'S', len: 0.24 }, { lead: 'A4', bass: 'B2', perc: null, len: 0.24 },
        { lead: 'G#4', bass: 'B2', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'B2', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'B2', perc: 'S', len: 0.12 }, { lead: 'D4', bass: 'B2', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'B2', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'B2', perc: null, len: 0.12 },

        { lead: 'Bb3', bass: 'Bb2', perc: 'H', len: 0.12 }, { lead: 'Bb3', bass: 'Bb2', perc: null, len: 0.12 },
        { lead: 'D5', bass: 'Bb2', perc: 'S', len: 0.24 }, { lead: 'A4', bass: 'Bb2', perc: null, len: 0.24 },
        { lead: 'G#4', bass: 'Bb2', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'Bb2', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'Bb2', perc: 'S', len: 0.12 }, { lead: 'D4', bass: 'Bb2', perc: null, len: 0.12 },
        { lead: 'F4', bass: 'Bb2', perc: 'H', len: 0.12 }, { lead: 'G4', bass: 'Bb2', perc: null, len: 0.12 }
    ];

    constructor() {}

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gain = this.ctx.createGain();
            this.gain.connect(this.ctx.destination);
            this.gain.gain.value = 0.15;
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
        o.frequency.setValueAtTime(2000 + Math.random()*2000, this.ctx.currentTime);
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

        this.playOsc(step.lead, time, step.len, this.currentTrack === 'ROYAL' ? 'triangle' : 'square', 0.1);
        
        // Intensity 2: Add high harmony
        if (this.currentTrack === 'BOSS_BATTLE' && this.intensity >= 2) {
            this.playOsc(step.lead, time, step.len, 'square', 0.05, 2.0); // An octave up
        }

        if (step.bass) {
            // Intensity 1+: Add bass
            const skipBass = this.currentTrack === 'BOSS_BATTLE' && this.intensity < 1;
            if (!skipBass) {
                this.playOsc(step.bass, time, step.len, 'sine', 0.08);
            }
        }

        if (step.perc === 'S') {
            const skipS = this.currentTrack === 'BOSS_BATTLE' && this.intensity < 1;
            if (!skipS) this.playNoise(time, 0.1, 0.05);
        } else if (step.perc === 'H') {
            this.playNoise(time, 0.03, 0.02);
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
        g.gain.linearRampToValueAtTime(vol, time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, time + len);

        osc.connect(g);
        g.connect(this.gain);
        osc.start(time);
        osc.stop(time + len);
    }

    private playNoise(time: number, len: number, vol: number) {
        if (!this.ctx || !this.gain) return;
        const bufferSize = this.ctx.sampleRate * len;
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
