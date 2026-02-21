import { ref, watch } from "vue";
import { DetallePedido } from "./detallePedido.js";
import { useEditarPedido } from "./editarPedido.js";

export const useEditarPedidoReady = () => {
  const { pedido, loading, error } = DetallePedido();
  const logica = ref(null);

  // watch en lugar de watchEffect — solo dispara cuando pedido cambia de null a un valor real
  watch(pedido, (nuevoPedido) => {
    if (nuevoPedido && !logica.value) {
      logica.value = useEditarPedido(nuevoPedido);
    }
  });

  return { pedido, logica, loading, error };
};
