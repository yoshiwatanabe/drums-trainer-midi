export class DrumSynthesizer {
    private ctx: AudioContext;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
    }

    playNote(midiNote: number, time: number, velocity: number) {
        const gain = velocity / 127;
        switch (midiNote) {
            case 36: // Kick
                this.playKick(time, gain);
                break;
            case 38: // Snare
            case 40: // Snare 2
                this.playSnare(time, gain);
                break;
            case 42: // Closed HH
                this.playHiHat(time, gain, 0.05);
                break;
            case 46: // Open HH
                this.playHiHat(time, gain, 0.3);
                break;
            case 49: // Crash
                this.playCrash(time, gain);
                break;
            case 51: // Ride
                this.playRide(time, gain);
                break;
            case 41: // Low Tom
            case 43: // Low Tom
                this.playTom(time, gain, 100);
                break;
            case 45: // Mid Tom
            case 47: // Mid Tom
            case 48: // Hi Mid Tom
                this.playTom(time, gain, 150);
                break;
            case 50: // High Tom
                this.playTom(time, gain, 200);
                break;
            default:
                // Fallback click
                this.playClick(time, gain);
        }
    }

    private playKick(time: number, gain: number) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gainNode.gain.setValueAtTime(gain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    private playSnare(time: number, gain: number) {
        // Noise
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 sec
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseEnvelope = this.ctx.createGain();

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnvelope);
        noiseEnvelope.connect(this.ctx.destination);

        noiseEnvelope.gain.setValueAtTime(gain, time);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.start(time);
        noise.stop(time + 0.2);

        // Tone
        const osc = this.ctx.createOscillator();
        const oscEnvelope = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);

        oscEnvelope.gain.setValueAtTime(gain * 0.5, time);
        oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.connect(oscEnvelope);
        oscEnvelope.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    private playHiHat(time: number, gain: number, duration: number) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;

        const envelope = this.ctx.createGain();

        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.ctx.destination);

        envelope.gain.setValueAtTime(gain * 0.8, time);
        envelope.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noise.start(time);
        noise.stop(time + duration);
    }

    private playTom(time: number, gain: number, freq: number) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.3);

        gainNode.gain.setValueAtTime(gain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    private playCrash(time: number, gain: number) {
        this.playHiHat(time, gain, 1.5); // Long hihat
    }

    private playRide(time: number, gain: number) {
        // Bell-ish tone
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'square'; // More harmonics
        osc.frequency.setValueAtTime(400, time);

        // Filter to make it metallic
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 5000;
        filter.Q.value = 10;

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        gainNode.gain.setValueAtTime(gain * 0.6, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 1.0);

        osc.start(time);
        osc.stop(time + 1.0);
    }

    private playClick(time: number, gain: number) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.frequency.setValueAtTime(800, time);
        gainNode.gain.setValueAtTime(gain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
    }
}
