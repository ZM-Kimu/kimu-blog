<script lang="ts">
	import { createStableGroupId } from '$lib/content/group-schema'
	import type { ManageGroupDocument } from '$lib/features/manage/types'
	import { tick } from 'svelte'

	let {
		value = $bindable(),
		newName = $bindable(),
		label,
		items,
		noneLabel,
		createLabel,
		renameLabel,
		renameSaveLabel,
		renameCancelLabel,
		disabled = false,
		onrename
	}: {
		value: string
		newName: string
		label: string
		items: ManageGroupDocument[]
		noneLabel: string
		createLabel: string
		renameLabel: string
		renameSaveLabel: string
		renameCancelLabel: string
		disabled?: boolean
		onrename?: (item: ManageGroupDocument, name: string) => Promise<void>
	} = $props()

	let root: HTMLDivElement
	let trigger: HTMLButtonElement
	let createInput = $state<HTMLInputElement>()
	let renameInput = $state<HTMLInputElement>()
	let open = $state(false)
	let creating = $state(false)
	let draftName = $state('')
	let renamingId = $state('')
	let renameDraft = $state('')
	const selected = $derived(items.find((item) => item.group.id === value))
	const selectedLabel = $derived(newName || selected?.group.name || noneLabel)

	function close(restoreFocus = false) {
		open = false
		creating = false
		draftName = ''
		renamingId = ''
		renameDraft = ''
		if (restoreFocus) trigger.focus()
	}

	function focusOption(index: number) {
		const options = root.querySelectorAll<HTMLButtonElement>('[role="option"]')
		options[Math.max(0, Math.min(index, options.length - 1))]?.focus()
	}

	async function show() {
		if (disabled) return
		open = true
		await tick()
		root.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')?.focus()
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			void show().then(() => focusOption(event.key === 'ArrowDown' ? 0 : items.length))
		}
	}

	function handleOptionKeydown(event: KeyboardEvent, index: number) {
		const optionCount = items.length + 1
		let next = index
		if (event.key === 'ArrowDown') next = (index + 1) % optionCount
		else if (event.key === 'ArrowUp') next = (index - 1 + optionCount) % optionCount
		else if (event.key === 'Home') next = 0
		else if (event.key === 'End') next = optionCount - 1
		else if (event.key === 'Escape') {
			event.preventDefault()
			close(true)
			return
		} else return
		event.preventDefault()
		focusOption(next)
	}

	function selectNone() {
		value = ''
		newName = ''
		close(true)
	}

	function selectItem(id: string) {
		value = id
		newName = ''
		close(true)
	}

	async function beginCreate() {
		renamingId = ''
		renameDraft = ''
		creating = true
		await tick()
		createInput?.focus()
	}

	function commitCreate() {
		const name = draftName.trim().replace(/\s+/gu, ' ')
		if (!name) return
		value = createStableGroupId(name)
		newName = name
		close(true)
	}

	async function beginRename(item: ManageGroupDocument, event: MouseEvent) {
		event.stopPropagation()
		if (!onrename) return
		creating = false
		draftName = ''
		renamingId = item.group.id
		renameDraft = item.group.name
		await tick()
		renameInput?.focus()
		renameInput?.select()
	}

	async function commitRename(item: ManageGroupDocument) {
		if (!onrename) return
		const name = renameDraft.trim().replace(/\s+/gu, ' ')
		if (!name || name === item.group.name) {
			cancelRename()
			return
		}
		await onrename(item, name)
		renamingId = ''
		renameDraft = ''
	}

	function cancelRename(event?: MouseEvent) {
		event?.stopPropagation()
		renamingId = ''
		renameDraft = ''
	}

	function handleWindowPointerDown(event: PointerEvent) {
		if (open && event.target instanceof Node && !root.contains(event.target)) close()
	}
</script>

<svelte:window onpointerdown={handleWindowPointerDown} />

<div class="manage-select" bind:this={root}>
	<button
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-label={label}
		bind:this={trigger}
		data-press-disabled="true"
		{disabled}
		onclick={() => (open ? close() : void show())}
		onkeydown={handleTriggerKeydown}
		type="button"
	>
		<span>{selectedLabel}</span><i aria-hidden="true"></i>
	</button>

	<div aria-hidden={!open} class:open class="manage-select-options" role="listbox">
		<button
			aria-selected={!value}
			data-press-disabled="true"
			onclick={selectNone}
			onkeydown={(event) => handleOptionKeydown(event, 0)}
			role="option"
			tabindex={open ? 0 : -1}
			type="button">{noneLabel}</button
		>
		{#each items as item, index (item.group.id)}
			<div class:active={value === item.group.id} class="manage-select-option-row">
				{#if renamingId === item.group.id}
					<form
						class="manage-select-rename-form"
						onsubmit={(event) => {
							event.preventDefault()
							void commitRename(item)
						}}
					>
						<input
							aria-label={`${renameLabel}: ${item.group.name}`}
							bind:this={renameInput}
							bind:value={renameDraft}
							maxlength="96"
						/>
						<button
							aria-label={renameSaveLabel}
							data-press-disabled="true"
							disabled={!renameDraft.trim()}
							type="submit"
						>
							<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
						</button>
						<button
							aria-label={renameCancelLabel}
							data-press-disabled="true"
							onclick={(event) => cancelRename(event)}
							type="button"
						>
							<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
						</button>
					</form>
				{:else}
					<button
						aria-selected={value === item.group.id}
						data-press-disabled="true"
						onclick={() => selectItem(item.group.id)}
						onkeydown={(event) => handleOptionKeydown(event, index + 1)}
						role="option"
						tabindex={open ? 0 : -1}
						type="button">{item.group.name}</button
					>
					{#if onrename}
						<button
							aria-label={`${renameLabel}: ${item.group.name}`}
							class="manage-select-rename"
							data-press-disabled="true"
							onclick={(event) => beginRename(item, event)}
							type="button"
						>
							<svg aria-hidden="true" viewBox="0 0 24 24"
								><path d="m4 16-.8 4 4-.8L18 8.4 15.6 6 4 16Z M14 7.6l2.4 2.4" /></svg
							>
						</button>
					{/if}
				{/if}
			</div>
		{/each}

		{#if creating}
			<form
				class="manage-select-create"
				onsubmit={(event) => {
					event.preventDefault()
					commitCreate()
				}}
			>
				<input bind:this={createInput} bind:value={draftName} maxlength="96" />
				<button aria-label={createLabel} data-press-disabled="true" type="submit">+</button>
			</form>
		{:else}
			<button
				class="manage-select-create-action"
				data-press-disabled="true"
				onclick={beginCreate}
				type="button">+ {createLabel}</button
			>
		{/if}
	</div>
</div>

<style>
	.manage-select {
		position: relative;
		z-index: 5;
	}

	.manage-select > button,
	.manage-select-create input,
	.manage-select-rename-form input {
		width: 100%;
		height: 3.15rem;
		padding: 0 1rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 78%);
		color: var(--ink);
		font: inherit;
	}

	.manage-select > button {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.manage-select > button > i {
		width: 0.55rem;
		height: 0.55rem;
		border-right: 2px solid currentcolor;
		border-bottom: 2px solid currentcolor;
		rotate: 45deg;
		translate: 0 -0.16rem;
	}

	.manage-select-options {
		position: absolute;
		top: calc(100% + 0.42rem);
		left: 0;
		z-index: 12;
		display: grid;
		gap: 0.25rem;
		width: 100%;
		max-height: 18rem;
		padding: 0.42rem;
		overflow: auto;
		border: 1px solid var(--line-strong);
		border-radius: 17px;
		background: rgb(248 252 255 / 97%);
		box-shadow: 0 18px 42px rgb(31 92 153 / 18%);
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity var(--motion-manage-select-options-exit-duration) var(--motion-shared-easing-standard),
			visibility 0s linear var(--motion-manage-select-options-exit-duration);
	}

	.manage-select-options.open {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transition:
			opacity var(--motion-manage-select-options-enter-duration)
				var(--motion-shared-easing-standard),
			visibility 0s linear;
	}

	.manage-select-options button {
		min-height: 2.65rem;
		padding: 0.65rem 0.75rem;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: var(--ink);
		font: inherit;
		text-align: left;
	}

	.manage-select-rename-form button {
		display: grid;
		place-items: center;
		padding: 0;
	}

	.manage-select-options > button[aria-selected='true'],
	.manage-select-option-row.active {
		background: rgb(79 120 255 / 10%);
	}

	.manage-select-option-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		border-radius: 12px;
	}

	.manage-select-option-row > button:first-child {
		width: 100%;
	}

	.manage-select-option-row .manage-select-rename {
		display: grid;
		place-items: center;
		width: 2.65rem;
		padding: 0;
	}

	.manage-select-rename svg {
		width: 1rem;
		fill: none;
		stroke: currentcolor;
		stroke-width: 1.7;
	}

	.manage-select-rename-form {
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: minmax(0, 1fr) repeat(2, 2.65rem);
		gap: 0.25rem;
		padding: 0.18rem;
	}

	.manage-select-rename-form input {
		height: 2.65rem;
		border-radius: 10px;
	}

	.manage-select-rename-form svg {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentcolor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2;
	}

	.manage-select-create {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 2.65rem;
		gap: 0.35rem;
	}

	.manage-select-create input {
		height: 2.65rem;
		border-radius: 12px;
	}

	.manage-select-create-action {
		color: #4169b3 !important;
	}
</style>
