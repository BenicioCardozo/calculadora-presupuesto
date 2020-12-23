<template>
  <form @submit.prevent="sendData()" novalidate>
    <div id="container" v-if="this.$store.state.sourceMaterials !== undefined">
      <h2>Crear</h2>
      <b-input
        @input="$v.nameProduct.$touch"
        :style="[
          $v.nameProduct.$error
            ? { border: '2px solid rgb(255, 36, 36)' }
            : { color: 'green' },
        ]"
        type="text"
        size="sm"
        placeholder="Nombre"
        v-model="nameProduct"
      ></b-input>
      <b-card-group columns class="select-characteristics">
        <b-card
          header="Color"
          header-tag="h4"
          border-variant="info"
          align="center"
        >
          <b-form-select
            v-model="color"
            class="select-inside-card"
            :options="colors"
          >
          </b-form-select>
        </b-card>
        <b-card
          header="Tamaño"
          header-tag="h4"
          border-variant="info"
          align="center"
        >
          <b-form-select
            v-model="size"
            class="select-inside-card"
            :options="sizes"
          >
          </b-form-select>
        </b-card>
        <b-card
          header="Calidad"
          header-tag="h4"
          border-variant="info"
          align="center"
        >
          <b-form-select
            v-model="quality"
            class="select-inside-card"
            :options="qualities"
          >
          </b-form-select>
        </b-card>
      </b-card-group>
      <h4 style="font-weight: 500;">Materias Primas que Lleva</h4>
      <b-form-select
        size="sm"
        ref="sourceMaterialSelector"
        v-model="sourceMaterial"
      >
        <b-form-select-option selected disabled hidden value="Nombre">
          Nombre
        </b-form-select-option>
        <b-form-select-option
          :value="sourceMaterial.name"
          v-bind:key="sourceMaterial + ' ' + index"
          v-for="(sourceMaterial, index) in this.$store.state.sourceMaterials"
        >
          {{ sourceMaterial.name }}
        </b-form-select-option>
      </b-form-select>
      <span id="quantity-and-dropdown">
        <b-input
          v-model="howMuch"
          type="number"
          placeholder="Cantidad de Materia Prima"
        ></b-input>
      </span>
      <span
        v-if="Object.keys(sourceMaterials).length !== 0"
        style="display:flex; justify-content: space-around;width:80vw;"
      >
        <h5
          :key="sourceMaterial + ' ' + index"
          v-for="(sourceMaterial, index) in sourceMaterials"
        >
          {{
            `${sourceMaterial.name}  ${
              sourceMaterial.howMuch
            } ${sourceMaterial.measurementUnit ||
              unitOfSourceMaterial.toLowerCase()}${plural(sourceMaterial)}`
          }}
          <b-icon
            style="cursor:pointer;"
            icon="trash"
            scale="1.1"
            @click.stop="deleteSourceMaterial(sourceMaterial.name)"
          >
          </b-icon>
        </h5>
      </span>
      <b-button
        :disabled="!howMuch && !sourceMaterial"
        size="sm"
        variant="info"
        @click="pushSourceMaterial()"
        >Agregar Materia Prima</b-button
      >

      <b-button
        pill
        size="lg"
        variant="success"
        type="submit"
        :disabled="
          $v.$invalid === true || Object.keys(sourceMaterials).length === 0
        "
        >Agregar Producto</b-button
      >
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
  import { db } from "../../firebase/firebase.js";
  import { required } from "vuelidate/lib/validators";
  export default {
    name: "create-product",
    data() {
      return {
        nameProduct: undefined,
        submitStatus: null,
        sourceMaterials: {},
        sourceMaterial: "Nombre",
        howMuch: undefined,
        sizes: ["Grande", "Mediano", "Pequeño"],
        size: undefined,
        colors: ["Blanco", "Azul", "Beige"],
        color: undefined,
        qualities: ["Alta", "Media", "Baja"],
        quality: undefined,
        unitOfSourceMaterial: "No seleccionaste un nombre",
      };
    },
    validations: {
      nameProduct: {
        required,
      },
      size: {
        required,
      },
      color: {
        required,
      },
      quality: {
        required,
      },
      sourceMaterials: {
        required,
      },
    },
    beforeCreate() {
      this.$store.dispatch("setSourceMaterials");
    },
    created() {},
    methods: {
      plural(sourceMaterial) {
        let result =
          this.sourceMaterials[sourceMaterial.name].measurementUnit === "Unidad"
            ? "es"
            : "s";
        return result;
      },
      sendData() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.submitStatus = "ERROR";
        } else {
          this.submitStatus = "OK";
          var newKey = db
            .ref()
            .child("products")
            .push().key;
          let productData = {
            name: this.nameProduct,
            sourceMaterials: this.sourceMaterials,
            characteristics: {
              color: this.color,
              size: this.size,
              quality: this.quality,
            },
            id: newKey,
          };
          console.dir(productData);
          let updates = {};
          updates["/products/" + this.nameProduct] = productData;
          db.ref().update(updates);
          this.$router.push("productos");
        }
      },
      pushSourceMaterial(newMeasurementUnit) {
        if (
          this.sourceMaterial.$invalid !== "Nombre" &&
          this.howMuch &&
          this.sourceMaterial !== "Nombre"
        ) {
          this.$set(this.sourceMaterials, this.sourceMaterial, {
            name: this.sourceMaterial,
            howMuch: Number(this.howMuch),
            measurementUnit: this.unitOfSourceMaterial,
          });
          this.howMuch = "";
          this.sourceMaterial = "";
        }
      },
      deleteSourceMaterial(name) {
        this.$delete(this.sourceMaterials, name);
      },
    },
    watch: {
      sourceMaterial: {
        handler(newVal) {
          if (!newVal) return false;
          db.ref(`sourceMaterials/${this.sourceMaterial}`).on(
            "value",
            (snapshot) => {
              let snap = snapshot.val();
              if (!snap) return false;
              this.unitOfSourceMaterial = snap.price.measurementUnit;
            }
          );
        },
        immediate: true,
      },
    },
    computed: {},
  };
</script>

<style scoped>
  #container {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    min-height: 90vh;
    justify-content: space-around;
    align-items: center;
  }
  #container > input,
  #container > input {
    padding: 1.5em !important;
    width: 80vw;
  }
  h2 {
    font-weight: 500;
    font-size: 2.4em;
  }
  #quantity-and-dropdown {
    display: inline-flex;
    align-items: center;
    width: 80vw;
  }
  #quantity-and-dropdown > h2 {
    margin: 0 0 0 2vw;
  }
  #quantity-and-dropdown > input {
    min-height: 100%;
  }
  #select-placeholder {
    color: #fff;
  }
  div > h4,
  div > span,
  div > input {
    margin: 7px;
  }
  form > span {
    display: flex;
    align-items: center;
    height: 85vh;
    justify-content: center;
  }
  #container > h4,
  button[type="submit"] {
    margin: 3vh;
  }
  .select-characteristics {
    width: 80vw;
  }
  .select-inside-card {
    width: 100%;
  }
  select {
    width: 80vw;
  }
</style>
