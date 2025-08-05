<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
    <Tile title="Реклама" to="/advertising" />
    <Tile title="Аудит рекламных кампаний" to="/audit" />
    <Tile title="Сайты" to="/sites" />
    <Tile title="Мобильные приложения" to="/mobileapp" />
  </div>
</template>

<script setup lang="ts">
import Tile from '@/components/Tile.vue'
</script>