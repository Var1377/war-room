<!-- Stakeholders editing page -->
<script lang="ts">
    import { Pencil, Plus, Trash2, Check } from 'lucide-svelte';

    type LoadedStakeholder = {
        id: string;
        name: string;
        role: string;
        interests: string;
    };

    let { data } = $props();
    
    interface EditableStakeholder {
        name: string;
        role: string;
        interests: string[];
    }

    interface EditableData {
        title: string;
        overview: string;
        stakeholders: EditableStakeholder[];
    }

    let editedData = $state<EditableData | null>(null);
    let editingTitle = $state(false);
    let editingOverview = $state(false);
    let editingField = $state<{
        type: 'name' | 'role' | 'interest';
        stakeholderIndex: number;
        interestIndex?: number;
    } | null>(null);

    $effect(() => {
        void (async () => {
            const scenario = await data.scenario;
            editedData = {
                title: scenario.title,
                overview: scenario.overview,
                stakeholders: scenario.stakeholders.map((s: LoadedStakeholder) => ({
                    name: s.name,
                    role: s.role,
                    interests: s.interests ? JSON.parse(s.interests) : []
                }))
            };
        })();
    });

    function addStakeholder() {
        if (!editedData) return;
        editedData.stakeholders = [
            ...editedData.stakeholders,
            {
                name: 'New Stakeholder',
                role: 'Role',
                interests: ['Interest']
            }
        ];
    }

    function addInterest(stakeholderIndex: number) {
        if (!editedData) return;
        editedData.stakeholders[stakeholderIndex].interests = [
            ...editedData.stakeholders[stakeholderIndex].interests,
            'New Interest'
        ];
    }

    function removeStakeholder(index: number) {
        if (!editedData) return;
        editedData.stakeholders = editedData.stakeholders.filter((_, i) => i !== index);
    }

    function removeInterest(stakeholderIndex: number, interestIndex: number) {
        if (!editedData) return;
        editedData.stakeholders[stakeholderIndex].interests = 
            editedData.stakeholders[stakeholderIndex].interests.filter((_, i) => i !== interestIndex);
    }
</script>

{#if !editedData}
    <div class="h-[calc(100vh-100px)] w-full m-4 placeholder animate-pulse rounded-lg"></div>
{:else}
    <div class="card p-8 m-4 text-white preset-tonal">
        <div class="flex max-w-none flex-col gap-4 text-white">
            <div class="group relative">
                {#if editingTitle}
                    <div class="flex items-center gap-2">
                        <input
                            bind:value={editedData.title}
                            class="h1 input flex-1 bg-transparent px-2 outline-none"
                        />
                        <button class="variant-soft-secondary btn-icon" onclick={() => (editingTitle = false)}>
                            <Check size={16} />
                        </button>
                    </div>
                {:else}
                    <div class="flex items-center gap-2">
                        <h1 class="h1 flex-1">{editedData.title}</h1>
                        <button class="variant-soft-secondary btn-icon" onclick={() => (editingTitle = true)}>
                            <Pencil size={16} />
                        </button>
                    </div>
                {/if}
            </div>

            <div class="group relative">
                {#if editingOverview}
                    <div class="flex gap-2">
                        <textarea
                            bind:value={editedData.overview}
                            class="textarea min-h-[100px] flex-1 bg-transparent p-2 outline-none"
                        ></textarea>
                        <button
                            class="variant-soft-secondary btn-icon"
                            onclick={() => (editingOverview = false)}
                        >
                            <Check size={16} />
                        </button>
                    </div>
                {:else}
                    <div class="flex items-start gap-2">
                        <p class="flex-1">{editedData.overview}</p>
                        <button
                            class="variant-soft-secondary btn-icon"
                            onclick={() => (editingOverview = true)}
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                {/if}
            </div>

            <div class="flex items-center gap-2">
                <h2 class="h2 flex-1">Stakeholders</h2>
                <button class="variant-soft-secondary btn-icon" onclick={addStakeholder}>
                    <Plus size={16} />
                </button>
            </div>

            <section class="flex flex-col gap-2">
                {#each editedData.stakeholders as stakeholder, stakeholderIndex}
                    <section class="group card p-4 preset-tonal">
                        <div class="flex flex-col gap-2">
                            <div>
                                {#if editingField?.type === 'name' && editingField.stakeholderIndex === stakeholderIndex}
                                    <div class="flex items-center gap-2">
                                        <input
                                            bind:value={stakeholder.name}
                                            class="h3 input flex-1 bg-transparent px-2 outline-none"
                                        />
                                        <button
                                            class="variant-soft-secondary btn-icon"
                                            onclick={() => (editingField = null)}
                                        >
                                            <Check size={16} />
                                        </button>
                                    </div>
                                {:else}
                                    <div class="flex items-center gap-2">
                                        <h3 class="h3 flex-1">{stakeholder.name}</h3>
                                        <button
                                            class="variant-soft-secondary btn-icon"
                                            onclick={() => (editingField = { type: 'name', stakeholderIndex })}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            class="variant-soft-error btn-icon"
                                            onclick={() => removeStakeholder(stakeholderIndex)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                {/if}
                            </div>

                            <div>
                                {#if editingField?.type === 'role' && editingField.stakeholderIndex === stakeholderIndex}
                                    <div class="flex items-center gap-2">
                                        <input
                                            bind:value={stakeholder.role}
                                            class="input flex-1 bg-transparent px-2 outline-none"
                                        />
                                        <button
                                            class="variant-soft-secondary btn-icon"
                                            onclick={() => (editingField = null)}
                                        >
                                            <Check size={16} />
                                        </button>
                                    </div>
                                {:else}
                                    <div class="flex items-center gap-2">
                                        <p class="flex-1">{stakeholder.role}</p>
                                        <button
                                            class="variant-soft-secondary btn-icon"
                                            onclick={() => (editingField = { type: 'role', stakeholderIndex })}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <div class="mb-2 mt-4 flex items-center gap-2">
                            <span class="flex-1 text-sm font-semibold">Interests</span>
                            <button
                                class="variant-soft-secondary btn-icon"
                                onclick={() => addInterest(stakeholderIndex)}
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <ul class="flex flex-col gap-2">
                            {#each stakeholder.interests as interest, interestIndex}
                                <li>
                                    {#if editingField?.type === 'interest' && editingField.stakeholderIndex === stakeholderIndex && editingField.interestIndex === interestIndex}
                                        <div class="flex items-center gap-2">
                                            <input
                                                bind:value={stakeholder.interests[interestIndex]}
                                                class="input flex-1 bg-transparent px-2 outline-none"
                                            />
                                            <button
                                                class="variant-soft-secondary btn-icon"
                                                onclick={() => (editingField = null)}
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    {:else}
                                        <div class="flex items-center gap-2">
                                            <p class="flex-1">{interest}</p>
                                            <button
                                                class="variant-soft-secondary btn-icon"
                                                onclick={() =>
                                                    (editingField = { type: 'interest', stakeholderIndex, interestIndex })}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                class="variant-soft-error btn-icon"
                                                onclick={() => removeInterest(stakeholderIndex, interestIndex)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    </section>
                {/each}
            </section>

            <form method="POST" class="mt-4 flex justify-end">
                <input type="hidden" name="overview" value={JSON.stringify(editedData)} />
                <button type="submit" class="preset-tonal btn">Save Changes</button>
            </form>
        </div>
    </div>
{/if} 