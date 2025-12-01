import type { Pattern, Group, Subgroup } from '../types';
import complexPatterns from '../../assets/patterns/complex_16beat.json';
import group1Patterns from '../../assets/patterns/group1_8beat_foundations.json';
import group2Patterns from '../../assets/patterns/group2_technique_articulation.json';
import group3Patterns from '../../assets/patterns/group3_rhythmic_challenges.json';
import group4Patterns from '../../assets/patterns/group4_genre_style.json';
import group5Patterns from '../../assets/patterns/group5_progressive_fills.json';
import group6Patterns from '../../assets/patterns/group6_recommended_extras.json';

// In a real app, this might load from a file system or API.
// For V1.0, we bundle the JSONs.

export const loadPatterns = (): Group[] => {
    const rawPatterns = [...complexPatterns, ...group1Patterns, ...group2Patterns, ...group3Patterns, ...group4Patterns, ...group5Patterns, ...group6Patterns] as Pattern[];

    // Group patterns by group and subgroup
    const groupsMap = new Map<string, Map<string, Pattern[]>>();

    rawPatterns.forEach(pattern => {
        if (!groupsMap.has(pattern.group)) {
            groupsMap.set(pattern.group, new Map());
        }
        const subgroups = groupsMap.get(pattern.group)!;
        if (!subgroups.has(pattern.subgroup)) {
            subgroups.set(pattern.subgroup, []);
        }
        subgroups.get(pattern.subgroup)!.push(pattern);
    });

    const groups: Group[] = [];
    groupsMap.forEach((subgroupsMap, groupName) => {
        const subgroups: Subgroup[] = [];
        subgroupsMap.forEach((patterns, subgroupName) => {
            subgroups.push({
                name: subgroupName,
                patterns: patterns
            });
        });
        groups.push({
            name: groupName,
            subgroups: subgroups
        });
    });

    return groups;
};
