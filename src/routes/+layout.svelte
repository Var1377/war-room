<script lang="ts">
	import '../app.postcss';
	import { Home } from "lucide-svelte"

	const { children } = $props();


</script>

<nav class="absolute card top-4 left-4 z-50">
	<a href="/">
		<Home />
	</a>
</nav>
<main class="flex flex-col gap-4 p-4">
	{@render children()}
</main>
