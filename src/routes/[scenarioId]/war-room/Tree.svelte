<script lang="ts" module>
    import type { Node } from './tree';

    type ComponentNode = {
        id: string;
        type?: never;
        events: Node[];
        component: any;
        props?: Record<string, any>;
        children?: TreeData[];
        stakeholderId?: string;
    };

    // Define the interface for the tree data.
    export type TreeData = Node | ComponentNode;

    export function isComponentNode(node: TreeData): node is ComponentNode {
        return 'component' in node;
    }
</script>
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import * as d3 from 'd3';
    import { browser } from '$app/environment';
    import Legend from './Legend.svelte';
    import type { Stakeholder } from '@prisma/client';
    import { stakeholders as stakeholdersStore, colorMap } from './colorStore';
    import Sidebar from './Sidebar.svelte';
    import { selectedNode } from './selectedStore';
    import { treeStore } from './tree';
  
    // --- Props ---
    // The hierarchical tree data.
    export let data: TreeData;
    export let stakeholders: Stakeholder[] = [];

    // Update stakeholders store when prop changes
    $: {
        stakeholdersStore.set(stakeholders);
    }

    // Function to get color for a node
    function getNodeColor(node: d3.HierarchyPointNode<TreeData>): string | undefined {
        const data = node.data;
        if (isComponentNode(data) && data.stakeholderId) {
            return $colorMap.get(data.stakeholderId);
        }
        // Look up through parents to find stakeholder color
        let current = node;
        while (current.parent) {
            const parentData = current.parent.data;
            if (isComponentNode(parentData) && parentData.stakeholderId) {
                return $colorMap.get(parentData.stakeholderId);
            }
            current = current.parent;
        }
        return undefined;
    }

    // Canvas dimensions will be set dynamically
    let width: number;
    let height: number;
  
    // Estimated node dimensions (used for positioning)
    export let nodeWidth: number = 200;  // Base width for spacing calculations
    export let nodeHeight: number = 80;  // Base height for spacing calculations
    
    // Root node dimensions
    const rootWidth = 120;  // Fixed root width
    const rootHeight = 80;  // Fixed root height
  
    // Arrays for computed layout data (nodes and links)
    let nodes: d3.HierarchyPointNode<TreeData>[] = [];
    let links: d3.HierarchyLink<TreeData>[] = [];
    let forceUpdate = 0;  // Add a counter to force updates
  
    // D3 Zoom variables
    let container: HTMLDivElement;
    let zoomWrapper: HTMLDivElement;
    let currentTransform: d3.ZoomTransform = d3.zoomIdentity;
  
    function updateDimensions() {
      if (browser) {
        width = window.innerWidth * 2;  // Double the width to account for tree spread
        height = window.innerHeight * 2; // Double the height to account for vertical spread
      }
    }
  
    /**
     * Computes the tree layout from the data using d3.hierarchy and d3.tree.
     * Called automatically whenever `data` changes.
     */
    function updateLayout(): void {
      if (!data) return;
      console.log("[Tree] Updating layout with data:", data);
      
      // Convert data into a hierarchy using children
      const root = d3.hierarchy<TreeData>(data);

      // Calculate dimensions based on tree structure
      const maxDepth = d3.max(root.descendants(), d => d.depth) || 0;
      const numLeaves = root.leaves().length;
      
      // Use more conservative spacing calculations
      const baseVerticalSpacing = nodeHeight * 2.0; // Base vertical gap between nodes
      const baseHorizontalSpacing = nodeWidth * 2.2; // Base horizontal gap between levels
      
      // Calculate total dimensions needed
      const totalHeight = baseVerticalSpacing * (numLeaves);
      const totalWidth = baseHorizontalSpacing * (maxDepth + 1);
      
      // Create a tree layout with the calculated dimensions
      const treeLayout = d3.tree<TreeData>()
        .size([totalHeight, totalWidth])
        .separation((a, b) => {
          return a.parent === b.parent ? 1.2 : 1.5;
        });

      // Apply the layout
      const rootWithPosition = treeLayout(root) as d3.HierarchyPointNode<TreeData>;
      nodes = rootWithPosition.descendants();
      links = rootWithPosition.links();
      
      // Center the tree vertically
      const yMin = d3.min(nodes, d => d.x) || 0;
      const yMax = d3.max(nodes, d => d.x) || 0;
      const yOffset = (height - (yMax - yMin)) / 2 - yMin;
      
      // Adjust node positions with smaller root offset
      const xOffset = rootWidth + 40; // Reduced root padding
      nodes.forEach(node => {
        const x = node.y + xOffset;
        const y = node.x + yOffset;
        node.x = x;
        node.y = y;
      });
    }
  
    // Reactive statement: update layout whenever data changes.
    $: {
        console.log("[Tree] Data changed", data);
        if (browser && width && height) {
            updateLayout();
            forceUpdate += 1;
        }
    }
  
    // Watch dimensions separately
    $: if (browser && width && height) {
        updateLayout();
        forceUpdate += 1;
    }
  
    // D3 zoom behavior.
    let zoom: d3.ZoomBehavior<HTMLElement, unknown>;
  
    onMount(() => {
      updateDimensions();
      updateLayout();  // Initial layout update
      
      // Add resize listener
      if (browser) {
        window.addEventListener('resize', updateDimensions);
      }

      zoom = d3.zoom<HTMLElement, unknown>()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          currentTransform = event.transform;
          if (zoomWrapper) {
            zoomWrapper.style.transform =
              `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.k})`;
          }
        });
      d3.select<HTMLElement, unknown>(container).call(zoom);
    });
  
    onDestroy(() => {
      d3.select<HTMLElement, unknown>(container).on('.zoom', null);
      if (browser) {
        window.removeEventListener('resize', updateDimensions);
      }
    });
</script>
  
  <!--
    The main container holds a zoomable wrapper.
    Both the SVG links and the HTML nodes are placed inside the zoomWrapper so that
    they are affected together by zoom and pan.
  -->
  <Legend />
  <Sidebar />

  <div
    class="tree-container"
    bind:this={container}
    style="height: {height}px;"
  >
    <div class="zoom-wrapper" bind:this={zoomWrapper}>
      <!-- SVG layer for drawing links -->
      <svg {width} {height} class="links-svg" data-update={forceUpdate}>
        {#each links as link (link.target.data.id)}
          <!-- Draw a curved path from parent to child -->
          {@const sx = link.source.x as number}
          {@const sy = link.source.y as number}
          {@const tx = link.target.x as number}
          {@const ty = link.target.y as number}
          {@const isRoot = !link.source.parent}
          {@const color = getNodeColor(link.target as d3.HierarchyPointNode<TreeData>)}
          <path
            d={`M${isRoot ? sx + rootWidth : sx},${sy}
                C${isRoot ? sx + rootWidth + 100 : (sx + tx) / 2},${sy}
                 ${isRoot ? tx - 50 : (sx + tx) / 2},${ty}
                 ${tx},${ty}`}
            class="link"
            style="stroke: {color || 'rgb(var(--color-primary-500))'}"
            fill="none"
          />
        {/each}
      </svg>
  
      <!-- HTML layer for nodes: each node is an absolutely positioned div.
           Nodes animate on entry/exit with the Svelte fade transition. -->
      {#each nodes as node (node.data.id)}
        <div
          class="node-container"
          class:root-node={!node.parent}
          style="left: {node.x}px; top: {node.y}px; {!node.parent ? `width: ${rootWidth}px; height: ${rootHeight}px;` : ''}"
          in:fade={{ duration: 300 }}
          out:fade={{ duration: 300 }}
          on:click={() => {
            const nodeData = $treeStore;
            const path = node.data.id.split('-');
            let current = nodeData;
            // Skip root
            for (let i = 1; i < path.length; i++) {
              current = current.events.find((n: Node) => n.id === path[i]) || current;
            }
            selectedNode.set(current);
          }}
          on:keydown={(e) => {
            if (e.key === 'Enter') {
              const nodeData = $treeStore;
              const path = node.data.id.split('-');
              let current = nodeData;
              // Skip root
              for (let i = 1; i < path.length; i++) {
                current = current.events.find((n: Node) => n.id === path[i]) || current;
              }
              selectedNode.set(current);
            }
          }}
          role="button"
          tabindex="0"
        >
          {#if isComponentNode(node.data)}
            <svelte:component 
              this={node.data.component} 
              color={getNodeColor(node)}
              {...node.data.props}
            />
          {:else}
            <div class="default-node">
              {node.data.id}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  
  <style>
    .tree-container {
      position: relative;
      overflow: hidden;
      background: transparent;
      width: 100%;
      height: 100%;
    }
    /* The zoom-wrapper will be transformed during zoom/pan operations. */
    .zoom-wrapper {
      position: absolute;
      width: 100%;
      height: 100%;
      transform-origin: 0 0;
      overflow: visible;
    }
    /* The SVG is positioned absolutely and draws the connecting links. */
    svg.links-svg {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      overflow: visible;
      width: 100%;
      height: 100%;
    }
    /* Each node container is absolutely positioned and centered at its (x,y) coordinate. */
    .node-container {
      position: absolute;
      transform: translate(-50%, -50%);
      min-width: min-content;  /* Allow container to grow based on content */
      white-space: normal;     /* Allow text to wrap if needed */
      word-break: break-word;  /* Break long words if necessary */
    }
    /* Default styling for nodes without a provided component. */
    .default-node {
      padding: 4px;
      background: #f0f0f0;
      border-radius: 4px;
      text-align: center;
      border: 1px solid #ccc;
    }
    
    .link {
      opacity: 0.5;
      stroke-width: 1.5;
    }
    
    .root-node {
      align-self: center;
      transform: translate(0, -50%); /* Only center vertically */
    }
  </style>
  