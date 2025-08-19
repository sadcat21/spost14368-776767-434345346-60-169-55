import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				social: {
					instagram: 'hsl(var(--social-instagram))',
					facebook: 'hsl(var(--social-facebook))',
					linkedin: 'hsl(var(--social-linkedin))',
					twitter: 'hsl(var(--social-twitter))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-social': 'var(--gradient-social)',
				'gradient-accent': 'var(--gradient-accent)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)'
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'dynamic-blue-frame': {
					'0%': { 
						background: 'linear-gradient(45deg, #3b82f6, #06b6d4, #3b82f6)',
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
					},
					'25%': { 
						background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6)',
						boxShadow: '0 0 30px rgba(6, 182, 212, 0.7)'
					},
					'50%': { 
						background: 'linear-gradient(225deg, #0ea5e9, #3b82f6, #06b6d4)',
						boxShadow: '0 0 25px rgba(14, 165, 233, 0.6)'
					},
					'75%': { 
						background: 'linear-gradient(315deg, #3b82f6, #06b6d4, #0ea5e9)',
						boxShadow: '0 0 35px rgba(59, 130, 246, 0.8)'
					},
					'100%': { 
						background: 'linear-gradient(45deg, #3b82f6, #06b6d4, #3b82f6)',
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
					}
				},
				'blue-glow': {
					'0%, 100%': { 
						opacity: '0.3',
						transform: 'scale(1)'
					},
					'50%': { 
						opacity: '0.8',
						transform: 'scale(1.02)'
					}
				},
				'ai-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 0 0 rgba(147, 51, 234, 0.7)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 0 10px rgba(147, 51, 234, 0)',
						transform: 'scale(1.02)'
					}
				},
				'smart-glow': {
					'0%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(0deg)'
					},
					'50%': { 
						backgroundPosition: '100% 50%',
						filter: 'hue-rotate(45deg)'
					},
					'100%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(0deg)'
					}
				},
				'neural-network': {
					'0%': { 
						opacity: '0.3',
						transform: 'rotate(0deg) scale(1)'
					},
					'33%': { 
						opacity: '0.7',
						transform: 'rotate(120deg) scale(1.1)'
					},
					'66%': { 
						opacity: '0.5',
						transform: 'rotate(240deg) scale(0.9)'
					},
					'100%': { 
						opacity: '0.3',
						transform: 'rotate(360deg) scale(1)'
					}
				},
				'smart-particle': {
					'0%': { 
						opacity: '0',
						transform: 'translate(0, 0) scale(0)'
					},
					'50%': { 
						opacity: '1',
						transform: 'translate(20px, -20px) scale(1)'
					},
					'100%': { 
						opacity: '0',
						transform: 'translate(40px, -40px) scale(0)'
					}
				},
				'automation-flow': {
					'0%': { 
						backgroundPosition: '0% 50%',
						transform: 'scale(1)'
					},
					'50%': { 
						backgroundPosition: '100% 50%',
						transform: 'scale(1.02)'
					},
					'100%': { 
						backgroundPosition: '0% 50%',
						transform: 'scale(1)'
					}
				},
				'step-complete': {
					'0%': { 
						transform: 'scale(1) rotate(0deg)',
						boxShadow: '0 0 0 rgba(34, 197, 94, 0.5)'
					},
					'50%': { 
						transform: 'scale(1.1) rotate(5deg)',
						boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)'
					},
					'100%': { 
						transform: 'scale(1) rotate(0deg)',
						boxShadow: '0 0 0 rgba(34, 197, 94, 0.5)'
					}
				},
				'step-error': {
					'0%, 100%': { 
						transform: 'translateX(0)',
						boxShadow: '0 0 0 rgba(239, 68, 68, 0.5)'
					},
					'25%': { 
						transform: 'translateX(-5px)',
						boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)'
					},
					'75%': { 
						transform: 'translateX(5px)',
						boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'dynamic-blue-frame': 'dynamic-blue-frame 4s ease-in-out infinite',
				'blue-glow': 'blue-glow 2s ease-in-out infinite',
				'ai-pulse': 'ai-pulse 2s ease-in-out infinite',
				'smart-glow': 'smart-glow 3s ease-in-out infinite',
				'neural-network': 'neural-network 6s ease-in-out infinite',
				'smart-particle': 'smart-particle 2s ease-out infinite',
				'automation-flow': 'automation-flow 4s ease-in-out infinite',
				'step-complete': 'step-complete 0.6s ease-out',
				'step-error': 'step-error 0.5s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
