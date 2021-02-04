<template>
  <b-form novalidate>
    <b-input-group class="mb-3" prepend="Nombre">
      <b-form-input v-model="name"> </b-form-input>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Tipo">
      <b-form-select :options="sourceMaterialsNames" v-model="type">
      </b-form-select>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Proveedor">
      <b-form-select :options="supplierOpt" v-model="supplier"> </b-form-select>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Color">
      <b-form-select v-model="color" :options="colors"> </b-form-select>
    </b-input-group>
    <b-input-group class="mb-3" prepend="Calidad">
      <b-form-select v-model="quality" :options="qualities"> </b-form-select>
    </b-input-group>
    <b-input-group prepend="$">
      <b-form-input
        v-model.number="price.amount"
        placeholder="Costo"
        type="number"
      ></b-form-input>
      <b-form-select
        v-model="price.measurementUnit"
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
        Guardar
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
    data() {
      return {
        name: null,
        color: null,
        quality: null,
        type: null,
        supplier: null,
        supplierOpt: [],
        measurementUnits: ["Metro", "Unidad"],
        price: {
          amount: undefined,
          measurementUnit: "Unidad de Medida",
        },
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
        id: undefined,
      };
    },
    async created() {
      let req = await db
        .ref(
          `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.$store.state.nameOfActualItem}`
        )
        .once("value");
      let res = await req.val();

      this.name = res.name;
      this.color = res.characteristics.color;
      this.type = res.characteristics.type;
      this.supplier = res.characteristics.supplier;
      this.quality = res.characteristics.quality;
      this.price.measurementUnit = res.price.measurementUnit;
      this.price.amount = res.price.amount;
      this.id = res.id;
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
          this.supplier != ""
        ) {
          return true;
        } else {
          return false;
        }
      },
    },
    methods: {
      sendData() {
        let sourceMaterialData = {
          name: this.name,
          characteristics: {
            color: this.color,
            quality: this.quality,
            type: this.type,
            supplier: this.supplier,
          },
          id: this.id,
          price: this.price,
        };

        let updates = {};
        updates[
          `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.$store.state.nameOfActualItem}`
        ] = sourceMaterialData;

        db.ref().update(updates);

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
