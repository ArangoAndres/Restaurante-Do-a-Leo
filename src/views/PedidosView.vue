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

            <tr v-if="item.cat" class="cat-row">
              <td colspan="3">{{ item.cat }}</td>
            </tr>

            <tr v-else class="dish-row">
              <td class="dish-name">
                <span v-if="item.num" class="dish-num">{{ item.num }}.</span>
                {{ item.name }}
              </td>

              <td>
                <input
                  type="number"
                  class="qty"
                  placeholder="0"
                  min="0"
                  max="99"
                  :value="selections[i].length || ''"
                  @change="updateQty(i, $event.target.value)"
                />
              </td>

              <td class="units-cell">
                <div v-if="selections[i].length > 0" class="units-wrapper">
                  <div v-for="(unidad, j) in selections[i]" :key="j" class="unit-row">

                    <span v-if="selections[i].length > 1" class="unit-label">
                      {{ j + 1 }}.
                    </span>

                    <select v-if="item.sizes.length > 0" class="unit-size" v-model="unidad.size">
                      <option v-for="s in item.sizes" :key="s" :value="s">{{ s }}</option>
                    </select>

                    <button
                      v-if="OBS_POR_PLATO[item.num]"
                      type="button"
                      class="btn-obs"
                      :class="{ 'btn-obs--active': unidad.obs.length > 0 }"
                      @click="abrirPopup(i, j)"
                    >
                      <template v-if="unidad.obs.length > 0">
                        <span
                          v-for="(o, k) in unidad.obs" :key="k"
                          :class="{
                            'obs-solo': o.modo === 'Solo',
                            'obs-no':   o.modo === 'No',
                            'obs-mas':  o.modo === '+'
                          }"
                        >{{ k > 0 ? ', ' : '' }}{{ o.modo === 'Solo' ? 'Solo ' : o.modo === 'No' ? 'No ' : '+ ' }}{{ o.item }}</span>
                      </template>
                      <template v-else>Observaciones</template>
                    </button>

                  </div>
                </div>
              </td>
            </tr>

          </template>
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
          <input type="text" id="direccion" v-model="form.direccion" placeholder="Calle, número, barrio" />
        </div>

        <div class="field-check">
          <label class="check-recoge">
            <input type="checkbox" v-model="recogeEnRestaurante" />
            <span>Recoge en restaurante</span>
          </label>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 3: RESTAURANTE DESTINO -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">3</div>
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
            :class="{ active: restauranteSeleccionado === 'Bolívar' }"
            @click="restauranteSeleccionado = 'Bolívar'">
            <span class="rest-icon">🏛</span>
            <span class="rest-name">Restaurante Bolívar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="submit-area">
      <button type="button" class="btn-reset" @click="resetForm">Limpiar</button>
      <button type="button" class="btn-submit" @click="sendOrder">Enviar Pedido →</button>
    </div>

  </div>

  <!-- TOAST -->
  <div class="toast" :class="{ visible: toastVisible }">✅ ¡Pedido enviado con éxito!</div>

  <!-- POPUP DE OBSERVACIONES -->
  <div v-if="popup.visible" class="popup-overlay" @click.self="cerrarPopup">
    <div class="popup">

      <div class="popup-header">
        <h3>Observaciones</h3>
        <span v-if="popup.itemIndex !== null" class="popup-plato">
          {{ MENU[popup.itemIndex].name }}
          <template v-if="selections[popup.itemIndex]?.length > 1">
            — Unidad {{ popup.unitIndex + 1 }}
          </template>
        </span>
      </div>

      <div class="popup-body">

        <!-- Aviso cuando Solo está activo -->
        <div v-if="haySolo()" class="popup-solo-aviso">
          Modo <strong>Solo</strong> activo — no se puede combinar con No o +
        </div>

        <!-- Tabla de ítems con opciones -->
        <div class="popup-table">

          <!-- Header -->
          <div class="popup-table-header">
            <span class="popup-col-item">Ingrediente</span>
            <span class="popup-col-modo">Solo</span>
            <span class="popup-col-modo">No</span>
            <span class="popup-col-modo">+</span>
          </div>

          <!-- Filas -->
          <div
            v-for="obs in OBS_POR_PLATO[MENU[popup.itemIndex]?.num]"
            :key="obs"
            class="popup-table-row"
          >
            <span class="popup-col-item">{{ obs }}</span>

            <!-- Solo -->
            <span class="popup-col-modo">
              <button
                type="button"
                class="modo-btn modo-solo"
                :class="{ active: popup.temp[obs] === 'Solo' }"
                @click="toggleModo(obs, 'Solo')"
              >Solo</button>
            </span>

            <!-- No -->
            <span class="popup-col-modo">
              <button
                type="button"
                class="modo-btn modo-no"
                :class="{ active: popup.temp[obs] === 'No' }"
                :disabled="haySolo()"
                @click="toggleModo(obs, 'No')"
              >No</button>
            </span>

            <!-- + -->
            <span class="popup-col-modo">
              <button
                type="button"
                class="modo-btn modo-mas"
                :class="{ active: popup.temp[obs] === '+' }"
                :disabled="haySolo()"
                @click="toggleModo(obs, '+')"
              >+</button>
            </span>

          </div>
        </div>

      </div>

      <div class="popup-footer">
        <button type="button" class="btn-reset" @click="cerrarPopup">Cancelar</button>
        <button type="button" class="btn-submit" @click="confirmarPopup">Confirmar</button>
      </div>

    </div>
  </div>

</template>

<script setup>
import { MENU, OBS_POR_PLATO, usePedido } from '../assets/js/userPedido.js'

const {
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
} = usePedido()
</script>