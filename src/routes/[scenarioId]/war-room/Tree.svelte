<script lang="ts">
import { onMount } from 'svelte';
import * as d3 from 'd3';

interface TreeNode {
    name: string;
    children?: TreeNode[];
    onClick?: () => void;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
}

type D3Node = d3.HierarchyPointNode<TreeNode>;
type D3Link = d3.HierarchyPointLink<TreeNode>;

export let data: TreeNode = {
    name: '',
    children: []
};

// Default colors that will be used if not specified in the node
export let defaultBackgroundColor = '#2a3f54';
export let defaultTextColor = '#ffffff';
export let defaultBorderColor = '#4a6484';

let svg: SVGSVGElement;
let width = 1000;
let height = 600;
let margin = { top: 20, right: 90, bottom: 30, left: 90 };

onMount(() => {
    renderTree();
});

function handleNodeClick(node: TreeNode): void {
    if (node.onClick) {
        node.onClick();
    }
}

function renderTree(): void {
    // Clear any existing SVG content
    d3.select(svg).selectAll("*").remove();

    const treeLayout = d3.tree<TreeNode>()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const root = d3.hierarchy(data);
    const rootWithPosition = treeLayout(root);
    
    const g = d3.select(svg)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add links
    g.selectAll<SVGPathElement, D3Link>(".link")
        .data(rootWithPosition.links())
        .join("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal<D3Link, D3Node>()
            .x((d) => d.y)    // Swapped x and y for horizontal layout
            .y((d) => d.x));

    // Add nodes
    const nodes = g.selectAll<SVGGElement, D3Node>(".node")
        .data(rootWithPosition.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .style("cursor", (d) => d.data.onClick ? "pointer" : "default")
        .on("click", (event, d) => handleNodeClick(d.data));

    // Add node rectangles
    nodes.append("rect")
        .attr("class", "node-rect")
        .attr("x", -50)
        .attr("y", -15)
        .attr("width", 100)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", (d) => d.data.backgroundColor || defaultBackgroundColor)
        .style("stroke", (d) => d.data.borderColor || defaultBorderColor);

    // Add node text
    nodes.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", (d) => d.data.textColor || defaultTextColor)
        .text((d) => d.data.name);
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
    ></svg>
</div>

<style>
.tree-container {
    width: 100%;
    height: 100%;
    overflow: auto;
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
}
</style>
