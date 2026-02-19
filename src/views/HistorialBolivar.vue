<template>
  <div class="historial-wrapper">

    <div class="pedidos-grid">

      <div
        v-for="pedido in pedidos"
        :key="pedido.id"
        class="pedido-card clickable"
        @click="irADetalle(pedido.id)"
      >
        <div class="pedido-card-header">
          <span class="pedido-direccion">
            {{ pedido.direccion }}
          </span>
        </div>

        <div class="pedido-card-body">
          <div class="pedido-meta">
            <span class="pedido-hora">🕐 {{ pedido.hora }}</span>
            <span class="pedido-elapsed">ver detalle</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>


//!Simulacion de data
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const pedidos = [
  { id: 1, direccion: 'Calle 15 # 8-32', hora: '3:45 p. m.' },
  { id: 2, direccion: 'Carrera 10 # 22-15', hora: '2:30 p. m.' },
  { id: 3, direccion: 'Av. Quebrada Seca # 5-40', hora: '1:10 p. m.' }
]

function irADetalle(id) {
  router.push(`/pedido/${id}`)
}
</script>

