import { ref, reactive } from 'vue'
import { MENU } from '../data/menuData.js'
import { OBS_POR_PLATO } from '../data/ObservacionesData.js'

export { MENU, OBS_POR_PLATO }

function crearUnidad(sizes) {
  return {
    size: sizes.length > 0 ? sizes[0] : '',
    obs: []
  }
}

export function buildObsText(obs) {
  if (!obs || obs.length === 0) return ''
  const solos = obs.filter(o => o.modo === 'Solo').map(o => `Solo ${o.item}`)
  const nos   = obs.filter(o => o.modo === 'No').map(o =>  `No ${o.item}`)
  const mas   = obs.filter(o => o.modo === '+').map(o =>   `+ ${o.item}`)
  return [...solos, ...nos, ...mas].join(', ')
}

export function usePedido() {
  const form                    = reactive({ nombre: '', telefono: '', direccion: '' })
  const recogeEnRestaurante     = ref(false)
  const restauranteSeleccionado = ref('')
  const toastVisible            = ref(false)
  const selections              = reactive(MENU.map(() => []))

  const popup = reactive({
    visible:   false,
    itemIndex: null,
    unitIndex: null,
    temp:      {},
  })

  function haySolo() {
    return Object.values(popup.temp).some(m => m === 'Solo')
  }

  function toggleModo(item, modo) {
    const actual = popup.temp[item]

    if (actual === modo) {
      delete popup.temp[item]
      return
    }

    if (modo === 'Solo') {
      popup.temp[item] = 'Solo'
      return
    }

    if ((modo === 'No' || modo === '+') && haySolo()) return

    popup.temp[item] = modo
  }

  function abrirPopup(i, j) {
    popup.itemIndex = i
    popup.unitIndex = j
    popup.temp      = {}
    selections[i][j].obs.forEach(o => {
      popup.temp[o.item] = o.modo
    })
    popup.visible = true
  }

  function cerrarPopup() {
    popup.visible   = false
    popup.itemIndex = null
    popup.unitIndex = null
    popup.temp      = {}
  }

  function confirmarPopup() {
    selections[popup.itemIndex][popup.unitIndex].obs = Object.entries(popup.temp)
      .map(([item, modo]) => ({ item, modo }))
    cerrarPopup()
  }

  function updateQty(i, qty) {
    const item   = MENU[i]
    const actual = selections[i].length
    const nueva  = parseInt(qty) || 0
    if (nueva > actual) {
      for (let j = actual; j < nueva; j++) {
        selections[i].push(crearUnidad(item.sizes || []))
      }
    } else if (nueva < actual) {
      selections[i].splice(nueva)
    }
  }

  function resetForm() {
    form.nombre               = ''
    form.telefono             = ''
    form.direccion            = ''
    recogeEnRestaurante.value     = false
    restauranteSeleccionado.value = ''
    MENU.forEach((_, i) => { selections[i] = [] })
    cerrarPopup()
  }

  function sendOrder() {
    const ahora = new Date()
    const horaPedido = ahora.toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    })

    if (!form.nombre || !form.telefono) {
      alert('Por favor completa nombre y teléfono.')
      return
    }
    if (!recogeEnRestaurante.value && !form.direccion) {
      alert('Por favor ingresa la dirección de entrega.')
      return
    }
    if (!restauranteSeleccionado.value) {
      alert('Por favor selecciona un restaurante.')
      return
    }

    const lines = []
    MENU.forEach((item, i) => {
      if (item.cat) return
      const unidades = selections[i]
      if (!unidades || unidades.length === 0) return
      unidades.forEach((u, j) => {
        const size    = u.size              ? ` [${u.size}]`    : ''
        const obsText = buildObsText(u.obs)
        const obs     = obsText             ? ` – ${obsText}`   : ''
        const label   = unidades.length > 1 ? ` (${j + 1}.)` : ''
        lines.push(`• ${item.name}${label}${size}${obs}`)
      })
    })

    if (lines.length === 0) {
      alert('Por favor agrega al menos un plato.')
      return
    }

    const entrega = recogeEnRestaurante.value
      ? '🏃 Recoge en restaurante'
      : `📍 ${form.direccion}`

    const msg = [
      `*Pedido Doña Leo*`, ``,
      `🏠 *Restaurante ${restauranteSeleccionado.value}*`, ``,
      `👤 ${form.nombre}`,
      `📞 ${form.telefono}`,
      entrega, ``,
      `🍽 *Platos:*`,
      ...lines
    ].join('\n')

    console.log('Pedido:', msg)
    console.log('Hora del pedido:', horaPedido)

    toastVisible.value = true
    setTimeout(() => toastVisible.value = false, 3500)
  }

  return {
    form,
    recogeEnRestaurante,
    restauranteSeleccionado,
    toastVisible,
    selections,
    popup,
    haySolo,
    toggleModo,
    updateQty,
    abrirPopup,
    cerrarPopup,
    confirmarPopup,
    buildObsText,
    resetForm,
    sendOrder
  }
}