<script lang="ts">
    import { colorMap } from './colorStore';

    const { event, stakeholderId } = $props<{
        event: {
            name: string;
            description: string;
            reasoning?: string;
            implications?: string;
            satisfaction?: number;
        },
        stakeholderId: string;
    }>();

    const color = $derived($colorMap.get(stakeholderId) || 'rgb(var(--color-primary-500))');
</script>

<div class="card px-4 py-2 flex flex-col w-[550px] bg-surface-900 text-white" 
    style="border: 2px solid {color}">
    <h3 class="h4 break-words">{event.name}</h3>
    <p class="body-sm line-clamp-2 pb-1">{event.description}</p>
    {#if event.satisfaction !== undefined}
        <div class="flex items-center gap-2">
            <div class="h-2 flex-1 rounded-full bg-surface-200">
                <div 
                    class="h-full rounded-full" 
                    style="width: {Math.abs(event.satisfaction) * 100}%; background-color: {color}"
                ></div>
            </div>
        </div>
    {/if}
</div>