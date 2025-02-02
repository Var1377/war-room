import { writable } from 'svelte/store';
import type { Stakeholder } from '@prisma/client';

export type Node = {
    type: "event";
    id: string;
    event: {
        name: string;
        description: string;
        reasoning?: string;
        implications?: string;
        satisfaction?: number;
        actorId: string;
    };
    events: Node[];
} | {
    type: "root";
    id: "root";
    events: Node[];
} | {
    type: "stakeholder";
    id: Stakeholder["id"];
    stakeholder: Stakeholder;
    events: Node[];
};

export type NodePath = {
    node: Node;
    parent: Node | null;
    path: string[];
};

function createTreeStore() {
    const { subscribe, update, set } = writable<Node>({ 
        type: "root", 
        id: "root", 
        events: [] 
    });

    return {
        subscribe,
        addStakeholders: (stakeholders: Stakeholder[]) => {
            set({
                type: "root",
                id: "root",
                events: stakeholders.map(stakeholder => ({
                    type: "stakeholder" as const,
                    id: stakeholder.id,
                    stakeholder,
                    events: []
                }))
            });
        },
        addEvents: (path: string[], events: Array<{
            name: string;
            description: string;
            reasoning?: string;
            implications?: string;
            satisfaction?: number;
            actorId: string;
        }>) => {
            console.log("[TreeStore] Adding events at path:", path);
            
            update(root => {
                const newRoot = { ...root };
                let current = newRoot;
                
                // Skip the root node in the path (index 0) but traverse to the target node
                for (let i = 1; i < path.length; i++) {
                    const segment = path[i];
                    console.log("[TreeStore] Looking for node:", segment, "in", current);
                    const nextNode = current.events.find(e => e.id === segment);
                    if (!nextNode) {
                        console.log("[TreeStore] Failed to find node at path segment:", segment);
                        return root;
                    }
                    current = nextNode;
                }

                // Add new events
                const newEvents = events.map(event => ({
                    type: "event" as const,
                    id: event.name,
                    event,
                    events: [] as Node[]
                }));

                // Append new events instead of replacing
                current.events = [...current.events, ...newEvents];
                console.log("[TreeStore] Updated tree:", newRoot);
                return newRoot;
            });
        }
    };
}

export const treeStore = createTreeStore();

// Helper to get node context from path
export function getNodeContext(root: Node, path: string[]): NodePath | null {
    if (path.length === 0) return null;
    
    let current = root;
    let parent: Node | null = null;
    
    for (let i = 1; i < path.length; i++) {
        const segment = path[i];
        parent = current;
        const nextNode = current.events.find(e => e.id === segment);
        if (!nextNode) return null;
        current = nextNode;
    }
    
    return {
        node: current,
        parent,
        path
    };
} 