import React, { type ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
    sidebar: ReactNode;
    main: ReactNode;
    player: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main, player }) => {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>{sidebar}</aside>
            <main className={styles.main}>{main}</main>
            <footer className={styles.player}>{player}</footer>
        </div>
    );
};
