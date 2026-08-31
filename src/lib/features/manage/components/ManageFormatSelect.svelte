<script lang="ts">
	import type { ManagedPostFormat } from '$lib/features/manage/types'
	import { tick } from 'svelte'

	let {
		value = $bindable(),
		label,
		disabled = false
	}: {
		value: ManagedPostFormat
		label: string
		disabled?: boolean
	} = $props()

	const options: readonly ManagedPostFormat[] = ['svx', 'md']
	let root: HTMLDivElement
	let trigger: HTMLButtonElement
	let open = $state(false)

	function focusOption(index: number) {
		root.querySelectorAll<HTMLButtonElement>('[role="option"]')[index]?.focus()
	}

	function closeMenu({ restoreFocus = false } = {}) {
		open = false

		if (restoreFocus) {
			trigger.focus()
		}
	}

	async function openMenu(focusIndex = options.indexOf(value)) {
		if (disabled) {
			return
		}

		open = true
		await tick()
		focusOption(Math.max(0, focusIndex))
	}

	function selectOption(option: ManagedPostFormat) {
		value = option
		closeMenu({ restoreFocus: true })
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			void openMenu(event.key === 'ArrowDown' ? 0 : options.length - 1)
		}
	}

	function handleOptionKeydown(event: KeyboardEvent, index: number) {
		let nextIndex = index

		switch (event.key) {
			case 'ArrowDown':
				nextIndex = (index + 1) % options.length
				break
			case 'ArrowUp':
				nextIndex = (index - 1 + options.length) % options.length
				break
			case 'Home':
				nextIndex = 0
				break
			case 'End':
				nextIndex = options.length - 1
				break
			case 'Escape':
				event.preventDefault()
				closeMenu({ restoreFocus: true })
				return
			default:
				return
		}

		event.preventDefault()
		focusOption(nextIndex)
	}

	function handleWindowPointerDown(event: PointerEvent) {
		if (open && event.target instanceof Node && !root.contains(event.target)) {
			closeMenu()
		}
	}
</script>

<svelte:window onpointerdown={handleWindowPointerDown} />

<div class="manage-format-select" bind:this={root}>
	<button
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-label={label}
		bind:this={trigger}
		class:manage-format-trigger-open={open}
		{disabled}
		onclick={() => (open ? closeMenu() : void openMenu())}
		onkeydown={handleTriggerKeydown}
		type="button"
	>
		<span>{value}</span>
		<i aria-hidden="true"></i>
	</button>

	{#if open}
		<div aria-label={label} class="manage-format-options" role="listbox">
			{#each options as option, index (option)}
				<button
					aria-selected={value === option}
					class:active={value === option}
					onclick={() => selectOption(option)}
					onkeydown={(event) => handleOptionKeydown(event, index)}
					role="option"
					type="button"
				>
					<span>{option}</span>
					{#if value === option}<i aria-hidden="true">✓</i>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.manage-format-select {
		position: relative;
		z-index: 3;
	}

	.manage-format-select > button {
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
		cursor: inherit;
		transition:
			border-color var(--motion-shared-ease-standard),
			background-color var(--motion-shared-ease-standard),
			box-shadow var(--motion-shared-ease-standard);
	}

	.manage-format-options {
		position: absolute;
		top: calc(100% + 0.42rem);
		left: 0;
		z-index: 12;
		display: grid;
		width: 100%;
		padding: 0.38rem;
		border: 1px solid var(--line-strong);
		border-radius: 17px;
		background: rgb(248 252 255 / 96%);
		box-shadow: 0 18px 42px rgb(31 92 153 / 18%);
		backdrop-filter: blur(18px);
	}

	.manage-format-options button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.7rem 0.78rem;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: var(--ink);
		font: inherit;
		text-align: left;
		cursor: inherit;
	}

	.manage-format-options button i {
		color: #557fd0;
		font-style: normal;
	}

	.manage-format-select > button:focus-visible,
	.manage-format-trigger-open {
		border-color: var(--line-strong);
		outline: none;
		background: rgb(255 255 255 / 94%);
		box-shadow: 0 0 0 3px rgb(79 120 255 / 8%);
	}

	.manage-format-select > button:disabled {
		opacity: 0.58;
	}

	.manage-format-select > button > i {
		width: 0.55rem;
		height: 0.55rem;
		border-right: 2px solid currentcolor;
		border-bottom: 2px solid currentcolor;
		rotate: 45deg;
		translate: 0 -0.16rem;
		transition: rotate var(--motion-shared-ease-standard);
	}

	.manage-format-select > .manage-format-trigger-open > i {
		rotate: 225deg;
		translate: 0 0.16rem;
	}

	.manage-format-options button:hover,
	.manage-format-options button:focus-visible,
	.manage-format-options button.active {
		outline: none;
		background: rgb(79 120 255 / 10%);
	}
</style>
