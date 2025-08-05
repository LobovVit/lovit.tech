<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 class="text-4xl font-bold mb-12 text-center">Выберите направление</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
      <div v-for="tile in tiles" :key="tile.title" class="tile" @click="goTo(tile.path)">
        <h2 class="text-xl font-semibold">{{ tile.title }}</h2>
      </div>
    </div>
    <button
      @click="toggleTheme"
      class="mt-10 px-4 py-2 border rounded text-sm"
    >
      Переключить тему
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tiles = [
  { title: 'Реклама', path: '/advertising' },
  { title: 'Аудит рекламных компаний', path: '/audit' },
  { title: 'Сайты', path: '/sites' },
  { title: 'Мобильные приложения', path: '/mobileapp' }
]

const theme = ref<'light' | 'dark'>('light')

function applyTheme(t: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', t === 'dark')
  theme.value = t
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
})
</script>
