<script lang="ts" module>
    type BaseNode = {
        events: Node[];
    };

    export type Node = ({
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
    } | {
        type: "root";
        id: "root";
    } | {
        type: "stakeholder";
        id: Stakeholder["id"];
        stakeholder: Stakeholder;
    }) & BaseNode;

    type EventNode = Extract<Node, { type: "event" }>;
</script>
<script lang="ts">
	import Tree, { type TreeData } from "./Tree.svelte";
	import Event from "./Event.svelte";
	import Root from "./Root.svelte";
	import type { Stakeholder } from "@prisma/client";
    import { treeStore } from "./tree";
    import Generate from "./Generate.svelte";
    import { colorMap } from './colorStore';

    const { data } = $props();
    const scenario = $derived(data.scenario);
    const colors = $derived($colorMap);

    function isEventNode(node: Node): node is EventNode {
        return node.type === "event";
    }

    function buildTreeData(node: Node, path: string[] = ["root"], parentStakeholderId?: string): TreeData {
        console.log("[TreeBuilder] Building node:", { type: node.type, id: node.id, path });
        
        // Create a map of stakeholder order for sorting
        const stakeholderOrder = new Map(
            scenario.stakeholders.map((s, index) => [s.id, index])
        );

        // Helper to get sort order for a node
        function getNodeOrder(node: Node): number {
            if (isEventNode(node)) return stakeholderOrder.get(node.event.actorId) ?? Infinity;
            if (node.type === "stakeholder") return stakeholderOrder.get(node.stakeholder.id) ?? Infinity;
            return Infinity;
        }

        // Sort children by stakeholder order
        const sortedChildren = [...node.events].sort((a, b) => getNodeOrder(a) - getNodeOrder(b));
        
        // Get set of stakeholder IDs that already have events
        const existingStakeholderIds = new Set(
            sortedChildren
                .filter(child => 
                    child.type === "stakeholder" || 
                    (isEventNode(child))
                )
                .map(child => 
                    child.type === "stakeholder" ? child.id : 
                    child.event.actorId
                )
        );

        // Add generate node at the top if this is not a stakeholder node
        const generateNode = {
            id: `generate-${path.join("-")}`,
            type: undefined,
            component: Generate,
            props: { 
                stakeholders: scenario.stakeholders,
                path,
                existingStakeholderIds,
                color: parentStakeholderId && colors?.get(parentStakeholderId)
            },
            children: [],
            events: [],
            stakeholderId: undefined
        } as TreeData;

        const allChildren = node.type !== "stakeholder" ? [
            generateNode,
            ...sortedChildren
        ] : sortedChildren;
        
        switch (node.type) {
            case "root":
                return {
                    id: "root",
                    type: undefined,
                    component: Root,
                    props: { scenario },
                    children: allChildren
                        .map(child => 'component' in child ? child : buildTreeData(child, [...path, child.id])),
                    stakeholderId: undefined,
                    events: node.events
                } as TreeData;
            case "event":
                return {
                    id: path.join("-"),
                    type: undefined,
                    component: Event,
                    props: { 
                        event: node.event, 
                        stakeholderId: node.event.actorId,
                        color: colors?.get(node.event.actorId)
                    },
                    children: allChildren
                        .map(child => 'component' in child ? child : buildTreeData(child, [...path, child.id], node.event.actorId)),
                    stakeholderId: node.event.actorId,
                    events: node.events
                } as TreeData;
            case "stakeholder":
                return {
                    id: path.join("-"),
                    type: undefined,
                    component: Event,
                    props: { stakeholder: node.stakeholder },
                    children: allChildren
                        .map(child => 'component' in child ? child : buildTreeData(child, [...path, child.id], node.id)),
                    stakeholderId: node.id,
                    events: node.events
                } as TreeData;
        }
    }

    // Create a reactive derived value to track store changes
    const currentTreeData = $derived(buildTreeData($treeStore));
</script>
<Tree data={currentTreeData} stakeholders={scenario.stakeholders} />