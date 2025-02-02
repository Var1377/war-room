<script lang="ts">
	import BackgroundGradient from "$lib/BackgroundGradient.svelte";

	const { data } = $props();
	const { scenarios } = $derived(data);
	let prompt = $state('');

	function selectScenario(scenarioPrompt: string) {
		prompt = scenarioPrompt;
	}
</script>

<div class="flex flex-col items-center gap-4 relative z-10">
	<h1 class="h1 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">War Room</h1>
	<p class="text-lg text-gray-300">Analyse global scenarios and predict international outcomes with state-of-the-art insights</p>
</div>

<label class="label mb-4 block relative z-10">
	<BackgroundGradient	className="p-1" animate={true}>
		<textarea
			name="prompt"
			bind:value={prompt}
			rows="5"
			placeholder="Write your scenario here, or click one of the suggestions above..."
			class="textarea bg-surface-900/80 backdrop-blur-sm w-full"
		></textarea>
	</BackgroundGradient>
</label>

<section class="preset-grid relative z-10">
	{#each scenarios as scenario}
		<button
			onclick={() => selectScenario(scenario.prompt)}
			class="card flex flex-col justify-between gap-2 rounded-lg p-4 text-left shadow-lg bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200"
		>
			<h2 class="h4 font-semibold">{scenario.title}</h2>
			<p class="text-gray-300">{scenario.prompt}</p>
		</button>
	{/each}
</section>

<form method="POST" action="?/analyze" class="mt-4 relative z-10">
	<input type="hidden" name="prompt" bind:value={prompt} />
	<div class="flex justify-center">
		<button class="btn px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-blue-500/20">Analyse</button>
	</div>
</form>

<style lang="postcss">
	.preset-grid {
		@apply grid gap-8;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	}
</style>
