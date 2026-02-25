import { ref, reactive } from "vue";
import { MENU } from "../data/menuData.js";
import { OBS_POR_PLATO } from "../data/ObservacionesData.js";
import { api } from "./api.js";
export { MENU, OBS_POR_PLATO };

function crearUnidad(sizes) {
  return {
    size: sizes.length > 0 ? sizes[0] : "",
    obs: { radios: [], modos: {}, selectores: {}, texto: "" },
  };
}

// texto de observaciones resumido
export function buildObsText(obs) {
  if (!obs) return "";
  const partes = [];
  const selectores = obs.selectores || {};
  Object.values(selectores).forEach((v) => v && partes.push(v));
  if (obs.radios?.length) partes.push(...obs.radios);
  const modos = obs.modos || {};
  Object.entries(modos).forEach(([label, modo]) => {
    if (modo === "Solo") partes.unshift(`Solo ${label}`);
    else if (modo === "No") partes.push(`No ${label}`);
    else if (modo === "+") partes.push(`+ ${label}`);
  });
  if (obs.texto?.trim()) partes.push(obs.texto.trim());
  return partes.join(", ");
}

export function usePedido() {
  const form = reactive({ nombre: "", telefono: "", direccion: "" });
  const recogeEnRestaurante = ref(false);
  const restauranteSeleccionado = ref("");
  const formaPago = ref("");
  const toastVisible = ref(false);
  const selections = reactive(MENU.map(() => []));

  // popup de observaciones
  const popup = reactive({
    visible: false,
    itemIndex: null,
    unitIndex: null,
    temp: { radios: [], modos: {}, selectores: {}, texto: "" },
  });

  // nuevo popup de resumen
  const popupResumen = reactive({
    visible: false,
    pedido: null,
  });

  function haySolo() {
    return Object.values(popup.temp.modos).some((m) => m === "Solo");
  }

  function toggleRadio(label) {
    const idx = popup.temp.radios.indexOf(label);
    if (idx === -1) popup.temp.radios.push(label);
    else popup.temp.radios.splice(idx, 1);
  }

  function toggleSelector(label, opcion) {
    if (popup.temp.selectores[label] === opcion)
      delete popup.temp.selectores[label];
    else popup.temp.selectores[label] = opcion;
  }

  function toggleModo(label, modo) {
    const actual = popup.temp.modos[label];
    if (actual === modo) return delete popup.temp.modos[label];
    if (modo === "Solo") return (popup.temp.modos[label] = "Solo");
    if ((modo === "No" || modo === "+") && haySolo()) return;
    popup.temp.modos[label] = modo;
  }

  function abrirPopup(i, j) {
    popup.itemIndex = i;
    popup.unitIndex = j;
    const saved = selections[i][j].obs;
    popup.temp = {
      radios: [...(saved.radios || [])],
      modos: { ...(saved.modos || {}) },
      selectores: { ...(saved.selectores || {}) },
      texto: saved.texto || "",
    };
    popup.visible = true;
  }

  function cerrarPopup() {
    popup.visible = false;
    popup.itemIndex = null;
    popup.unitIndex = null;
    popup.temp = { radios: [], modos: {}, selectores: {}, texto: "" };
  }

  function confirmarPopup() {
    const plato = OBS_POR_PLATO[MENU[popup.itemIndex]?.num];
    if (plato) {
      const requeridos = plato.items.filter(
        (i) => i.tipo === "selector" && i.requerido,
      );
      for (const r of requeridos) {
        if (!popup.temp.selectores[r.label]) {
          alert(`Por favor selecciona "${r.label}"`);
          return;
        }
      }
    }
    selections[popup.itemIndex][popup.unitIndex].obs = {
      radios: [...popup.temp.radios],
      modos: { ...popup.temp.modos },
      selectores: { ...popup.temp.selectores },
      texto: popup.temp.texto,
    };
    cerrarPopup();
  }

  function tieneObs(obs) {
    if (!obs) return false;
    return (
      obs.radios?.length > 0 ||
      Object.keys(obs.modos || {}).length > 0 ||
      Object.keys(obs.selectores || {}).length > 0 ||
      !!obs.texto?.trim()
    );
  }

  function updateQty(i, qty) {
    const item = MENU[i];
    const actual = selections[i].length;
    const nueva = parseInt(qty) || 0;
    if (nueva > actual) {
      for (let j = actual; j < nueva; j++) {
        selections[i].push(crearUnidad(item.sizes || []));
      }
    } else if (nueva < actual) {
      selections[i].splice(nueva);
    }
  }

  function resetForm() {
    form.nombre = "";
    form.telefono = "";
    form.direccion = "";
    recogeEnRestaurante.value = false;
    restauranteSeleccionado.value = "";
    formaPago.value = "";
    MENU.forEach((_, i) => (selections[i] = []));
    cerrarPopup();
  }

  function construirPedido() {
    const ahora = new Date();
    const platos = [];

    MENU.forEach((item, i) => {
      if (item.cat) return;
      const unidades = selections[i];
      if (!unidades?.length) return;
      unidades.forEach((u) => {
        let precio = 0;
        if (item.prices?.length && item.sizes?.length) {
          const idx = item.sizes.indexOf(u.size);
          precio = idx >= 0 ? item.prices[idx] : item.prices[0];
        } else {
          precio = item.price || 0;
        }

        platos.push({
          nombre: item.name,
          size: u.size,
          precio,
          observaciones: { ...u.obs },
        });
      });
    });

    return {
      fecha: ahora,
      cliente: {
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: recogeEnRestaurante.value
          ? "Recoge en restaurante"
          : form.direccion,
      },
      formaPago: formaPago.value,
      restaurante: restauranteSeleccionado.value,
      platos,
    };
  }

  function abrirResumen() {
    const pedido = construirPedido();
    if (pedido.platos.length === 0) {
      alert("Por favor agrega al menos un plato.");
      return;
    }
    popupResumen.pedido = pedido;
    popupResumen.visible = true;
  }

  async function enviarPedidoFinal() {
    const pedido = popupResumen.pedido;
    if (!pedido) return;

    try {
      const response = await api.post("/pedidos", pedido);
      console.log("Respuesta backend:", response.data);
      toastVisible.value = true;
      setTimeout(() => (toastVisible.value = false), 3500);
      resetForm();
      popupResumen.visible = false;
    } catch (error) {
      console.error("Error enviando pedido:", error);
      alert("Error al enviar pedido");
    }
  }

  return {
    form,
    recogeEnRestaurante,
    restauranteSeleccionado,
    formaPago,
    toastVisible,
    selections,
    popup,
    popupResumen,
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
    resetForm,
    abrirResumen,
    enviarPedidoFinal,
  };
}
