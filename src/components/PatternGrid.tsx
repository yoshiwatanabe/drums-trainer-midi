import React from 'react';
import type { Pattern } from '../lib/types';
import { ScoreView } from './ScoreView';
import styles from './PatternGrid.module.css';

interface PatternGridProps {
    patterns: Pattern[];
    selectedPattern: Pattern | null;
    onSelectPattern: (pattern: Pattern) => void;
    favorites: Set<string>;
    onToggleFavorite: (pattern: Pattern) => void;
    getPatternId: (pattern: Pattern) => string;
}

export const PatternGrid: React.FC<PatternGridProps> = ({
    patterns,
    selectedPattern,
    onSelectPattern,
    favorites,
    onToggleFavorite,
    getPatternId
}) => {
    return (
        <div className={styles.grid}>
            {patterns.map((pattern, index) => (
                <ScoreView
                    key={`${pattern.title}-${index}`}
                    pattern={pattern}
                    index={index}
                    isSelected={selectedPattern === pattern}
                    onClick={() => onSelectPattern(pattern)}
                    isFavorite={favorites.has(getPatternId(pattern))}
                    onToggleFavorite={() => onToggleFavorite(pattern)}
                />
            ))}
        </div>
    );
};
