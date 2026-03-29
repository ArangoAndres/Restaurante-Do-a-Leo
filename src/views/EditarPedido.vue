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

            <tr v-else class="dish-row">

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
                  >−</button>

                  <span class="qty-value">{{ selections[i].length }}</span>

                  <button
                    type="button"
                    class="qty-btn qty-btn--plus"
                    @click="logica.updateQty(i, selections[i].length + 1)"
                    :disabled="selections[i].length >= 99"
                  >+</button>
                </div>
              </td>

              <td class="units-cell">
                <div v-if="selections[i].length > 0" class="units-wrapper">
                  <div
                    v-for="(unidad, j) in selections[i]"
                    :key="j"
                    class="unit-row"
                  >
                    <span v-if="selections[i].length > 1" class="unit-label">
                      {{ j + 1 }}.
                    </span>

                    <select
                      v-if="item.sizes?.length > 0"
                      class="unit-size"
                      v-model="unidad.size"
                    >
                      <option v-for="s in item.sizes" :key="s" :value="s">
                        {{ s }}
                      </option>
                    </select>

                    <button
                      v-if="OBS_POR_PLATO[item.num]"
                      type="button"
                      class="btn-obs"
                      :class="{ 'btn-obs--active': logica.tieneObs(unidad.obs) }"
                      @click="logica.abrirPopup(i, j)"
                    >
                      <template v-if="logica.tieneObs(unidad.obs)">
                        {{ logica.buildObsText(unidad.obs) }}
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

    <!-- SECCIÓN 2: CLIENTE -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">2</div>
        <h2>Datos del Cliente</h2>
      </div>

      <div class="section-body">
        <div class="grid-2">
          <div class="field">
            <label>Nombre</label>
            <input
              type="text"
              v-model="logica.form.nombre"
              placeholder="Ej. Juan Garcia"
            />
          </div>

          <div class="field">
            <label>Teléfono</label>
            <input
              type="text"
              v-model="logica.form.telefono"
              placeholder="3000000000"
            />
          </div>
        </div>

        <div v-if="!logica.recogeEnRestaurante.value" class="field">
          <label>Dirección</label>
          <input
            type="text"
            v-model="logica.form.direccion"
            placeholder="Ej. Calle 10 # 20 - 30"
          />
        </div>

        <div v-if="!logica.recogeEnRestaurante.value" class="field">
          <label>Barrio</label>
          <input
            type="text"
            v-model="logica.form.barrio"
            placeholder="Ej. Centro"
          />
        </div>

        <div v-if="!logica.recogeEnRestaurante.value" class="field">
          <label>Hora de Entrega</label>
          <input type="time" v-model="logica.form.hora_entrega" />
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
            :class="{ active: logica.form.formaPago === 'Efectivo' }"
            @click="logica.form.formaPago = 'Efectivo'"
          >
            <span class="rest-icon">💵</span>
            <span class="rest-name">Efectivo</span>
          </button>

          <button
            type="button"
            class="btn-restaurante"
            :class="{ active: logica.form.formaPago === 'Transferencia' }"
            @click="logica.form.formaPago = 'Transferencia'"
          >
            <span class="rest-icon">📲</span>
            <span class="rest-name">Transferencia</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 4: ENTREGA -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon">4</div>
        <h2>Entrega</h2>
      </div>

      <div class="section-body">
        <div class="grid-3">
          <button
            type="button"
            class="btn-restaurante"
            :class="{ active: logica.form.modoEntrega === 'Moto' }"
            @click="logica.form.modoEntrega = 'Moto'"
          >
            <span class="rest-icon">🏍</span>
            <span class="rest-name">Domicilio - Moto</span>
          </button>

          <button
            type="button"
            class="btn-restaurante"
            :class="{ active: logica.form.modoEntrega === 'Recoger' }"
            @click="logica.form.modoEntrega = 'Recoger'"
          >
            <span class="rest-icon">📦</span>
            <span class="rest-name">Pasar a recoger</span>
          </button>

          <button
            type="button"
            class="btn-restaurante"
            :class="{ active: logica.form.modoEntrega === 'Pie' }"
            @click="logica.form.modoEntrega = 'Pie'"
          >
            <span class="rest-icon">🚶</span>
            <span class="rest-name">A pie</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="submit-area">
      <button class="btn-reset" @click="volver">Cancelar</button>
      <button class="btn-submit" @click="logica.guardarCambios">Guardar Cambios</button>
    </div>

  </div>

  <!-- TOAST -->
  <div class="toast" :class="{ visible: logica?.toastVisible.value }">
    Pedido actualizado correctamente
  </div>

</template>