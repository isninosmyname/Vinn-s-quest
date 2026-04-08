export class MusicManager {
    private ctx: AudioContext | null = null;
    private currentTrack: string | null = null;
    private gain: GainNode | null = null;
    private nextNoteTime: number = 0;
    private noteIndex: number = 0;

    private NOTES: Record<string, number> = {
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
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

    public update(phase: string) {
        this.init();
        this.resume();

        let targetTrack = null;
        if (['WALK_IN', 'KNEEL_AND_TALK'].includes(phase)) targetTrack = 'ROYAL';
        else if (['PORTAL_OPENS', 'QUEEN_SUCKED_IN', 'VINN_JUMPS', 'FOREST_DROP', 'TECH_KIDNAP', 'VINN_LANDING'].includes(phase)) targetTrack = 'STORM';
        else if (['REUNION', 'PORTAL_EXIT', 'CASTLE_ARRIVAL', 'THE_REWARD', 'THE_KISS', 'QUEEN_EXIT', 'BANQUET_CALL', 'FOLLOW_QUEEN'].includes(phase)) targetTrack = 'VICTORY';
        else if (['BUT_SCREEN', 'BOSS_REGEN', 'BOSS_FUSION', 'FIN_BAIT'].includes(phase)) targetTrack = 'STINGER';
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
        else melody = this.STINGER_THEME;
        const step = melody[this.noteIndex];
        const time = this.ctx.currentTime;

        this.playOsc(step.lead, time, step.len, this.currentTrack === 'ROYAL' ? 'triangle' : 'square', 0.1);
        
        if (step.bass) {
            this.playOsc(step.bass, time, step.len, 'sine', 0.08);
        }

        if (step.perc === 'S') {
            this.playNoise(time, 0.1, 0.05);
        } else if (step.perc === 'H') {
            this.playNoise(time, 0.03, 0.02);
        }

        this.nextNoteTime = time + step.len;
        this.noteIndex = (this.noteIndex + 1) % melody.length;
    }

    private playOsc(note: string, time: number, len: number, type: OscillatorType, vol: number) {
        if (!this.ctx || !this.gain) return;
        const freq = this.NOTES[note] || 440;
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
