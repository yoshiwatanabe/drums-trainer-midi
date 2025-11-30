export interface PatternEvent {
    midi_note: number;
    start_time: number; // Relative time in quarter notes (0.0 = start of bar)
    duration: number; // Duration in quarter notes
    velocity: number; // 0-127
    hand?: 'R' | 'L'; // Optional for V1.0
}

export interface Pattern {
    group: string;
    subgroup: string;
    title: string;
    bpm: number;
    time_signature: string;
    length_in_measures: number;
    events: PatternEvent[];
}

export interface Subgroup {
    name: string;
    patterns: Pattern[];
}

export interface Group {
    name: string;
    subgroups: Subgroup[];
}
