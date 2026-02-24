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
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  let contenidoTicket = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: monospace;
            font-size: 13px; /* ⬆️ tamaño más grande */
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          h2 {
            text-align: center;
            margin: 6px 0;
            font-size: 16px; /* ⬆️ más grande */
          }
          .linea {
            border-top: 1px dashed black;
            margin: 6px 0;
          }
          .grupo {
            margin-top: 5px;
            margin-bottom: 5px;
          }
          .titulo-grupo {
            font-weight: bold;
            font-size: 15px; /* ⬆️ más grande */
            text-transform: uppercase;
          }
          .plato {
            font-weight: bold;
            font-size: 14px;
            margin-left: 10px;
          }
          .obs {
            margin-left: 20px;
            font-size: 12px;
          }
          p {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <h2>🧾 NUEVO PEDIDO</h2>
        <div class="linea"></div>
  `;

  // 🔹 Agrupar platos por nombre y tamaño
  const grupos = {};
  pedido.platos.forEach((p) => {
    const key = (p.nombre || "Plato") + "|" + (p.size || "");
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  });

  // 🔹 Procesar cada grupo
  Object.entries(grupos).forEach(([key, lista]) => {
    const [nombreBase, size] = key.split("|");
    const cantidad = lista.length;

    contenidoTicket += `<div class="grupo"><div class="titulo-grupo">${nombreBase}${size ? " - " + size : ""} x${cantidad}</div>`;

    lista.forEach((p) => {
      const obs = p.observaciones || {};
      const partes = [];

      // Radios
      if (Array.isArray(obs.radios) && obs.radios.length > 0) {
        obs.radios.forEach((r) => partes.push(r));
      }

      // Modos
      if (obs.modos && Object.keys(obs.modos).length > 0) {
        Object.entries(obs.modos).forEach(([ingrediente, simbolo]) => {
          if (simbolo === "+" || simbolo === "-") {
            partes.push(`${simbolo} ${ingrediente}`);
          } else if (simbolo.toLowerCase() === "no") {
            partes.push(`No ${ingrediente}`);
          } else {
            partes.push(`${ingrediente}: ${simbolo}`);
          }
        });
      }

      // Texto libre
      if (obs.texto && obs.texto.trim() !== "") {
        partes.push(obs.texto.trim());
      }

      // Si no hay observaciones
      if (partes.length === 0) {
        partes.push("Normal");
      }

      // Mostrar cada plato con sus observaciones
      contenidoTicket += `
        <div class="plato">${nombreBase}${size ? " - " + size : ""}</div>
        ${partes.map((t) => `<div class="obs">${t}</div>`).join("")}
      `;
    });

    contenidoTicket += `</div><div class="linea"></div>`;
  });

  contenidoTicket += `
      </body>
    </html>
  `;

  iframe.contentDocument.write(contenidoTicket);
  iframe.contentDocument.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
    console.log("✅ Pedido impreso:", pedido.id);
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