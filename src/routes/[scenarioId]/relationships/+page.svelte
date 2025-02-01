<!-- Relationships editing page -->
<script lang="ts">
    import { Pencil, Check } from 'lucide-svelte';
    import type { Relationship } from '@prisma/client';

    const { data } = $props();
    const { relationships } = $derived(data);

    let editedRelationships = $state<Relationship[] | null>(null);
    let editingIndex = $state<number | null>(null);

    $effect(() => {
        editedRelationships = structuredClone(relationships);
    });
</script>

<div class="flex flex-col gap-4">
    {#if editedRelationships?.length}
        {#each editedRelationships as relationship, index}
            <div class="card p-4 preset-tonal">
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="h3">{relationship.stakeholder1Id}</h3>
                    <span class="text-sm">⟷</span>
                    <h3 class="h3">{relationship.stakeholder2Id}</h3>
                </div>
                {#if editingIndex === index}
                    <div class="flex gap-2">
                        <textarea
                            bind:value={relationship.description}
                            class="textarea min-h-[100px] flex-1 bg-transparent p-2 outline-none"
                        ></textarea>
                        <button
                            class="variant-soft-secondary btn-icon"
                            onclick={() => (editingIndex = null)}
                        >
                            <Check size={16} />
                        </button>
                    </div>
                {:else}
                    <div class="flex items-start gap-2">
                        <p class="flex-1">{relationship.description}</p>
                        <button
                            class="variant-soft-secondary btn-icon"
                            onclick={() => (editingIndex = index)}
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                {/if}
            </div>
        {/each}

        <form method="POST" class="mt-4 flex justify-end">
            <input type="hidden" name="relationships" value={JSON.stringify(editedRelationships)} />
            <button type="submit" class="variant-filled-primary btn">Save & Continue</button>
        </form>
    {:else}
        <p>No relationships analyzed yet</p>
    {/if}
</div>