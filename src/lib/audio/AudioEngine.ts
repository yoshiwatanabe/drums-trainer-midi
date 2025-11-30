import type { Pattern } from '../types';
import { DrumSynthesizer } from './DrumSynthesizer';

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private synth: DrumSynthesizer | null = null;
    private isPlaying: boolean = false;
    private currentPattern: Pattern | null = null;
    private nextNoteIndex: number = 0;
    private nextNoteTime: number = 0; // Absolute time in AudioContext
    private timerID: number | null = null;
    private lookahead: number = 25.0; // ms
    private scheduleAheadTime: number = 0.1; // s
    private bpm: number = 120;
    private loop: boolean = true;

    constructor() {
        // AudioContext must be initialized after user interaction
    }

    async init() {
        if (!this.ctx) {
            this.ctx = new AudioContext();
            this.synth = new DrumSynthesizer(this.ctx);
        }
    }

    play(pattern: Pattern, bpm?: number) {
        if (!this.ctx) this.init();

        this.currentPattern = pattern;
        // Sort events by time to ensure scheduler works correctly
        this.currentPattern.events.sort((a, b) => a.start_time - b.start_time);

        this.bpm = bpm || pattern.bpm;
        this.isPlaying = true;
        this.nextNoteIndex = 0;
        this.nextNoteTime = this.ctx!.currentTime + 0.1; // Start slightly in future

        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID !== null) {
            window.clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    setBpm(bpm: number) {
        this.bpm = bpm;
    }

    setLoop(loop: boolean) {
        this.loop = loop;
    }

    private scheduler() {
        if (!this.isPlaying || !this.ctx) return;

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote();
            this.advanceNote();
        }

        this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }

    private scheduleNote() {
        if (!this.currentPattern || !this.synth) return;

        const event = this.currentPattern.events[this.nextNoteIndex];
        if (event) {
            this.synth.playNote(event.midi_note, this.nextNoteTime, event.velocity);
        }
    }

    private advanceNote() {
        if (!this.currentPattern) return;

        // Move to next event
        const currentEvent = this.currentPattern.events[this.nextNoteIndex];
        this.nextNoteIndex++;

        if (this.nextNoteIndex >= this.currentPattern.events.length) {
            if (this.loop) {
                this.nextNoteIndex = 0;
            } else {
                this.isPlaying = false;
                return;
            }
        }

        const nextEvent = this.currentPattern.events[this.nextNoteIndex];

        let deltaBeats = 0;

        if (this.nextNoteIndex === 0) {
            // We just looped.
            const patternLengthBeats = this.currentPattern.length_in_measures * 4;
            deltaBeats = patternLengthBeats - currentEvent.start_time + nextEvent.start_time;
        } else {
            deltaBeats = nextEvent.start_time - currentEvent.start_time;
        }

        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += deltaBeats * secondsPerBeat;
    }
}
