<template>
  <div class="form-wrapper">

    <!-- SECCIÓN 1: SELECCIÓN DE PLATOS -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">1</div>
        <h2>Selección de Platos</h2>
      </div>
      <table class="menu-table">
        <thead>
          <tr>
            <th>Nombre del Plato</th>
            <th class="th-cant">Cant.</th>
            <th class="th-units">Unidades</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, i) in MENU" :key="i">

            <!-- CATEGORÍA -->
            <tr
              v-if="item.cat"
              class="cat-row"
              @click="handleCatClick(item.cat)"
              :style="{
                cursor: ['ADICIONALES', 'BEBIDAS'].includes(item.cat) ? 'pointer' : 'default',
                background: ['ADICIONALES', 'BEBIDAS'].includes(item.cat) ? '#f5f5f5' : ''
              }"
            >
              <td colspan="3">
                {{ item.cat }}
                <span v-if="['ADICIONALES', 'BEBIDAS'].includes(item.cat)" style="float: right; font-weight: bold;">
                  {{ isOpen(item.cat) ? '▲' : '▼' }}
                </span>
              </td>
            </tr>

            <!-- PLATO NORMAL -->
            <tr v-else class="dish-row" v-show="shouldShowDish(i)">
              <td class="dish-name">
                <span v-if="item.num" class="dish-num">{{ item.num }}.</span>
                {{ item.name }}
              </td>
              <td>
                <div class="qty-counter">
                  <button type="button" class="qty-btn qty-btn--minus"
                    @click="updateQty(i, selections[i].length - 1)"
                    :disabled="selections[i].length === 0">−</button>
                  <span class="qty-value">{{ selections[i].length }}</span>
                  <button type="button" class="qty-btn qty-btn--plus"
                    @click="updateQty(i, selections[i].length + 1)"
                    :disabled="selections[i].length >= 99">+</button>
                </div>
              </td>
              <td class="units-cell">
                <div v-if="selections[i].length > 0" class="units-wrapper">
                  <div v-for="(unidad, j) in selections[i]" :key="j" class="unit-row">
                    <span v-if="selections[i].length > 1" class="unit-label">{{ j + 1 }}.</span>
                    <select v-if="item.sizes.length > 0" class="unit-size" v-model="unidad.size">
                      <option v-for="s in item.sizes" :key="s" :value="s">{{ s }}</option>
                    </select>
                    <button
                      v-if="OBS_POR_PLATO[item.num] && !(
                        (item.cat === 'SOPAS' || (item.num >= 1 && item.num <= 4)) &&
                        (unidad.size === 'Solo Sopa' || unidad.size === '9500')
                      )"
                      type="button"
                      class="btn-obs"
                      :class="{ 'btn-obs--active': tieneObs(unidad.obs) }"
                      @click="abrirPopup(i, j)"
                    >
                      <template v-if="tieneObs(unidad.obs)">{{ buildObsText(unidad.obs) }}</template>
                      <template v-else>Observaciones</template>
                    </button>
                  </div>
                </div>
              </td>
            </tr>

          </template>

          <!-- ══════════════ SECCIÓN CORRIENTE ══════════════ -->
          <tr class="cat-row cat-row--corriente" @click="handleCatClick('CORRIENTE')" style="cursor:pointer;">
            <td colspan="3">
              🍽 CORRIENTE
              <span style="float: right; font-weight: bold;">
                {{ isOpen('CORRIENTE') ? '▲' : '▼' }}
              </span>
            </td>
          </tr>

          <template v-if="isOpen('CORRIENTE')">
            <!-- Sin proteínas seleccionadas -->
            <tr v-if="corrienteSelections.length === 0" class="dish-row">
              <td colspan="3" class="corriente-empty">
                Usa el botón <strong>🍗</strong> para elegir proteínas del corriente
              </td>
            </tr>

            <!-- Platos corriente activos -->
            <tr
              v-for="(item, idx) in corrienteSelections"
              :key="'corriente-' + idx"
              class="dish-row dish-row--corriente"
            >
              <!-- Nombre -->
              <td class="dish-name">
                <span class="corriente-badge">Corriente</span>
                {{ item.nombre }}
              </td>

              <!-- Contador — igual que platos normales -->
              <td>
                <div class="qty-counter">
                  <button
                    type="button"
                    class="qty-btn qty-btn--minus"
                    @click="updateQtyCorriente(idx, item.unidades.length - 1)"
                    :disabled="item.unidades.length === 0"
                  >−</button>
                  <span class="qty-value">{{ item.unidades.length }}</span>
                  <button
                    type="button"
                    class="qty-btn qty-btn--plus"
                    @click="updateQtyCorriente(idx, item.unidades.length + 1)"
                    :disabled="item.unidades.length >= 99"
                  >+</button>
                </div>
              </td>

              <!-- Unidades con obs individuales — igual que platos normales -->
              <td class="units-cell">
                <div v-if="item.unidades.length > 0" class="units-wrapper">
                  <div
                    v-for="(unidad, j) in item.unidades"
                    :key="j"
                    class="unit-row"
                  >
                    <span v-if="item.unidades.length > 1" class="unit-label">{{ j + 1 }}.</span>
                    <button
                      type="button"
                      class="btn-obs"
                      :class="{ 'btn-obs--active': tieneObs(unidad) }"
                      @click="abrirPopupCorriente(idx, j)"
                    >
                      <template v-if="tieneObs(unidad)">{{ buildObsText(unidad) }}</template>
                      <template v-else>Observaciones</template>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <!-- ═══════════════════════════════════════════════ -->

        </tbody>
      </table>
    </div>

    <!-- SECCIÓN 2: DATOS DEL CLIENTE -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">2</div>
        <h2>Datos del Cliente</h2>
      </div>
      <div class="section-body">
        <div class="grid-2">
          <div class="field">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" v-model="form.nombre" placeholder="Ej. Juan García" />
          </div>
          <div class="field">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" v-model="form.telefono" placeholder="300 123 4567" />
          </div>
        </div>
        <div class="field" v-if="!recogeEnRestaurante">
          <label for="direccion">Dirección de entrega</label>
          <input type="text" id="direccion" v-model="form.direccion" placeholder="Calle, número" />
        </div>
        <div class="field" v-if="!recogeEnRestaurante">
          <label for="barrio">Barrio</label>
          <input type="text" id="barrio" v-model="form.barrio" placeholder="Ej. El Centro, La Esperanza" />
        </div>
        <div class="field-check">
          <label class="check-recoge">
            <input type="checkbox" v-model="recogeEnRestaurante" />
            <span>Recoge en restaurante</span>
          </label>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 3: FORMA DE PAGO -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">3</div>
        <h2>Forma de Pago</h2>
      </div>
      <div class="section-body">
        <div class="grid-2">
          <button type="button" class="btn-restaurante"
            :class="{ active: formaPago === 'Efectivo' }"
            @click="formaPago = 'Efectivo'">
            <span class="rest-icon">💵</span>
            <span class="rest-name">Efectivo</span>
          </button>
          <button type="button" class="btn-restaurante"
            :class="{ active: formaPago === 'Transferencia' }"
            @click="formaPago = 'Transferencia'">
            <span class="rest-icon">📲</span>
            <span class="rest-name">Transferencia</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 4: RESTAURANTE DESTINO -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">4</div>
        <h2>Restaurante Destino</h2>
      </div>
      <div class="section-body">
        <div class="grid-2">
          <button type="button" class="btn-restaurante"
            :class="{ active: restauranteSeleccionado === 'Centro' }"
            @click="restauranteSeleccionado = 'Centro'">
            <span class="rest-icon">🏠</span>
            <span class="rest-name">Restaurante Centro</span>
          </button>
          <button type="button" class="btn-restaurante"
            :class="{ active: restauranteSeleccionado === 'Bolivar' }"
            @click="restauranteSeleccionado = 'Bolivar'">
            <span class="rest-icon">🏛</span>
            <span class="rest-name">Restaurante Bolívar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="submit-area">
      <button type="button" class="btn-reset" @click="resetForm">Limpiar</button>
      <button type="button" class="btn-submit" @click="abrirResumen">Confirmar Pedido</button>
    </div>
  </div>

  <!-- ══════════ POPUP PROTEÍNAS CORRIENTE ══════════ -->
  <div v-if="popupProteinas.visible" class="popup-overlay" @click.self="cerrarPopupProteinas">
    <div class="popup popup-proteinas">
      <div class="popup-header">
        <h3>Proteínas del Corriente</h3>
        <span class="popup-plato">Activa las proteínas disponibles hoy</span>
      </div>

      <div class="popup-body popup-proteinas-body">
        <template v-for="grupo in PROTEINAS_CORRIENTE" :key="grupo.categoria">
          <div class="proteina-cat-header">{{ grupo.categoria }}</div>
          <div
            v-for="proteina in grupo.items"
            :key="proteina.nombre"
            class="proteina-row"
            :class="{ 'proteina-row--activa': isProteinaActiva(proteina) }"
            @click="toggleProteina(proteina)"
          >
            <div class="proteina-info">
              <span class="proteina-nombre">{{ proteina.nombre }}</span>
              <span class="proteina-precio">${{ proteina.precio.toLocaleString('es-CO') }}</span>
            </div>
            <div class="proteina-toggle" :class="{ 'proteina-toggle--on': isProteinaActiva(proteina) }">
              <div class="proteina-toggle-knob"></div>
            </div>
          </div>
        </template>
      </div>

      <div class="popup-footer proteinas-footer">
        <button type="button" class="btn-limpiar-proteinas" @click="limpiarTodasProteinas">
          Limpiar todo
        </button>
        <span class="proteinas-count">
          {{ proteinasActivas.size }} activa{{ proteinasActivas.size !== 1 ? 's' : '' }}
        </span>
        <button type="button" class="btn-submit" @click="cerrarPopupProteinas">Listo ✓</button>
      </div>
    </div>
  </div>

  <!-- ══════════ POPUP CONFIRMACIÓN ══════════ -->
  <div v-if="popupResumen.visible" class="popup-overlay" @click.self="popupResumen.visible = false">
    <div class="popup-resumen">
      <div class="popup-header">
        <h3>Confirmar Pedido</h3>
      </div>
      <div class="popup-body">
        <div class="info-cliente">
          <p><strong>Cliente:</strong> {{ popupResumen.pedido.cliente.nombre }}</p>
          <p><strong>Tel:</strong> {{ popupResumen.pedido.cliente.telefono }}</p>
          <p><strong>Dirección:</strong> {{ popupResumen.pedido.cliente.direccion }}</p>
          <p v-if="popupResumen.pedido.cliente.barrio"><strong>Barrio:</strong> {{ popupResumen.pedido.cliente.barrio }}</p>
          <hr style="margin:8px 0;">
        </div>
        <div v-for="(plato, index) in popupResumen.pedido.platos" :key="index" class="grupo-resumen">
          <div class="resumen-item">
            <span>{{ plato.nombre }} <small v-if="plato.size">({{ plato.size }})</small></span>
            <span>${{ plato.precio.toLocaleString('es-CO') }}</span>
          </div>
          <div v-if="buildObsText(plato.observaciones)" class="resumen-obs">
            {{ buildObsText(plato.observaciones) }}
          </div>
        </div>
        <div class="resumen-total">
          Total:
          <strong>${{ popupResumen.pedido.platos.reduce((t, p) => t + Number(p.precio || 0), 0).toLocaleString("es-CO") }}</strong>
        </div>
      </div>
      <div class="popup-footer">
        <button type="button" class="btn-reset" @click="popupResumen.visible = false">Volver</button>
        <button type="button" class="btn-submit" @click="enviarPedidoFinal">Enviar Pedido →</button>
      </div>
    </div>
  </div>

  <!-- TOAST -->
  <div class="toast" :class="{ visible: toastVisible }">✅ ¡Pedido enviado con éxito!</div>

  <!-- ══════════ POPUP OBSERVACIONES ══════════ -->
  <div v-if="popup.visible" class="popup-overlay" @click.self="cerrarPopup">
    <div class="popup">
      <div class="popup-header">
        <h3>Observaciones</h3>
        <span class="popup-plato">
          <template v-if="popup.esCorriente">
            {{ corrienteSelections[popup.itemIndex]?.nombre }} — Corriente
            <template v-if="corrienteSelections[popup.itemIndex]?.unidades.length > 1">
              — Unidad {{ popup.unitIndex + 1 }}
            </template>
          </template>
          <template v-else-if="popup.itemIndex !== null">
            {{ MENU[popup.itemIndex].name }}
            <template v-if="selections[popup.itemIndex]?.length > 1">
              — Unidad {{ popup.unitIndex + 1 }}
            </template>
          </template>
        </span>
      </div>

      <div class="popup-body">
        <div v-if="haySolo()" class="popup-solo-aviso">
          Modo <strong>Solo</strong> activo — no se puede combinar con No o +
        </div>

        <div class="popup-table">
          <template
            v-for="obs in (popup.esCorriente ? OBS_CORRIENTE.items : OBS_POR_PLATO[MENU[popup.itemIndex]?.num]?.items)"
            :key="obs.label"
          >
            <!-- SELECTOR -->
            <div v-if="obs.tipo === 'selector'" class="popup-table-row popup-row-selector">
              <span class="popup-col-item">{{ obs.label }}</span>
              <span class="popup-col-selector">
                <button
                  v-for="opc in obs.opciones" :key="opc"
                  type="button"
                  class="selector-btn"
                  :class="{ active: popup.temp.selectores[obs.label] === opc }"
                  @click="toggleSelector(obs.label, opc)"
                >{{ opc }}</button>
              </span>
            </div>

            <!-- RADIO -->
            <div v-if="obs.tipo === 'radio'" class="popup-table-row popup-row-radio">
              <span class="popup-col-item">{{ obs.label }}</span>
              <span class="popup-col-radio-span">
                <button
                  type="button"
                  class="radio-btn"
                  :class="{ active: popup.temp.radios.includes(obs.label) }"
                  @click="toggleRadio(obs.label)"
                >
                  <span class="radio-check">✓</span>
                </button>
              </span>
            </div>

            <!-- MODO -->
            <div v-else-if="obs.tipo === 'modo'" class="popup-table-row">
              <span class="popup-col-item">{{ obs.label }}</span>
              <span class="popup-col-modo">
                <button type="button" class="modo-btn modo-solo"
                  :class="{ active: popup.temp.modos[obs.label] === 'Solo' }"
                  @click="toggleModo(obs.label, 'Solo')">Solo</button>
              </span>
              <span class="popup-col-modo">
                <button type="button" class="modo-btn modo-no"
                  :class="{ active: popup.temp.modos[obs.label] === 'No' }"
                  :disabled="haySolo()"
                  @click="toggleModo(obs.label, 'No')">No</button>
              </span>
              <span class="popup-col-modo">
                <button type="button" class="modo-btn modo-mas"
                  :class="{ active: popup.temp.modos[obs.label] === '+' }"
                  :disabled="haySolo()"
                  @click="toggleModo(obs.label, '+')">+</button>
              </span>
            </div>
          </template>
        </div>

        <div class="popup-texto"
          v-if="popup.esCorriente ? OBS_CORRIENTE.permitirTexto : OBS_POR_PLATO[MENU[popup.itemIndex]?.num]?.permitirTexto">
          <label class="popup-texto-label">Observación adicional</label>
          <input type="text" class="popup-texto-input"
            placeholder="Ej: sin sal, aparte..."
            v-model="popup.temp.texto" />
        </div>
      </div>

      <div class="popup-footer">
        <button type="button" class="btn-reset" @click="cerrarPopup">Cancelar</button>
        <button type="button" class="btn-submit" @click="confirmarPopup">Confirmar</button>
      </div>
    </div>
  </div>

  <!-- BOTÓN FLOTANTE -->
  <button class="floating-btn" @click="abrirPopupProteinas">🍗</button>
</template>

<script setup>
import { ref } from "vue";
import {
  MENU, OBS_POR_PLATO,
  PROTEINAS_CORRIENTE, OBS_CORRIENTE,
  usePedido
} from '../assets/js/userPedido.js';

const {
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
} = usePedido();

// Categorías colapsables
const indexToCategory = [];
let lastCat = null;
MENU.forEach((it, idx) => {
  if (it.cat) { lastCat = it.cat; indexToCategory[idx] = it.cat; }
  else { indexToCategory[idx] = lastCat; }
});

const openCats = ref({
  ADICIONALES: false,
  BEBIDAS: false,
  CORRIENTE: false,
});

function isOpen(cat) { return !!openCats.value[cat]; }

function handleCatClick(cat) {
  if (['ADICIONALES', 'BEBIDAS', 'CORRIENTE'].includes(cat)) {
    openCats.value[cat] = !openCats.value[cat];
  }
}

function shouldShowDish(i) {
  const cat = indexToCategory[i];
  if (!cat) return true;
  if (cat === 'ADICIONALES' || cat === 'BEBIDAS') return isOpen(cat);
  return true;
}
</script>