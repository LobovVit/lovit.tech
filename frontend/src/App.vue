<template>
  <div :class="{ dark: isDark }">
    <div class="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <div class="p-4 flex justify-end">
        <button
            @click="toggleTheme"
            class="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
        >
          {{ isDark ? '🌙 Dark' : '☀️ Light' }}
        </button>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('theme')
  isDark.value = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
})

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>