import React, { useEffect, useRef } from 'react';
import type { Pattern } from '../lib/types';
import { ScoreRenderer } from '../lib/score/ScoreRenderer';

interface ScoreViewProps {
    pattern: Pattern;
    isSelected: boolean;
    onClick: () => void;
}

export const ScoreView: React.FC<ScoreViewProps> = ({ pattern, isSelected, onClick }) => {
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
            ref={containerRef}
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
                paddingBottom: '20px'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 5,
                left: 10,
                color: 'black',
                fontWeight: 'bold',
                fontSize: '0.9rem'
            }}>
                {pattern.title}
            </div>
        </div>
    );
};
