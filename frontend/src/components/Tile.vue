<template>
  <Motion
      tag="div"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }"
      class="transform transition-all duration-300"
  >
    <router-link
        :to="to"
        class="block bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center text-xl font-semibold hover:-translate-y-1 hover:shadow-xl"
    >
      {{ title }}
    </router-link>
  </Motion>
</template>

<script setup lang="ts">
import { Motion } from 'vue-motion'

defineProps<{
  title: string
  to: string
}>()
</script>