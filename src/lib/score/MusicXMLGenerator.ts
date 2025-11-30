import type { Pattern, PatternEvent } from '../types';

export class MusicXMLGenerator {
    static generate(pattern: Pattern): string {
        const header = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Drums</part-name>
    </score-part>
  </part-list>
  <part id="P1">`;

        const measures = this.generateMeasures(pattern);

        const footer = `
  </part>
</score-partwise>`;

        return header + measures + footer;
    }

    private static generateMeasures(pattern: Pattern): string {
        let xml = '';
        const length = pattern.length_in_measures;

        // Group events by measure
        const measureEvents = new Array(length).fill(0).map(() => [] as PatternEvent[]);

        pattern.events.forEach(event => {
            const measureIndex = Math.floor(event.start_time / 4);
            if (measureIndex < length) {
                measureEvents[measureIndex].push(event);
            }
        });

        for (let i = 0; i < length; i++) {
            xml += this.generateMeasure(i + 1, measureEvents[i], i === 0, pattern.time_signature);
        }

        return xml;
    }

    private static generateMeasure(number: number, events: PatternEvent[], isFirst: boolean, timeSignature: string): string {
        let xml = `<measure number="${number}">`;

        if (isFirst) {
            const [beats, beatType] = timeSignature.split('/');
            xml += `
      <attributes>
        <divisions>4</divisions> <!-- 4 divisions per quarter note = 16th note precision -->
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${beats}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
        <clef>
          <sign>percussion</sign>
          <line>2</line>
        </clef>
      </attributes>`;
        }

        // Quantize to 16th notes (0, 1, 2 ... 15)
        // 4 beats * 4 divisions = 16 slots
        const grid = new Array(16).fill(null).map(() => [] as PatternEvent[]);

        events.forEach(event => {
            // Relative time within measure
            const relTime = event.start_time % 4;
            const slot = Math.round(relTime * 4); // 0.0 -> 0, 0.25 -> 1
            if (slot >= 0 && slot < 16) {
                grid[slot].push(event);
            }
        });

        // Iterate grid and generate notes/rests
        let i = 0;
        while (i < 16) {
            if (grid[i].length > 0) {
                // Note(s) found
                const evts = grid[i];
                // Sort by pitch?

                // Write note(s)
                // Duration is 1 (16th note)
                // We always write 16th note for now
                evts.forEach((evt, index) => {
                    const isChord = index > 0;
                    xml += this.getNoteXML(evt, 1, isChord);
                });
                i++;
            } else {
                // Rest found
                // Count consecutive rests
                let restLength = 0;
                let j = i;
                while (j < 16 && grid[j].length === 0) {
                    restLength++;
                    j++;
                }

                // Optimize rest duration
                // We have `restLength` 16th notes.
                // Try to fit largest rests.
                // 16 = whole (if 4/4)
                // 8 = half
                // 4 = quarter
                // 2 = eighth
                // 1 = 16th

                // But we must align to beats?
                // MusicXML doesn't strictly enforce beat alignment but it looks better.
                // For simplicity, let's just output combinations of 4, 2, 1.

                let remaining = restLength;
                while (remaining > 0) {
                    let duration = 1;
                    let type = '16th';

                    if (remaining >= 4) {
                        duration = 4;
                        type = 'quarter';
                    } else if (remaining >= 2) {
                        duration = 2;
                        type = 'eighth';
                    } else {
                        duration = 1;
                        type = '16th';
                    }

                    xml += this.getRestXML(duration, type);
                    remaining -= duration;
                }

                i += restLength;
            }
        }

        xml += `</measure>`;
        return xml;
    }

    private static getNoteXML(event: PatternEvent, duration: number, chord: boolean): string {
        const stepInfo = this.getStepInfo(event.midi_note);
        let type = '16th';
        if (duration === 2) type = 'eighth';
        if (duration === 4) type = 'quarter';

        return `
      <note>
        ${chord ? '<chord/>' : ''}
        <unpitched>
          <display-step>${stepInfo.step}</display-step>
          <display-octave>${stepInfo.octave}</display-octave>
        </unpitched>
        <duration>${duration}</duration>
        <instrument id="P1-I${event.midi_note}"/>
        <voice>1</voice>
        <type>${type}</type>
        <stem>up</stem>
        <notehead>${stepInfo.notehead}</notehead>
      </note>`;
    }

    private static getRestXML(duration: number, type: string): string {
        return `
      <note>
        <rest/>
        <duration>${duration}</duration>
        <voice>1</voice>
        <type>${type}</type>
      </note>`;
    }

    private static getStepInfo(midiNote: number): { step: string, octave: number, notehead: string } {
        // GM Mapping
        switch (midiNote) {
            case 36: return { step: 'F', octave: 4, notehead: 'normal' }; // Kick (Bottom space)
            case 38: return { step: 'C', octave: 5, notehead: 'normal' }; // Snare (3rd space)
            case 42: return { step: 'G', octave: 5, notehead: 'x' }; // Closed HH (Top space)
            case 46: return { step: 'G', octave: 5, notehead: 'diamond' }; // Open HH (Top space) - Using diamond or circle-x
            case 49: return { step: 'A', octave: 5, notehead: 'x' }; // Crash (Line above)
            case 51: return { step: 'B', octave: 5, notehead: 'x' }; // Ride
            case 41: return { step: 'F', octave: 4, notehead: 'normal' }; // Low Tom (Same as kick? No, usually line below)
            // Let's refine mapping
            // Standard Drum Notation:
            // Kick: F4 (Bottom space)
            // Snare: C5 (3rd space)
            // HiHat: G5 (Top space)
            // High Tom: E5 (4th space)
            // Mid Tom: D5 (4th line)
            // Low Tom: A4 (2nd space)
            // Floor Tom: F4? No, usually G4 or A4.

            // Let's use:
            // Kick: F4
            // Snare: C5
            // HH: G5
            // Tom1 (High): E5
            // Tom2 (Mid): D5
            // Tom3 (Low): A4
            // Crash: A5 (Ledger line)
            // Ride: F5 (Top line)
        }

        // Default
        if (midiNote === 50) return { step: 'E', octave: 5, notehead: 'normal' }; // High Tom
        if (midiNote === 48) return { step: 'D', octave: 5, notehead: 'normal' }; // Mid Tom
        if (midiNote === 45) return { step: 'A', octave: 4, notehead: 'normal' }; // Low Tom
        if (midiNote === 41) return { step: 'F', octave: 4, notehead: 'normal' }; // Floor Tom (Low) - maybe G4?

        return { step: 'C', octave: 5, notehead: 'normal' };
    }
}
