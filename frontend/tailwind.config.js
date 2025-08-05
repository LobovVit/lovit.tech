/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // 💡 добавили поддержку тёмной темы
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}