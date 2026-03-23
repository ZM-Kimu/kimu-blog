<script lang="ts">
	interface Props {
		label: string;
		value: string;
	}

	let { label, value }: Props = $props();
</script>

<div class="status-chip">
	<span>{label}</span>
	<strong>{value}</strong>
</div>
