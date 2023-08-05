/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			eesti: ['var(--font-eesti)'],
			dm: ['var(--font-dmSans)']
		},
		colors: {
			brand: {
				pink: 'var(--brand-pink)',
				cyan: 'var(--brand-cyan)',
				gray: 'var(--brand-gray)'
			},
			white: 'var(--white)',
			black: 'var(--black)',
			accent: 'var(--accent)',
			'badge-flag': 'var(--badge-flag)',
			primary: {
				purple: 'var(--primary-purple)',
				hover: 'var(--primary-hover)',
				light: 'var(--primary-light)'
			},
			neutral: {
				1: 'var(--neutral-1)',
				2: 'var(--neutral-2)',
				3: 'var(--neutral-3)',
				4: 'var(--neutral-4)'
			},
			alert: {
				success: 'var(--alert-success)',
				error: 'var(--alert-error)',
				warning: 'var(--alert-warning)'
			},
			'form-color': 'var(--form-color)',
			input: {
				text: 'var(--input-text)',
				'text-error': 'var(--input-text-error)',
				bg: 'var(--input-bg)',
				'bg-error': 'var(--input-bg-error)',
				outline: 'var(--input-outline)',
				'outline-error': 'var(--input-outline-error)',
				placeholder: 'var(--input-placeholder)'
			}
		},
		backgroundImage: {
			'gd-main': 'var(--gd-main)',
			'gd-linear': 'var(--gd-linear)',
			'gd-icon': 'var(--gd-icon)',
			'gd-mavie': 'var(--gd-mavie)',
			'gd-navbar': 'var(--gd-navbar)',
			'gd-glassmorphism': 'var(--gd-glassmorphism)',
			'gd-page': 'var(--gd-page)',
			'gd-preview':
				'linear-gradient(360deg, rgba(10, 10, 10, 0.33) 0%, rgba(10, 10, 10, 0.33) 100%)',
			'black-gradient-r': 'var(--black-gradient-r)',
			'black-gradient-l': 'var(--black-gradient-l)',
			'vertical-gradient': 'var(--vertical-gradient)'
		},
		boxShadow: {
			section: 'var(--shadow-section)',
			icon: 'var(--shadow-icon)',
			dot: 'var(--shadow-dot)',
			modal: 'var(--shadow-modal)',
			tooltip: 'var(--shadow-tooltip)'
		},
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px',
			'3xl': '1920px',
			'4xl': '2560px'
		}
	},
	plugins: [
		require('@tailwindcss/container-queries')
	]
}
