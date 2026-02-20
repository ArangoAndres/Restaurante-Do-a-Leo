<template>
  <div class="historial-wrapper">
    <div class="pedidos-grid">

      <div
        v-for="pedido in pedidos"
        :key="pedido.id"
        class="pedido-card"
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
              {{ tiempoTranscurrido(pedido.fecha) }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { usePedidos } from "../assets/js/Historial.js"

const { pedidos } = usePedidos()

const formatHora = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

const tiempoTranscurrido = (fecha) => {
  const diff = Date.now() - new Date(fecha).getTime()
  const minutos = Math.floor(diff / 60000)

  if (minutos < 1) return "hace segundos"
  if (minutos < 60) return `hace ${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60

  return `hace ${horas} h ${resto} min`
}
</script>