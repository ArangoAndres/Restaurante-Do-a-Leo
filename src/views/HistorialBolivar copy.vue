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
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { HistorialBolivar } from "../assets/js/Historial_Bolivar.js"

const router = useRouter()
const { pedidos, onNuevoPedido } = HistorialBolivar()

function irADetalle(id) {
  router.push(`/pedido/${id}`)
}

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
  return `hace ${horas} h ${resto > 0 ? resto + ' min' : ''}`
}

/* ============================
   IMPRESIÓN NATIVA
============================ */
function imprimirPedido(pedido) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:80mm;height:1px;border:none;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow.document

  let itemsHTML = ''
  pedido.platos.forEach(p => {
    itemsHTML += `<div class="plato">${p.nombre}${p.size ? ' - ' + p.size : ''}</div>`
    if (p.observaciones?.length) {
      p.observaciones.forEach(obs => {
        itemsHTML += `<div class="obs">${obs.modo}: ${obs.item}</div>`
      })
    }
  })

  // Datos extra del pedido para el ticket
  const ahora = new Date().toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  doc.open()
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <style>
      /* Ticket 80mm sin márgenes */
      @page {
        size: 80mm auto;
        margin: 0mm;
      }

      * { box-sizing: border-box; }

      html, body {
        width: 80mm;
        margin: 0;
        padding: 2mm;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        line-height: 1.3;
        color: #000;
      }

      .centro { text-align: center; }
      .negrita { font-weight: bold; }

      h2 {
        text-align: center;
        font-size: 14px;
        margin: 0 0 4px 0;
        letter-spacing: 1px;
      }

      .linea {
        border: none;
        border-top: 1px dashed #000;
        margin: 5px 0;
      }

      .meta {
        font-size: 10px;
        margin-bottom: 2px;
      }

      .plato {
        font-weight: bold;
        font-size: 12px;
        margin: 4px 0 2px 0;
      }

      .obs {
        margin-left: 8px;
        font-size: 10px;
        color: #333;
      }

      .fin {
        text-align: center;
        margin-top: 6px;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <h2>NUEVO PEDIDO</h2>
    <hr class="linea"/>
    <div class="meta"><b>Hora:</b> ${ahora}</div>
    <div class="meta"><b>Dirección:</b> ${pedido.direccion || '—'}</div>
    <div class="meta"><b>Pago:</b> ${pedido.metodoPago || '—'}</div>
    <hr class="linea"/>
    ${itemsHTML}
    <hr class="linea"/>
    <div class="fin">--- FIN ---</div>
  </body>
</html>`)
  doc.close()

  // Esperar a que el iframe cargue antes de imprimir
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 1000)
    }, 200)
  }

  // Fallback si onload no dispara (ya estaba cargado)
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 1000)
    }
  }, 500)
}

/* ============================
   AUTO-IMPRIMIR NUEVOS PEDIDOS
============================ */
onMounted(() => {
  if (onNuevoPedido) {
    onNuevoPedido.value = (pedido) => {
      imprimirPedido(pedido)
    }
  }
})
</script>