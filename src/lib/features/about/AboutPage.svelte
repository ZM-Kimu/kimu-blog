<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'

	const displayGithubAccount = 'ZM-Kimu'
	const githubUrl = `https://github.com/${displayGithubAccount}`
	const contactEmail = 'kimu@zmkimu.com'
	const maimaiRatingImageUrl = 'https://dxrating.luoling.moe/api/genImage/zmkimu'
	const githubIconPath =
		'M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.86 8.36 6.84 9.72.5.1.68-.22.68-.5v-1.9c-2.78.62-3.36-1.22-3.36-1.22-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.06-.62.06-.62 1.02.08 1.56 1.08 1.56 1.08.9 1.58 2.38 1.12 2.96.86.08-.66.34-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.04 0-1.12.38-2.02 1.04-2.74-.1-.26-.46-1.3.1-2.7 0 0 .86-.28 2.76 1.04A9.38 9.38 0 0 1 12 6.98c.84 0 1.7.12 2.5.34 1.9-1.32 2.74-1.04 2.74-1.04.56 1.4.22 2.44.1 2.7.66.72 1.04 1.62 1.04 2.74 0 3.92-2.34 4.78-4.58 5.04.36.32.68.94.68 1.9v2.8c0 .28.18.6.68.5A10.1 10.1 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z'
	const emailIconPath =
		'M3.75 5.25h16.5c.96 0 1.75.79 1.75 1.75v10c0 .96-.79 1.75-1.75 1.75H3.75C2.79 18.75 2 17.96 2 17V7c0-.96.79-1.75 1.75-1.75Zm.25 2.41v9.09h16V7.66l-7.02 5.45a1.57 1.57 0 0 1-1.96 0L4 7.66Zm1.4-.41L12 12.38l6.6-5.13H5.4Z'
	const techStackItems = [
		'Python',
		'FastAPI',
		'AI Agents',
		'React',
		'TypeScript',
		'GLSL',
		'Flutter',
		'Unity',
		'C#',
		'ESP Hardware',
		'Decompilation'
	] as const

	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string>) => translate(messages, key, params)
</script>

<section class="profile-screen about-profile-screen" aria-label={t('about.title')}>
	<div class="about-profile-grid">
		<section class="about-profile-card-shell about-personal-card-shell">
			<div class="about-profile-card about-personal-card">
				<div class="panel-heading about-card-heading">
					<div class="about-heading-row">
						<h2>{t('about.personalTitle')}</h2>
						<span class="about-heading-username">{displayGithubAccount}</span>
					</div>
				</div>

				<section class="about-tech-stack" aria-label={t('about.techStackTitle')}>
					<h3>{t('about.techStackTitle')}</h3>
					<div class="about-tech-stack-list">
						{#each techStackItems as item (item)}
							<span>{item}</span>
						{/each}
					</div>
				</section>
			</div>
		</section>

		<section class="about-profile-card-shell about-entertainment-card-shell">
			<div class="about-profile-card about-entertainment-card">
				<div class="panel-heading about-card-heading">
					<div>
						<h2>{t('about.entertainmentTitle')}</h2>
					</div>
				</div>

				<figure class="about-rating-frame">
					<img
						src={maimaiRatingImageUrl}
						alt={t('about.maimaiImageAlt')}
						loading="lazy"
						decoding="async"
						draggable="false"
					/>
				</figure>
			</div>
		</section>
	</div>

	<footer class="about-profile-footer">
		<a
			class="about-footer-email-link"
			href="mailto:{contactEmail}"
			aria-label={t('about.emailAriaLabel', { email: contactEmail })}
		>
			<span class="about-footer-link-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" focusable="false">
					<path d={emailIconPath} />
				</svg>
			</span>
			<span class="about-footer-link-copy" aria-hidden="true">
				<span>{t('about.mailFooterLabel')}</span>
				<strong>{contactEmail}</strong>
			</span>
		</a>
		<a
			class="about-footer-github-link"
			href={githubUrl}
			target="_blank"
			rel="noreferrer"
			aria-label={t('about.githubAriaLabel', { account: displayGithubAccount })}
		>
			<span class="about-footer-link-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" focusable="false">
					<path d={githubIconPath} />
				</svg>
			</span>
			<span class="about-footer-link-copy" aria-hidden="true">
				<span>{t('about.githubFooterLabel')}</span>
				<strong>{displayGithubAccount}</strong>
			</span>
		</a>
	</footer>
</section>
