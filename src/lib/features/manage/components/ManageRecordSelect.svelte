<script lang="ts">
	import { tick } from 'svelte'

	interface Option {
		label: string
		value: string
	}

	let {
		value = $bindable(),
		label,
		options,
		disabled = false,
		onchange
	}: {
		value: string
		label: string
		options: readonly Option[]
		disabled?: boolean
		onchange?: (value: string) => void
	} = $props()

	let root: HTMLDivElement
	let trigger: HTMLButtonElement
	let open = $state(false)
	const selectedLabel = $derived(options.find((option) => option.value === value)?.label ?? value)

	function close(restoreFocus = false) {
		open = false
		if (restoreFocus) trigger.focus()
	}

	async function show() {
		if (disabled) return
		open = true
		await tick()
		root.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus()
	}

	function focusOption(index: number) {
		const elements = root.querySelectorAll<HTMLButtonElement>('[role="option"]')
		elements[Math.max(0, Math.min(index, elements.length - 1))]?.focus()
	}

	function selectOption(next: string) {
		value = next
		onchange?.(next)
		close(true)
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			void show().then(() => focusOption(event.key === 'ArrowDown' ? 0 : options.length - 1))
		}
	}

	function handleOptionKeydown(event: KeyboardEvent, index: number) {
		let next = index
		if (event.key === 'ArrowDown') next = (index + 1) % options.length
		else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length
		else if (event.key === 'Home') next = 0
		else if (event.key === 'End') next = options.length - 1
		else if (event.key === 'Escape') {
			event.preventDefault()
			close(true)
			return
		} else return
		event.preventDefault()
		focusOption(next)
	}

	function handleWindowPointerDown(event: PointerEvent) {
		if (open && event.target instanceof Node && !root.contains(event.target)) close()
	}
</script>

<svelte:window onpointerdown={handleWindowPointerDown} />

<div class="manage-record-select" bind:this={root}>
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
	<div aria-hidden={!open} class:open class="manage-record-options" role="listbox">
		{#each options as option, index (option.value)}
			<button
				aria-selected={value === option.value}
				data-press-disabled="true"
				onclick={() => selectOption(option.value)}
				onkeydown={(event) => handleOptionKeydown(event, index)}
				role="option"
				tabindex={open ? 0 : -1}
				type="button"
			>
				{option.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.manage-record-select {
		position: relative;
		z-index: 4;
	}

	.manage-record-select > button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 3.15rem;
		padding: 0 1rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 78%);
		color: var(--ink);
		font: inherit;
		cursor: inherit;
	}

	.manage-record-select > button:focus-visible {
		border-color: var(--line-strong);
		outline: none;
		box-shadow: 0 0 0 3px rgb(79 120 255 / 8%);
	}

	.manage-record-select > button i {
		width: 0.55rem;
		height: 0.55rem;
		border-right: 2px solid currentcolor;
		border-bottom: 2px solid currentcolor;
		rotate: 45deg;
		translate: 0 -0.16rem;
	}

	.manage-record-options {
		position: absolute;
		top: calc(100% + 0.42rem);
		left: 0;
		z-index: 10;
		display: grid;
		gap: 0.25rem;
		width: 100%;
		padding: 0.4rem;
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

	.manage-record-options.open {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transition:
			opacity var(--motion-manage-select-options-enter-duration)
				var(--motion-shared-easing-standard),
			visibility 0s linear;
	}

	.manage-record-select .manage-record-options button {
		width: 100%;
		padding: 0.68rem 0.75rem;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: var(--ink);
		font: inherit;
		text-align: left;
		cursor: inherit;
	}

	.manage-record-select .manage-record-options button:focus-visible,
	.manage-record-select .manage-record-options button[aria-selected='true'] {
		outline: none;
		background: rgb(79 120 255 / 10%);
	}
</style>
