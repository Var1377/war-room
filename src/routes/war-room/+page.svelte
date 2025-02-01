<script lang="ts">
    import { onMount } from 'svelte';
    
    let stakeholders: string[] = [];
    
    onMount(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const encodedStakeholders = searchParams.get('stakeholders');
        if (encodedStakeholders) {
            stakeholders = JSON.parse(decodeURIComponent(encodedStakeholders));
        }
    });
</script>

<div class="container mx-auto p-8">
    <h1 class="h1 mb-8">War Room Analysis</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="card p-4">
            <h2 class="h2">Stakeholder Relations</h2>
            <div class="mt-4">
                <ul class="list-disc pl-6">
                    {#each stakeholders as stakeholder}
                        <li>{stakeholder}</li>
                    {/each}
                </ul>
            </div>
        </div>
        
        <div class="card p-4">
            <h2 class="h2">Risk Assessment</h2>
            <p class="opacity-50">Coming soon...</p>
        </div>
        
        <div class="card p-4">
            <h2 class="h2">Timeline</h2>
            <p class="opacity-50">Coming soon...</p>
        </div>
    </div>
</div> 