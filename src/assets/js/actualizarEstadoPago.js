import { api } from "./api.js";

export const actualizarEstadoPago = async (id) => {
  try {
    const response = await api.patch(`/pedidos/${id}/pago`, {
      estado: "Pagado",
    });

    return response.data;
  } catch (error) {
    console.error("Error actualizando estado:", error);
    throw error;
  }
};
