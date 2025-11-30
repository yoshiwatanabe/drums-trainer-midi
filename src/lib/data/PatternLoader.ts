import type { Pattern, Group, Subgroup } from '../types';
import complexPatterns from '../../assets/patterns/complex_16beat.json';

// In a real app, this might load from a file system or API.
// For V1.0, we bundle the JSONs.

export const loadPatterns = (): Group[] => {
    const rawPatterns = complexPatterns as Pattern[];

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
