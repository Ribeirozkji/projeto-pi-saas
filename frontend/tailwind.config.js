export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554'
        }
      },
      boxShadow: {
        soft: '0 10px 35px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
