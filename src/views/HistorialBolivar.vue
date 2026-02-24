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
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  let contenidoTicket = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: monospace; font-size: 13px; width: 80mm; margin: 0; padding: 0; }
          h2 { text-align: center; margin: 6px 0; font-size: 16px; }
          .linea { border-top: 1px dashed black; margin: 6px 0; }
          .grupo { margin-top: 5px; margin-bottom: 5px; }
          .titulo-grupo { font-weight: bold; font-size: 15px; text-transform: uppercase; }
          .plato { font-weight: bold; font-size: 14px; margin-left: 10px; }
          .obs { margin-left: 20px; font-size: 12px; }
          p { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <h2>🧾 NUEVO PEDIDO</h2>
        <div class="linea"></div>
  `;

  // Agrupar platos por nombre + size, pero conservando el orden original en cada grupo
  const grupos = {};
  pedido.platos.forEach((p, index) => {
    const key = (p.nombre || "Plato") + "|" + (p.size || "");
    if (!grupos[key]) grupos[key] = [];
    // guardamos el plato y su índice para mantener orden si hace falta
    grupos[key].push({ item: p, index });
  });

  // Procesar cada grupo en el orden de aparición (ordenamos las keys por el primer index guardado)
  const entries = Object.entries(grupos).sort((a, b) => {
    const aIndex = a[1][0].index;
    const bIndex = b[1][0].index;
    return aIndex - bIndex;
  });

  entries.forEach(([key, lista]) => {
    const [nombreBase, size] = key.split("|");
    const cantidad = lista.length;

    if (cantidad > 1) {
      // sección agrupada (solo cuando hay más de 1)
      contenidoTicket += `<div class="grupo"><div class="titulo-grupo">${nombreBase}${size ? " - " + size : ""} x${cantidad}</div>`;
      // listar cada ítem dentro del grupo (uno por línea con sus observaciones)
      lista.forEach(({ item }) => {
        const obs = item.observaciones || {};
        const partes = [];

        // radios
        if (Array.isArray(obs.radios) && obs.radios.length > 0) {
          obs.radios.forEach(r => partes.push(r));
        }

        // modos (objeto)
        if (obs.modos && Object.keys(obs.modos).length > 0) {
          Object.entries(obs.modos).forEach(([ingrediente, simbolo]) => {
            if (simbolo === "+" || simbolo === "-") partes.push(`${simbolo} ${ingrediente}`);
            else if (typeof simbolo === "string" && simbolo.toLowerCase() === "no") partes.push(`No ${ingrediente}`);
            else partes.push(`${ingrediente}: ${simbolo}`);
          });
        }

        // selectores (objeto: clave -> valor o arreglo)
        if (obs.selectores && Object.keys(obs.selectores).length > 0) {
          Object.entries(obs.selectores).forEach(([k, v]) => {
            if (Array.isArray(v)) v.forEach(val => partes.push(`${k}: ${val}`));
            else partes.push(`${k}: ${v}`);
          });
        }

        // texto libre
        if (obs.texto && typeof obs.texto === "string" && obs.texto.trim() !== "") {
          partes.push(obs.texto.trim());
        }

        if (partes.length === 0) partes.push("Normal");

        // Mostrar el plato (nombre - size) y debajo sus observaciones
        contenidoTicket += `
          <div class="plato">${nombreBase}${size ? " - " + size : ""}</div>
          ${partes.map(t => `<div class="obs">${t}</div>`).join("")}
        `;
      });

      contenidoTicket += `</div><div class="linea"></div>`;
    } else {
      // solo 1 en el grupo -> imprimir normalmente sin encabezado de grupo
      const item = lista[0].item;
      const obs = item.observaciones || {};
      const partes = [];

      if (Array.isArray(obs.radios) && obs.radios.length > 0) {
        obs.radios.forEach(r => partes.push(r));
      }
      if (obs.modos && Object.keys(obs.modos).length > 0) {
        Object.entries(obs.modos).forEach(([ingrediente, simbolo]) => {
          if (simbolo === "+" || simbolo === "-") partes.push(`${simbolo} ${ingrediente}`);
          else if (typeof simbolo === "string" && simbolo.toLowerCase() === "no") partes.push(`No ${ingrediente}`);
          else partes.push(`${ingrediente}: ${simbolo}`);
        });
      }
      if (obs.selectores && Object.keys(obs.selectores).length > 0) {
        Object.entries(obs.selectores).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach(val => partes.push(`${k}: ${val}`));
          else partes.push(`${k}: ${v}`);
        });
      }
      if (obs.texto && typeof obs.texto === "string" && obs.texto.trim() !== "") {
        partes.push(obs.texto.trim());
      }
      if (partes.length === 0) partes.push("Normal");

      contenidoTicket += `
        <div class="plato">${item.nombre}${item.size ? " - " + item.size : ""}</div>
        ${partes.map(t => `<div class="obs">${t}</div>`).join("")}
        <div class="linea"></div>
      `;
    }
  });

  // No mostramos "--- FIN ---" (pedido lo pediste sin esa línea)
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