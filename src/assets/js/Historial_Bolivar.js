import { ref, onMounted, onUnmounted } from "vue";
import { api } from "./api";

export function HistorialBolivar() {
  const pedidos = ref([]);
  const onNuevoPedido = ref(null); // callback que el componente puede asignar
  let interval = null;
  let idsConocidos = new Set();

  const fetchPedidos = async () => {
    try {
      const { data } = await api.get("/pedidos/bolivar");
      const ordenados = [...data].reverse();

      // Primera carga: solo registrar ids, no imprimir
      if (idsConocidos.size === 0) {
        ordenados.forEach((p) => idsConocidos.add(p.id));
        pedidos.value = ordenados;
        return;
      }

      // Detectar pedidos nuevos
      const nuevos = ordenados.filter((p) => !idsConocidos.has(p.id));
      nuevos.forEach((p) => {
        idsConocidos.add(p.id);
        if (onNuevoPedido.value) {
          onNuevoPedido.value(p); // dispara impresión
        }
      });

      pedidos.value = ordenados;
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
    }
  };

  onMounted(() => {
    fetchPedidos();
    interval = setInterval(fetchPedidos, 5000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  return {
    pedidos,
    onNuevoPedido,
  };
}
