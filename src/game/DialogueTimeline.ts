export interface DialogueScene {
    phase: string;
    timer: number;
    phaseTime: number;
    motionActive?: boolean;
    dialogueIndex: number;
    dialogues: { speaker: string; text: string }[];
    currentDialogue: { speaker: string; text: string } | null;
}

export interface AnimationBeat<S> {
    phase: string;
    seconds: number;
    to?: Partial<S>;
    enter?: (scene: S) => void;
    frame?: (scene: S, progress: number) => void;
}

// One checkpoint per line. Space settles the outgoing choreography before
// moving to the next line, even when several presses arrive in one frame.
// The scene's ambient clock never resets; phaseTime is local choreography time.
export class DialogueTimeline<S extends DialogueScene> {
    private checkpoints: AnimationBeat<S>[][];
    private outro: AnimationBeat<S>[];
    private beatIndex = 0;
    private elapsed = 0;
    private starts: Record<string, number> = {};
    private entered = false;
    finished = false;

    constructor(checkpoints: AnimationBeat<S>[][], outro: AnimationBeat<S>[] = []) {
        this.checkpoints = checkpoints;
        this.outro = outro;
    }

    private beats(scene: S) {
        return this.checkpoints[scene.dialogueIndex] ?? this.outro;
    }

    private enter(scene: S, beat: AnimationBeat<S>) {
        scene.phase = beat.phase;
        scene.phaseTime = 0;
        beat.enter?.(scene);
        this.starts = {};
        for (const key of Object.keys(beat.to ?? {})) {
            const value = scene[key as keyof S];
            if (typeof value === 'number') this.starts[key] = value;
        }
        this.entered = true;
        this.paint(scene, beat, 0);
    }

    private paint(scene: S, beat: AnimationBeat<S>, progress: number) {
        scene.motionActive = progress < 1 && (!!beat.to || !!beat.frame);
        const eased = progress * progress * (3 - 2 * progress);
        for (const [key, start] of Object.entries(this.starts)) {
            const end = beat.to?.[key as keyof S];
            if (typeof end === 'number') Object.assign(scene, { [key]: start + (end - start) * eased });
        }
        beat.frame?.(scene, progress);
    }

    update(scene: S, dt: number) {
        scene.timer += Math.max(0, dt);
        let remaining = Math.max(0, dt);
        while (!this.finished) {
            const beats = this.beats(scene);
            const beat = beats[this.beatIndex];
            if (!beat) {
                this.finished = scene.dialogueIndex >= this.checkpoints.length;
                break;
            }
            if (!this.entered) this.enter(scene, beat);
            const step = Math.min(remaining, Math.max(0, beat.seconds - this.elapsed));
            this.elapsed += step;
            scene.phaseTime = this.elapsed;
            remaining -= step;
            this.paint(scene, beat, Math.min(1, this.elapsed / Math.max(0.001, beat.seconds)));
            if (this.elapsed < beat.seconds) break;
            if (this.beatIndex === beats.length - 1 && scene.dialogueIndex < this.checkpoints.length) break;
            this.beatIndex++;
            this.elapsed = 0;
            this.entered = false;
        }
        scene.currentDialogue = this.finished ? null : scene.dialogues[scene.dialogueIndex] ?? null;
        return this.finished;
    }

    advance(scene: S) {
        if (this.finished || scene.dialogueIndex >= this.checkpoints.length) return;
        const beats = this.beats(scene);
        for (; this.beatIndex < beats.length; this.beatIndex++) {
            const beat = beats[this.beatIndex];
            if (!this.entered) this.enter(scene, beat);
            this.paint(scene, beat, 1);
            this.entered = false;
        }
        scene.dialogueIndex++;
        this.beatIndex = 0;
        this.elapsed = 0;
        this.update(scene, 0);
    }
}
