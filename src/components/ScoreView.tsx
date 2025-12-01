import React, { useEffect, useRef } from 'react';
import type { Pattern } from '../lib/types';
import { ScoreRenderer } from '../lib/score/ScoreRenderer';

interface ScoreViewProps {
    pattern: Pattern;
    index: number;
    isSelected: boolean;
    onClick: () => void;
}

export const ScoreView: React.FC<ScoreViewProps> = ({ pattern, index, isSelected, onClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<ScoreRenderer | null>(null);
    const prevWidth = useRef<number>(0);

    useEffect(() => {
        if (containerRef.current && !rendererRef.current) {
            rendererRef.current = new ScoreRenderer(containerRef.current);
        }

        if (rendererRef.current) {
            rendererRef.current.render(pattern);
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width !== prevWidth.current) {
                    prevWidth.current = entry.contentRect.width;
                    if (rendererRef.current) {
                        rendererRef.current.resize();
                    }
                }
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [pattern]);

    return (
        <div
            onClick={onClick}
            style={{
                width: '100%',
                height: 'auto',
                minHeight: '200px',
                border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden', // Ensure header radius is respected
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{
                backgroundColor: isSelected ? 'var(--primary-color)' : '#f0f0f0',
                color: isSelected ? 'white' : 'black',
                padding: '8px 12px',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#ddd',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                }}>
                    #{index + 1}
                </span>
                <span>{pattern.title}</span>
            </div>

            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    paddingBottom: '20px'
                }}
            />
        </div>
    );
};
