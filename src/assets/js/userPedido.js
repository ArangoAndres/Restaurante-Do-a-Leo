import { ref, reactive } from "vue";
import { MENU } from "../data/menuData.js";
import { OBS_POR_PLATO } from "../data/ObservacionesData.js";
import { api } from "./api.js";
export { MENU, OBS_POR_PLATO };

function crearUnidad(sizes) {
  return {
    size: sizes.length > 0 ? sizes[0] : "",
    obs: {
      radios: [],
      modos: {},
      selectores: {}, // 👈 IMPORTANTE
      texto: "",
    },
  };
}

// Construye texto resumen para mostrar en el botón de la tabla
export function buildObsText(obs) {
  if (!obs) return "";
  const partes = [];

  // Selectores — va primero (ej: "Arroz", "Sancocho")
  const selectores = obs.selectores || {};
  Object.values(selectores).forEach((v) => {
    if (v) partes.push(v);
  });

  // Radios — muestra el label tal cual
  if (obs.radios?.length) {
    partes.push(...obs.radios);
  }

  // Modos — jerarquía: Solo, No, +
  const modos = obs.modos || {};
  Object.entries(modos).forEach(([label, modo]) => {
    if (modo === "Solo") partes.unshift(`Solo ${label}`);
    else if (modo === "No") partes.push(`No ${label}`);
    else if (modo === "+") partes.push(`+ ${label}`);
  });

  // Texto libre
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

  // popup.temp tiene la misma estructura que obs:
  // { radios: [], modos: {}, texto: '' }
  const popup = reactive({
    visible: false,
    itemIndex: null,
    unitIndex: null,
    temp: { radios: [], modos: {}, selectores: {}, texto: "" },
  });

  function haySolo() {
    return Object.values(popup.temp.modos).some((m) => m === "Solo");
  }

  // RADIO: toggle individual — cada uno es independiente
  function toggleRadio(label) {
    const idx = popup.temp.radios.indexOf(label);
    if (idx === -1) popup.temp.radios.push(label);
    else popup.temp.radios.splice(idx, 1);
  }

  // SELECTOR: opciones excluyentes (ej: Sancocho / Arroz)
  function toggleSelector(label, opcion) {
    if (popup.temp.selectores[label] === opcion) {
      delete popup.temp.selectores[label];
    } else {
      popup.temp.selectores[label] = opcion;
    }
  }

  // MODO: Solo/No/+
  function toggleModo(label, modo) {
    const actual = popup.temp.modos[label];

    // Deseleccionar si ya estaba
    if (actual === modo) {
      delete popup.temp.modos[label];
      return;
    }

    // Solo siempre se puede marcar libremente
    if (modo === "Solo") {
      popup.temp.modos[label] = "Solo";
      return;
    }

    // No y + se bloquean si hay algún Solo activo
    if ((modo === "No" || modo === "+") && haySolo()) return;

    popup.temp.modos[label] = modo;
  }

  function abrirPopup(i, j) {
    popup.itemIndex = i;
    popup.unitIndex = j;
    // Carga lo ya guardado en la unidad
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
    // Validar selectores requeridos
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

  // Devuelve true si la unidad tiene alguna obs definida
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
    MENU.forEach((_, i) => {
      selections[i] = [];
    });
    cerrarPopup();
  }

  async function sendOrder() {
    const ahora = new Date();

    if (!form.nombre || !form.telefono) {
      alert("Por favor completa nombre y teléfono.");
      return;
    }

    if (!recogeEnRestaurante.value && !form.direccion) {
      alert("Por favor ingresa la dirección de entrega.");
      return;
    }

    if (!formaPago.value) {
      alert("Por favor selecciona una forma de pago.");
      return;
    }

    if (!restauranteSeleccionado.value) {
      alert("Por favor selecciona un restaurante.");
      return;
    }

    const platos = [];

    MENU.forEach((item, i) => {
      if (item.cat) return;

      const unidades = selections[i];
      if (!unidades || unidades.length === 0) return;

      unidades.forEach((u) => {
        platos.push({
          nombre: item.name,
          size: u.size,
          observaciones: {
            radios: u.obs.radios || [],
            modos: u.obs.modos || {},
            selectores: u.obs.selectores || {}, // 👈 FALTABA ESTO
            texto: u.obs.texto || "",
          },
        });
      });
    });

    if (platos.length === 0) {
      alert("Por favor agrega al menos un plato.");
      return;
    }

    const pedido = {
      fecha: ahora,
      restaurante: restauranteSeleccionado.value,
      formaPago: formaPago.value,
      estado:
        formaPago.value === "Transferencia"
          ? "Pago pendiente"
          : "Pago Efectivo",
      cliente: {
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: recogeEnRestaurante.value
          ? "Recoge en restaurante"
          : form.direccion,
      },
      platos,
    };

    try {
      console.log("Pedido a enviar:", JSON.stringify(pedido, null, 2));

      const response = await api.post("/pedidos", pedido);
      console.log("Respuesta backend:", response.data);

      toastVisible.value = true;
      setTimeout(() => (toastVisible.value = false), 3500);

      resetForm();
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
    sendOrder,
  };
}
