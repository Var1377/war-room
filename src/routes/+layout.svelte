<script lang="ts">
	import '../app.postcss';
	import { selectedModel } from '$lib/stores';

	import { AppBar } from '@skeletonlabs/skeleton-svelte';

	const { data, children } = $props();
	const { models, defaultModel } = $derived(data);

	// Initialize the store with the default model
	$effect(() => {
		selectedModel.set(defaultModel);
	});
</script>

<AppBar>
	{#snippet lead()}
		<h1 class="place-self-center">[interesting title]</h1>
	{/snippet}
	{#snippet trail()}
		<div class="h-8">
			<label class="label flex items-center gap-2">
				Model:
				<select
					name="model"
					class="select"
					bind:value={$selectedModel}
				>
					{#each models as model}
						<option value={model.id} selected={model.id === defaultModel}>{model.id}</option>
					{/each}
				</select>
			</label>
		</div>
	{/snippet}
</AppBar>
{@render children()}
