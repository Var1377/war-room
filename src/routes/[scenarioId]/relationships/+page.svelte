<!-- Relationships editing page -->
<script lang="ts">
	import { Pencil, Check, Plus, Trash2 } from 'lucide-svelte';
	import type { Stakeholder } from '@prisma/client';

	const { data } = $props();
	let editedRelationships = $state<ExpandedRelationship[] | null>(null);
	let editingIndex = $state<number | null>(null);
	let stakeholders = $state<Stakeholder[]>([]);

	// New reactive variable to control popup visibility
	let showGraphPopup = $state(false);

	// Add these state declarations near your other $state declarations
	let graphNodes = $state<Array<{ id: string, visible: boolean }>>([]);
	let graphLinks = $state<Array<{ source: string, target: string, relation: string, visible: boolean }>>([]);

	type ExpandedRelationship = {
		id: string;
		description: string;
		stakeholder1: Stakeholder;
		stakeholder2: Stakeholder;
	};

	type ServerRelationship = {
		id: string;
		description: string;
		stakeholder1: Stakeholder;
		stakeholder2: Stakeholder;
		scenarioId: string;
		stakeholder1Id: string;
		stakeholder2Id: string;
	};

	type ScenarioData = {
		id: string;
		stakeholders: Stakeholder[];
		relationships: ServerRelationship[];
	};

	$effect(() => {
		void (async () => {
			const scenario = (await data.scenario) as unknown as ScenarioData;
			console.log('Data:', scenario.relationships); // my edit
			stakeholders = scenario.stakeholders;
			const relationships = scenario.relationships.map((rel) => ({
				id: rel.id,
				description: rel.description,
				stakeholder1: rel.stakeholder1,
				stakeholder2: rel.stakeholder2
			}));
			editedRelationships = structuredClone(relationships);
		})();
	});

	// Add this effect to update the graph data whenever editedRelationships changes
	$effect(() => {
		if (!editedRelationships || !stakeholders || stakeholders.length < 2) {
			graphNodes = [];
			graphLinks = [];
			return;
		}

		// Compute nodes
		const relationshipsList = editedRelationships.map(rel => [
			rel.stakeholder1.name,
			rel.stakeholder2.name, 
			rel.description
		]);

		const nodeSet = new Set();
		relationshipsList.forEach(([source, target]) => {
			nodeSet.add(source);
			nodeSet.add(target);
		});

		graphNodes = Array.from(nodeSet).map((nodeName) => ({
			id: nodeName,
			visible: false
		}));

		// Compute links
		graphLinks = editedRelationships.map(rel => ({
			source: rel.stakeholder1.name,
			target: rel.stakeholder2.name,
			relation: rel.description,
			visible: false
		}));
	});

	// Callback function for the Graph Visualise button
	function graphVisualise() {
		showGraphPopup = true;
	}

	// A helper to close the popup:
	function closePopup() {
		showGraphPopup = false;
	}

	function addRelationship() {
		if (!editedRelationships || !stakeholders || stakeholders.length < 2) return;

		editedRelationships = [
			...editedRelationships,
			{
				id: crypto.randomUUID(),
				description: '',
				stakeholder1: stakeholders[0],
				stakeholder2: stakeholders[1]
			}
		];
		
		// Start editing the new relationship
		editingIndex = editedRelationships.length - 1;
	}

	function deleteRelationship(index: number) {
		if (!editedRelationships) return;
		editedRelationships = editedRelationships.filter((_, i) => i !== index);
		if (editingIndex === index) editingIndex = null;
	}

	function updateStakeholder(
		relationshipIndex: number,
		stakeholderNum: 1 | 2,
		stakeholderId: string
	) {
		if (!editedRelationships || !stakeholders) return;

		const newStakeholder = stakeholders.find((s) => s.id === stakeholderId);
		if (!newStakeholder) return;

		const updatedRelationships = [...editedRelationships];
		if (stakeholderNum === 1) {
			updatedRelationships[relationshipIndex].stakeholder1 = newStakeholder;
		} else {
			updatedRelationships[relationshipIndex].stakeholder2 = newStakeholder;
		}
		editedRelationships = updatedRelationships;
	}

	// Graph Visualisation Code

    import { onMount } from 'svelte';
    import Graph from './Graph.svelte';
  

	function get_nodes() {
		if (!editedRelationships || !stakeholders || stakeholders.length < 2) return;

		editedRelationships = [
			...editedRelationships,
			{
				id: crypto.randomUUID(),
				description: '',
				stakeholder1: stakeholders[0],
				stakeholder2: stakeholders[1]
			}
		];	

		const relationshipsList = editedRelationships.map(rel => [
			rel.stakeholder1.name,
			rel.stakeholder2.name, 
			rel.description
		]);

		const nodeSet = new Set();

		relationshipsList.forEach(([source, target]) => {
		nodeSet.add(source);
		nodeSet.add(target);
		});

		// Convert each unique node name into the desired node object
		return Array.from(nodeSet).map((nodeName) => ({
		id: nodeName,
		visible: false
		}));
	}

	function get_links() { 
		if (!editedRelationships || !stakeholders || stakeholders.length < 2) return;

		editedRelationships = [
			...editedRelationships,
			{
				id: crypto.randomUUID(),
				description: '',
				stakeholder1: stakeholders[0],
				stakeholder2: stakeholders[1]
			}
		];	

		const relationshipsList = editedRelationships.map(rel => [
			rel.stakeholder1.name,
			rel.stakeholder2.name, 
			rel.description
		]);

		return relationshipsList.map(([source, target, relation]) => ({
		source,
		target,
		relation,
		visible: false
		}));
	}

    // Same nodes and links as your original code
    let nodes = [
      { id: "USA", visible: false },
      { id: "Ukraine", visible: false },
      { id: "Russia", visible: false },
      { id: "China", visible: false },
      { id: "NATO", visible: false },
      { id: "EU", visible: false },
      { id: "Iran", visible: false },
      { id: "Turkey", visible: false },
      { id: "Israel", visible: false },
      { id: "Japan", visible: false }
    ];
  
    let links = [
      // USA relationships
      { source: "USA", target: "NATO", relation: "MEMBER", visible: false },
      { source: "USA", target: "Ukraine", relation: "SUPPORT", visible: false },
      { source: "USA", target: "Japan", relation: "ALLIES", visible: false },
      
      // NATO relationships
      { source: "NATO", target: "EU", relation: "COOPERATION", visible: false },
      { source: "NATO", target: "Turkey", relation: "MEMBER", visible: false },
      
      // Russia relationships
      { source: "Russia", target: "Ukraine", relation: "CONFLICT", visible: false },
      { source: "Russia", target: "China", relation: "ALLIES", visible: false },
      { source: "Russia", target: "Iran", relation: "ALLIES", visible: false },
      
      // China relationships
      { source: "China", target: "Iran", relation: "PARTNERS", visible: false },
      { source: "China", target: "NATO", relation: "RIVAL", visible: false },
      
      // Other relationships
      { source: "Iran", target: "Israel", relation: "TENSION", visible: false },
      { source: "Turkey", target: "EU", relation: "CANDIDATE", visible: false },
      { source: "EU", target: "Ukraine", relation: "SUPPORT", visible: false },
      { source: "Japan", target: "NATO", relation: "PARTNER", visible: false }
    ];
  
    // We'll store viewport size in these, updated on mount
    let width = 0;
    let height = 0;
  
    onMount(() => {
      width = window.innerWidth;
      height = window.innerHeight;
    });

  </script>
  

{#if editedRelationships}

	{#if showGraphPopup}
		<div class="modal-overlay" on:click={closePopup}>
			<div class="modal" on:click|stopPropagation>
				<button class="btn" on:click={closePopup}>Close</button>
				<Graph nodes={graphNodes} links={graphLinks} {width} {height} />
			</div>
		</div>
	{/if}

	<div class="flex flex-col gap-4 p-4">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="h2">Stakeholder Relationships</h2>

			<button type="button" class="btn preset-tonal" on:click={graphVisualise}>
				Graph Visualise
			</button>

			<button class="variant-filled-primary btn" on:click={addRelationship}>
				<Plus size={16} class="mr-2" />
				Add Relationship
			</button>
		</div>

		{#each editedRelationships ?? [] as relationship, index}
			<div class="card p-4 preset-tonal">
				<div class="mb-2 flex items-center gap-2">
					<select
						class="select"
						value={relationship.stakeholder1.id}
						on:change={(e) => updateStakeholder(index, 1, e.currentTarget.value)}
					>
						{#each stakeholders as stakeholder}
							<option value={stakeholder.id}>{stakeholder.name}</option>
						{/each}
					</select>
					<span class="text-sm">⟷</span>
					<select
						class="select"
						value={relationship.stakeholder2.id}
						on:change={(e) => updateStakeholder(index, 2, e.currentTarget.value)}
					>
						{#each stakeholders as stakeholder}
							<option value={stakeholder.id}>{stakeholder.name}</option>
						{/each}
					</select>
					<button
						class="variant-soft-error btn-icon ml-auto"
						on:click={() => deleteRelationship(index)}
					>
						<Trash2 size={16} />
					</button>
				</div>
				{#if editingIndex === index}
					<div class="flex gap-2">
						<textarea
							bind:value={relationship.description}
							class="textarea m-2 min-h-[100px] flex-1 bg-transparent p-2 outline-none"
						></textarea>
						<button class="variant-soft-secondary btn-icon" on:click={() => (editingIndex = null)}>
							<Check size={16} />
						</button>
					</div>
				{:else}
					<div class="mx-4 mt-2 flex items-start gap-2">
						<p class="flex-1">{relationship.description}</p>
						<button class="variant-soft-secondary btn-icon" on:click={() => (editingIndex = index)}>
							<Pencil size={16} />
						</button>
					</div>
				{/if}
			</div>
		{/each}

		<form method="POST" class="mt-4 flex justify-end">
			<input
				type="hidden"
				name="relationships"
				value={JSON.stringify(
					editedRelationships?.map((rel) => ({
						id: rel.id,
						stakeholder1Id: rel.stakeholder1.id,
						stakeholder2Id: rel.stakeholder2.id,
						description: rel.description
					})) ?? []
				)}
			/>
			<button type="submit" class="btn preset-tonal">Save & Continue</button>
		</form>
	</div>
{:else}
	<div class="placeholder m-4 h-96 w-full animate-pulse rounded-lg">Loading...</div>
{/if}

<style>
	/* The overlay covers the whole viewport with a slight dark tint */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.3); /* Adjust the alpha value for more/less transparency */
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	.modal {
		background: rgba(32, 32, 32, 0.85); /* Semi-transparent dark gray background */
		padding: 1rem;
		border-radius: 8px;
		width: 80%;
		height: 80%;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		overflow: auto;
	}
</style>
