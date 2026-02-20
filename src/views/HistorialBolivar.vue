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
            {{ pedido.cliente?.direccion }}
          </span>
        </div>

        <div class="pedido-card-body">
          <div class="pedido-meta">
            <span class="pedido-hora">
              🕐 {{ formatHora(pedido.fecha) }}
            </span>
            <span class="pedido-elapsed">
              ver detalle
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { HistorialBolivar } from "../assets/js/Historial_Bolivar.js"

const router = useRouter()
const { pedidos } = HistorialBolivar()

function irADetalle(id) {
  router.push(`/pedido/${id}`)
}

const formatHora = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  })
}
</script>