<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const id = route.params.id

function volver() {
  router.push('/historial-bolivar')
}

</script>
<template>
  <div class="detalle-wrapper">

    <div class="factura">

      <!-- BOTÓN VOLVER -->
      <button class="btn-volver" @click="volver">
        ← Volver al historial
      </button>

      <h1 class="factura-titulo">Detalle del Pedido {{ id }}</h1>

      <div class="factura-info">
        <p><strong>Hora:</strong> 3:45 p. m.</p>
        <p><strong>Nombre:</strong> Juan Pérez</p>
        <p><strong>Celular:</strong> 300 123 4567</p>
        <p><strong>Dirección:</strong> Calle 15 # 8-32</p>
      </div>

      <div class="factura-platos">
        <h3>Platos</h3>
        <ul>
          <li>Hamburguesa x2</li>
          <li>Papas x1</li>
          <li>Gaseosa x1</li>
        </ul>
      </div>

    </div>

  </div>
</template>

