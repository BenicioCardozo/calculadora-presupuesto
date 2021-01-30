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
      <b-dropdown
        style="margin: 0 20px"
        text="Unidad de Medida"
        variant="primary"
      >
        <b-dropdown-item @click="price.measurementUnit = 'Metro'"
          >Metro</b-dropdown-item
        >
        <b-dropdown-item @click="price.measurementUnit = 'Unidad'"
          >Unidad</b-dropdown-item
        >
      </b-dropdown>
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
        Agregar
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
        price: {
          amount: undefined,
          measurementUnit: undefined,
        },
        supplierOpt: [],
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
          this.price.measurementUnit != undefined &&
          this.price.amount !== (undefined || "")
        ) {
          return true;
        } else {
          return false;
        }
      },
    },
    methods: {
      sendData() {
        if (!this.isFormValid) return false;
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
          id: newKey,
          price: this.price,
        };

        let updates = {};
        updates[
          `users/${this.$store.getters["user/userProfile"].uid}/sourceMaterials/${this.name}`
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
