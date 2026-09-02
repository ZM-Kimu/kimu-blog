import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const MUSIC_DIR = path.resolve('static/music')
const OUTPUT_FILE = path.resolve('src/lib/generated/music-playlist.ts')
const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.m4a', '.ogg', '.wav'])
const checkMode = process.argv.includes('--check')

async function directoryExists(directory) {
	try {
		await access(directory)
		return true
	} catch {
		return false
	}
}

async function collectMusicFiles() {
	if (!(await directoryExists(MUSIC_DIR))) {
		return []
	}

	const entries = await readdir(MUSIC_DIR, { withFileTypes: true })
	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((filename) => SUPPORTED_EXTENSIONS.has(path.extname(filename).toLowerCase()))
		.sort((left, right) => left.localeCompare(right, 'en'))
}

function createTrackId(filename) {
	return path
		.basename(filename, path.extname(filename))
		.toLowerCase()
		.replace(/[^a-z0-9]+/gu, '-')
		.replace(/^-|-$/gu, '')
}

function createTrackTitle(filename) {
	return path
		.basename(filename, path.extname(filename))
		.replace(/[_-]+/gu, ' ')
		.replace(/\s+/gu, ' ')
		.trim()
}

function createTrackSrc(filename) {
	return `/music/${encodeURIComponent(filename)}`
}

function quoteString(value) {
	return `'${value.replace(/\\/gu, '\\\\').replace(/'/gu, "\\'")}'`
}

function renderPlaylistModule(files) {
	const tracks = files.map((filename, index) => ({
		id: createTrackId(filename) || `track-${index + 1}`,
		title: createTrackTitle(filename) || filename,
		src: createTrackSrc(filename)
	}))
	const playlistLiteral =
		tracks.length > 0
			? `[
${tracks
	.map(
		(track) => `\t{
\t\tid: ${quoteString(track.id)},
\t\ttitle: ${quoteString(track.title)},
\t\tsrc: ${quoteString(track.src)}
\t}`
	)
	.join(',\n')}
]`
			: '[]'

	return `import type { MusicTrack } from '$lib/music/types'

export const musicPlaylist = ${playlistLiteral} as const satisfies readonly MusicTrack[]
`
}

const files = await collectMusicFiles()
const nextContents = renderPlaylistModule(files)

if (checkMode) {
	const currentContents = await readFile(OUTPUT_FILE, 'utf8').catch(() => '')

	if (currentContents !== nextContents) {
		console.error('Music playlist is out of date. Run npm run gen:music.')
		process.exit(1)
	}

	process.exit(0)
}

await mkdir(path.dirname(OUTPUT_FILE), { recursive: true })
await writeFile(OUTPUT_FILE, nextContents, 'utf8')
