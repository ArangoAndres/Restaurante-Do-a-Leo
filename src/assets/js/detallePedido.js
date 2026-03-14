import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { api } from "./api";

export function DetallePedido() {
  const route = useRoute();

  const pedido = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchDetalle = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { id } = route.params;
      const { data } = await api.get(`/pedidos/bolivar/${id}?t=${Date.now()}`);
      pedido.value = data;
    } catch (err) {
      error.value = "Error cargando el pedido";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchDetalle);

  // 🔴 ESTA ES LA SOLUCIÓN
  watch(
    () => route.params.id,
    () => {
      fetchDetalle();
    },
  );

  return {
    pedido,
    loading,
    error,
    fetchDetalle,
  };
}
