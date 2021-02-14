<template>
  <form @submit.prevent="sendData()" novalidate>
    <div id="container" v-if="this.$store.state.sourceMaterials !== undefined">
      <b-input-group prepend="Nombre" class="mb-2">
        <b-input
          :value="name"
          @input="updValue({ newValue: $event, prop: 'name' })"
          :style="[
            $v.name.$error ? { border: '2px solid rgb(255, 36, 36)' } : null
          ]"
          type="text"
        ></b-input
      ></b-input-group>

      <b-input-group prepend="Tipo de Producto">
        <b-form-select
          :value="type"
          @input="updValue({ newValue: $event, prop: 'type' })"
          :options="types"
        >
        </b-form-select
      ></b-input-group>
      <b-input-group prepend="Tamaño" class="mb-2 mt-3">
        <b-form-select
          :value="size"
          @input="updValue({ newValue: $event, prop: 'size' })"
          :options="sizes"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group prepend="Color" class="mb-2">
        <b-form-select
          :value="color"
          @input="updValue({ newValue: $event, prop: 'color' })"
          :options="colors"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group class="mb-2" prepend="Calidad">
        <b-form-select
          :value="quality"
          @input="updValue({ newValue: $event, prop: 'quality' })"
          :options="qualities"
        >
        </b-form-select>
      </b-input-group>
      <b-input-group
        prepend="Margen de Ganancia"
        append="
        %
        "
      >
        <b-input
          :value="profit"
          @input="
            updValue({
              newValue: Number($event.replace(/,/g, '.')),
              prop: 'profit'
            })
          "
          type="number"
        >
        </b-input>
      </b-input-group>
      <h4 class="mt-4">
        Materias Primas que Lleva
      </h4>
      <b-table
        responsive
        :fields="fields"
        :items="sourceMaterialsListWithDropdown"
      >
        <template #top-row>
          <td class="w-25">
            <b-form-select
              :options="sourceMaterialsFiltered"
              :value="sourceMaterial"
              @input="
                updValue({
                  newValue: $event,
                  notEvaluate: true,
                  prop: 'sourceMaterial'
                })
              "
            >
            </b-form-select>
          </td>

          <td class="w-50">
            <b-input
              :value="howMuch"
              @input="
                updValue({
                  newValue: Number($event.replace(/,/g, '.')),
                  prop: 'howMuch',
                  notEvaluate: true
                })
              "
              type="number"
            ></b-input>
          </td>
          <td>{{ measurementUnitOfSelectedSourceMaterial || '-' }}</td>

          <td>
            <b-button
              :disabled="
                !howMuch || sourceMaterial === 'Nombre' || sourceMaterial === ''
              "
              variant="outline-info"
              @click="pushSourceMaterial()"
              ><b-icon scale="1.3" icon="plus"></b-icon
            ></b-button>
          </td>
        </template>
        <template #head(name)>Nombre</template>
        <template #head(howMuch)>Cantidad</template>
        <template #head(measurementUnit)>Unidad de Medida</template>
        <template #head(opts)> {{ `` }}</template>
        <template #cell(howMuch)="data">
          <b-input
            v-if="!data.item.isForShowingTheTable"
            @input="updQuantity($event, data.item.name)"
            :value="data.value.toLocaleString('es-AR')"
          ></b-input>
          <span v-else> {{ data.value }}</span>
        </template>
        <template #cell(opts)="data">
          {{ data.value }}
          <b-icon
            style="cursor:pointer;"
            class="ml-3"
            icon="trash"
            scale="2"
            v-if="!data.item.isForShowingTheTable"
            @click.stop="deleteSourceMaterial(data.item.name)"
          >
          </b-icon
        ></template>
      </b-table>

      <span>
        <b-button
          :disabled="$v.$invalid === true"
          variant="success"
          size="lg"
          pill
          class="mb-2"
          type="submit"
        >
          {{ this.id ? 'Guardar' : 'Agregar' }}
        </b-button>
        <cancelationButton redirectionForCancelation="/productos" />
      </span>
    </div>
    <span v-else>
      <h2 style="text-align: center;">
        Todavía no tenés Materias Primas Creadas
        <router-link
          style="color: rgb(10, 92, 173); text-align:center; margin-top: 10px;"
          to="/crear-materia-prima"
        >
          <h2 style="font-size: 4rem;">
            ¡Crealas!
          </h2>
        </router-link>
      </h2>
    </span>
  </form>
</template>

<script>
  import { db } from '../../firebase/firebase.js';
  import { required } from 'vuelidate/lib/validators';
  import cancelationButton from '../../components/cancelationButton.vue';
  export default {
    components: { cancelationButton },
    name: 'products-layout',
    props: {
      name: {
        type: String
      },
      sourceMaterials: {
        type: Object
      },
      sourceMaterial: {
        type: [String, Object]
      },
      howMuch: {
        type: [String, Number]
      },
      size: {
        type: String
      },
      color: {
        type: String
      },
      quality: {
        type: String
      },
      profit: {
        type: [String, Number]
      },
      type: {
        type: String
      },
      id: {
        type: String
      }
    },
    data() {
      return {
        fields: ['name', 'howMuch', 'measurementUnit', 'opts'],
        submitStatus: null,
        sizes: ['Grande', 'Mediano', 'Pequeño'],
        colors: ['Blanco', 'Azul', 'Beige'],
        qualities: ['Alta', 'Media', 'Baja'],
        types: ['Sss', 'Aaaa']
      };
    },
    validations: {
      name: {
        required
      },
      profit: {
        required,
        validateNumber: (value) => value > 0
      },
      size: {
        required
      },
      color: {
        required
      },
      quality: {
        required
      },
      type: {
        required
      },
      sourceMaterials: {
        validateObject: (value) => Object.values(value).length > 0
      }
    },

    computed: {
      measurementUnitOfSelectedSourceMaterial() {
        if (this.sourceMaterial === 'Nombre' || !this.sourceMaterial) return;
        return this.$store.state.sourceMaterials.find(
          (el) => el.name === this.sourceMaterial.name
        ).price.measurementUnit;
      },
      sourceMaterialsListWithDropdown() {
        let result = [
          {
            isForShowingTheTable: true
          }
        ];
        for (const iterator in this.sourceMaterials) {
          result.push({
            ...this.sourceMaterials[iterator],
            opts: '',
            id: iterator
          });
        }
        return result;
      },
      sourceMaterialsFiltered() {
        let addedSourceMaterials = [];
        for (const key in this.sourceMaterials) {
          let element = this.sourceMaterials[key];
          addedSourceMaterials.push({
            value: { id: key, name: element.name },
            text: element.name
          });
        }
        let merge = [
          ...this.$store.state.sourceMaterials.map((el) => {
            return { value: { name: el.name }, text: el.name };
          }),
          ...addedSourceMaterials
        ];
        let duplicates = merge.map((el) => el.value.name);
        duplicates = duplicates.filter(
          (item, index) => duplicates.indexOf(item) != index
        );
        let result = merge.filter(
          (item) => !duplicates.find((el) => el === item.value.name)
        );
        return result;
      }
    },
    methods: {
      updValue({ newValue, prop, notEvaluate }) {
        if (!notEvaluate) this.$v[prop].$touch;

        this.$emit(`update:${prop}`, newValue);
      },
      async updQuantity(newQuantity, id) {
        if (!newQuantity || newQuantity === 0) {
          let copy = Object.assign({}, this.sourceMaterials);
          delete copy[id];
          this.$emit('update:sourceMaterials', copy);
        } else {
          let copy = Object.assign({}, this.sourceMaterials);
          copy[id].howMuch = Number(newQuantity.replace(/,/g, '.'));
          this.$emit('update:sourceMaterials', copy);
        }
      },
      async sendData() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.submitStatus = 'ERROR';
        } else {
          this.submitStatus = 'OK';
          var newKey = db
            .ref()
            .child('products')
            .push().key;
          let sourceMaterials = this.sourceMaterials;

          let productData = {
            name: this.name,
            type: this.type,
            sourceMaterials,
            characteristics: {
              color: this.color,
              size: this.size,
              quality: this.quality
            },
            profit: this.profit,
            id: this.id || newKey
          };
          let updates = {};
          updates[
            `users/${this.$store.getters['user/userProfile'].uid}/products/${this.name}`
          ] = productData;
          await db.ref().update(updates);
          this.$router.push('productos');
        }
      },
      pushSourceMaterial() {
        this.$set(this.sourceMaterials, this.sourceMaterial.name, {
          name: this.sourceMaterial.name,
          howMuch: this.howMuch,
          measurementUnit: this.$store.state.sourceMaterials.find(
            (el) => el.name === this.sourceMaterial.name
          ).price.measurementUnit
        });
        this.$emit('update:howMuch', '');
        this.$emit('update:sourceMaterial', 'Nombre');
      },
      deleteSourceMaterial(name) {
        this.$delete(this.sourceMaterials, name);
      }
    }
  };
</script>

<style scoped>
  #container {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    min-height: 92.3vh;
    justify-content: space-around;
    align-items: center;
  }

  form > span {
    display: flex;
    align-items: center;
    height: 85vh;
    justify-content: center;
  }

  .input-group {
    width: 80vw;
  }
  form > div > span {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
</style>
