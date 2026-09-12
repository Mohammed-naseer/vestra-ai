/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vesta: {
          bg: "#0B0C10",
          card: "#12131A",
          cardHover: "#181A24",
          surface: "#1A1C26",
          border: "#262838",
          borderGlow: "#3D415A",
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
          goldMuted: "#AA8C2C",
          accent: "#C5A880",
          cream: "#F9F6F0",
          muted: "#9496A8",
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(212, 175, 55, 0.08)',
        'luxury-glow': '0 0 30px -5px rgba(212, 175, 55, 0.30), 0 0 12px rgba(212, 175, 55, 0.18), 0 4px 20px -4px rgba(0,0,0,0.8)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-hover': '0 20px 40px -12px rgba(0,0,0,0.9), 0 0 25px -8px rgba(212, 175, 55, 0.2)',
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(135deg, #FFF8D6 0%, #E8C84A 30%, #D4AF37 60%, #B89028 100%)',
        'radial-gold': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26, 28, 40, 0.75) 0%, rgba(14, 15, 20, 0.90) 100%)',
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'marquee': 'marquee 24s linear infinite',
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.12)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px -4px rgba(212, 175, 55, 0.35)' },
          '50%': { boxShadow: '0 0 22px -4px rgba(212, 175, 55, 0.65), 0 0 40px -8px rgba(212, 175, 55, 0.2)' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(18px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.94)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      scale: {
        '130': '1.30',
      },
    },
  },
  plugins: [],
}
