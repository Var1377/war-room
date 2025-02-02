<script lang="ts">
	import { selectedModel } from '$lib/stores';
	const { data } = $props();
	const { defaultModel, scenarios } = $derived(data);
	let prompt = $state('');

	function selectScenario(scenarioPrompt: string) {
		prompt = scenarioPrompt;
	}

	$effect(() => {
		if (defaultModel) {
			selectedModel.set(defaultModel);
		}
	});
</script>

<div class="hero-gradient" data-theme="vintage">
	<header id="hero" class="bg-surface-100-800-token">
		<div class="section-container text-center">
			<h1 class="mb-20 text-8xl font-medium text-white drop-shadow-lg">
				International Relations War Room
			</h1>
			<p class="mt-[50px] font-sans text-3xl text-white">
				Analyse global scenarios and predict international outcomes with state-of-the-art insights
			</p>
		</div>
	</header>

	<!-- Suggested Scenarios Section -->
	<section id="scenarios" class="bg-surface-100-800-token">
		<div class="section-container">
			<h2 class="mb-6 text-3xl font-bold text-white">Suggested Scenarios</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				{#each scenarios as scenario}
					<button
						class="transform rounded-lg bg-[rgb(var(--color-war-500))] p-6 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
						on:click={() => selectScenario(scenario.prompt)}
					>
						<!--  -->
						<h3 class="mb-2 text-2xl font-bold text-white">{scenario.title}</h3>
						<p class="font-bold text-white">{scenario.prompt}</p>
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Analysis Section -->
	<section id="analysis" class="bg-surface-100-800-token">
		<div class="section-container">
			<div class="rounded-lg border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg">
				<label class="mb-4 block">
					<span class="mb-2 block text-lg font-bold text-white">
						Describe your international relations scenario:
					</span>
					<textarea
						name="prompt"
						bind:value={prompt}
						class="w-full rounded-lg bg-[rgb(var(--color-war-tertiary-500))] p-4 font-bold text-white placeholder-white/70 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
						rows="5"
						placeholder="Write your scenario here, or click one of the suggestions above..."
					></textarea>
				</label>

				<form method="POST" action="?/analyse" class="mt-4">
					<input type="hidden" name="prompt" bind:value={prompt} />
					<input type="hidden" name="model" bind:value={$selectedModel} />
					<div class="flex justify-center">
						<button
							type="submit"
							class="rounded-lg bg-[rgb(var(--color-war-tertiary-500))] px-8 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:bg-primary-600"
						>
							Analyse Scenario
						</button>
					</div>
				</form>
			</div>
		</div>
	</section>

	<!-- Footer Section -->
	<footer class="bg-surface-100-800-token">
		<div class="section-container py-6 text-center">
			<p class="font-bold text-white">
				&copy; 2025 International Relations War Room. All rights reserved.
			</p>
		</div>
	</footer>
</div>

<style lang="postcss">
	/* Section Container inspired by Skeleton's docs */
	.section-container {
		@apply mx-auto w-full max-w-7xl p-4 py-8 md:py-14;
	}

	/* Hero Gradient similar to Skeleton's style */
	.hero-gradient {
		background-image: radial-gradient(
				at 0% 0%,
				rgba(var(--color-war-secondary-500) / 0.33) 0px,
				transparent 60%
			),
			radial-gradient(at 98% 1%, rgba(var(--color-war-secondary-500) / 0.33) 0px, transparent 60%);
	}
</style>
