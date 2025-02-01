<!-- War Room overview page -->
<script lang="ts">
    const { data } = $props();
    const { scenario } = $derived(data);
</script>

<div class="container mx-auto p-8">
    {JSON.stringify(scenario)}

    <div class="mt-8 flex justify-end gap-4">
        <a href="./../stakeholders" class="variant-soft-secondary btn">Edit Stakeholders</a>
        <a href="./../relationships" class="variant-soft-secondary btn">Edit Relationships</a>
    </div>
</div>