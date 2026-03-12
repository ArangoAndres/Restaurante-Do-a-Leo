<template>
  <div class="historial-wrapper">
    <!-- Botón de resumen -->
    <div style="text-align:right; margin-bottom:10px;">
      <button @click="mostrarResumen">📋 Ver resumen del día</button>
    </div>

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

          <!-- FILA 1: Cliente + Pago -->
          <div class="pedido-top">
            <div class="pedido-left">
              <div class="cliente-nombre">
                {{ pedido.cliente?.nombre }}
                <span class="cliente-telefono">Cel: {{ pedido.cliente?.telefono }}</span>
              </div>
              <div class="pago-info">
                {{ pedido.formaPago }}
                <template v-if="pedido.formaPago !== 'Efectivo'">
                  • <span class="estado-pendiente">{{ pedido.estado }}</span>
                </template>
              </div>
            </div>
          </div>

          <!-- FILA 2: Hora + Tiempo transcurrido + Ver detalle -->
          <div class="pedido-bottom">
            <div class="pedido-tiempo">
              <span class="pedido-hora">🕐 {{ formatHora(pedido.fecha) }}</span>
              <span class="pedido-hace">{{ tiempoTranscurrido(pedido.fecha) }}</span>
            </div>
            <button class="btn-detalle" @click.stop="irADetalle(pedido.id)">
              ver detalle
            </button>
          </div>
          
        </div>
      </div>
    </div>

    <!-- POPUP RESUMEN -->
   <!-- POPUP DE RESUMEN -->
<!-- POPUP RESUMEN DEL DÍA -->
<div v-if="popupResumenDia" class="popup-overlay" @click.self="popupResumenDia = false">
  <div class="popup popup-resumen-dia">
    <!-- ENCABEZADO -->
    <div class="popup-header">
      <h3>📋 Resumen del Día</h3>
      <span class="popup-plato">Ventas agrupadas por plato</span>
    </div>

    <!-- CUERPO -->
    <div class="popup-body">
      <div v-if="resumen.length === 0" style="text-align:center; font-weight:600;">
        No hay ventas registradas hoy.
      </div>

      <div v-else>
        <div
          v-for="r in resumen"
          :key="r.nombre + r.size"
          class="popup-resumen-item"
        >
          <span>
            <strong>{{ r.nombre }}</strong>
            <span v-if="r.size"> - {{ r.size }}</span>
            × {{ r.cantidad }}
          </span>
          <span>$ {{ r.total.toLocaleString('es-CO') }}</span>
        </div>

        <div class="popup-resumen-total">
          <strong>Total del día:</strong>
          <span>$ {{ totalDia.toLocaleString('es-CO') }}</span>
        </div>
      </div>
    </div>

    <!-- PIE -->
    <div class="popup-footer">
      <button class="btn-cerrar" @click="popupResumenDia = false">Cerrar</button>
    </div>
  </div>
</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { HistorialBolivar } from "../assets/js/Historial_Bolivar.js"
import { obtenerResumenDelDia } from "../assets/js/ResumenDiario.js"
import bellsound from "../components/icons/bell_Cortado.mp3"

const router = useRouter()
const { pedidos, onNuevoPedido } = HistorialBolivar()

/* ============================
   SONIDO
============================ */
const sonidoImprimir = new Audio(bellsound)
sonidoImprimir.loop = false
sonidoImprimir.volume = 1

/* ============================
   NAVEGACIÓN
============================ */
function irADetalle(id) {
  router.push(`/pedido/${id}`)
}

/* ============================
   FORMATEOS
============================ */
const formatHora = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
}

const tiempoTranscurrido = (fecha) => {
  const diff = Date.now() - new Date(fecha).getTime()
  const minutos = Math.floor(diff / 60000)

  if (minutos < 1) return "hace segundos"
  if (minutos < 60) return `hace ${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return `hace ${horas} h ${resto > 0 ? resto + " min" : ""}`
}

/* ============================
   IMPRESIÓN NATIVA
============================ */
function imprimirPedido(pedido) {
  if (!pedido) return

  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  document.body.appendChild(iframe)

  let contenidoTicket = `
  <html>
  <head>
  <meta charset="UTF-8"/>
  <style>
  @page { size: 80mm auto; margin: 0; }
  body { font-size:18px; width:70mm; margin:0; padding:0; }
  h2 { text-align:center; font-size:17px; text-transform:uppercase; }
  .encabezado { text-align:center; font-size:16px; text-transform:uppercase; margin-bottom:4px; }
  .encabezado .nombre-restaurante { font-weight:bold; font-size:20px; }
  .linea { border-top:1px dashed black; }
  .grupo { margin-top:5px; margin-bottom:5px; }
  .titulo-grupo { font-weight:bold; font-size:15px; text-transform:uppercase; display:flex; }
  .plato { font-weight:bold; font-size:14px; margin-left:2px; display:flex; text-transform:uppercase; }
  .plato .Price1 { margin-left:17px; }
  .obs { font-size:12px; text-transform:uppercase; }
  .info-cliente { font-size:14px; text-transform:uppercase; margin-bottom:4px; }
  .total-final { font-weight:bold; font-size:15px; margin-top:10px; border-top:1px dashed black; padding-top:5px; }
  </style>
  </head>
  <body>

  <br><br><br>

  <div class="encabezado">
  <div class="nombre-restaurante">RESTAURANTE DOÑA LEO</div>
  <div>NIT: 1098687925-3</div>
  <div>Tel: 3214895544</div>
  <div>Direccion: Calle 41 # 14-17</div>
  </div>

  <div class="linea"></div>

  <h2>🧾 PEDIDO #${pedido.id || "-"}</h2>

  <div class="linea"></div>

  <div class="info-cliente">
  <p><strong>Hora:</strong> ${formatHora(pedido.fecha)}</p>
  <p><strong>Barrio:</strong> ${pedido.cliente?.barrio || "-"}</p>
  <p><strong>Dirección:</strong> ${pedido.cliente?.direccion || "-"}</p>
  <p><strong>Cliente:</strong> ${pedido.cliente?.nombre || "-"}</p>
  <p><strong>Tel:</strong> ${pedido.cliente?.telefono || "-"}</p>
  </div>

  <div class="linea"></div>
  `

  let totalPedido = 0

  pedido.platos.forEach((p) => {
    totalPedido += Number(p.precio || 0)

    contenidoTicket += `
    <div class="plato">
    <span>${p.nombre}${p.size ? " - " + p.size : ""}</span>
    <span class="Price1">$${Number(p.precio).toLocaleString("es-CO")}</span>
    </div>
    `
  })

  contenidoTicket += `
  <div class="linea"></div>

  <div class="total-final">
  TOTAL: $${totalPedido.toLocaleString("es-CO")}
  </div>

  <p>Método de Pago: ${pedido.formaPago}</p>
  <p>Estado del Pago: ${pedido.estado}</p>

  <p><strong>¡GRACIAS POR SU COMPRA!</strong></p>

  </body>
  </html>
  `

  iframe.contentDocument.write(contenidoTicket)
  iframe.contentDocument.close()

  setTimeout(() => {

    iframe.contentWindow.focus()

    /* 🔔 SONIDO */
    sonidoImprimir.currentTime = 0
    sonidoImprimir.play().catch(() => {})

    /* 🖨 IMPRIMIR */
    iframe.contentWindow.print()

    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)

  }, 300)
}

/* ============================
   AUTO-IMPRIMIR NUEVOS PEDIDOS
============================ */
onMounted(() => {

  /* desbloquear audio del navegador */
  document.addEventListener("click", () => {

    sonidoImprimir.play()
    sonidoImprimir.pause()
    sonidoImprimir.currentTime = 0

  }, { once: true })

  if (onNuevoPedido) {
    onNuevoPedido.value = (pedido) => {
      imprimirPedido(pedido)
    }
  }

})

/* ============================
   RESUMEN DEL DÍA
============================ */
const resumen = ref([])
const totalDia = ref(0)
const popupResumenDia = ref(false)

async function mostrarResumen() {

  const { lista, totalGeneral } = await obtenerResumenDelDia()

  resumen.value = lista
  totalDia.value = totalGeneral
  popupResumenDia.value = true
}
</script>