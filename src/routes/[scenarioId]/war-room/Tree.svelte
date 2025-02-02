<script lang="ts" module>
    export interface TreeNode {
        name: string;
        id: string;  // Using id for tracking
        details?: string; // Additional details to display
        children?: TreeNode[];
        onClick?: () => void;
        backgroundColor?: string;
        textColor?: string;
        borderColor?: string;
        loading?: boolean;
    }
</script>
<script lang="ts">
import { onMount } from 'svelte';
import * as d3 from 'd3';

type D3Node = d3.HierarchyPointNode<TreeNode>;
type D3Link = d3.HierarchyPointLink<TreeNode>;

export let data: TreeNode;
let svg: SVGSVGElement;
let width = 1000;
let height = 600;
let margin = { top: 20, right: 90, bottom: 30, left: 90 };
let g: d3.Selection<SVGGElement, unknown, null, undefined>;
let previousData: Map<string, { x: number; y: number }> = new Map();

// Default colors that will be used if not specified in the node
export let defaultBackgroundColor = '#2a3f54';
export let defaultTextColor = '#ffffff';
export let defaultBorderColor = '#4a6484';

const duration = 750;

// Initialize zoom behavior
const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
        g?.attr('transform', event.transform);
    });

onMount(() => {
    // Create main group for zoom/pan
    g = d3.select(svg)
        .call(zoom)
        .call(zoom.translateTo, width / 2, height / 2)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    renderTree();
});

function handleNodeClick(node: TreeNode): void {
    if (node.onClick) {
        node.onClick();
    }
}

function shouldAnimate(d: D3Node): boolean {
    // Check if this node or any of its ancestors have changed position
    let current: D3Node | null = d;
    while (current) {
        const prev = previousData.get(current.data.id);
        if (!prev || prev.x !== current.x || prev.y !== current.y) {
            return true;
        }
        current = current.parent;
    }
    return false;
}

function renderTree(): void {
    if (!g) return;

    const treeLayout = d3.tree<TreeNode>()
        .nodeSize([50, 200])
        .separation((a, b) => {
            return a.parent === b.parent ? 1.5 : 2;
        });

    const root = d3.hierarchy(data);
    
    // Store current positions for transitions
    root.each(d => {
        const prevPos = previousData.get(d.data.id);
        if (prevPos) {
            (d as any).x0 = prevPos.x;
            (d as any).y0 = prevPos.y;
        } else {
            (d as any).x0 = (d.parent as any)?.x ?? height / 2;
            (d as any).y0 = (d.parent as any)?.y ?? 0;
        }
    });

    const rootWithPosition = treeLayout(root);

    // Calculate bounds for centering
    let x0 = Infinity, x1 = -Infinity;
    rootWithPosition.each(d => {
        if (d.x < x0) x0 = d.x;
        if (d.x > x1) x1 = d.x;
    });

    const centerX = -(x0 + x1) / 2;

    // Update links with transitions
    const links = g.selectAll<SVGPathElement, D3Link>("path.link")
        .data(rootWithPosition.links(), (d: any) => d.target.data.id);

    // Enter new links at parent's previous position
    const linkEnter = links.enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", d => {
            const o = {
                x: (d.source as any).x0,
                y: (d.source as any).y0
            };
            return d3.linkHorizontal<any, any>()({
                source: [o.y, o.x + centerX],
                target: [o.y, o.x + centerX]
            });
        });

    // Transition links to new position
    links.merge(linkEnter)
        .transition()
        .duration((d: any) => shouldAnimate(d.target) ? duration : 0)
        .attr("d", d3.linkHorizontal<any, any>()
            .x(d => d.y)
            .y(d => d.x + centerX));

    // Transition exiting links to parent's new position
    links.exit()
        .transition()
        .duration(duration)
        .attr("d", (d: any) => {
            const o = {
                x: d.source.x,
                y: d.source.y
            };
            return d3.linkHorizontal<any, any>()({
                source: [o.y, o.x + centerX],
                target: [o.y, o.x + centerX]
            });
        })
        .remove();

    // Update nodes with transitions
    const nodes = g.selectAll<SVGGElement, D3Node>("g.node")
        .data(rootWithPosition.descendants(), (d: any) => d.data.id);

    // Enter new nodes at parent's previous position
    const nodeEnter = nodes.enter()
        .append("g")
        .attr("class", d => `node${d.data.loading ? ' loading' : ''}`)
        .attr("transform", d => {
            const x0 = (d.parent as any)?.x0 ?? height / 2;
            const y0 = (d.parent as any)?.y0 ?? 0;
            return `translate(${y0},${x0 + centerX})`;
        })
        .style("cursor", d => d.data.onClick ? "pointer" : "default")
        .style("opacity", 0)
        .on("click", (event, d) => handleNodeClick(d.data));

    nodeEnter.append("rect")
        .attr("class", "node-rect")
        .attr("x", -50)
        .attr("y", -15)
        .attr("width", 100)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", d => d.data.backgroundColor || defaultBackgroundColor)
        .style("stroke", d => d.data.borderColor || defaultBorderColor);

    nodeEnter.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", d => d.data.textColor || defaultTextColor)
        .text(d => d.data.name);

    // Transition nodes to new position
    const nodeUpdate = nodes.merge(nodeEnter)
        .transition()
        .duration((d: any) => shouldAnimate(d) ? duration : 0)
        .attr("transform", d => `translate(${d.y},${d.x + centerX})`)
        .style("opacity", 1);

    // Transition exiting nodes to the parent's new position
    const nodeExit = nodes.exit()
        .transition()
        .duration(duration)
        .attr("transform", (d: any) => {
            const parent = d.parent;
            return `translate(${parent?.y ?? d.y},${(parent?.x ?? d.x) + centerX})`;
        })
        .style("opacity", 0)
        .remove();

    // Store the positions for next update
    previousData.clear();
    rootWithPosition.each(d => {
        previousData.set(d.data.id, { x: d.x, y: d.y });
    });

    // Update existing nodes
    nodes.attr("class", d => `node${d.data.loading ? ' loading' : ''}`);
}

$: if (data && svg) {
    renderTree();
}
</script>

<div class="tree-container">
    <svg 
        bind:this={svg} 
        {width} 
        {height}
        style="cursor: grab;"
    ></svg>
</div>

<style>
.tree-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

:global(.link) {
    fill: none;
    stroke: #b8c4ce;
    stroke-width: 1px;
}

:global(.node-rect) {
    stroke-width: 1px;
}

:global(.node text) {
    font-size: 14px;
    font-family: system-ui, -apple-system, sans-serif;
    pointer-events: none;
}

:global(.node.loading) {
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
</style>
