<template>
  <b-form novalidate>
    <b-input-group class="mb-3" prepend="Nombre">
      <b-form-input
        :value="name"
        @input="updValue({ prop: 'name', newValue: $event })"
      >
      </b-form-input>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Tipo">
      <b-form-select
        @change="
          updValue({
            prop: 'type',
            newValue: $event,
          })
        "
        :options="sourceMaterialsNames"
        :value="type"
      >
      </b-form-select>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Proveedor">
      <b-form-select
        :value="supplier"
        @change="
          updValue({
            prop: 'supplier',
            newValue: $event,
          })
        "
        :options="supplierOpt"
      >
      </b-form-select>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Color">
      <b-form-select
        :value="color"
        @change="
          updValue({
            prop: 'color',
            newValue: $event,
          })
        "
        :options="colors"
      >
      </b-form-select>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Calidad">
      <b-form-select
        :value="quality"
        @change="
          updValue({
            prop: 'quality',
            newValue: $event,
          })
        "
        :options="qualities"
      >
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="$">
      <b-form-input
        :value="price.amount"
        @input="
          updValue({
            prop: 'amount',
            newValue: Number($event),
            object: 'price',
          })
        "
        placeholder="Costo"
        type="number"
      ></b-form-input>
      <b-form-select
        :value="price.measurementUnit"
        @change="
          updValue({
            prop: 'measurementUnit',
            newValue: $event,
            object: 'price',
          })
        "
        class="ml-3"
        :options="measurementUnits"
      >
        <b-form-select-option value="Unidad de Medida" hidden
          >Unidad de Medida</b-form-select-option
        >
      </b-form-select>
    </b-input-group>
    <span>
      <b-button
        :disabled="isFormValid === false"
        variant="success"
        size="lg"
        pill
        @click.prevent="sendData()"
        type="submit"
      >
        {{ this.id ? "Guardar" : "Agregar" }}
      </b-button>
      <cancelationButton redirectionForCancelation="/materias-primas" />
    </span>
  </b-form>
</template>

<script>
  import { db } from "../../firebase/firebase";
  import cancelationButton from "../../components/cancelationButton.vue";
  export default {
    components: { cancelationButton },
    props: {
      name: {
        type: String,
      },
      color: {
        type: String,
      },
      quality: {
        type: String,
      },
      type: {
        type: String,
      },
      supplier: {
        type: String,
      },
      price: {
        type: Object,
      },
      id: {
        type: String,
      },
    },
    data() {
      return {
        supplierOpt: [],
        // price: {
        //   amount: undefined,
        //   measurementUnit: "Unidad de Medida",
        // },
        measurementUnits: ["Metro", "Unidad"],

        sourceMaterialsNames: [
          "Linón",
          "Tela Puntillé",
          "Lienzo",
          "Cinta PP",
          "Cierre",
          "Etiquetas",
          "Bagún",
          "Cristal",
          "Deslizadores",
          "Gabardina",
          "Mano de Obra",
        ],
        qualities: ["Alta", "Media", "Baja"],
        colors: ["Beige", "Azul", "Blanco"],
      };
    },
    created() {
      this.$store.state.suppliers.forEach((element) => {
        this.supplierOpt.push(element.name);
      });
    },
    computed: {
      isFormValid() {
        if (
          this.name &&
          this.price.measurementUnit !== "Unidad de Medida" &&
          this.price.amount !== (undefined || "") &&
          this.supplier != "" &&
          this.color != "" &&
          this.quality != "" &&
          this.type != ""
        ) {
          return true;
        } else {
          return false;
        }
      },
    },
    methods: {
      updValue({ prop, newValue, object }) {
        if (object) {
          let copy = Object.assign({}, this[object]);
          copy[prop] = newValue;
          this.$emit(`update:${object}`, copy);
        } else this.$emit(`update:${prop}`, newValue);
      },
      async sendData() {
        let newKey = db
          .ref()
          .child("sourceMaterials")
          .push().key;

        let sourceMaterialData = {
          name: this.name,
          characteristics: {
            color: this.color,
            quality: this.quality,
            type: this.type,
            supplier: this.supplier,
          },
          id: this.id || newKey,
          price: this.price,
        };

        let updates = {};
        updates[
          `users/${
            this.$store.getters["user/userProfile"].uid
          }/sourceMaterials/${this.id || newKey}`
        ] = sourceMaterialData;

        await db.ref().update(updates);

        this.$router.push("materias-primas");
      },
    },
  };
</script>

<style scoped>
  form {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    min-height: 90vh;
  }
  .input-group {
    width: 90% !important;
  }
  form > span {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
</style>
