import { ref, reactive } from "vue";
import { api } from "./api.js";
import { MENU, OBS_POR_PLATO } from "./userPedido.js";

export const useEditarPedido = (pedido) => {
  // ── FORM DEL CLIENTE ──────────────────────────────────────────
  const form = reactive({
    nombre: pedido.cliente.nombre,
    telefono: pedido.cliente.telefono,
    direccion: pedido.cliente.direccion,
    formaPago: pedido.formaPago ?? "Efectivo", // ← movido aquí
  });

  const recogeEnRestaurante = ref(
    !pedido.cliente.direccion || pedido.cliente.direccion.trim() === "",
  );

  // ── SELECTIONS ─────────────────────────────────────────────────
  const selections = ref(
    MENU.map((item) => {
      if (item.cat) return [];

      const platosDelMenu = pedido.platos.filter((p) => p.nombre === item.name);

      return platosDelMenu.map((p) => ({
        size: p.size || (item.sizes?.[0] ?? ""),
        obs: Array.isArray(p.observaciones) ? p.observaciones : [],
      }));
    }),
  );

  // ── POPUP OBSERVACIONES ───────────────────────────────────────
  const popup = reactive({
    visible: false,
    itemIndex: null,
    unitIndex: null,
    temp: {},
  });

  const haySolo = () => Object.values(popup.temp).some((v) => v === "Solo");

  const toggleModo = (obs, modo) => {
    if (modo !== "Solo" && haySolo()) return;
    popup.temp[obs] = popup.temp[obs] === modo ? null : modo;
  };

  const abrirPopup = (itemIndex, unitIndex) => {
    popup.itemIndex = itemIndex;
    popup.unitIndex = unitIndex;
    const obsActuales = selections.value[itemIndex][unitIndex].obs;
    popup.temp = {};
    obsActuales.forEach((o) => {
      popup.temp[o.item] = o.modo;
    });
    popup.visible = true;
  };

  const cerrarPopup = () => {
    popup.visible = false;
    popup.itemIndex = null;
    popup.unitIndex = null;
    popup.temp = {};
  };

  const confirmarPopup = () => {
    const nuevasObs = Object.entries(popup.temp)
      .filter(([, modo]) => modo)
      .map(([item, modo]) => ({ item, modo }));
    selections.value[popup.itemIndex][popup.unitIndex].obs = nuevasObs;
    cerrarPopup();
  };

  // ── CANTIDAD ──────────────────────────────────────────────────
  const updateQty = (itemIndex, newQty) => {
    const item = MENU[itemIndex];
    const current = selections.value[itemIndex];

    if (newQty > current.length) {
      for (let i = current.length; i < newQty; i++) {
        current.push({ size: item.sizes?.[0] ?? "", obs: [] });
      }
    } else {
      current.splice(newQty);
    }
  };

  // ── TOAST ─────────────────────────────────────────────────────
  const toastVisible = ref(false);

  const showToast = () => {
    toastVisible.value = true;
    setTimeout(() => (toastVisible.value = false), 2500);
  };

  // ── ENVIAR ────────────────────────────────────────────────────
  const guardarCambios = async () => {
    const platos = [];

    MENU.forEach((item, i) => {
      if (item.cat) return;
      selections.value[i].forEach((unidad) => {
        platos.push({
          nombre: item.name,
          size: unidad.size,
          observaciones: unidad.obs,
        });
      });
    });

    if (platos.length === 0) {
      alert("Debes seleccionar al menos un plato.");
      return;
    }

    const payload = {
      restaurante: pedido.restaurante,
      formaPago: form.formaPago, // ← desde form
      estado: pedido.estado,
      cliente: {
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: recogeEnRestaurante.value ? "" : form.direccion,
      },
      platos,
    };

    try {
      await api.put(`/pedidos/${pedido.id}/editar`, payload);
      showToast();
      setTimeout(() => window.history.back(), 1500);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el pedido.");
    }
  };

  return {
    form,
    recogeEnRestaurante,
    selections,
    popup,
    toastVisible,
    haySolo,
    toggleModo,
    updateQty,
    abrirPopup,
    cerrarPopup,
    confirmarPopup,
    guardarCambios,
  };
};
