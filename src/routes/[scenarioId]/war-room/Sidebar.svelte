<script lang="ts">
    import { nodePath } from './selectedStore';
    import { colorMap } from './colorStore';
</script>

<div class="fixed right-4 top-4 z-50 card preset-outlined-primary-500 preset-tonal bg-black p-4 flex flex-col gap-4 max-h-[90vh] overflow-y-auto w-[300px]">
    <h3 class="h4">Event Chain</h3>
    {#if $nodePath.length === 0}
        <p class="text-sm opacity-50">Click on a node to see its event chain</p>
    {:else}
        <div class="flex flex-col gap-4">
            {#each $nodePath as node}
                {#if node.type !== 'root'}
                    <div class="card p-4 variant-soft-surface">
                        {#if node.type === 'stakeholder'}
                            <div class="flex items-center gap-2 mb-2">
                                <div 
                                    class="w-4 h-4 rounded" 
                                    style="background-color: {$colorMap.get(node.stakeholder.id)}"
                                ></div>
                                <h4 class="h5">{node.stakeholder.name}</h4>
                            </div>
                            <p class="text-sm opacity-75">{node.stakeholder.role}</p>
                        {:else if node.type === 'event'}
                            <div class="flex items-center gap-2 mb-2">
                                <div 
                                    class="w-4 h-4 rounded" 
                                    style="background-color: {$colorMap.get(node.event.actorId)}"
                                ></div>
                                <h4 class="h5">{node.event.name}</h4>
                            </div>
                            <p class="text-sm">{node.event.description}</p>
                            {#if node.event.reasoning}
                                <p class="text-sm mt-2 opacity-75">{node.event.reasoning}</p>
                            {/if}
                            {#if node.event.implications}
                                <p class="text-sm mt-2 opacity-75">{node.event.implications}</p>
                            {/if}
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div> 