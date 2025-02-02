import { writable, derived, get } from 'svelte/store';
import type { Stakeholder } from '@prisma/client';

// Create a color scheme for stakeholders
const darkColors = [
    '#2c3e50', // Dark Blue
    '#c0392b', // Dark Red
    '#27ae60', // Dark Green
    '#8e44ad', // Dark Purple
    '#d35400', // Dark Orange
    '#16a085', // Dark Teal
    '#2980b9', // Medium Blue
    '#c0392b', // Medium Red
    '#2ecc71', // Medium Green
    '#9b59b6'  // Medium Purple
];

// Store for stakeholders
export const stakeholders = writable<Stakeholder[]>([]);

// Derived store for color mappings
export const colorMap = derived(stakeholders, ($stakeholders) => {
    const map = new Map<string, string>();
    $stakeholders.forEach((stakeholder, index) => {
        map.set(stakeholder.id, darkColors[index % darkColors.length]);
    });
    return map;
});

// Helper function to get color for a stakeholder ID
export function getColor(stakeholderId: string | undefined): string {
    if (!stakeholderId) return 'rgb(var(--color-primary-500))';
    return get(colorMap).get(stakeholderId) || 'rgb(var(--color-primary-500))';
} 