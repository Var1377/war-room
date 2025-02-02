<script lang="ts">
    import { stakeholders, colorMap } from './colorStore';
</script>

<div class="fixed top-4 left-4 z-50 card variant-filled-surface p-4 flex flex-col gap-2">
    <h3 class="h4">Stakeholders</h3>
    <div class="flex flex-col gap-1">
        {#each $stakeholders as stakeholder}
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded" style="background-color: {$colorMap.get(stakeholder.id)}"></div>
                <span class="text-sm">{stakeholder.name}</span>
            </div>
        {/each}
    </div>
</div> 