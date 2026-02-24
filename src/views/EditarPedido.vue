<script setup>
import { useEditarPedidoReady } from "../assets/js/esperarPedido.js";
import { MENU, OBS_POR_PLATO } from "../assets/js/userPedido.js";

const { pedido, logica, loading, selections } = useEditarPedidoReady();

function volver() {
  window.history.back();
}
</script>

<template>

  <div v-if="loading" class="form-wrapper">Cargando pedido...</div>

  <div v-else-if="pedido && logica" class="form-wrapper">

    <div style="margin-bottom: 8px;">
      <button class="btn-volver" @click="volver">← Volver al detalle</button>
    </div>

    <!-- SECCIÓN 1: PLATOS -->
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

            <tr v-else-if="selections[i]" class="dish-row">
              <td class="dish-name">
                <span v-if="item.num" class="dish-num">{{ item.num }}.</span>
                {{ item.name }}
              </td>

              <td>
                <div class="qty-counter">
                  <button
                    type="button"
                    class="qty-btn qty-btn--minus"
                    @click="logica.updateQty(i, selections[i].length - 1)"
                    :disabled="selections[i].length === 0"
                  >
                    −
                  </button>

                  <span class="qty-value">
                    {{ selections[i].length }}
                  </span>

                  <button
                    type="button"
                    class="qty-btn qty-btn--plus"
                    @click="logica.updateQty(i, selections[i].length + 1)"
                    :disabled="selections[i].length >= 99"
                  >
                    +
                  </button>
                </div>
              </td>

              <td class="units-cell">
                <div
                  v-if="selections[i].length > 0"
                  class="units-wrapper"
                >
                  <div
                    v-for="(unidad, j) in selections[i]"
                    :key="j"
                    class="unit-row"
                  >
                    <span
                      v-if="selections[i].length > 1"
                      class="unit-label"
                    >
                      {{ j + 1 }}.
                    </span>

                    <select
                      v-if="item.sizes?.length > 0"
                      class="unit-size"
                      v-model="unidad.size"
                    >
                      <option
                        v-for="s in item.sizes"
                        :key="s"
                        :value="s"
                      >
                        {{ s }}
                      </option>
                    </select>

                    <button
                      v-if="OBS_POR_PLATO[item.num]"
                      type="button"
                      class="btn-obs"
                      :class="{ 'btn-obs--active': unidad.obs.length > 0 }"
                      @click="logica.abrirPopup(i, j)"
                    >
                      <template v-if="unidad.obs.length > 0">
                        <span
                          v-for="(o, k) in unidad.obs"
                          :key="k"
                          :class="{
                            'obs-solo': o.modo === 'Solo',
                            'obs-no': o.modo === 'No',
                            'obs-mas': o.modo === '+'
                          }"
                        >
                          {{ k > 0 ? ', ' : '' }}
                          {{ o.modo === 'Solo'
                              ? 'Solo '
                              : o.modo === 'No'
                              ? 'No '
                              : '+ ' }}
                          {{ o.item }}
                        </span>
                      </template>

                      <template v-else>
                        Observaciones
                      </template>
                    </button>
                  </div>
                </div>
              </td>
            </tr>

          </template>
        </tbody>
      </table>
    </div>

    <!-- SECCIÓN 2: CLIENTE -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">2</div>
        <h2>Datos del Cliente</h2>
      </div>
      <div class="section-body">
        <div class="grid-2">
          <div class="field">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" v-model="logica.form.nombre" placeholder="Ej. Juan García" />
          </div>
          <div class="field">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" v-model="logica.form.telefono" placeholder="300 123 4567" />
          </div>
        </div>

        <div class="field" v-if="!logica.recogeEnRestaurante.value">
          <label for="direccion">Dirección de entrega</label>
          <input type="text" id="direccion" v-model="logica.form.direccion" placeholder="Calle, número, barrio" />
        </div>

        <div class="field-check">
          <label class="check-recoge">
            <input type="checkbox" v-model="logica.recogeEnRestaurante.value" />
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
          <button
            type="button"
            class="btn-restaurante"
            :class="{ active: logica.formaPago.value === 'Efectivo' }"
            @click="logica.formaPago.value = 'Efectivo'"
          >
            <span class="rest-icon">💵</span>
            <span class="rest-name">Efectivo</span>
          </button>

          <button
            type="button"
            class="btn-restaurante"
            :class="{ active: logica.formaPago.value === 'Transferencia' }"
            @click="logica.formaPago.value = 'Transferencia'"
          >
            <span class="rest-icon">📲</span>
            <span class="rest-name">Transferencia</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="submit-area">
      <button type="button" class="btn-reset" @click="volver">Cancelar</button>
      <button type="button" class="btn-submit" @click="logica.guardarCambios()">
        Guardar Cambios →
      </button>
    </div>

  </div>

  <!-- TOAST -->
  <div class="toast" :class="{ visible: logica?.toastVisible.value }">
    ✅ ¡Pedido actualizado con éxito!
  </div>

  <!-- POPUP OBSERVACIONES -->
  <div v-if="logica?.popup.visible" class="popup-overlay" @click.self="logica.cerrarPopup()">
    <div class="popup">

      <div class="popup-header">
        <h3>Observaciones</h3>
        <span v-if="logica.popup.itemIndex !== null" class="popup-plato">
          {{ MENU[logica.popup.itemIndex].name }}
          <!-- ✅ CORREGIDO: usa selections del computed -->
          <template v-if="selections[logica.popup.itemIndex]?.length > 1">
            — Unidad {{ logica.popup.unitIndex + 1 }}
          </template>
        </span>
      </div>

      <div class="popup-body">
        <div v-if="logica.haySolo()" class="popup-solo-aviso">
          Modo <strong>Solo</strong> activo — no se puede combinar con No o +
        </div>

        <div class="popup-table">
          <div class="popup-table-header">
            <span class="popup-col-item">Ingrediente</span>
            <span class="popup-col-modo">Solo</span>
            <span class="popup-col-modo">No</span>
            <span class="popup-col-modo">+</span>
          </div>

          <div
            v-for="obs in OBS_POR_PLATO[MENU[logica.popup.itemIndex]?.num]"
            :key="obs"
            class="popup-table-row"
          >
            <span class="popup-col-item">{{ obs }}</span>
            <span class="popup-col-modo">
              <button type="button" class="modo-btn modo-solo"
                :class="{ active: logica.popup.temp[obs] === 'Solo' }"
                @click="logica.toggleModo(obs, 'Solo')">Solo</button>
            </span>
            <span class="popup-col-modo">
              <button type="button" class="modo-btn modo-no"
                :class="{ active: logica.popup.temp[obs] === 'No' }"
                :disabled="logica.haySolo()"
                @click="logica.toggleModo(obs, 'No')">No</button>
            </span>
            <span class="popup-col-modo">
              <button type="button" class="modo-btn modo-mas"
                :class="{ active: logica.popup.temp[obs] === '+' }"
                :disabled="logica.haySolo()"
                @click="logica.toggleModo(obs, '+')">+</button>
            </span>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <button type="button" class="btn-reset" @click="logica.cerrarPopup()">Cancelar</button>
        <button type="button" class="btn-submit" @click="logica.confirmarPopup()">Confirmar</button>
      </div>

    </div>
  </div>

</template>