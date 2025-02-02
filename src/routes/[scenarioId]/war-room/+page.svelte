<!-- War Room overview page -->
<script lang="ts">
	import Tree from './Tree.svelte';

    const { data } = $props();
    const { scenario } = $derived(data);

    const treeData = $derived({
        name: 'Root',
        children: scenario.stakeholders.map((stakeholder) => ({
            name: stakeholder.name,
            id: stakeholder.id
        }))
    });
</script>
<Tree data={treeData} />
<div class="container mx-auto p-8">
    <div class="mt-8 flex justify-end gap-4">
        <a href={`/${scenario.id}/stakeholders`} class="variant-soft-secondary btn">Edit Stakeholders</a>
        <a href={`/${scenario.id}/relationships`} class="variant-soft-secondary btn">Edit Relationships</a>
    </div>
</div>