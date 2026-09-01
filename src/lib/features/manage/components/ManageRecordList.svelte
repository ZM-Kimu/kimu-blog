<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import type {
		ManageFavoriteDocument,
		ManageRecordKind,
		ManageUpdateDocument
	} from '$lib/features/manage/types'

	type RecordDocument = ManageUpdateDocument | ManageFavoriteDocument

	let {
		kind,
		items,
		loading = false,
		errorMessage = '',
		onRetry
	}: {
		kind: ManageRecordKind
		items: RecordDocument[]
		loading?: boolean
		errorMessage?: string
		onRetry?: () => void
	} = $props()

	let query = $state('')
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)
	const copyRoot = $derived(`manage.records.${kind}`)
	const filteredItems = $derived.by(() => {
		const normalized = query.trim().toLowerCase()
		if (!normalized) return items

		return items.filter(({ entry }) =>
			Object.values(entry).flat().join(' ').toLowerCase().includes(normalized)
		)
	})
</script>

<section class="manage-record-list panel">
	<div class="manage-record-list-toolbar">
		<label>
			<input
				aria-label={t(`${copyRoot}.searchLabel`)}
				bind:value={query}
				placeholder={t(`${copyRoot}.searchPlaceholder`)}
				type="search"
			/>
		</label>
		<div class="manage-record-list-controls">
			<span>{t(`${copyRoot}.count`, { count: items.length })}</span>
			<a
				aria-label={t(`${copyRoot}.create`)}
				class="manage-record-create"
				href={resolve(`/manage/${kind}/new`)}
				title={t(`${copyRoot}.create`)}><i aria-hidden="true"></i></a
			>
		</div>
	</div>

	<div class="manage-record-rows">
		{#if loading}
			<div aria-busy="true" aria-live="polite" class="manage-record-state">
				{t('manage.records.common.loading')}
			</div>
		{:else if errorMessage}
			<div class="manage-record-state error">
				<span>{errorMessage}</span>
				{#if onRetry}
					<button data-press-disabled="true" onclick={onRetry} type="button">
						{t('manage.records.common.retry')}
					</button>
				{/if}
			</div>
		{:else if filteredItems.length}
			{#each filteredItems as document (document.entry.id)}
				<a class="manage-record-row" href={resolve(`/manage/${kind}/${document.entry.id}`)}>
					<div>
						<h2>{document.entry.title}</h2>
						<p>
							{'summary' in document.entry ? document.entry.summary : document.entry.description}
						</p>
					</div>
					<div class="manage-record-meta">
						<strong>{document.entry.id}</strong>
						<span>{document.entry.kind}</span>
						<time>
							{'date' in document.entry ? document.entry.date : document.entry.added}
						</time>
					</div>
				</a>
			{/each}
		{:else}
			<div class="manage-record-state">{t(`${copyRoot}.empty`)}</div>
		{/if}
	</div>
</section>

<style>
	.manage-record-list {
		display: grid;
		gap: 1rem;
		align-self: start;
		padding: clamp(0.9rem, 1.35vw, 1.25rem);
	}

	.manage-record-list-toolbar,
	.manage-record-list-controls {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		justify-content: space-between;
	}

	.manage-record-list-toolbar label {
		flex: 1 1 32rem;
		cursor: inherit;
	}

	.manage-record-list-toolbar input {
		width: 100%;
		height: 3.1rem;
		padding: 0 1.05rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		outline: none;
		background: rgb(247 251 255 / 76%);
		color: var(--ink);
		cursor: inherit;
	}

	.manage-record-list-toolbar input:focus {
		border-color: var(--line-strong);
		box-shadow: 0 0 0 3px rgb(79 120 255 / 8%);
	}

	.manage-record-list-controls > span,
	.manage-record-meta {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.045em;
		color: var(--ink-faint);
	}

	.manage-record-create {
		display: grid;
		place-items: center;
		width: 3.1rem;
		height: 3.1rem;
		border: 1px solid rgb(68 112 201 / 22%);
		border-radius: 50%;
		background: linear-gradient(145deg, #78a9ed, #557fd0);
		box-shadow: 0 10px 24px rgb(54 95 174 / 18%);
		color: white;
		cursor: inherit;
	}

	.manage-record-create i {
		position: relative;
		display: block;
		width: 1.05rem;
		height: 1.05rem;
	}

	.manage-record-create i::before,
	.manage-record-create i::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		display: block;
		width: 1.05rem;
		height: 2px;
		border-radius: 999px;
		background: currentcolor;
		transform: translate(-50%, -50%);
	}

	.manage-record-create i::after {
		transform: translate(-50%, -50%) rotate(90deg);
	}

	.manage-record-create:focus-visible {
		outline: 2px solid rgb(79 120 255 / 44%);
		outline-offset: 3px;
	}

	.manage-record-rows {
		display: grid;
		gap: 0.55rem;
	}

	.manage-record-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(11rem, 0.28fr);
		gap: clamp(1rem, 2vw, 2rem);
		min-height: 6.2rem;
		padding: 1rem 1.15rem 1rem 1.25rem;
		border: 1px solid var(--line);
		border-radius: 17px;
		background:
			linear-gradient(90deg, rgb(79 120 255 / 8%) 0 3px, transparent 3px), rgb(250 253 255 / 58%);
		color: inherit;
		cursor: inherit;
	}

	.manage-record-row:focus-visible {
		outline: 2px solid rgb(79 120 255 / 44%);
		outline-offset: 3px;
	}

	.manage-record-row h2,
	.manage-record-row p {
		margin: 0;
	}

	.manage-record-row h2 {
		font-family: var(--font-display);
		font-size: clamp(1.05rem, 1.4vw, 1.25rem);
		letter-spacing: -0.02em;
	}

	.manage-record-row p {
		margin-top: 0.45rem;
		color: var(--ink-soft);
		line-height: 1.5;
	}

	.manage-record-meta {
		display: grid;
		align-content: start;
		justify-items: end;
		gap: 0.3rem;
		padding-left: 1rem;
		border-left: 1px solid var(--line);
		text-align: right;
	}

	.manage-record-meta strong {
		color: var(--ink);
	}

	.manage-record-state {
		display: grid;
		gap: 0.6rem;
		align-content: center;
		justify-items: start;
		min-height: 6.2rem;
		padding: 1rem 1.2rem;
		border: 1px dashed var(--line-strong);
		border-radius: 17px;
		color: var(--ink-soft);
	}

	.manage-record-state button {
		min-height: 2.6rem;
		padding: 0 0.9rem;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: rgb(255 255 255 / 68%);
		color: var(--ink);
		cursor: inherit;
	}

	@media (width <= 760px) {
		.manage-record-list-toolbar {
			align-items: stretch;
			flex-wrap: wrap;
		}

		.manage-record-list-toolbar label,
		.manage-record-list-controls {
			width: 100%;
		}

		.manage-record-row {
			grid-template-columns: 1fr;
		}

		.manage-record-meta {
			justify-items: start;
			padding: 0.7rem 0 0;
			border-top: 1px solid var(--line);
			border-left: 0;
			text-align: left;
		}
	}
</style>
