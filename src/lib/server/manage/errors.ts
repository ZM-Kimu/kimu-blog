export class ManageError extends Error {
	constructor(
		public readonly status: number,
		public readonly code: string,
		message: string,
		public readonly details?: unknown
	) {
		super(message)
		this.name = 'ManageError'
	}
}

export function isManageError(error: unknown): error is ManageError {
	return error instanceof ManageError
}
