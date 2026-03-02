<script setup>
import { DetallePedidoCancelado } from "../assets/js/detallePedidoCancelado.js";

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

const { pedido } = DetallePedidoCancelado();

const formatHora = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  });
};
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
        <p><strong>Estado:</strong> {{ pedido.estado }}</p>
        <p>
          <strong>Cancelación:</strong>
          {{ pedido.razon_cancelacion ?? "Sin motivo registrado" }}
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

    </div>

    <div v-else>Cargando pedido...</div>

  </div>
</template>