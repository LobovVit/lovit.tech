/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // ✅ включаем переключение по классу .dark
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}