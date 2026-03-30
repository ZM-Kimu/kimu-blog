<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'

	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string) => translate(messages, key)
</script>

<section class="profile-screen">
	<section class="panel dossier-hero">
		<div class="dossier-hero-top">
			<p class="eyebrow">{t('about.heroEyebrow')}</p>
			<a class="button-secondary dossier-hero-back" href={resolve('/')}>{t('about.backHome')}</a>
		</div>

		<div class="dossier-hero-header">
			<div>
				<h1>{t('about.title')}</h1>
				<p class="post-description">{t('about.description')}</p>
			</div>
		</div>
	</section>

	<div class="profile-grid">
		<section class="panel dossier-side-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">{t('about.systemsEyebrow')}</p>
					<h2>{t('about.systemsTitle')}</h2>
				</div>
			</div>
			<ul class="system-list">
				<li>{t('about.items.cloudflarePages')}</li>
				<li>{t('about.items.mdsvex')}</li>
				<li>{t('about.items.schemaValidation')}</li>
				<li>{t('about.items.entries')}</li>
				<li>{t('about.items.gameUi')}</li>
			</ul>
		</section>

		<section class="panel dossier-side-panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">{t('about.nextEyebrow')}</p>
					<h2>{t('about.nextTitle')}</h2>
				</div>
			</div>
			<ul class="system-list">
				<li>{t('about.items.replacePlaceholders')}</li>
				<li>{t('about.items.profileData')}</li>
				<li>{t('about.items.realContent')}</li>
				<li>{t('about.items.searchCommentsAnalytics')}</li>
			</ul>
		</section>
	</div>
</section>
