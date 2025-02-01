<script lang="ts">
	const { data } = $props();
	const { models, defaultModel, scenarios } = $derived(data);
	import { selectedModel } from '$lib/stores';

	let prompt = $state('');

	function selectScenario(scenarioPrompt: string) {
		prompt = scenarioPrompt;
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="h1 mb-8">[interesting title]</h1>

	<div class="mb-8">
		<h2 class="h2 mb-4">Suggested Scenarios</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each scenarios as scenario}
				<button
					class="card p-4 text-left transition-colors hover:bg-primary-500/10"
					onclick={() => selectScenario(scenario.prompt)}
				>
					<h3 class="h3 mb-2">{scenario.title}</h3>
					<p class="text-sm opacity-75">{scenario.prompt}</p>
				</button>
			{/each}
		</div>
	</div>

	<div class="card space-y-4 p-6">
		<div class="space-y-4">
			<label class="label">
				<span>Describe your international relations scenario:</span>
				<textarea
					name="prompt"
					bind:value={prompt}
					class="textarea rounded-lg"
					rows="4"
					placeholder="Write your scenario here, or click one of the suggestions above..."
				></textarea>
			</label>
		</div>
	</div>
	<div class="mt-4">
		<a
			href="/stakeholders?prompt={prompt}&model={$selectedModel}"
			class="variant-filled-primary btn w-full"
		>
			Analyze Scenario
		</a>
	</div>
</div>
