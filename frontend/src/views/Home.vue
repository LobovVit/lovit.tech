<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 w-full max-w-4xl">
      <Tile title="Реклама" to="/advertising" />
      <Tile title="Аудит рекламных кампаний" to="/advertising" />
      <Tile title="Сайты" to="/sites" />
      <Tile title="Мобильные приложения" to="/mobileapp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Tile from "../components/Tile.vue";
</script>