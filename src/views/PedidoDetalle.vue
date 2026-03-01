<script setup>
import { computed, ref } from "vue";
import { DetallePedido } from "../assets/js/detallePedido.js";
import { actualizarEstadoPago } from "../assets/js/actualizarEstadoPago.js";
import { cancelarPedido } from "../assets/js/cancelarPedido.js";

function volver() {
  window.history.back();
}

const formatearObservaciones = (observaciones) => {
  if (!observaciones) return "";

  const partes = [];

  if (observaciones.selectores) {
    Object.values(observaciones.selectores).forEach((valor) => {
      if (valor) partes.push(valor);
    });
  }

  if (observaciones.radios?.length) {
    partes.push(...observaciones.radios);
  }

  if (observaciones.modos) {
    Object.entries(observaciones.modos).forEach(([item, modo]) => {
      if (modo === "Solo") partes.unshift(`Solo ${item}`);
      else if (modo === "No") partes.push(`No ${item}`);
      else if (modo === "+") partes.push(`Más ${item}`);
    });
  }

  if (observaciones.texto?.trim()) {
    partes.push(observaciones.texto.trim());
  }

  return partes.join(", ");
};

const { pedido } = DetallePedido();

const formatHora = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

// ── POPUP CONFIRMAR PAGO ──────────────────────────────────────
const mostrarConfirmacionPago = ref(false);

const abrirConfirmacionPago = () => {
  mostrarConfirmacionPago.value = true;
};

const cerrarConfirmacionPago = () => {
  mostrarConfirmacionPago.value = false;
};

const confirmarPago = async () => {
  try {
    await actualizarEstadoPago(pedido.value.id);
    cerrarConfirmacionPago();
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("No se pudo actualizar el estado");
  }
};

// ── CANCELAR PEDIDO ───────────────────────────────────────────
const cancelar = computed(() =>
  pedido.value ? cancelarPedido(pedido.value.id) : null
);

// ── IMPRIMIR ──────────────────────────────────────────────────
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
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          h2 {
            text-align: center;
            font-size: 17px;
            text-transform: uppercase;
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
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 4px;
            word-break: break-word;
            white-space: normal;
            line-height: 1.2;
            width: 100%;
            max-width: 70mm;
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
        <br><br><br>
        <h2>🧾 PEDIDO #${pedido.id || "—"}</h2>
        <div class="linea"></div>
        <div class="info-cliente">
          <p><strong>Dirección:</strong> ${pedido.cliente?.direccion || "—"}</p>
          <p><strong>Cliente:</strong> ${pedido.cliente?.nombre || "Sin nombre"}</p>
          <p><strong>Tel:</strong> ${pedido.cliente?.telefono || "—"}</p>
        </div>
        <div class="linea"></div>
  `;

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
            <span>${nombreBase}${size ? " - " + size : ""} x${cantidad}</span>
            <span class="Price1">$${subtotalGrupo.toLocaleString("es-CO")}</span>
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
        if (obs.texto && obs.texto.trim() !== "") partes.push(obs.texto.trim());
        if (partes.length === 0) partes.push("Normal");

        contenidoTicket += `
          <div class="plato">
            <span>${nombreBase}${size ? " - " + size : ""}</span>
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
      if (obs.texto && obs.texto.trim() !== "") partes.push(obs.texto.trim());
      if (partes.length === 0) partes.push("Normal");

      contenidoTicket += `
        <div class="plato">
          <span>${p.nombre}${p.size ? " - " + p.size : ""}</span>
          <span class="Price1">$${precioUnitario.toLocaleString("es-CO")}</span>
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
  }, 300);
}
</script>

<template>
  <div class="detalle-wrapper">
    <div class="factura" v-if="pedido">

      <button class="btn-volver" @click="volver">
        ← Volver al historial
      </button>

      <h1 class="factura-titulo">
        Detalle del Pedido {{ pedido.id }}
      </h1>

      <div class="factura-info">
        <p><strong>Hora:</strong> {{ formatHora(pedido.fecha) }}</p>
        <p><strong>Nombre:</strong> {{ pedido.cliente.nombre }}</p>
        <p><strong>Celular:</strong> {{ pedido.cliente.telefono }}</p>
        <p><strong>Dirección:</strong> {{ pedido.cliente.direccion }}</p>
        <p><strong>Forma Pago:</strong> {{ pedido.formaPago }}</p>
        <p>
          <strong>Estado:</strong>
          {{ pedido.estado }}
          <button
            v-if="pedido.estado === 'Pago pendiente' && pedido.formaPago === 'Transferencia'"
            class="btn-pago-realizado"
            @click="abrirConfirmacionPago"
          >
            ¿Pago realizado?
          </button>
        </p>
      </div>

      <div class="factura-platos">
        <h3>Platos</h3>
        <ul>
          <li v-for="(plato, index) in pedido.platos" :key="index">
            <div class="plato-linea">
              <span>
                {{ plato.nombre }}
                <span v-if="plato.size"> ({{ plato.size }})</span>
              </span>
              <span v-if="plato.precio" class="precio-plato">
                ${{ plato.precio.toLocaleString("es-CO") }}
              </span>
            </div>
            <div
              v-if="formatearObservaciones(plato.observaciones)"
              class="obs-text"
            >
              {{ formatearObservaciones(plato.observaciones) }}
            </div>
          </li>
        </ul>
        <br>
        <div class="total-linea">
          <strong>Total:</strong>
          <span>
            ${{ pedido.platos.reduce((sum, p) => sum + Number(p.precio || 0), 0).toLocaleString("es-CO") }}
          </span>
        </div>
      </div>

      <div class="factura-acciones">
        <button
          class="btn-editar"
          @click="$router.push(`/pedidos/${pedido.id}/editar`)"
        >
          ✏️ Editar Pedido
        </button>
        <button
          class="btn-cancelar"
          @click="cancelar.abrirConfirmacion()"
        >
          ✕ Cancelar Pedido
        </button>
        <button class="btn-imprimir" @click="imprimirPedido(pedido)">
          🖨️ Imprimir Pedido
        </button>
      </div>

    </div>

    <div v-else>Cargando pedido...</div>

    <!-- POPUP CONFIRMAR PAGO -->
    <div
      class="popup-overlay"
      v-if="mostrarConfirmacionPago"
      @click.self="cerrarConfirmacionPago"
    >
      <div class="popup">
        <div class="popup-header">
          <h3>Confirmar Pago</h3>
          <span class="popup-plato">Pedido #{{ pedido?.id }}</span>
        </div>
        <div class="popup-body">
          <p style="font-size: .95rem; color: #333;">
            ¿Confirmas que el pago por <strong>transferencia</strong> fue recibido?
          </p>
        </div>
        <div class="popup-footer">
          <button class="btn-reset" @click="cerrarConfirmacionPago">
            No, volver
          </button>
          <button class="btn-submit" @click="confirmarPago">
            Sí, confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP CANCELAR PEDIDO -->
    <!-- POPUP CANCELAR PEDIDO -->
<div
  class="popup-overlay"
  v-if="cancelar?.mostrarConfirmacion.value"
  @click.self="cancelar.cerrarConfirmacion()"
>
  <div class="popup">
    <div class="popup-header">
      <h3>Cancelar Pedido</h3>
      <span class="popup-plato">Esta acción no se puede deshacer</span>
    </div>
    <div class="popup-body">
      <p style="font-size: .95rem; color: #333;">
        ¿Estás seguro de que deseas cancelar el pedido
        <strong>#{{ pedido?.id }}</strong>?
      </p>
      <div class="field">
        <label class="popup-label">
          Razón de cancelación <span class="required">*</span>
        </label>
        <textarea
          v-model="cancelar.razonCancelacion.value"
          class="popup-textarea"
          :class="{ 'popup-textarea--error': !cancelar.razonCancelacion.value.trim() }"
          placeholder="Ej: Cliente llamó para cancelar, dirección incorrecta..."
          rows="3"
        />
      </div>
    </div>
    <div class="popup-footer">
      <button class="btn-reset" @click="cancelar.cerrarConfirmacion()">
        No, volver
      </button>
      <button class="btn-cancelar" @click="cancelar.confirmarCancelacion()">
        Sí, cancelar
      </button>
    </div>
  </div>
</div>

  </div>
</template>