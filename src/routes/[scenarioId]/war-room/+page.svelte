<!-- War Room overview page -->
<script lang="ts">
    const { data } = $props();
    const { scenario } = $derived(data);
</script>

<div class="container mx-auto p-8">
    <h1 class="h1 mb-8">{scenario.title} - War Room</h1>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Overview Section -->
        <div class="card p-6">
            <h2 class="h2 mb-4">Overview</h2>
            <p class="mb-4">{scenario.overview}</p>
        </div>

        <!-- Key Stakeholders -->
        <div class="card p-6">
            <h2 class="h2 mb-4">Key Stakeholders</h2>
            <div class="space-y-4">
                {#each scenario.stakeholders as stakeholder}
                    <div class="card p-4 preset-tonal">
                        <h3 class="h3 mb-2">{stakeholder.name}</h3>
                        <p class="mb-2 text-sm opacity-75">{stakeholder.role}</p>
                        <div class="space-y-1">
                            {#each stakeholder.interests.split('\n') as interest}
                                <p class="text-sm">• {interest}</p>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Relationships Map -->
        <div class="card p-6 lg:col-span-2">
            <h2 class="h2 mb-4">Relationship Network</h2>
            <div class="space-y-4">
                {#each scenario.relationships as relationship}
                    <div class="card p-4 preset-tonal">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-semibold">
                                {scenario.stakeholders.find(s => s.id === relationship.stakeholder1Id)?.name}
                            </span>
                            <span class="text-sm">⟷</span>
                            <span class="font-semibold">
                                {scenario.stakeholders.find(s => s.id === relationship.stakeholder2Id)?.name}
                            </span>
                        </div>
                        <p class="text-sm">{relationship.description}</p>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="mt-8 flex justify-end gap-4">
        <a href="./../stakeholders" class="variant-soft-secondary btn">Edit Stakeholders</a>
        <a href="./../relationships" class="variant-soft-secondary btn">Edit Relationships</a>
    </div>
</div>