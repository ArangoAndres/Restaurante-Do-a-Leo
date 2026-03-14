<template>
  <AppHeader />
  <RouterView :key="$route.fullPath"/>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>