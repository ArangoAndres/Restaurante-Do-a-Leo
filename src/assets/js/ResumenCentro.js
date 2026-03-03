import { api } from "./api.js";
import { MENU } from "../data/menuData.js";

const ordenMenu = {};
MENU.forEach((item) => {
  if (item.num !== undefined) {
    ordenMenu[item.name] = item.num;
  }
});

export async function obtenerResumenDelDiaCentro() {
  try {
    const { data } = await api.get("/pedidos/centro");

    const hoy = new Date().toISOString().split("T")[0];

    const pedidosHoy = data.filter(
      (p) => new Date(p.fecha).toISOString().split("T")[0] === hoy,
    );

    const resumen = {};

    pedidosHoy.forEach((pedido) => {
      if (!Array.isArray(pedido.platos)) return;
      pedido.platos.forEach((p) => {
        const key = `${p.nombre} | ${p.size || "—"}`;
        if (!resumen[key]) {
          resumen[key] = {
            nombre: p.nombre,
            size: p.size || "",
            cantidad: 0,
            total: 0,
          };
        }
        resumen[key].cantidad += 1;
        resumen[key].total += Number(p.precio) || 0;
      });
    });

    const lista = Object.values(resumen).sort((a, b) => {
      const ordenA = ordenMenu[a.nombre] ?? 999;
      const ordenB = ordenMenu[b.nombre] ?? 999;
      if (ordenA !== ordenB) return ordenA - ordenB;
      if (a.size < b.size) return -1;
      if (a.size > b.size) return 1;
      return 0;
    });

    const totalGeneral = lista.reduce((sum, r) => sum + r.total, 0);

    return { lista, totalGeneral };
  } catch (e) {
    console.error("Error generando resumen:", e);
    return { lista: [], totalGeneral: 0 };
  }
}
