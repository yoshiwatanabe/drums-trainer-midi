import React, { useEffect, useRef } from 'react';
import type { Pattern } from '../lib/types';
import { ScoreRenderer } from '../lib/score/ScoreRenderer';

interface ScoreViewProps {
    pattern: Pattern;
    index: number;
    isSelected?: boolean;
    onClick?: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export const ScoreView: React.FC<ScoreViewProps> = ({
    pattern,
    index,
    isSelected,
    onClick,
    isFavorite,
    onToggleFavorite
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<ScoreRenderer | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize renderer
        rendererRef.current = new ScoreRenderer(containerRef.current);

        // Render pattern
        const render = async () => {
            if (rendererRef.current) {
                await rendererRef.current.render(pattern);
            }
        };
        render();

        // Cleanup
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [pattern]);

    return (
        <div
            style={{
                border: isSelected ? '2px solid var(--primary-color)' : '1px solid #ccc',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            onClick={onClick}
        >
            <div style={{
                backgroundColor: isSelected ? 'var(--primary-color)' : '#f0f0f0',
                color: isSelected ? 'white' : '#333',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>#{index + 1} {pattern.title}</span>
                {onToggleFavorite && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                        style={{
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: isFavorite ? (isSelected ? 'white' : 'red') : (isSelected ? 'rgba(255,255,255,0.5)' : '#ccc'),
                            userSelect: 'none'
                        }}
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        {isFavorite ? '♥' : '♡'}
                    </span>
                )}
            </div>
            <div ref={containerRef} style={{ width: '100%', height: '150px' }} />
        </div>
    );
};
