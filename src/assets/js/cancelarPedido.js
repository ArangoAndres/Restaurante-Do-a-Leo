import { api } from "./api.js";
import { ref } from "vue";

export const cancelarPedido = (pedidoId) => {
  const mostrarConfirmacion = ref(false);

  const abrirConfirmacion = () => {
    mostrarConfirmacion.value = true;
  };

  const cerrarConfirmacion = () => {
    mostrarConfirmacion.value = false;
  };

  const confirmarCancelacion = async () => {
    try {
      await api.delete(`/pedidos/${pedidoId}`);
      window.history.back();
    } catch (error) {
      console.error(error);
      alert("No se pudo cancelar el pedido");
    } finally {
      mostrarConfirmacion.value = false;
    }
  };

  return {
    mostrarConfirmacion,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarCancelacion,
  };
};
