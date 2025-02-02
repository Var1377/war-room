<!-- Relationships editing page -->
<script lang="ts">
	import { Pencil, Check, Plus, Trash2 } from 'lucide-svelte';
	import type { Stakeholder } from '@prisma/client';

	const { data } = $props();
	let editedRelationships = $state<ExpandedRelationship[] | null>(null);
	let editingIndex = $state<number | null>(null);
	let stakeholders = $state<Stakeholder[]>([]);

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
</script>

{#if editedRelationships}
	<div class="flex flex-col gap-4 p-4">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="h2">Stakeholder Relationships</h2>
			<button class="variant-filled-primary btn" onclick={addRelationship}>
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
						onchange={(e) => updateStakeholder(index, 1, e.currentTarget.value)}
					>
						{#each stakeholders as stakeholder}
							<option value={stakeholder.id}>{stakeholder.name}</option>
						{/each}
					</select>
					<span class="text-sm">⟷</span>
					<select
						class="select"
						value={relationship.stakeholder2.id}
						onchange={(e) => updateStakeholder(index, 2, e.currentTarget.value)}
					>
						{#each stakeholders as stakeholder}
							<option value={stakeholder.id}>{stakeholder.name}</option>
						{/each}
					</select>
					<button
						class="variant-soft-error btn-icon ml-auto"
						onclick={() => deleteRelationship(index)}
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
						<button class="variant-soft-secondary btn-icon" onclick={() => (editingIndex = null)}>
							<Check size={16} />
						</button>
					</div>
				{:else}
					<div class="mx-4 mt-2 flex items-start gap-2">
						<p class="flex-1">{relationship.description}</p>
						<button class="variant-soft-secondary btn-icon" onclick={() => (editingIndex = index)}>
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
