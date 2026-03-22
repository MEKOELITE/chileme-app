/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    darkMode: 'media',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#667eea',
                    dark: '#5a67d8',
                    light: '#a78bfa',
                },
                surface: {
                    primary: '#fafafa',
                    secondary: '#ffffff',
                    tertiary: '#f4f4f5',
                    card: '#ffffff',
                    'dark-primary': '#09090b',
                    'dark-secondary': '#18181b',
                    'dark-tertiary': '#27272a',
                    'dark-card': '#1c1c1e',
                },
                text: {
                    primary: '#18181b',
                    secondary: '#71717a',
                    tertiary: '#a1a1aa',
                    inverse: '#ffffff',
                    'dark-primary': '#fafafa',
                    'dark-secondary': '#a1a1aa',
                    'dark-tertiary': '#71717a',
                },
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"SF Pro Display"',
                    '"SF Pro Text"',
                    '"Helvetica Neue"',
                    '"PingFang SC"',
                    '"Microsoft YaHei"',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica"',
                    'Arial',
                    'sans-serif',
                ],
            },
            borderRadius: {
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
                'full': '9999px',
            },
            boxShadow: {
                'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 8px 32px rgba(102, 126, 234, 0.3)',
                'glow': '0 8px 32px rgba(102, 126, 234, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 250ms ease forwards',
                'slide-up': 'slideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'bounce-sm': 'bounceSm 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'float': 'float 3s ease-in-out infinite',
                'pop': 'pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                bounceSm: {
                    '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
                    '50%': { transform: 'scale(1.2) rotate(5deg)' },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                pop: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
