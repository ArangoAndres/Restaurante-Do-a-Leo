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
            font-size: 18px;
            width: 70mm;
            margin: 0;
            padding: 0;
          }
          h2 {
            text-align: center;
            font-size: 17px;
            text-transform: uppercase;
          }
          .encabezado {
            text-align: center;
            font-size: 16px;
            text-transform: uppercase;
            margin-bottom: 4px;
            line-height: 1.4;
          }
          .encabezado .nombre-restaurante {
            font-weight: bold;
            font-size: 20px;
          }
          .linea {
            border-top: 1px dashed black;
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
            text-transform: uppercase;
          }
          .plato .Price1 {
            margin-left: 17px;
          }
          .obs {
            font-size: 12px;
            text-transform: uppercase;
          }
          .info-cliente {
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 4px;
            word-break: break-word;
            white-space: normal;
            line-height: 1.2;
            width: 100%;
            max-width: 70mm;
          }
            .linea_grupos{
            border-top: 1px solid black;}

          .total-final {
            font-weight: bold;
            font-size: 15px;
            text-align: left;
            margin-top: 10px;
            border-top: 1px dashed black;
            padding-top: 5px;
          }
             .Hora_tam{
            font-size:20px;
            }
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
        <h2>🧾 PEDIDO #${pedido.id || "—"}</h2>
        <div class="linea"></div>
        <div class="info-cliente">
          <p><strong>Hora:</strong> <strong class="Hora_tam">${pedido.fecha ? new Date(pedido.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—"}</strong></p>
          <p><strong>Barrio:</strong> <strong>${pedido.cliente?.barrio || "—"}</strong></p>
          <p><strong>Dirección:</strong> <strong>${pedido.cliente?.direccion || "—"}</strong></p>
          <p><strong>Cliente:</strong> <strong>${pedido.cliente?.nombre || "Sin nombre"}</strong></p>
          <p><strong>Tel:</strong> <strong>${pedido.cliente?.telefono || "—"}</strong></p>
        </div>
        <div class="linea"></div>
             <p class="Hora_tam"><strong>Hora de Entrega:</strong><strong> ${pedido.cliente.hora_entrega}</strong></p>
        <p style="font-size:10px">@@@@@@@@@@@@@@@@@@@@@@@@@@@@@</p>
         <p style="font-size:10px">@@@@@@@@@@@@@@@@@@@@@@@@@@@</p>
  `;

  const limpiar = (txt) => String(txt).replace(/[¿¡?!]/g, "").trim();

  const procesarModos = (modos, partes) => {
    Object.entries(modos).forEach(([ing, sim]) => {
      if (sim === "+") partes.push(`Más ${limpiar(ing)}`);
      else if (sim.toLowerCase() === "no") partes.push(`No ${limpiar(ing)}`);
      else if (sim.toLowerCase() === "solo") partes.push(`Solo ${limpiar(ing)}`);
      else partes.push(`${limpiar(sim)} ${limpiar(ing)}`);
    });
  };

  const procesarSelectores = (selectores, partes) => {
    Object.entries(selectores).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((val) => partes.push(`${limpiar(val)} ${limpiar(k)}`));
      else partes.push(`${limpiar(String(v))} ${limpiar(k)}`);
    });
  };

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
      contenidoTicket += `
        <div class="grupo">
          <div class="titulo-grupo">
            <span>${nombreBase}${size ? " - " + size : ""}-- x${cantidad} -- </span>
           
            <span class="Price1">$${subtotalGrupo.toLocaleString("es-CO")}</span>
            </div>
            <div class="linea_grupos"></div>
      `;

      lista.forEach((p) => {
        const obs = p.observaciones || {};
        const partes = [];

        if (Array.isArray(obs.radios) && obs.radios.length > 0)
          obs.radios.forEach((r) => partes.push(limpiar(r)));
        if (obs.modos && Object.keys(obs.modos).length > 0)
          procesarModos(obs.modos, partes);
        if (obs.selectores && Object.keys(obs.selectores).length > 0)
          procesarSelectores(obs.selectores, partes);
        if (obs.texto && obs.texto.trim() !== "") partes.push(limpiar(obs.texto));
        if (partes.length === 0) partes.push("-");

        contenidoTicket += `
          <div class="plato">
            <span>${nombreBase}${size ? " - " + size : ""} -- x1 --</span>
            <span class="Price1">$${precioUnitario.toLocaleString("es-CO")}</span>
          </div>
          ${partes.map((t) => `<div class="obs">${t}</div>`).join("")}
        `;
      });

      contenidoTicket += `</div><div class="linea"></div>`;
    } else {
      const p = lista[0];
      const obs = p.observaciones || {};
      const partes = [];

      if (Array.isArray(obs.radios) && obs.radios.length > 0)
        obs.radios.forEach((r) => partes.push(limpiar(r)));
      if (obs.modos && Object.keys(obs.modos).length > 0)
        procesarModos(obs.modos, partes);
      if (obs.selectores && Object.keys(obs.selectores).length > 0)
        procesarSelectores(obs.selectores, partes);
      if (obs.texto && obs.texto.trim() !== "") partes.push(limpiar(obs.texto));
      if (partes.length === 0) partes.push("-");

      contenidoTicket += `
        <div class="plato">
          <span>${p.nombre}${p.size ? " - " + p.size : ""} -- x1 --</span>
          <span class="Price1">$${precioUnitario.toLocaleString("es-CO")}</span>
        </div>
        ${partes.map((t) => `<div class="obs">${t}</div>`).join("")}
        <div class="linea"></div>
      `;
    }
  });

  contenidoTicket += `
<p style="font-size:10px">@@@@@@@@@@@@@@@@@@@@@@@@@@@</p>
<p style="font-size:10px">@@@@@@@@@@@@@@@@@@@@@@@@@@@@@</p>
        <div class="total-final">TOTAL: $${totalPedido.toLocaleString("es-CO")}</div>
        <div>
          <p>Método de Pago: ${pedido.formaPago}</p>
          <p>Estado del Pago: ${pedido.estado}</p>
          <p>-</p>
          <p><strong>¡GRACIAS POR SU COMPRA!</strong></p>
        </div>
      </body>
    </html>
  `;

const paginaCorte = `<div style="page-break-after: always;"></div>`;
iframe.contentDocument.write(contenidoTicket);

  iframe.contentDocument.close();

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
  setTimeout(() => {
    imprimirPedido(pedido)
  }, 1500)
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