/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        page: '#FAFAFA',
        card: '#FFFFFF',
        accent: '#BCEC30',
        text: '#000000',
        'text-muted': '#202020',
        chip: '#F7F7F7',
        'course-card': '#FFC700',
      },
      backgroundImage: {
        'dark-gradient':
          'linear-gradient(152deg, rgba(21, 23, 32, 1) 17%, rgba(30, 33, 46, 1) 100%)',
      },
      boxShadow: {
        card: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
      },
    },
  },
  plugins: [],
}
