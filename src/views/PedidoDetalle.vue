<script setup>
import { computed, ref } from "vue";
import { DetallePedido } from "../assets/js/detallePedido.js";
import { actualizarEstadoPago } from "../assets/js/actualizarEstadoPago.js";
import { cancelarPedido } from "../assets/js/cancelarPedido.js";

function volver() {
  window.history.back();
}

const formatearObservaciones = (observaciones) => {
  if (!observaciones || !observaciones.length) return "";
  return observaciones
    .map(o => {
      if (o.modo === "+") return `Más ${o.item}`;
      if (o.modo === "No") return `No ${o.item}`;
      return o.item;
    })
    .join(", ");
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
            v-if="pedido.estado === 'Pago pendiente'"
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
            {{ plato.nombre }} - {{ plato.size }}
            <span v-if="plato.observaciones?.length">
              {{ formatearObservaciones(plato.observaciones) }}
            </span>
          </li>
        </ul>
      </div>

      <div class="factura-acciones">
        <button class="btn-editar" @click="$router.push(`/pedidos/${pedido.id}/editar`)">
          ✏️ Editar Pedido
        </button>
        <button class="btn-cancelar" @click="cancelar.abrirConfirmacion()">
          ✕ Cancelar Pedido
        </button>
      </div>

    </div>

    <div v-else>Cargando pedido...</div>

    <!-- POPUP CONFIRMAR PAGO -->
    <div class="popup-overlay" v-if="mostrarConfirmacionPago" @click.self="cerrarConfirmacionPago">
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
    <div class="popup-overlay" v-if="cancelar?.mostrarConfirmacion.value" @click.self="cancelar.cerrarConfirmacion()">
      <div class="popup">
        <div class="popup-header">
          <h3>Cancelar Pedido</h3>
          <span class="popup-plato">Esta acción no se puede deshacer</span>
        </div>
        <div class="popup-body">
          <p style="font-size: .95rem; color: #333;">
            ¿Estás seguro de que deseas cancelar el pedido <strong>#{{ pedido?.id }}</strong>?
          </p>
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