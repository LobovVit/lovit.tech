<template>
  <router-link
      :to="to"
      class="block p-8 text-2xl font-semibold text-center rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700
           bg-white dark:bg-gray-800 hover:-translate-y-1 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700
           transition-all duration-300"
  >
    {{ title }}
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  to: string;
}>();
</script>