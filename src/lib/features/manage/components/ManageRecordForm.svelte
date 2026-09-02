<script lang="ts">
	import type { Snippet } from 'svelte'
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'

	let {
		children,
		onsubmit,
		ondelete,
		isSubmitting,
		canDelete,
		statusMessage = '',
		errorMessage = ''
	}: {
		children: Snippet
		onsubmit: (event: SubmitEvent) => void
		ondelete: () => void
		isSubmitting: boolean
		canDelete: boolean
		statusMessage?: string
		errorMessage?: string
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string) => translate(messages, key)
</script>

<form class="manage-record-form panel" {onsubmit}>
	<div class="manage-record-toolbar">
		<div aria-live="polite" class="manage-record-feedback">
			{#if statusMessage}<span class="success">{statusMessage}</span>{/if}
			{#if errorMessage}<span class="error">{errorMessage}</span>{/if}
		</div>
		<div class="manage-record-actions">
			<button
				aria-label={t('manage.records.common.save')}
				class="save"
				data-press-disabled="true"
				disabled={isSubmitting}
				title={t('manage.records.common.save')}
				type="submit"
			>
				<svg aria-hidden="true" viewBox="0 0 24 24"
					><path d="M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-7h8v7" /></svg
				>
			</button>
			{#if canDelete}
				<button
					aria-label={t('manage.records.common.delete')}
					class="danger"
					data-press-disabled="true"
					disabled={isSubmitting}
					onclick={ondelete}
					title={t('manage.records.common.delete')}
					type="button"
				>
					<svg aria-hidden="true" viewBox="0 0 24 24"
						><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" /></svg
					>
				</button>
			{/if}
		</div>
	</div>
	{@render children()}
</form>

<style>
	.manage-record-form {
		display: grid;
		gap: 1rem;
		align-self: start;
		overflow: visible;
		padding: clamp(1rem, 1.5vw, 1.35rem);
	}

	.manage-record-toolbar,
	.manage-record-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		justify-content: space-between;
	}

	.manage-record-feedback {
		min-height: 1.4rem;
		font-size: 0.82rem;
	}

	.manage-record-feedback .success {
		color: #237b5a;
	}

	.manage-record-feedback .error {
		color: #b84f62;
	}

	.manage-record-actions button {
		display: grid;
		place-items: center;
		width: 2.8rem;
		height: 2.8rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: rgb(255 255 255 / 74%);
		color: var(--ink-soft);
		cursor: inherit;
	}

	.manage-record-actions .save {
		border-color: rgb(79 120 255 / 24%);
		background: rgb(79 120 255 / 12%);
		color: #476fb9;
	}

	.manage-record-actions .danger {
		color: #b84f62;
	}

	.manage-record-actions button:focus-visible {
		outline: 2px solid rgb(79 120 255 / 40%);
		outline-offset: 2px;
	}

	.manage-record-actions button:disabled {
		opacity: 0.5;
	}

	svg {
		width: 1.15rem;
		height: 1.15rem;
		fill: none;
		stroke: currentcolor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}
</style>
