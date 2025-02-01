<script lang="ts">
	import { Pencil, Plus, Trash2, Check, X } from 'lucide-svelte';
	const { data } = $props();
	const { overview } = $derived(data);

	let editedOverview: Awaited<typeof overview> | null = $state(null);
	let editingTitle = $state(false);
	let editingOverview = $state(false);
	let editingField: { type: 'name' | 'role' | 'interest', stakeholderIndex: number, interestIndex?: number } | null = $state(null);

	$effect(() => {
		if (overview) {
			overview.then((o) => {
				editedOverview = structuredClone(o);
			});
		}
	});

	function addStakeholder() {
		if (!editedOverview) return;
		editedOverview.stakeholders = [
			...editedOverview.stakeholders,
			{
				name: 'New Stakeholder',
				role: 'Role',
				interests: ['Interest']
			}
		];
	}

	function addInterest(stakeholderIndex: number) {
		if (!editedOverview) return;
		editedOverview.stakeholders[stakeholderIndex].interests = [
			...editedOverview.stakeholders[stakeholderIndex].interests,
			'New Interest'
		];
	}

	function removeStakeholder(index: number) {
		if (!editedOverview) return;
		editedOverview.stakeholders = editedOverview.stakeholders.filter((_: unknown, i: number) => i !== index);
	}

	function removeInterest(stakeholderIndex: number, interestIndex: number) {
		if (!editedOverview) return;
		editedOverview.stakeholders[stakeholderIndex].interests = editedOverview.stakeholders[
			stakeholderIndex
		].interests.filter((_: unknown, i: number) => i !== interestIndex);
	}
</script>

<div class="card m-8 p-8 text-white preset-tonal">
	{#if !editedOverview}
		<div class="placeholder h-48 w-full animate-pulse rounded-lg">Analyzing scenario...</div>
	{:else}
		<div class="flex max-w-none flex-col gap-4 text-white">
			<div class="group relative">
				{#if editingTitle}
					<div class="flex items-center gap-2">
						<input
							bind:value={editedOverview.title}
							class="h1 flex-1 bg-transparent px-2 outline-none input"
						/>
						<button class="variant-soft-secondary btn-icon" onclick={() => editingTitle = false}>
							<Check size={16} />
						</button>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<h1 class="h1 flex-1">{editedOverview.title}</h1>
						<button
							class="variant-soft-secondary btn-icon"
							onclick={() => editingTitle = true}
						>
							<Pencil size={16} />
						</button>
					</div>
				{/if}
			</div>

			<div class="group relative">
				{#if editingOverview}
					<div class="flex gap-2">
						<textarea
							bind:value={editedOverview.overview}
							class="min-h-[100px] flex-1 bg-transparent p-2 outline-none textarea"
						></textarea>
						<button
							class="variant-soft-secondary btn-icon"
							onclick={() => editingOverview = false}
						>
							<Check size={16} />
						</button>
					</div>
				{:else}
					<div class="flex items-start gap-2">
						<p class="flex-1">{editedOverview.overview}</p>
						<button
							class="variant-soft-secondary btn-icon"
							onclick={() => editingOverview = true}
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

			<section class="card preset-tonal p-4">
                <section class="flex flex-col gap-2">
                    {#each editedOverview.stakeholders as stakeholder, stakeholderIndex}
                        <section class="group card p-4 preset-tonal">
                            <div class="flex flex-col gap-2">
                                <div>
                                    {#if editingField?.type === 'name' && editingField.stakeholderIndex === stakeholderIndex}
                                        <div class="flex items-center gap-2">
                                            <input
                                                bind:value={stakeholder.name}
                                                class="h3 flex-1 bg-transparent px-2 outline-none input"
                                            />
                                            <button
                                                class="variant-soft-secondary btn-icon"
                                                onclick={() => editingField = null}
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    {:else}
                                        <div class="flex items-center gap-2">
                                            <h3 class="h3 flex-1">{stakeholder.name}</h3>
                                            <button
                                                class="variant-soft-secondary btn-icon"
                                                onclick={() => editingField = { type: 'name', stakeholderIndex }}
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
                                                class="flex-1 bg-transparent px-2 outline-none input"
                                            />
                                            <button
                                                class="variant-soft-secondary btn-icon"
                                                onclick={() => editingField = null}
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    {:else}
                                        <div class="flex items-center gap-2">
                                            <p class="flex-1">{stakeholder.role}</p>
                                            <button
                                                class="variant-soft-secondary btn-icon"
                                                onclick={() => editingField = { type: 'role', stakeholderIndex }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="mb-2 mt-4 flex items-center gap-2">
                                <span class="text-sm font-semibold flex-1">Interests</span>
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
                                                    class="flex-1 bg-transparent px-2 outline-none input"
                                                />
                                                <button
                                                    class="variant-soft-secondary btn-icon"
                                                    onclick={() => editingField = null}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        {:else}
                                            <div class="flex items-center gap-2">
                                                <p class="flex-1">{interest}</p>
                                                <button
                                                    class="variant-soft-secondary btn-icon"
                                                    onclick={() => editingField = { type: 'interest', stakeholderIndex, interestIndex }}
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
            </section>
		</div>
	{/if}
</div>
