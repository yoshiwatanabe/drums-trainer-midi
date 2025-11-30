import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { Pattern } from '../types';
import { MusicXMLGenerator } from './MusicXMLGenerator';

export class ScoreRenderer {
    private osmd: OpenSheetMusicDisplay | null = null;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.osmd = new OpenSheetMusicDisplay(this.container, {
            autoResize: false, // We handle resize manually
            backend: 'svg',
            drawTitle: false,
            drawPartNames: false,
        });
    }

    async render(pattern: Pattern) {
        if (!this.osmd) return;

        const xml = MusicXMLGenerator.generate(pattern);

        try {
            await this.osmd.load(xml);
            this.osmd.render();
        } catch (e) {
            console.error('Error rendering score:', e);
        }
    }

    resize() {
        if (this.osmd) {
            this.osmd.render();
        }
    }
}
