import React, { useState } from 'react';
import type { Group, Subgroup } from '../lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
    groups: Group[];
    selectedSubgroup: Subgroup | null;
    onSelectSubgroup: (subgroup: Subgroup) => void;
    onSelectFavorites: () => void;
    isFavoritesSelected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    groups,
    selectedSubgroup,
    onSelectSubgroup,
    onSelectFavorites,
    isFavoritesSelected
}) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map(g => g.name)));

    const toggleGroup = (groupName: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
        } else {
            newExpanded.add(groupName);
        }
        setExpandedGroups(newExpanded);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>Rhythm Forge</div>
            <ul className={styles.groupList}>
                <li className={styles.groupItem}>
                    <div
                        className={`${styles.groupTitle} ${isFavoritesSelected ? styles.selected : ''}`}
                        onClick={onSelectFavorites}
                        style={{ cursor: 'pointer', color: isFavoritesSelected ? 'var(--primary-color)' : 'inherit' }}
                    >
                        ♥ Favorites
                    </div>
                </li>
                {groups.map(group => (
                    <li key={group.name} className={styles.groupItem}>
                        <div className={styles.groupTitle} onClick={() => toggleGroup(group.name)}>
                            {group.name}
                            <span>{expandedGroups.has(group.name) ? '▼' : '▶'}</span>
                        </div>
                        {expandedGroups.has(group.name) && (
                            <ul className={styles.subgroupList}>
                                {group.subgroups.map(subgroup => (
                                    <li
                                        key={subgroup.name}
                                        className={`${styles.subgroupItem} ${selectedSubgroup === subgroup ? styles.selected : ''}`}
                                        onClick={() => onSelectSubgroup(subgroup)}
                                    >
                                        {subgroup.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
