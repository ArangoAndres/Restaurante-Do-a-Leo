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
   IMPRESIÓN NATIVA (REEMPLAZA QZ)
============================ */
function imprimirPedido(pedido) {
  if (!pedido) return;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  let contenidoTicket = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
           
            font-size: 16px;
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          h2 {
            text-align: center;
            margin: 6px 0;
            font-size: 16px;
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
            font-size: 15px;
            text-transform: uppercase;
            display: flex;
          }
          .plato {
            font-weight: bold;
            font-size: 14px;
            margin-left: 2px;
            display: flex;
          }
            .plato .Price1 {
              margin-left: 17px;
            }

          .obs {
            margin-left: 20px;
            font-size: 13px;
          }
          .info-cliente {
            font-size: 14px;
            margin-bottom: 4px;
          }
          .total-final {
            font-weight: bold;
            font-size: 15px;
            text-align: left;
            margin-top: 10px;
            border-top: 1px dashed black;
            padding-top: 5px;
          }
        </style>
      </head>
      <body>
        <h2>🧾 PEDIDO #${pedido.id || "—"}</h2>

        <div class="linea"></div>

        <div class="info-cliente">
          <p><strong>Dirección:</strong> ${pedido.cliente?.direccion || "—"}</p>
          <p><strong>Cliente:</strong> ${pedido.cliente?.nombre || "Sin nombre"}</p>
          <p><strong>Tel:</strong> ${pedido.cliente?.telefono || "—"}</p>
        </div>

        <div class="linea"></div>
  `;

  // Agrupar platos por nombre + tamaño
  const grupos = {};
  pedido.platos.forEach((p) => {
    const key = (p.nombre || "Plato") + "|" + (p.size || "");
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  });

  let totalPedido = 0;

  Object.entries(grupos).forEach(([key, lista]) => {
    const [nombreBase, size] = key.split("|");
    const cantidad = lista.length;
    const precioUnitario = lista[0].precio || 0;
    const subtotalGrupo = cantidad * precioUnitario;
    totalPedido += subtotalGrupo;

    if (cantidad > 1) {
      // Grupo con varios platos
      contenidoTicket += `
        <div class="grupo">
          <div class="titulo-grupo">
            <span>${nombreBase}${size ? " - " + size : ""} x${cantidad}</span>
            <span class ="Price1">$${subtotalGrupo.toLocaleString("es-CO")}</span>
          </div>
      `;

      lista.forEach((p) => {
        const obs = p.observaciones || {};
        const partes = [];

        if (Array.isArray(obs.radios) && obs.radios.length > 0)
          obs.radios.forEach((r) => partes.push(r));

        if (obs.modos && Object.keys(obs.modos).length > 0)
          Object.entries(obs.modos).forEach(([ing, sim]) => {
            if (sim === "+") partes.push(`+ ${ing}`);
            else if (sim.toLowerCase() === "no") partes.push(`No ${ing}`);
            else partes.push(`${ing}: ${sim}`);
          });

        if (obs.selectores && Object.keys(obs.selectores).length > 0)
          Object.entries(obs.selectores).forEach(([k, v]) => {
            if (Array.isArray(v)) v.forEach((val) => partes.push(`${k}: ${val}`));
            else partes.push(`${k}: ${v}`);
          });

        if (obs.texto && obs.texto.trim() !== "")
          partes.push(obs.texto.trim());

        if (partes.length === 0) partes.push("Normal");

        contenidoTicket += `
          <div class="plato">
            <span>${nombreBase}${size ? " - " + size : ""}</span>
            <span>$${precioUnitario.toLocaleString("es-CO")}</span>
          </div>
          ${partes.map((t) => `<div class="obs">${t}</div>`).join("")}
        `;
      });

      contenidoTicket += `</div><div class="linea"></div>`;
    } else {
      // Plato único
      const p = lista[0];
      const obs = p.observaciones || {};
      const partes = [];

      if (Array.isArray(obs.radios) && obs.radios.length > 0)
        obs.radios.forEach((r) => partes.push(r));

      if (obs.modos && Object.keys(obs.modos).length > 0)
        Object.entries(obs.modos).forEach(([ing, sim]) => {
          if (sim === "+") partes.push(`+ ${ing}`);
          else if (sim.toLowerCase() === "no") partes.push(`No ${ing}`);
          else partes.push(`${ing}: ${sim}`);
        });

      if (obs.selectores && Object.keys(obs.selectores).length > 0)
        Object.entries(obs.selectores).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((val) => partes.push(`${k}: ${val}`));
          else partes.push(`${k}: ${v}`);
        });

      if (obs.texto && obs.texto.trim() !== "")
        partes.push(obs.texto.trim());

      if (partes.length === 0) partes.push("Normal");

      contenidoTicket += `
        <div class="plato">
          <span>${p.nombre}${p.size ? " - " + p.size : ""}</span>
          <span class ="Price1">$${precioUnitario.toLocaleString("es-CO")}</span>
        </div>
        ${partes.map((t) => `<div class="obs">${t}</div>`).join("")}
        <div class="linea"></div>
      `;
    }
  });

  contenidoTicket += `
        <div class="total-final">TOTAL: $${totalPedido.toLocaleString("es-CO")}</div>
      </body>
    </html>
  `;

  iframe.contentDocument.write(contenidoTicket);
  iframe.contentDocument.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
    console.log("🖨️ Pedido impreso:", pedido.id);
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