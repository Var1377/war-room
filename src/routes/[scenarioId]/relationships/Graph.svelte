<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    // Exported props for easy reusability:
    export let nodes = [];
    export let links = [];
    // Optionally export width, height or other config
    export let width = typeof window !== 'undefined' ? window.innerWidth : 800;
    export let height = typeof window !== 'undefined' ? window.innerHeight : 600;
  
    // We'll bind the <svg> element to this variable
    let svgElement;
  
    onMount(() => {
      // Select the bound SVG element
      const svg = d3.select(svgElement)
        .attr('width', width)
        .attr('height', height);
  
      // Force simulation setup
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(400))
        .force('charge', d3.forceManyBody().strength(-100))
        // Adjust both x and y slightly
        .force('x', d3.forceX(width/2.7).strength(0.1))  // from width/3 to width/2.7
        .force('y', d3.forceY(height/3.1).strength(0.1))  // from height/3.5 to height/3.1
        .force('collision', d3.forceCollide().radius(50));
  
      // Wrap each link in a group
      const linkGroup = svg.append('g')
        .selectAll('g')
        .data(links)
        .enter()
        .append('g');
  
      // Append the line for each link
      linkGroup.append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);
  
      // Append text for each link
      linkGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#FFFFF0')
        .attr('dy', -5)
        .text(d => d.visible ? (d.relation.split(' ').length > 6 ? d.relation.split(' ').slice(0, 6).join(' ') + '...' : d.relation) : '')
        .attr('transform', function(d) {
          // Calculate angle for text rotation
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          // Flip text if angle is beyond 180 degrees to prevent upside-down text
          return angle > 90 || angle < -90
            ? `rotate(${angle + 180}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`
            : `rotate(${angle}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`;
        });
  
      // Create a group for each node
      const nodeGroup = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .call(drag(simulation))
        .on('mouseover', (event, d) => hover(d, true))
        .on('mouseout', (event, d) => hover(d, false));
  
      // Outer circle
      nodeGroup.append('circle')
        .attr('r', 32)
        .attr('fill', '#B71C1C');
  
      // Inner circle
      nodeGroup.append('circle')
        .attr('r', 28)
        .attr('fill', '#D32F2F');
  
      // Node label
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('fill', '#FFFFF0')
        .attr('font-size', '80%')
        .text(d => d.visible ? d.id : '');
  
      // Ticker update
      simulation.on('tick', () => {
        linkGroup.select('line')
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
  
        linkGroup.select('text')
          .attr('x', d => (d.source.x + d.target.x) / 2)
          .attr('y', d => (d.source.y + d.target.y) / 2)
          .attr('transform', function(d) {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            return angle > 90 || angle < -90
              ? `rotate(${angle + 180}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`
              : `rotate(${angle}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`;
          });
  
        nodeGroup.attr('transform', d => `translate(${d.x}, ${d.y})`);
      });
  
      function hover(d, visibility) {
        d.visible = visibility;
        links.forEach(link => {
          if (link.source === d || link.target === d) {
            nodes.forEach(node => {
              if (node.id === link.target.id || node.id === link.source.id){
                node.visible = visibility;
              }
            });
            link.visible = visibility;
          }
        });
        
        // Update node text
        nodeGroup.select('text')
          .text(d => d.visible ? d.id : '');
          
        // Update link text
        linkGroup.select('text')
          .attr('font-size', '80%')
          .text(d => d.visible ? (d.relation.split(' ').length > 4 ? d.relation.split(' ').slice(0, 4).join(' ') + '...' : d.relation) : '');
      }
  
      // Drag behavior
      function drag(simulation) {
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
  
        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }
  
        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
  
        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
    });
  </script>
  
  <!-- We don't need a special container div; the SVG is enough -->
  <svg bind:this={svgElement}></svg>
  
  <style>
    /* Remove any default background and spacing */
    svg {
      background: none !important;
      margin: 0;
      padding: 20px; /* Add some padding to prevent nodes from touching the edges */
    }
  </style>