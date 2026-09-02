<script lang="ts">
	type IdentifierStatus = 'idle' | 'checking' | 'available' | 'invalid'

	let {
		value = $bindable(),
		label,
		status = 'idle',
		statusText = '',
		fieldId,
		disabled = false,
		readonly = false,
		oninput
	}: {
		value: string
		label: string
		status?: IdentifierStatus
		statusText?: string
		fieldId: string
		disabled?: boolean
		readonly?: boolean
		oninput?: (event: Event) => void
	} = $props()

	const statusId = $derived(`${fieldId}-status`)

	function handleInput(event: Event) {
		value = (event.currentTarget as HTMLInputElement).value
		oninput?.(event)
	}

	function suppressNativeValidation(event: Event) {
		event.preventDefault()
	}
</script>

<label class="manage-identifier-field" for={fieldId}>
	<span>{label}</span>
	<div class="manage-identifier-input-wrap">
		<input
			aria-describedby={statusText ? statusId : undefined}
			aria-invalid={status === 'invalid' ? 'true' : undefined}
			aria-required="true"
			autocapitalize="none"
			{disabled}
			id={fieldId}
			maxlength="96"
			oninput={handleInput}
			oninvalid={suppressNativeValidation}
			{readonly}
			spellcheck="false"
			type="text"
			{value}
		/>
		{#if status !== 'idle'}
			<span aria-hidden="true" class="manage-identifier-indicator" data-state={status}>
				{#if status === 'available'}
					<svg viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
				{:else if status === 'invalid'}
					<svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17" /></svg>
				{/if}
			</span>
		{/if}
	</div>
	{#if statusText}
		<span aria-live="polite" class="manage-identifier-visually-hidden" id={statusId}
			>{statusText}</span
		>
	{/if}
</label>

<style>
	.manage-identifier-field {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}

	.manage-identifier-field > span:first-child {
		color: var(--ink-faint);
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.manage-identifier-input-wrap {
		position: relative;
	}

	input {
		width: 100%;
		height: 3.15rem;
		padding: 0 3rem 0 0.92rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 78%);
		color: var(--ink);
		font: inherit;
		cursor: inherit;
	}

	input[readonly] {
		background: rgb(240 246 253 / 78%);
	}

	input[aria-invalid='true'] {
		border-color: rgb(217 82 100 / 36%);
	}

	.manage-identifier-indicator {
		position: absolute;
		top: 50%;
		right: 1rem;
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.manage-identifier-indicator[data-state='checking'] {
		border: 2px solid rgb(79 120 255 / 20%);
		border-top-color: rgb(79 120 255 / 62%);
	}

	.manage-identifier-indicator[data-state='available'] {
		background: rgb(11 184 135 / 12%);
		color: #087458;
	}

	.manage-identifier-indicator[data-state='invalid'] {
		background: rgb(231 91 79 / 12%);
		color: #a43d4b;
	}

	svg {
		width: 0.9rem;
		height: 0.9rem;
		fill: none;
		stroke: currentcolor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2.4;
	}

	.manage-identifier-visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
