<script lang="ts">
	import type { Scenario } from "@prisma/client";

    const { scenario }: { scenario: Scenario } = $props();
</script>

<div class="card preset-outlined-primary-500 p-4 flex flex-col gap-1">
    <h1 class="h3 truncate">Root</h1>
</div>

<style>
    .card {
        width: 120px;
        height: 80px;
        box-sizing: border-box;
    }
</style>