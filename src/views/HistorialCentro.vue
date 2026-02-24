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
import { useRouter } from "vue-router"
import { usePedidos } from "../assets/js/Historial.js"


const router = useRouter()
const { pedidos, onNuevoPedido } = usePedidos()


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
   IMPRESIÓN NATIVA (REEMPLAZA QZ)
============================ */

function imprimirPedido(pedido) {
  // Crear iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Contenido HTML del ticket
  let contenidoTicket = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page {
            size: 80mm auto;    /* ancho de papel térmico */
            margin: 0;          /* sin márgenes */
          }

          body {
            font-family: monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0;
            padding: 0;
          }

          h2 {
            text-align: center;
            margin: 5px 0;
            font-size: 14px;
          }

          .linea {
            border-top: 1px dashed black;
            margin: 6px 0;
          }

          .plato {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 2px;
          }

          .obs {
            margin-left: 10px;
            font-size: 11px;
            color: #333;
          }

          p {
            margin: 0;
            padding: 0;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <h2>🧾 NUEVO PEDIDO</h2>
        <div class="linea"></div>
  `;

  pedido.platos.forEach(p => {
    contenidoTicket += `
      <div class="plato">${p.nombre} ${p.size ? '- ' + p.size : ''}</div>
    `;
    if (p.observaciones?.length) {
      p.observaciones.forEach(obs => {
        contenidoTicket += `<div class="obs">${obs.modo}: ${obs.item}</div>`;
      });
    }
    contenidoTicket += `<br>`;
  });

  contenidoTicket += `
        <div class="linea"></div>
        <p style="text-align:center;">--- FIN ---</p>
      </body>
    </html>
  `;

  // Escribir contenido e imprimir
  iframe.contentDocument.write(contenidoTicket);
  iframe.contentDocument.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Quitar el iframe después de imprimir
    setTimeout(() => document.body.removeChild(iframe), 1000);
    console.log("✅ Pedido enviado a impresora:", pedido.id);
  }, 300);
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