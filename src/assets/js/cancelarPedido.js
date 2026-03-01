import { api } from "./api.js";
import { ref } from "vue";

export const cancelarPedido = (pedidoId) => {
  const mostrarConfirmacion = ref(false);
  const razonCancelacion = ref("");

  const abrirConfirmacion = () => {
    razonCancelacion.value = "";
    mostrarConfirmacion.value = true;
  };

  const cerrarConfirmacion = () => {
    razonCancelacion.value = "";
    mostrarConfirmacion.value = false;
  };

  const confirmarCancelacion = async () => {
    if (!razonCancelacion.value.trim()) {
      alert("Debes escribir una razón de cancelación");
      return;
    }
    try {
      await api.delete(`/pedidos/${pedidoId}`, {
        data: { razon_cancelacion: razonCancelacion.value.trim() },
      });
      window.history.back();
    } catch (error) {
      console.error(error);
      alert("No se pudo cancelar el pedido");
    } finally {
      mostrarConfirmacion.value = false;
      razonCancelacion.value = "";
    }
  };

  return {
    mostrarConfirmacion,
    razonCancelacion,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarCancelacion,
  };
};
