<script lang="ts">
    import type { Stakeholder } from "@prisma/client";
    import { enhance } from "$app/forms";
    import { colorMap } from './colorStore';
    import { treeStore } from './tree';

    const { stakeholders, path, existingStakeholderIds, color: parentColor } = $props<{
        stakeholders: Stakeholder[];
        path: string[];
        existingStakeholderIds: Set<string>;
        color?: string;
    }>();

    const availableStakeholders = $derived(
        stakeholders.filter((s: Stakeholder) => !existingStakeholderIds.has(s.id))
    );

    const initialStakeholderId = $derived(availableStakeholders[0]?.id);
    let selectedStakeholderId = $state(initialStakeholderId);
    let loading = $state(false);

    const borderColor = $derived(
        selectedStakeholderId 
            ? $colorMap.get(selectedStakeholderId) || parentColor || 'rgb(var(--color-primary-500))'
            : parentColor || 'rgb(var(--color-primary-500))'
    );

    function handleSubmit() {
        loading = true;
        return async ({ result }: { result: { type: string; data?: { events: any[] } } }) => {
            loading = false;
            if (result.type === 'success' && Array.isArray(result.data?.events)) {
                treeStore.addEvents(path, result.data.events);
            }
        };
    }
</script>

{#if availableStakeholders.length > 0}
    <form
        method="POST"
        action="?/getEvents"
        use:enhance={handleSubmit}
        class="card p-4 min-w-[200px] bg-surface-900 text-white {loading ? 'animate-pulse' : ''}"
        style="border: 2px solid {borderColor}"
    >
        <div class="flex gap-4 items-center">
            <select 
                name="stakeholderId" 
                bind:value={selectedStakeholderId}
                class="select bg-surface-800 w-48"
            >
                {#each availableStakeholders as stakeholder}
                    <option value={stakeholder.id} selected={stakeholder.id === selectedStakeholderId}>
                        {stakeholder.name}
                    </option>
                {/each}
            </select>
            <input type="hidden" name="eventPath" value={JSON.stringify(path)} />
            <button type="submit" class="btn preset-outlined-primary-500">Generate Event</button>
            <button type="button" class="btn preset-outlined-primary-500">Add Custom</button>
        </div>
    </form>
{/if} 