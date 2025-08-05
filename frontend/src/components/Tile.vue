<template>
  <router-link
      :to="to"
      class="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center text-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
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