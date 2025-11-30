import React from 'react';
import type { Pattern } from '../lib/types';
import { ScoreView } from './ScoreView';
import styles from './PatternGrid.module.css';

interface PatternGridProps {
    patterns: Pattern[];
    selectedPattern: Pattern | null;
    onSelectPattern: (pattern: Pattern) => void;
}

export const PatternGrid: React.FC<PatternGridProps> = ({ patterns, selectedPattern, onSelectPattern }) => {
    return (
        <div className={styles.grid}>
            {patterns.map((pattern, index) => (
                <ScoreView
                    key={`${pattern.title}-${index}`}
                    pattern={pattern}
                    isSelected={selectedPattern === pattern}
                    onClick={() => onSelectPattern(pattern)}
                />
            ))}
        </div>
    );
};
