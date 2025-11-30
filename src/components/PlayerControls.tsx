import React from 'react';
import styles from './PlayerControls.module.css';

interface PlayerControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    bpm: number;
    onBpmChange: (bpm: number) => void;
    loop: boolean;
    onLoopToggle: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    isPlaying,
    onPlayPause,
    bpm,
    onBpmChange,
    loop,
    onLoopToggle
}) => {
    return (
        <div className={styles.container}>
            <button className={styles.playButton} onClick={onPlayPause}>
                {isPlaying ? 'STOP' : 'PLAY'}
            </button>

            <div className={styles.controlGroup}>
                <label>BPM: {bpm}</label>
                <input
                    type="range"
                    min="40"
                    max="200"
                    value={bpm}
                    onChange={(e) => onBpmChange(Number(e.target.value))}
                />
            </div>

            <div className={styles.controlGroup}>
                <label>
                    <input
                        type="checkbox"
                        checked={loop}
                        onChange={onLoopToggle}
                    />
                    Loop
                </label>
            </div>
        </div>
    );
};
