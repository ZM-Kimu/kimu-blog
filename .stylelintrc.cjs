module.exports = {
	extends: ['stylelint-config-standard'],
	overrides: [
		{
			files: ['**/*.svelte'],
			customSyntax: 'postcss-html'
		}
	],
	rules: {
		'selector-class-pattern': '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'
	}
}
