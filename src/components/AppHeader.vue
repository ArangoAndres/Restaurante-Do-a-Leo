<template>
  <header>
    <div class="hamburger" @click="toggleMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <nav class="nav-menu" :class="{ open: menuOpen }">
      <RouterLink to="/historial-bolivar" @click="menuOpen = false">
        Historial R. Bolívar
      </RouterLink>

      <RouterLink to="/" @click="menuOpen = false">
        Pedidos Central
      </RouterLink>

      <RouterLink to="/historial-centro" @click="menuOpen = false">
        Historial R. Centro
      </RouterLink>

      <RouterLink to="/pedidos-centro" @click="menuOpen = false">
        Pedidos Centro
      </RouterLink>
    </nav>

    <h1>{{ pageTitle }}</h1>

    <div class="logo">
      <img src="/icon_doñaleo.png" class="logo_img" />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const menuOpen = ref(false)
const route = useRoute()

const pageTitle = computed(() => {
  switch (route.path) {
    case '/':
      return 'Pedidos Central'
    case '/pedidos-centro':
      return 'Pedidos Centro'
    case '/historial-bolivar':
      return 'Historial Bolívar'
    case '/historial-centro':
      return 'Historial Centro'
    default:
      return 'Restaurante Doña Leo'
  }
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function handleClickOutside(e) {
  const menu = document.querySelector('.nav-menu')
  const hamburger = document.querySelector('.hamburger')

  if (
    menu &&
    hamburger &&
    !menu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
