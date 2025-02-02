<script lang="ts" module>
    export type Event = {
        name: string;
        description: string;
        actor: string;
        reasoning?: string;
        implications?: string;
        satisfaction?: number;
        children: Event[];
    }

    interface GeneratedEvent {
        name: string;
        description: string;
        reasoning: string;
        implications: string;
        satisfaction: number;
    }
</script>
<script lang="ts">
	import Tree, { type TreeNode } from './Tree.svelte';
    import * as d3 from 'd3';

    const { data } = $props();
    const { scenario } = $derived(data);

    let autoincrement = $state(0);
    let loadingNodes = $state<Set<string>>(new Set());

    const rootEvent = $state<Event>({
        name: 'Start',
        description: 'The start of the scenario',
        actor: 'N/A',
        children: []
    });

    // Generate colors for stakeholders
    const stakeholderColors = $derived(() => {
        const colors: Record<string, string> = {};
        const colorScale = d3.scaleSequential()
            .domain([0, scenario.stakeholders.length])
            .interpolator(t => d3.hsl(t * 360, 0.7, 0.4).toString());
            
        scenario.stakeholders.forEach((stakeholder, index) => {
            colors[stakeholder.id] = colorScale(index);
        });
        return colors;
    });

    // Get the path of events from root to target event
    function getEventPath(root: Event, targetEvent: Event): Event[] {
        function findPath(current: Event, target: Event, path: Event[]): Event[] | null {
            // Add current event to path
            path.push(current);
            
            // If this is our target, we found the path
            if (current === target) {
                return path;
            }
            
            // Search through children
            for (const child of current.children) {
                const result = findPath(child, target, [...path]);
                if (result) {
                    return result;
                }
            }
            
            return null;
        }

        const path = findPath(root, targetEvent, []);
        return path || [root];
    }

    async function addEvent(parentEvent: Event, stakeholder: any, nodeId: string) {
        loadingNodes.add(nodeId);
        loadingNodes = loadingNodes;
        tree = buildTreeData(rootEvent, nodeId);

        try {
            const eventPath = getEventPath(rootEvent, parentEvent);

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scenarioId: scenario.id,
                    stakeholderId: stakeholder.id,
                    eventPath
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate events');
            }

            const generatedEvents = await response.json() as GeneratedEvent[];

            // Add the generated events as children (ensuring reactivity)
            parentEvent.children = [
                ...parentEvent.children,
                ...generatedEvents.map((event: GeneratedEvent) => ({
                    name: event.name,
                    description: event.description,
                    reasoning: event.reasoning,
                    implications: event.implications,
                    actor: stakeholder.name,
                    satisfaction: event.satisfaction,
                    children: []
                }))
            ];
            
            // Create a new root event to trigger full tree reactivity
            rootEvent.children = [...rootEvent.children];

        } catch (error) {
            console.error('Failed to generate events:', error);
            // Add a fallback event in case of error
            parentEvent.children = [
                ...parentEvent.children,
                {
                    name: `${stakeholder.name}'s Action`,
                    description: `node-${autoincrement++}`,
                    actor: stakeholder.name,
                    children: []
                }
            ];
        } finally {
            loadingNodes.delete(nodeId);
            loadingNodes = loadingNodes;
            tree = buildTreeData(rootEvent);
        }
    }

    function buildTreeData(event: Event, loadingNodeId?: string): TreeNode {
        return {
            name: event.name,
            id: event.description,
            details: event.reasoning || event.implications ? 
                `${event.description}\n\n${event.reasoning ? `Reasoning: ${event.reasoning}\n\n` : ''}${event.implications ? `Implications: ${event.implications}` : ''}`
                : event.description,
            children: [
                // First, show all events that have already been generated
                ...event.children.map(childEvent => buildTreeData(childEvent, loadingNodeId)),
                // Then, show stakeholder nodes for potential new events
                ...scenario.stakeholders.map(stakeholder => {
                    const stakeholderId = `${event.description}-stakeholder-${stakeholder.id}`;
                    return {
                        name: stakeholder.name,
                        id: stakeholderId,
                        backgroundColor: stakeholderColors()[stakeholder.id],
                        loading: loadingNodes.has(stakeholderId),
                        onClick: () => addEvent(event, stakeholder, stakeholderId)
                    };
                })
            ]
        }
    }

    let tree = $state(buildTreeData(rootEvent));
</script>

<div class="relative">
    <Tree data={tree} />
    
    <!-- Legend -->
    <div class="absolute top-4 right-4 bg-surface-900/80 p-4 rounded-lg">
        <h3 class="mb-2 text-sm font-semibold">Stakeholders</h3>
        <div class="flex flex-col gap-2">
            {#each scenario.stakeholders as stakeholder, i}
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded" style="background-color: {stakeholderColors()[stakeholder.id]}"></div>
                    <span class="text-sm">{stakeholder.name}</span>
                </div>
            {/each}
        </div>
    </div>
</div>

<div class="container mx-auto p-8">
    <div class="mt-8 flex justify-end gap-4">
        <a href={`/${scenario.id}/stakeholders`} class="variant-soft-secondary btn">Edit Stakeholders</a>
        <a href={`/${scenario.id}/relationships`} class="variant-soft-secondary btn">Edit Relationships</a>
    </div>
</div>

<style>
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

:global(.node.loading) {
    animation: pulse 1s ease-in-out infinite;
}
</style>