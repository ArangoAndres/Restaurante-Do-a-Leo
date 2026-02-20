import { ref, onMounted, onUnmounted } from "vue";
import { api } from "./api";

export function HistorialBolivar() {
  const pedidos = ref([]);
  let interval = null;

  const fetchPedidos = async () => {
    try {
      const { data } = await api.get("/pedidos/bolivar");

      // nuevo primero
      pedidos.value = [...data].reverse();
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
    }
  };

  onMounted(() => {
    fetchPedidos();

    // actualizar cada 5 segundos
    interval = setInterval(fetchPedidos, 5000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  return {
    pedidos,
  };
}
