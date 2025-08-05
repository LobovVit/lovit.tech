<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center p-6">
    <h1 class="text-3xl font-bold mb-10 text-center">Что вас интересует?</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <TileNav title="Реклама" to="/advertising" />
      <TileNav title="Аудит рекламных кампаний" to="/advertising" />
      <TileNav title="Сайты" to="/sites" />
      <TileNav title="Мобильные приложения" to="/mobileapp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TileNav from '../components/TileNav.vue'
</script>