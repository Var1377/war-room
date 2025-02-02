import { writable, derived } from 'svelte/store';
import type { Node } from './tree';
import { treeStore } from './tree';

// Store for the currently selected node
export const selectedNode = writable<Node | null>(null);

// Derived store that calculates the path to the selected node
export const nodePath = derived([treeStore, selectedNode], ([$treeStore, $selectedNode]) => {
    if (!$selectedNode) return [];

    const path: Node[] = [];
    let current = $treeStore;
    
    function findNodePath(node: Node, target: Node): boolean {
        if (node === target) {
            path.push(node);
            return true;
        }

        for (const child of node.events) {
            if (findNodePath(child, target)) {
                path.unshift(node);
                return true;
            }
        }

        return false;
    }

    findNodePath($treeStore, $selectedNode);
    return path;
}); 