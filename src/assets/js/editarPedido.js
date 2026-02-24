import { ref, reactive } from "vue";
import { api } from "./api.js";
import { MENU, OBS_POR_PLATO } from "./userPedido.js";

export const useEditarPedido = (pedido) => {
  // ── FORM DEL CLIENTE ───────────────────────────────
  const form = reactive({
    nombre: pedido.cliente.nombre,
    telefono: pedido.cliente.telefono,
    direccion: pedido.cliente.direccion,
    formaPago: pedido.formaPago ?? "Efectivo",
  });

  const recogeEnRestaurante = ref(
    !pedido.cliente.direccion || pedido.cliente.direccion.trim() === "",
  );

  // ── SELECTIONS ─────────────────────────────────────
  const selections = ref(
    MENU.map((item) => {
      if (item.cat) return [];

      const platosDelMenu = pedido.platos.filter((p) => p.nombre === item.name);

      return platosDelMenu.map((p) => ({
        size: p.size || (item.sizes?.[0] ?? ""),
        obs: {
          radios: p.observaciones?.radios ?? [],
          modos: p.observaciones?.modos ?? {},
          selectores: p.observaciones?.selectores ?? {},
          texto: p.observaciones?.texto ?? "",
        },
      }));
    }),
  );

  // ── POPUP OBSERVACIONES ────────────────────────────
  const popup = reactive({
    visible: false,
    itemIndex: null,
    unitIndex: null,
    temp: { radios: [], modos: {}, selectores: {}, texto: "" },
  });

  // Helpers
  const haySolo = () =>
    Object.values(popup.temp.modos).some((v) => v === "Solo");

  const toggleRadio = (label) => {
    const radios = popup.temp.radios;
    if (radios.includes(label)) {
      popup.temp.radios = radios.filter((r) => r !== label);
    } else {
      popup.temp.radios.push(label);
    }
  };

  const toggleModo = (label, modo) => {
    if (modo !== "Solo" && haySolo()) return;
    popup.temp.modos[label] = popup.temp.modos[label] === modo ? null : modo;
  };

  const toggleSelector = (label, value) => {
    popup.temp.selectores[label] =
      popup.temp.selectores[label] === value ? null : value;
  };

  const abrirPopup = (itemIndex, unitIndex) => {
    popup.itemIndex = itemIndex;
    popup.unitIndex = unitIndex;
    const obs = selections.value[itemIndex][unitIndex].obs;
    popup.temp = JSON.parse(JSON.stringify(obs));
    popup.visible = true;
  };

  const cerrarPopup = () => {
    popup.visible = false;
    popup.itemIndex = null;
    popup.unitIndex = null;
    popup.temp = { radios: [], modos: {}, selectores: {}, texto: "" };
  };

  const confirmarPopup = () => {
    selections.value[popup.itemIndex][popup.unitIndex].obs = JSON.parse(
      JSON.stringify(popup.temp),
    );
    cerrarPopup();
  };

  // ── CANTIDAD ───────────────────────────────────────
  const updateQty = (itemIndex, newQty) => {
    const item = MENU[itemIndex];
    const current = selections.value[itemIndex];

    if (newQty > current.length) {
      for (let i = current.length; i < newQty; i++) {
        current.push({
          size: item.sizes?.[0] ?? "",
          obs: { radios: [], modos: {}, selectores: {}, texto: "" },
        });
      }
    } else {
      current.splice(newQty);
    }
  };

  // ── TOAST ──────────────────────────────────────────
  const toastVisible = ref(false);
  const showToast = () => {
    toastVisible.value = true;
    setTimeout(() => (toastVisible.value = false), 2500);
  };

  // ── GUARDAR CAMBIOS ────────────────────────────────
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

    const nuevoEstado =
      form.formaPago === "Efectivo" ? "Pagado" : "Pago pendiente";

    const payload = {
      restaurante: pedido.restaurante,
      formaPago: form.formaPago,
      estado: nuevoEstado,
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

  // ── UTILIDADES PARA MOSTRAR OBS EN BOTÓN ───────────
  const tieneObs = (obs) => {
    return (
      (obs.radios && obs.radios.length) ||
      Object.keys(obs.modos || {}).length ||
      Object.keys(obs.selectores || {}).length ||
      (obs.texto && obs.texto.trim() !== "")
    );
  };

  const buildObsText = (obs) => {
    const parts = [];
    if (obs.radios?.length) parts.push(obs.radios.join(", "));
    if (obs.modos && Object.keys(obs.modos).length)
      Object.entries(obs.modos).forEach(([k, v]) => {
        if (v)
          parts.push(
            `${v === "Solo" ? "Solo " : v === "No" ? "No " : "+ "}${k}`,
          );
      });
    if (obs.texto) parts.push(obs.texto);
    return parts.join(", ");
  };

  return {
    form,
    recogeEnRestaurante,
    selections,
    popup,
    toastVisible,
    haySolo,
    toggleRadio,
    toggleModo,
    toggleSelector,
    tieneObs,
    buildObsText,
    updateQty,
    abrirPopup,
    cerrarPopup,
    confirmarPopup,
    guardarCambios,
  };
};
