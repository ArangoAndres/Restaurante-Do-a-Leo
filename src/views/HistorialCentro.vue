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

          <!-- FILA 1: Cliente + Pago -->
          <div class="pedido-top">
            <div class="pedido-left">
              <div class="cliente-nombre">
                {{ pedido.cliente?.nombre }}
                <span class="cliente-telefono">
                  Cel: {{ pedido.cliente?.telefono }}
                </span>
              </div>
              <div class="pago-info">
                {{ pedido.formaPago }}
                <template v-if="pedido.formaPago !== 'Efectivo'">
                  • <span class="estado-pendiente">{{ pedido.estado }}</span>
                </template>
              </div>
            </div>
          </div>

          <!-- FILA 2: Hora + Tiempo transcurrido -->
          <div class="pedido-bottom">
            <div class="pedido-tiempo">
              <span class="pedido-hora">🕐 {{ formatHora(pedido.fecha) }}</span>
              <span class="pedido-hace">{{ tiempoTranscurrido(pedido.fecha) }}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { usePedidos } from "../assets/js/Historial.js"

const { pedidos, onNuevoPedido } = usePedidos()

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

  return `hace ${horas} h ${resto > 0 ? resto + ' min' : ''}`
}

/* ============================
   QZ TRAY - IMPRESIÓN
============================ */

async function conectarQZ() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect()
  }
}

function buildTicket(pedido) {
  const ESC = '\x1B'
  const GS = '\x1D'

  const LETRA_GRANDE = ESC + '!' + '\x30'
  const LETRA_NORMAL = ESC + '!' + '\x00'
  const CORTE = GS + 'V' + '\x41' + '\x00'

  let ticket = ""

  ticket += LETRA_GRANDE
  ticket += "NUEVO PEDIDO\n"
  ticket += "--------------------------------\n"

  ticket += LETRA_NORMAL
  ticket += `Cliente: ${pedido.cliente?.nombre || ""}\n`
  ticket += `Tel: ${pedido.cliente?.telefono || ""}\n`
  ticket += `Dir: ${pedido.cliente?.direccion || ""}\n`
  ticket += `Pago: ${pedido.formaPago}\n`
  if (pedido.formaPago !== "Efectivo") {
    ticket += `Estado: ${pedido.estado}\n`
  }

  ticket += "--------------------------------\n"

  pedido.platos?.forEach(p => {
    let linea = p.nombre
    if (p.size) linea += ` - ${p.size}`
    ticket += linea + "\n"

    if (p.observaciones?.length) {
      p.observaciones.forEach(obs => {
        ticket += `  ${obs.modo}: ${obs.item}\n`
      })
    }

    ticket += "\n"
  })

  ticket += "\n\n"
  ticket += CORTE

  return ticket
}

async function imprimirPedido(pedido) {
  try {
    await conectarQZ()
    const config = qz.configs.create("EPSON TM-T20II Receipt")
    const data = [{
      type: 'raw',
      format: 'plain',
      data: buildTicket(pedido)
    }]
    await qz.print(config, data)
    console.log("Pedido impreso:", pedido.id)
  } catch (err) {
    console.error("Error al imprimir:", err)
  }
}

/* 🔥 Cuando llega un pedido nuevo → imprimir automáticamente */
onMounted(() => {
  if (onNuevoPedido) {
    onNuevoPedido.value = (pedido) => {
      imprimirPedido(pedido)
    }
  }
})
</script>