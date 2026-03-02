import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "./api";

export function DetallePedidoCancelado() {
  const route = useRoute();

  const pedido = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchDetalle = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { canceladoId } = route.params;
      const { data } = await api.get(`/cancelados/${canceladoId}`);
      pedido.value = data;
    } catch (err) {
      error.value = "Error cargando el pedido";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchDetalle);

  return {
    pedido,
    loading,
    error,
    fetchDetalle,
  };
}
