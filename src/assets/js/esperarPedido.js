// esperarPedido.js
import { ref, watch, computed } from "vue";
import { DetallePedido } from "./detallePedido.js";
import { useEditarPedido } from "./editarPedido.js";

export const useEditarPedidoReady = () => {
  const { pedido, loading, error } = DetallePedido();
  const logica = ref(null);

  watch(pedido, (nuevoPedido) => {
    if (nuevoPedido && !logica.value) {
      logica.value = useEditarPedido(nuevoPedido);
    }
  });

  // Exponemos selections como computed para que el template lo vea directo
  const selections = computed(() => logica.value?.selections ?? []);

  return { pedido, logica, loading, error, selections };
};
