import { ref, reactive } from "vue";
import { MENU } from "../data/menuData.js";
import { OBS_POR_PLATO } from "../data/ObservacionesData.js";
import { PROTEINAS_CORRIENTE, OBS_CORRIENTE } from "../js/CorrienteConfig.js";
import { api } from "./api.js";

export { MENU, OBS_POR_PLATO, PROTEINAS_CORRIENTE, OBS_CORRIENTE };

const RADIO_EXCLUSIVOS = [
  ["¿Sopa Clarita?", "¿Sopa Espesa?", "¿Sancocho?", "¿Sopa de arroz?", "¿No sopa?"],
  ["¿3/4?", "¿Termino Medio?", "¿Bien asado?"],
  ["¿Frito?", "¿Sudado?", "¿Frito Sudado?"],
  ["¿Solo costilla?", "¿Solo Pierna?"],
];

function crearUnidad(sizes) {
  return {
    size: sizes.length > 0 ? sizes[0] : "",
    obs: { radios: [], modos: {}, selectores: {}, texto: "" },
  };
}

function crearObsCorriente() {
  return { radios: [], modos: {}, selectores: {}, texto: "" };
}

export function buildObsText(obs) {
  if (!obs) return "";
  const partes = [];
  Object.values(obs.selectores || {}).forEach((v) => v && partes.push(v));
  if (obs.radios?.length) partes.push(...obs.radios);
  Object.entries(obs.modos || {}).forEach(([label, modo]) => {
    if (modo === "Solo") partes.unshift(`Solo ${label}`);
    else if (modo === "No") partes.push(`No ${label}`);
    else if (modo === "+") partes.push(`+ ${label}`);
  });
  if (obs.texto?.trim()) partes.push(obs.texto.trim());
  return partes.join(", ");
}

// ─── Persistencia diaria en localStorage ─────────────────────
const STORAGE_KEY = "corriente_del_dia";

function guardarCorriente(proteinasSet, selecciones) {
  const hoy = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    fecha: hoy,
    proteinasActivas: [...proteinasSet],
    corrienteSelections: selecciones,
  }));
}

function cargarCorriente() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const hoy = new Date().toISOString().slice(0, 10);
    if (data.fecha !== hoy) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ─── Hook principal ───────────────────────────────────────────
export function usePedido() {
  const form = reactive({ nombre: "", telefono: "", direccion: "", barrio: "" });
  const recogeEnRestaurante = ref(false);
  const restauranteSeleccionado = ref("");
  const formaPago = ref("");
  const toastVisible = ref(false);
  const selections = reactive(MENU.map(() => []));

  // ─── Corriente — carga desde localStorage si es hoy ──────────
  const guardado = cargarCorriente();

  const proteinasActivas = ref(
    guardado ? new Set(guardado.proteinasActivas) : new Set()
  );
  const corrienteSelections = ref(
    guardado ? guardado.corrienteSelections : []
  );

  function toggleProteina(proteina) {
    const key = proteina.nombre;
    const set = new Set(proteinasActivas.value);
    if (set.has(key)) {
      set.delete(key);
      corrienteSelections.value = corrienteSelections.value.filter(
        (c) => c.nombre !== proteina.nombre
      );
    } else {
      set.add(key);
      corrienteSelections.value.push({
        nombre: proteina.nombre,
        precio: proteina.precio,
        unidades: [],
      });
    }
    proteinasActivas.value = set;
    guardarCorriente(proteinasActivas.value, corrienteSelections.value);
  }

  function isProteinaActiva(proteina) {
    return proteinasActivas.value.has(proteina.nombre);
  }

  function updateQtyCorriente(idx, nuevaCant) {
    const val = parseInt(nuevaCant) || 0;
    const item = corrienteSelections.value[idx];
    if (val < 0) return;
    const actual = item.unidades.length;
    if (val > actual) {
      for (let j = actual; j < val; j++) item.unidades.push(crearObsCorriente());
    } else {
      item.unidades.splice(val);
    }
    guardarCorriente(proteinasActivas.value, corrienteSelections.value);
  }

  function limpiarTodasProteinas() {
    proteinasActivas.value = new Set();
    corrienteSelections.value = [];
    guardarCorriente(proteinasActivas.value, corrienteSelections.value);
  }

  // ─── Popup observaciones ─────────────────────────────────────
  const popup = reactive({
    visible: false,
    itemIndex: null,
    unitIndex: null,
    esCorriente: false,
    temp: { radios: [], modos: {}, selectores: {}, texto: "" },
  });

  const popupResumen = reactive({ visible: false, pedido: null });

  const popupProteinas = reactive({ visible: false });
  function abrirPopupProteinas() { popupProteinas.visible = true; }
  function cerrarPopupProteinas() { popupProteinas.visible = false; }

  function haySolo() {
    return Object.values(popup.temp.modos).some((m) => m === "Solo");
  }

  function toggleRadio(label) {
    const grupo = RADIO_EXCLUSIVOS.find((g) => g.includes(label));
    if (grupo) {
      popup.temp.radios = popup.temp.radios.filter((r) => !grupo.includes(r));
      popup.temp.radios.push(label);
    } else {
      const i = popup.temp.radios.indexOf(label);
      i === -1 ? popup.temp.radios.push(label) : popup.temp.radios.splice(i, 1);
    }
  }

  function toggleSelector(label, opcion) {
    if (popup.temp.selectores[label] === opcion) delete popup.temp.selectores[label];
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
    popup.esCorriente = false;
    const saved = selections[i][j].obs;
    popup.temp = {
      radios: [...(saved.radios || [])],
      modos: { ...(saved.modos || {}) },
      selectores: { ...(saved.selectores || {}) },
      texto: saved.texto || "",
    };
    popup.visible = true;
  }

  function abrirPopupCorriente(corrienteIdx, unidadIdx) {
    popup.itemIndex = corrienteIdx;
    popup.unitIndex = unidadIdx;
    popup.esCorriente = true;
    const saved = corrienteSelections.value[corrienteIdx].unidades[unidadIdx];
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
    popup.esCorriente = false;
    popup.temp = { radios: [], modos: {}, selectores: {}, texto: "" };
  }

  function confirmarPopup() {
    if (popup.esCorriente) {
      corrienteSelections.value[popup.itemIndex].unidades[popup.unitIndex] = {
        radios: [...popup.temp.radios],
        modos: { ...popup.temp.modos },
        selectores: { ...popup.temp.selectores },
        texto: popup.temp.texto,
      };
      guardarCorriente(proteinasActivas.value, corrienteSelections.value);
      cerrarPopup();
      return;
    }

    const plato = OBS_POR_PLATO[MENU[popup.itemIndex]?.num];
    if (plato) {
      const requeridos = plato.items.filter((i) => i.tipo === "selector" && i.requerido);
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
    return (
      obs?.radios?.length ||
      Object.keys(obs?.modos || {}).length ||
      Object.keys(obs?.selectores || {}).length ||
      obs?.texto?.trim()
    );
  }

  function updateQty(i, qty) {
    const item = MENU[i];
    const actual = selections[i].length;
    const nueva = parseInt(qty) || 0;
    if (nueva > actual) {
      for (let j = actual; j < nueva; j++) selections[i].push(crearUnidad(item.sizes || []));
    } else {
      selections[i].splice(nueva);
    }
  }

  function resetForm() {
    form.nombre = "";
    form.telefono = "";
    form.direccion = "";
    form.barrio = "";
    recogeEnRestaurante.value = false;
    restauranteSeleccionado.value = "";
    formaPago.value = "";
    MENU.forEach((_, i) => (selections[i] = []));
    // Mantiene proteínas activas del día, resetea unidades a [] y limpia obs
    corrienteSelections.value = corrienteSelections.value.map((c) => ({
      ...c,
      unidades: [],
    }));
    guardarCorriente(proteinasActivas.value, corrienteSelections.value);
    cerrarPopup();
  }

  function construirPedido() {
    const ahora = new Date();
    const platos = [];

    MENU.forEach((item, i) => {
      if (item.cat) return;
      selections[i].forEach((u) => {
        let precio = 0;
        if (item.prices?.length && item.sizes?.length) {
          const idx = item.sizes.indexOf(u.size);
          precio = idx >= 0 ? item.prices[idx] : item.prices[0];
        } else {
          precio = item.price?.[0] || 0;
        }
        platos.push({ nombre: item.name, size: u.size, precio, observaciones: { ...u.obs } });
      });
    });

    corrienteSelections.value.forEach((c) => {
      c.unidades.forEach((u) => {
        platos.push({
          nombre: `[Corriente] ${c.nombre}`,
          size: "",
          precio: c.precio,
          observaciones: { ...u },
        });
      });
    });

    return {
      fecha: ahora,
      cliente: {
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: recogeEnRestaurante.value ? "Recoge en restaurante" : form.direccion,
        barrio: recogeEnRestaurante.value ? "" : form.barrio,
      },
      formaPago: formaPago.value,
      restaurante: restauranteSeleccionado.value,
      estado: formaPago.value === "Transferencia" ? "Pago pendiente" : "",
      estado_pedido: "Listo",
      razon_cancelacion: null,
      platos,
    };
  }

  function abrirResumen() {
    if (!form.nombre || !form.telefono) return alert("Completa nombre y teléfono");
    if (!recogeEnRestaurante.value && !form.direccion) return alert("Ingresa dirección");
    if (!formaPago.value) return alert("Selecciona método de pago");
    if (!restauranteSeleccionado.value) return alert("Selecciona restaurante");
    const pedido = construirPedido();
    if (!pedido.platos.length) return alert("Agrega al menos un plato");
    popupResumen.pedido = pedido;
    popupResumen.visible = true;
  }

  async function enviarPedidoFinal() {
    try {
      await api.post("/pedidos", popupResumen.pedido);
      toastVisible.value = true;
      setTimeout(() => (toastVisible.value = false), 3000);
      resetForm();
      popupResumen.visible = false;
    } catch (e) {
      console.error(e);
      alert("Error enviando pedido");
    }
  }

  return {
    form, recogeEnRestaurante, restauranteSeleccionado, formaPago,
    toastVisible, selections,
    corrienteSelections, proteinasActivas,
    toggleProteina, isProteinaActiva,
    updateQtyCorriente, limpiarTodasProteinas,
    popupProteinas, abrirPopupProteinas, cerrarPopupProteinas,
    popup, popupResumen,
    haySolo, toggleRadio, toggleModo, toggleSelector,
    tieneObs, buildObsText, updateQty,
    abrirPopup, abrirPopupCorriente, cerrarPopup, confirmarPopup,
    resetForm, abrirResumen, enviarPedidoFinal,
  };
}