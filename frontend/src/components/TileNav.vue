<template>
  <router-link
      :to="to"
      class="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition transform hover:-translate-y-1 hover:scale-105 rounded-2xl p-6 shadow text-center font-semibold text-xl"
  >
    {{ title }}
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  to: string
}>()
</script>