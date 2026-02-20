<script setup>
import { DetallePedido } from "../assets/js/detallePedido.js";
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
const {
  pedido,

} = DetallePedido();
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

    </div>

    <div v-else>
      Cargando pedido...
    </div>
  </div>
</template>