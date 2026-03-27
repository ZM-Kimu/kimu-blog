<script lang="ts">
	import { siteConfig } from '$lib/config/site'
	import { translate, type LocaleMessages } from '$lib/i18n'

	let { messages }: { messages?: LocaleMessages } = $props()
	const t = (key: string) => (messages ? translate(messages, key) : key)
</script>

<footer class="site-footer">
	<div class="shell site-footer__inner">
		<div>
			<strong>{siteConfig.name}</strong>
			<small>{t('shell.footer.lead')}</small>
		</div>

		<small>{t('shell.footer.detail')}</small>
	</div>
</footer>
